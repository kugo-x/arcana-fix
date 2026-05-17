"""
InklusiKerja — Step 3: Recommendation Engine (v4)
==================================================
Fix:
  1. filter_disability sebagai hard filter
  2. to_query_text() pakai kalimat natural
  3. disability_match < 0.5 → fallback
  4. fallback jika hasil < top_k
  5. n_retrieve = index.ntotal saat filter aktif
  6. min_semantic threshold: job disability-cocok tapi semantik rendah → fallback
  7. Fallback diurutkan semantic+skill (bukan final_score)
  8. Default weights: disability=0.60, semantic=0.35, skill=0.05
"""

import os
import re
import json
import pickle
import numpy as np
import pandas as pd
from typing import Optional
from dataclasses import dataclass, field, asdict


# ─── DATA CLASSES ─────────────────────────────────────────────────────────────

@dataclass
class KandidatProfile:
    disability_type: str
    skills: list[str]
    functional_profile: str
    preferred_level: Optional[str] = None
    location: Optional[str] = None

    def to_query_text(self) -> str:
        normalized = [normalize_skill_name(s) for s in self.skills]
        query = (
            f"Kandidat dengan {self.disability_type} mencari pekerjaan di bidang "
            f"{', '.join(normalized[:3])}. "
            f"Memiliki skill: {', '.join(normalized)}. "
            f"{self.functional_profile}"
        )
        if self.preferred_level:
            query += f" Level yang diinginkan: {self.preferred_level}."
        return query

    def normalized_skills(self) -> list[str]:
        return [normalize_skill_name(s) for s in self.skills]


@dataclass
class JobRecommendation:
    rank: int
    job_id: str
    job_title: str
    disability_type: str
    level: str
    qualification: str
    accessibility: str
    semantic_score: float
    skill_match_score: float
    disability_match_score: float
    final_score: float
    skill_gap: list[str]
    matched_skills: list[str]
    accommodation_suggestions: list[str]
    explanation: str


# ─── SKILL NORMALIZATION ──────────────────────────────────────────────────────

SKILL_ALIAS = {
    "r"              : "r programming",
    "go"             : "golang",
    "machine learning": "machine learning dasar",
    "ml"             : "machine learning dasar",
    "node"           : "node.js",
    "nodejs"         : "node.js",
    "vue"            : "vue.js",
    "postgres"       : "postgresql",
    "ms excel"       : "microsoft excel",
    "ms word"        : "microsoft word",
    "ms office"      : "microsoft office",
    "power point"    : "microsoft powerpoint",
    "google sheet"   : "google sheets",
}

def normalize_skill_name(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"\s+", " ", s)
    return SKILL_ALIAS.get(s, s)


# ─── SKILL EXTRACTOR ─────────────────────────────────────────────────────────

KNOWN_SKILLS = {
    "python", "r programming", "golang", "java", "javascript", "typescript",
    "php", "kotlin", "swift", "dart", "css", "html",
    "react", "vue.js", "node.js", "django", "fastapi", "spring boot",
    "laravel", "flutter", "react native", "bootstrap", "jetpack compose",
    "redis", "microservices", "rest api", "git",
    "power bi", "tableau", "google data studio", "numpy", "pandas",
    "sql", "mysql", "postgresql", "sqlite", "excel", "google sheets",
    "machine learning dasar", "statistik", "data cleaning", "scikit-learn",
    "microsoft excel",
    "docker", "kubernetes", "aws", "gcp", "azure", "linux", "ci/cd",
    "jenkins", "terraform", "ansible",
    "figma", "adobe xd", "sketch", "invision", "canva",
    "adobe illustrator", "adobe photoshop", "coreldraw",
    "wireframing", "prototyping", "user research", "design system",
    "seo", "google ads", "facebook ads", "tiktok ads",
    "email marketing", "copywriting", "content creation",
    "digital marketing", "analitik media sosial",
    "akuntansi", "jurnal keuangan", "pajak", "rekonsiliasi bank",
    "laporan keuangan", "audit internal", "sap", "myob", "accurate", "erp",
    "hris", "rekrutmen", "payroll", "manajemen kinerja",
    "pelatihan sdm", "hubungan industrial", "linkedin recruiter",
    "firewall", "owasp", "penetration testing", "metasploit",
    "ethical hacking", "kriptografi", "iso 27001", "siem", "nmap",
    "selenium", "cypress", "katalon", "postman", "jira",
    "qa documentation", "test case", "testing manual", "bug tracking",
    "cisco", "mikrotik", "vpn", "ccna",
    "monitoring jaringan", "server management", "networking",
    "microsoft office", "microsoft word", "google workspace",
    "administrasi perkantoran",
    "zendesk", "freshdesk", "crm", "live chat",
    "komunikasi", "problem solving", "empati", "penanganan keluhan",
    "notulensi", "manajemen jadwal", "pengarsipan",
    "wms", "sap wm", "inventory", "supply chain", "manajemen gudang",
    "perencanaan distribusi",
    "e-learning", "zoom", "google classroom", "moodle",
    "microsoft teams", "kurikulum",
    "motion graphics", "tipografi", "desain visual", "branding",
    "editing video", "capcut", "youtube", "instagram",
    "penulisan konten", "seo writing", "wordpress",
    "ketelitian data", "pengetikan cepat", "spreadsheet",
    "penerjemahan", "proofreading", "lokalisasi", "sdl trados",
    "bahasa inggris", "bahasa jepang", "bahasa mandarin",
}

def extract_skills_from_text(text: str) -> set[str]:
    text_lower = text.lower()
    for alias, canonical in SKILL_ALIAS.items():
        text_lower = re.sub(r"\b" + re.escape(alias) + r"\b", canonical, text_lower)
    found = set()
    for skill in KNOWN_SKILLS:
        if re.search(r"\b" + re.escape(skill) + r"\b", text_lower):
            found.add(skill)
    return found


def compute_skill_gap(
    kandidat_skills: list[str],
    qualification_text: str,
    skill_tags: list[str] = None,
) -> tuple[list[str], list[str], float]:
    kandidat_set = {normalize_skill_name(s) for s in kandidat_skills}

    if skill_tags and len(skill_tags) > 0:
        required_set = set(skill_tags)
    else:
        required_set = extract_skills_from_text(qualification_text)

    if not required_set:
        return list(kandidat_skills[:3]), [], 0.4

    matched = kandidat_set & required_set
    missing = required_set - kandidat_set
    overlap_ratio = len(matched) / len(required_set)

    return list(matched), list(missing), overlap_ratio


# ─── ACCOMMODATION MAPPING ────────────────────────────────────────────────────

ACCOMMODATION_MAP = {
    "tunanetra": [
        "Screen reader (NVDA/JAWS/VoiceOver)",
        "Display braille atau braille note taker",
        "Komputer dengan antarmuka berbasis keyboard shortcut",
        "Dokumen dan materi kerja dalam format aksesibel (PDF tertagged)",
        "Workstation dengan monitor kontras tinggi atau konfigurasi audio",
        "Pelatihan rekan kerja mengenai etika berinteraksi dengan tunanetra",
    ],
    "tunarungu": [
        "Interpreter BISINDO/SIBI untuk meeting penting",
        "Captioning real-time (CART) untuk rapat dan presentasi",
        "Komunikasi via teks: Slack, email, atau aplikasi chat",
        "Visual alert system (lampu kedip) untuk alarm/notifikasi",
        "Loop induktif untuk pengguna hearing aid",
        "Closed captioning pada semua video training",
    ],
    "tunawicara": [
        "Perangkat augmentative & alternative communication (AAC)",
        "Text-to-speech software untuk presentasi",
        "Preferensi komunikasi tertulis/digital untuk semua koordinasi",
        "Waktu bicara yang cukup tanpa tekanan kecepatan",
        "Sistem antrian komunikasi yang adil di rapat",
    ],
    "gangguan daksa tangan": [
        "Voice recognition software (Dragon NaturallySpeaking)",
        "Mouse trackball atau joystick ergonomis",
        "Keyboard one-hand atau keyboard adaptif",
        "Meja kerja adjustable height (motorized)",
        "Waktu kerja fleksibel untuk manajemen energi",
    ],
    "daksa tangan": [
        "Voice recognition software (Dragon NaturallySpeaking)",
        "Mouse trackball atau joystick ergonomis",
        "Keyboard one-hand atau keyboard adaptif",
        "Meja kerja adjustable height (motorized)",
        "Waktu kerja fleksibel untuk manajemen energi",
    ],
    "gangguan daksa kaki": [
        "Aksesibilitas fisik: ramp, lift, pintu otomatis",
        "Parkir prioritas dekat pintu masuk",
        "Meja kerja adjustable height",
        "Toilet aksesibel kursi roda",
        "Opsi remote/hybrid work jika memungkinkan",
    ],
    "daksa kaki": [
        "Aksesibilitas fisik: ramp, lift, pintu otomatis",
        "Parkir prioritas dekat pintu masuk",
        "Meja kerja adjustable height",
        "Toilet aksesibel kursi roda",
        "Opsi remote/hybrid work jika memungkinkan",
    ],
    "autisme": [
        "Lingkungan kerja terstruktur dengan jadwal konsisten",
        "Ruang kerja tenang atau noise-cancelling headphone",
        "Instruksi tugas tertulis yang jelas dan terperinci",
        "Check-in rutin dengan supervisor (jadwal tetap)",
        "Komunikasi tertulis diutamakan",
    ],
    "gangguan spektrum autisme": [
        "Lingkungan kerja terstruktur dengan jadwal konsisten",
        "Ruang kerja tenang atau noise-cancelling headphone",
        "Instruksi tugas tertulis yang jelas dan terperinci",
        "Check-in rutin dengan supervisor (jadwal tetap)",
        "Komunikasi tertulis diutamakan",
    ],
    "acquired brain injury": [
        "Tugas dipecah menjadi langkah-langkah kecil (task chunking)",
        "Pengingat digital (reminder apps, calendar)",
        "Tempo kerja yang fleksibel, tidak ada tekanan multitasking",
        "Lingkungan kerja tenang dengan distraksi minimal",
        "Dukungan job coach untuk adaptasi awal",
    ],
    "gangguan mental": [
        "Jadwal kerja yang konsisten dan dapat diprediksi",
        "Akses ke layanan konseling atau EAP (Employee Assistance Program)",
        "Beban kerja yang realistis tanpa overtime berlebihan",
        "Lingkungan kerja suportif dan anti-stigma",
        "Fleksibilitas untuk appointment medis rutin",
    ],
    "gangguan intelektual": [
        "Instruksi kerja sederhana dengan visual aids",
        "Task management tools (Trello, Todoist)",
        "Mentor/buddy system di tempat kerja",
        "Waktu adaptasi yang lebih panjang saat onboarding",
        "Review tugas berkala yang suportif",
    ],
}

def get_accommodation(disability_type: str) -> list[str]:
    key = disability_type.lower().strip()
    if key in ACCOMMODATION_MAP:
        return ACCOMMODATION_MAP[key]
    for k, v in ACCOMMODATION_MAP.items():
        if k in key or key in k:
            return v
    return [
        "Konsultasikan kebutuhan akomodasi spesifik dengan HR",
        "Evaluasi ergonomis workstation",
        "Fleksibilitas jadwal kerja sesuai kebutuhan",
        "Akses ke teknologi asistif yang relevan",
    ]


# ─── RECOMMENDATION ENGINE ────────────────────────────────────────────────────

DISABILITY_MATCH_THRESHOLD = 0.5

class RecommendationEngine:

    def __init__(self, index_dir: str = "data/index", model_key: str = "multilingual_minilm"):
        import faiss
        from sentence_transformers import SentenceTransformer

        print("🚀 Memuat RecommendationEngine v4...")

        with open(f"{index_dir}/config.json") as f:
            self.config = json.load(f)

        self.index = faiss.read_index(f"{index_dir}/jobs.faiss")
        print(f"   ✓ FAISS index: {self.index.ntotal} vektor")

        with open(f"{index_dir}/jobs_metadata.pkl", "rb") as f:
            self.metadata = pickle.load(f)
        print(f"   ✓ Metadata: {len(self.metadata)} entri")

        model_map = {
            "multilingual_minilm": "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
            "finetuned"          : "models/finetuned",
        }
        model_name = model_map.get(model_key, model_map["multilingual_minilm"])
        self.model = SentenceTransformer(model_name)
        print(f"   ✓ Model: {model_name}")
        print("✅ Engine siap!\n")

    def _encode_query(self, text: str) -> np.ndarray:
        vec = self.model.encode([text], normalize_embeddings=True, convert_to_numpy=True)
        return vec.astype(np.float32)

    def _compute_disability_match(self, kandidat_disability: str, job_disability: str) -> float:
        k = kandidat_disability.lower().strip()
        j = job_disability.lower().strip()

        if k == j:
            return 1.0
        if k in j or j in k:
            return 0.8

        disability_groups = [
            {"tunanetra", "gangguan penglihatan", "gangguan penglihatan (tunanetra)"},
            {"tunarungu", "gangguan pendengaran", "gangguan pendengaran / tuli (tunarungu)", "tuli"},
            {"tunawicara", "gangguan bicara (tunawicara)", "gangguan bicara"},
            {"tunadaksa", "gangguan daksa", "gangguan daksa kaki", "gangguan daksa tangan",
             "daksa kaki", "daksa tangan"},
            {"autisme", "gangguan spektrum autisme", "asd"},
            {"acquired brain injury", "abi"},
            {"disabilitas kognitif", "gangguan intelektual", "gangguan kognitif"},
            {"gangguan mental", "psikososial", "gangguan mental / psikososial"},
        ]

        for group in disability_groups:
            if any(key in k for key in group) and any(key in j for key in group):
                return 0.9

        return 0.1

    def _score_candidate(self, faiss_idx: int, sem_score: float, kandidat: "KandidatProfile", weights: dict) -> Optional["JobRecommendation"]:
        meta = self.metadata.get(int(faiss_idx), {})
        if not meta:
            return None

        skill_tags = meta.get("skill_tags", [])
        if isinstance(skill_tags, str):
            try:
                import ast
                skill_tags = ast.literal_eval(skill_tags)
            except Exception:
                skill_tags = []

        matched_skills, skill_gap, skill_ratio = compute_skill_gap(
            kandidat.normalized_skills(),
            meta.get("qualification", ""),
            skill_tags=skill_tags,
        )

        dis_score = self._compute_disability_match(
            kandidat.disability_type,
            meta.get("disability_type", ""),
        )

        sem_norm = float(np.clip(sem_score, 0, 1))

        level_bonus = 0.0
        if kandidat.preferred_level:
            if kandidat.preferred_level.lower() in meta.get("level", "").lower():
                level_bonus = 0.05

        final = (
            weights["semantic"]   * sem_norm    +
            weights["skill"]      * skill_ratio +
            weights["disability"] * dis_score   +
            level_bonus
        ) * 100

        return JobRecommendation(
            rank=0,
            job_id=meta["job_id"],
            job_title=meta["job_title"],
            disability_type=meta["disability_type"],
            level=meta["level"],
            qualification=meta["qualification"],
            accessibility=meta["accessibility"],
            semantic_score=round(sem_norm * 100, 1),
            skill_match_score=round(skill_ratio * 100, 1),
            disability_match_score=round(dis_score * 100, 1),
            final_score=round(final, 1),
            skill_gap=skill_gap[:5],
            matched_skills=matched_skills[:5],
            accommodation_suggestions=get_accommodation(kandidat.disability_type),
            explanation=self._generate_explanation(sem_norm, skill_ratio, dis_score, matched_skills, skill_gap),
        )

    def recommend(
        self,
        kandidat: "KandidatProfile",
        top_k: int = 10,
        weights: dict = None,
        filter_disability: bool = True,
        disability_threshold: float = DISABILITY_MATCH_THRESHOLD,
        min_semantic: float = 0.43,
    ) -> list["JobRecommendation"]:

        if weights is None:
            weights = {
                "semantic"   : 0.35,
                "skill"      : 0.05,
                "disability" : 0.60,
            }

        query_vec = self._encode_query(kandidat.to_query_text())

        if filter_disability:
            n_retrieve = self.index.ntotal
        else:
            n_retrieve = min(top_k * 10, self.index.ntotal)

        scores, indices = self.index.search(query_vec, n_retrieve)

        matched_results  = []
        fallback_results = []

        for faiss_idx, sem_score in zip(indices[0], scores[0]):
            if faiss_idx == -1:
                continue

            rec = self._score_candidate(faiss_idx, sem_score, kandidat, weights)
            if rec is None:
                continue

            passes_disability = (not filter_disability) or (rec.disability_match_score / 100 >= disability_threshold)
            passes_semantic   = rec.semantic_score / 100 >= min_semantic

            if passes_disability and passes_semantic:
                matched_results.append(rec)
            else:
                fallback_results.append(rec)

        matched_results.sort(key=lambda r: r.final_score, reverse=True)

        if len(matched_results) < top_k:
            fallback_results.sort(
                key=lambda r: r.semantic_score * 0.70 + r.skill_match_score * 0.30,
                reverse=True,
            )
            shortage = top_k - len(matched_results)
            matched_results.extend(fallback_results[:shortage])
            if shortage > 0:
                print(f"   ⚠️  Menambahkan {shortage} job fallback (semantic+skill ranking).")

        final_results = matched_results[:top_k]
        for i, r in enumerate(final_results, start=1):
            r.rank = i

        return final_results

    def _generate_explanation(self, sem_score: float, skill_score: float, dis_score: float, matched: list, gap: list) -> str:
        parts = []

        if sem_score > 0.8:
            parts.append("Sangat relevan secara semantik dengan profil kamu.")
        elif sem_score > 0.6:
            parts.append("Cukup relevan dengan profil dan pengalamanmu.")
        elif sem_score > 0.4:
            parts.append("Ada kemiripan pada beberapa aspek profil.")
        else:
            parts.append("Relevansi semantik rendah — pertimbangkan opsi lain.")

        if matched:
            parts.append(f"Skill yang sudah kamu miliki: {', '.join(matched[:3])}.")

        if gap:
            parts.append(f"Perlu diperkuat: {', '.join(gap[:3])}.")
        elif skill_score > 0.7:
            parts.append("Kamu memiliki sebagian besar skill yang dibutuhkan.")
        elif skill_score == 0:
            parts.append("Skill kamu belum terdeteksi cocok — cek kembali data skills-mu.")

        if dis_score >= 0.9:
            parts.append("Posisi ini dirancang khusus untuk profil disabilitasmu.")
        elif dis_score < 0.5:
            parts.append("⚠️ Perhatian: profil disabilitas tidak sesuai posisi ini (fallback).")

        return " ".join(parts)


# ─── DEMO ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    engine = RecommendationEngine()

    kandidat = KandidatProfile(
        disability_type="Gangguan Penglihatan (Tunanetra)",
        skills=["R", "Power BI", "NumPy", "Tableau", "Machine Learning Dasar"],
        functional_profile=(
            "Mengalami gangguan penglihatan total sejak lahir. "
            "Ahli data analyst dan business intelligence menggunakan JAWS. "
            "Lulus S1 Teknik Informatika."
        ),
        preferred_level="Mid level",
    )

    print(f"Query: {kandidat.to_query_text()}\n")
    results = engine.recommend(kandidat, top_k=5)

    for r in results:
        print(f"#{r.rank} [{r.final_score:.1f}] {r.job_title} — {r.level}")
        print(f"  Semantic:{r.semantic_score:.1f}% | Skill:{r.skill_match_score:.1f}% | Disability:{r.disability_match_score:.1f}%")
        print(f"  {r.explanation}\n")

    import json
    from dataclasses import asdict
    with open("data/processed/sample_recommendations.json", "w", encoding="utf-8") as f:
        json.dump([asdict(r) for r in results], f, ensure_ascii=False, indent=2)
    print("💾 Tersimpan → data/processed/sample_recommendations.json")