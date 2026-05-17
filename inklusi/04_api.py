"""
InklusiKerja — Step 4: FastAPI Endpoint
========================================
Endpoints:
  POST /api/match        → rekomendasi pekerjaan (FAISS index)
  POST /api/match/direct → cocokkan kandidat vs 1 job langsung (tanpa FAISS)
  GET  /api/health       → status server

Jalankan:
  uvicorn 04_api:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import os
import importlib.util
import sys

spec = importlib.util.spec_from_file_location(
    "recommendation_engine",
    os.path.join(os.path.dirname(__file__), "03_recommendation_engine.py")
)
recommendation_engine = importlib.util.module_from_spec(spec)
sys.modules["recommendation_engine"] = recommendation_engine
spec.loader.exec_module(recommendation_engine)

RecommendationEngine = recommendation_engine.RecommendationEngine
KandidatProfile      = recommendation_engine.KandidatProfile

app = FastAPI(
    title="InklusiKerja ML API",
    description="Semantic job recommendation for people with disabilities",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_engine: Optional[RecommendationEngine] = None

def get_engine() -> RecommendationEngine:
    global _engine
    if _engine is None:
        _engine = RecommendationEngine()
    return _engine


# ─── SCHEMAS ──────────────────────────────────────────────────────────────────

class WeightsInput(BaseModel):
    semantic:   float = Field(default=0.35, ge=0.0, le=1.0)
    skill:      float = Field(default=0.05, ge=0.0, le=1.0)
    disability: float = Field(default=0.60, ge=0.0, le=1.0)

class MatchRequest(BaseModel):
    disability_type:    str           = Field(...,  example="Tunanetra")
    skills:             list[str]     = Field(...,  example=["Python", "Tableau", "SQL"])
    functional_profile: str           = Field(...,  example="Data analyst dengan gangguan penglihatan...")
    preferred_level:    Optional[str] = Field(None, example="Mid level")
    top_k:              int           = Field(default=5, ge=1, le=20)
    weights:            Optional[WeightsInput] = None
    min_semantic:       float         = Field(default=0.43, ge=0.0, le=1.0)

class JobResult(BaseModel):
    rank:                      int
    job_id:                    str
    job_title:                 str
    level:                     str
    semantic_score:            float
    skill_match_score:         float
    disability_match_score:    float
    final_score:               float
    skill_gap:                 list[str]
    matched_skills:            list[str]
    accommodation_suggestions: list[str]
    explanation:               str
    qualification:             str

class MatchResponse(BaseModel):
    status:          str
    total_results:   int
    kandidat_query:  str
    weights_used:    dict
    recommendations: list[JobResult]


# ─── DIRECT MATCH SCHEMAS ─────────────────────────────────────────────────────

class DirectMatchRequest(BaseModel):
    disability_type:    str           = Field(...,    example="Tunanetra")
    skills:             list[str]     = Field(...,    example=["Python", "SQL"])
    functional_profile: str           = Field(...,    example="Seorang data analyst...")
    job_title:          str           = Field(...,    example="Data Analyst")
    job_description:    str           = Field(default="",  example="Kami mencari data analyst...")
    job_required_skills: list[str]   = Field(default=[], example=["Python", "SQL", "Tableau"])
    preferred_level:    Optional[str] = Field(None)

class DirectMatchResult(BaseModel):
    semantic_score:            float
    skill_match_score:         float
    disability_match_score:    float
    final_score:               float
    matched_skills:            list[str]
    skill_gap:                 list[str]
    accommodation_suggestions: list[str]
    explanation:               str
    source:                    str   # selalu "ml_direct"

class DirectMatchResponse(BaseModel):
    status:         str
    kandidat_query: str
    job_query:      str
    result:         DirectMatchResult


# ─── HELPER: PENJELASAN UNTUK DIRECT MATCH ───────────────────────────────────

def _generate_direct_explanation(
    semantic_score: float,
    skill_ratio: float,
    matched_skills: list,
    skill_gap: list,
    has_skill_requirements: bool,
) -> str:
    """
    Menghasilkan penjelasan naratif berdasarkan skor aktual.
    Skor rendah → kalimat rendah. Skor tinggi → kalimat tinggi.
    """
    parts = []

    # ── Bagian Deskripsi (Semantic) ──────────────────────────────────────────
    if semantic_score >= 0.80:
        parts.append("Deskripsi profilmu sangat relevan dengan deskripsi pekerjaan ini.")
    elif semantic_score >= 0.60:
        parts.append("Deskripsi profilmu cukup relevan dengan pekerjaan ini.")
    elif semantic_score >= 0.40:
        parts.append("Ada kesamaan antara profil kamu dan pekerjaan ini, tapi tidak terlalu kuat.")
    elif semantic_score >= 0.20:
        parts.append("Profil kamu kurang relevan dengan deskripsi pekerjaan ini.")
    else:
        parts.append("Profil kamu tidak relevan dengan pekerjaan ini berdasarkan deskripsi.")

    # ── Bagian Skill ─────────────────────────────────────────────────────────
    if has_skill_requirements:
        if skill_ratio >= 0.80:
            if matched_skills:
                parts.append(
                    f"Skill kamu sangat cocok — "
                    f"memenuhi {round(skill_ratio*100)}% kebutuhan job: "
                    f"{', '.join(matched_skills[:3])}."
                )
            else:
                parts.append(f"Skill kamu memenuhi {round(skill_ratio*100)}% kebutuhan job.")
        elif skill_ratio >= 0.50:
            if matched_skills:
                parts.append(
                    f"Skill kamu cocok sebagian ({round(skill_ratio*100)}%): "
                    f"{', '.join(matched_skills[:3])}."
                )
            else:
                parts.append(f"Skill kamu cocok {round(skill_ratio*100)}% dari kebutuhan.")
        elif skill_ratio > 0:
            if matched_skills:
                parts.append(
                    f"Hanya {round(skill_ratio*100)}% skill yang cocok: "
                    f"{', '.join(matched_skills[:2])}."
                )
            else:
                parts.append(f"Skill kamu hanya cocok {round(skill_ratio*100)}% dari kebutuhan.")
        else:
            parts.append("Tidak ada skill kamu yang cocok dengan persyaratan pekerjaan ini.")

        if skill_gap:
            parts.append(f"Skill yang perlu diperkuat: {', '.join(skill_gap[:3])}.")
    else:
        parts.append("Tidak ada daftar skill spesifik — kecocokan dinilai dari relevansi deskripsi.")

    return " ".join(parts)


# ─── ENDPOINTS ────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    engine = get_engine()
    return {
        "status": "ok",
        "engine": "loaded",
        "total_jobs_indexed": engine.index.ntotal,
        "model": engine.config["model_name"],
    }


@app.post("/api/match", response_model=MatchResponse)
def get_recommendations(req: MatchRequest):
    try:
        engine = get_engine()

        kandidat = KandidatProfile(
            disability_type    = req.disability_type,
            skills             = req.skills,
            functional_profile = req.functional_profile,
            preferred_level    = req.preferred_level,
        )

        if req.weights is not None:
            weights_used = {
                "semantic"   : req.weights.semantic,
                "skill"      : req.weights.skill,
                "disability" : req.weights.disability,
            }
        else:
            weights_used = {"semantic": 0.35, "skill": 0.05, "disability": 0.60}

        results = engine.recommend(
            kandidat,
            top_k        = req.top_k,
            weights      = weights_used,
            min_semantic = req.min_semantic,
        )

        return MatchResponse(
            status          = "success",
            total_results   = len(results),
            kandidat_query  = kandidat.to_query_text(),
            weights_used    = weights_used,
            recommendations = [
                JobResult(
                    rank                      = r.rank,
                    job_id                    = r.job_id,
                    job_title                 = r.job_title,
                    level                     = r.level,
                    semantic_score            = r.semantic_score,
                    skill_match_score         = r.skill_match_score,
                    disability_match_score    = r.disability_match_score,
                    final_score               = r.final_score,
                    skill_gap                 = r.skill_gap,
                    matched_skills            = r.matched_skills,
                    accommodation_suggestions = r.accommodation_suggestions,
                    explanation               = r.explanation,
                    qualification             = r.qualification,
                )
                for r in results
            ]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/match/direct", response_model=DirectMatchResponse)
def direct_match(req: DirectMatchRequest):
    """
    Mencocokkan kandidat dengan satu job secara langsung.

    Scoring (tanpa disability factor — murni kesesuaian skill + deskripsi):
      final_score = 0.50 × skill_score  +  0.50 × semantic_score

    Prinsip:
      - Skill & deskripsi tidak cocok  → skor RENDAH
      - Skill & deskripsi cocok        → skor TINGGI
    """
    try:
        import numpy as np

        engine = get_engine()
        normalize_skill_name = recommendation_engine.normalize_skill_name
        get_accommodation    = recommendation_engine.get_accommodation

        # ═══════════════════════════════════════════════════════════════════════
        # 1. SKILL SCORE  (bobot 50%)
        #    Bandingkan skill kandidat vs skill yang dibutuhkan job.
        #    KEDUANYA dinormalisasi agar "Python" == "python" == "PYTHON".
        # ═══════════════════════════════════════════════════════════════════════
        candidate_skills_norm = {
            normalize_skill_name(s) for s in req.skills if s.strip()
        }

        if req.job_required_skills:
            # Normalisasi skill job juga — ini perbaikan bug kritis
            job_skills_norm = {
                normalize_skill_name(s) for s in req.job_required_skills if s.strip()
            }

            # Exact match setelah normalisasi
            exact_matched = candidate_skills_norm & job_skills_norm

            # Partial match: "react native" cocok dengan "react"
            partial_matched = set()
            for cs in candidate_skills_norm:
                for js in job_skills_norm:
                    if js not in exact_matched and (cs in js or js in cs) and len(cs) >= 3:
                        partial_matched.add(js)

            all_matched = exact_matched | partial_matched
            skill_gap   = list(job_skills_norm - all_matched)

            # Partial match diberi bobot 0.6 agar tidak sama dengan exact
            skill_ratio = (
                len(exact_matched) + 0.6 * len(partial_matched)
            ) / len(job_skills_norm)
            skill_ratio = float(np.clip(skill_ratio, 0.0, 1.0))

            matched_skills = list(all_matched)
        else:
            # Tidak ada skill yang ditetapkan job → gunakan semantic saja
            matched_skills = []
            skill_gap      = []
            skill_ratio    = 0.0

        # ═══════════════════════════════════════════════════════════════════════
        # 2. SEMANTIC SCORE  (bobot 50%)
        #    Bandingkan HANYA teks deskripsi kandidat vs deskripsi job.
        #    Jangan campur daftar skill ke teks ini — supaya benar-benar
        #    mencerminkan kesesuaian konteks pekerjaan.
        # ═══════════════════════════════════════════════════════════════════════
        profile_text = req.functional_profile.strip()
        if not profile_text:
            profile_text = "Saya seorang profesional yang sedang mencari pekerjaan."

        job_text = f"{req.job_title}. {req.job_description}".strip(" .")
        if not req.job_description.strip():
            # Fallback jika deskripsi job kosong
            job_text = req.job_title or "Lowongan pekerjaan"

        vecs = engine.model.encode(
            [profile_text, job_text],
            normalize_embeddings=True,
            convert_to_numpy=True,
        ).astype(np.float32)

        raw_cosine = float(np.dot(vecs[0], vecs[1]))

        # Rescale cosine ke [0, 1] yang lebih diskriminatif.
        # Untuk multilingual-MiniLM, teks yang sama topik ≈ 0.4–0.7,
        # teks yang sangat relevan ≈ 0.7–0.95, teks tidak relevan ≈ 0.0–0.3.
        # Kita shift agar 0.0 cosine → 0%, 0.9 cosine → 100%.
        semantic_score = float(np.clip(raw_cosine / 0.9, 0.0, 1.0))

        # ═══════════════════════════════════════════════════════════════════════
        # 3. FINAL SCORE  — murni skill + deskripsi, tanpa disability
        #    Disability TIDAK dimasukkan karena selalu 1.0 (self-match)
        #    sehingga akan menyebabkan semua kandidat mendapat skor tinggi.
        # ═══════════════════════════════════════════════════════════════════════
        if req.job_required_skills:
            # Ada skill list → keduanya berkontribusi seimbang
            final_score = (0.50 * skill_ratio + 0.50 * semantic_score) * 100
        else:
            # Tidak ada skill list → andalkan semantic sepenuhnya
            final_score = semantic_score * 100

        # Disability score — hanya untuk ditampilkan di UI, TIDAK memengaruhi skor
        dis_score = engine._compute_disability_match(
            req.disability_type,
            req.disability_type,
        )

        accommodation_suggestions = get_accommodation(req.disability_type)
        explanation = _generate_direct_explanation(
            semantic_score, skill_ratio, matched_skills, skill_gap,
            bool(req.job_required_skills)
        )

        return DirectMatchResponse(
            status         = "success",
            kandidat_query = profile_text,
            job_query      = job_text,
            result         = DirectMatchResult(
                semantic_score            = round(semantic_score * 100, 1),
                skill_match_score         = round(skill_ratio    * 100, 1),
                disability_match_score    = round(dis_score      * 100, 1),
                final_score               = round(final_score,          1),
                matched_skills            = matched_skills[:5],
                skill_gap                 = skill_gap[:5],
                accommodation_suggestions = accommodation_suggestions,
                explanation               = explanation,
                source                    = "ml_direct",
            ),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("04_api:app", host="0.0.0.0", port=8000, reload=True)
