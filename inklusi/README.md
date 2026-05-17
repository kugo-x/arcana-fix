# InklusiKerja — ML System Documentation
## Semantic Job Recommendation for People with Disabilities

---

## 📁 Struktur File

```
inklusikerja_ml/
├── 01_preprocessing.py       # Data cleaning & document builder
├── 02_embedding.py           # SBERT embedding + FAISS index builder
├── 03_recommendation_engine.py  # Core recommendation logic
├── 04_api.py                 # FastAPI REST endpoints
├── 05_evaluation.py          # Model evaluation & fine-tuning guide
├── requirements.txt          # Dependencies
└── data/
    ├── job_titles_disabilitas.csv   # Dataset pekerjaan (450 baris)
    ├── kandidat_dummy.csv           # Dataset kandidat (250 baris)
    ├── processed/                   # Output preprocessing
    └── index/                       # FAISS index + metadata
```

---

## 🚀 Cara Menjalankan (Step by Step)

### 1. Install Dependencies
```bash
pip install sentence-transformers faiss-cpu fastapi uvicorn \
            pandas numpy scikit-learn
```

### 2. Siapkan Data
```bash
mkdir -p data/processed data/index
# Salin CSV ke folder data/
cp job_titles_disabilitas.csv data/
cp kandidat_dummy.csv data/
```

### 3. Preprocessing
```bash
python 01_preprocessing.py
# Output: data/processed/jobs_processed.csv
#         data/processed/kandidat_processed.csv
```

### 4. Build Embedding Index
```bash
python 02_embedding.py
# Output: data/index/jobs.faiss
#         data/index/jobs_metadata.pkl
#         data/index/config.json
# Estimasi waktu: 1-3 menit (tergantung GPU/CPU)
```

### 5. Test Recommendation Engine
```bash
python 03_recommendation_engine.py
# Menampilkan 5 rekomendasi untuk kandidat demo
```

### 6. Jalankan API Server
```bash
uvicorn 04_api:app --host 0.0.0.0 --port 8000 --reload
# API tersedia di: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### 7. Evaluasi Model
```bash
python 05_evaluation.py
# Menampilkan perbandingan model & laporan evaluasi
```

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                        InklusiKerja ML                         │
└─────────────────────────────────────────────────────────────────┘

INPUT: Profil Kandidat
  ├── disability_type: "Tunanetra"
  ├── skills: ["Python", "Tableau", "SQL"]
  └── functional_profile: "Data analyst dengan gangguan penglihatan..."

        │
        ▼
┌──────────────────────────┐
│   1. TEXT PREPROCESSING  │  clean_text(), build_kandidat_document()
│   Gabungkan semua field  │
│   jadi 1 teks query      │
└──────────────┬───────────┘
               │
               ▼
┌──────────────────────────┐
│   2. SBERT ENCODING      │  paraphrase-multilingual-MiniLM-L12-v2
│   Text → Vector (384D)   │  atau LazarusNLP/indobert-base-p2 (768D)
│   + L2 normalization     │
└──────────────┬───────────┘
               │  query vector (1, 384)
               ▼
┌──────────────────────────┐
│   3. FAISS SEARCH        │  IndexFlatIP (exact cosine similarity)
│   Retrieve top-50 jobs   │  scores: cosine similarity 0.0–1.0
│   dari 450 job index     │
└──────────────┬───────────┘
               │  [(job_idx, semantic_score), ...]
               ▼
┌──────────────────────────────────────────────────────────────┐
│   4. MULTI-FACTOR RE-RANKING                                  │
│                                                               │
│   final_score = 0.55 × semantic_score                        │
│               + 0.30 × skill_match_score   ← skill overlap   │
│               + 0.15 × disability_match    ← jenis disabilitas│
│               + 0.05 × level_bonus         ← preferred level  │
│                                                               │
│   skill_match: Jaccard similarity(kandidat_skills, job_skills)│
│   disability_match: Exact/partial/group matching              │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────┐
│   5. OUTPUT GENERATION   │
│   • Top-K recommendations│
│   • Skill gap analysis   │
│   • Accommodation list   │
│   • Score explanation    │
└──────────────────────────┘
```

---

## 📡 API Reference

### POST /api/match
```json
Request:
{
  "disability_type": "Tunanetra",
  "skills": ["Python", "Tableau", "SQL"],
  "functional_profile": "Data analyst dengan gangguan penglihatan total...",
  "preferred_level": "Mid level",
  "top_k": 5
}

Response:
{
  "status": "success",
  "total_results": 5,
  "recommendations": [
    {
      "rank": 1,
      "job_id": "JOB0042",
      "job_title": "Data Analyst",
      "level": "Mid level",
      "semantic_score": 87.3,
      "skill_match_score": 75.0,
      "disability_match_score": 100.0,
      "final_score": 85.4,
      "skill_gap": ["machine learning", "spark"],
      "matched_skills": ["python", "sql", "tableau"],
      "accommodation_suggestions": [
        "Screen reader (NVDA/JAWS/VoiceOver)",
        "Display braille atau braille note taker",
        ...
      ],
      "explanation": "Sangat relevan secara semantik. Skill yang sudah kamu miliki: python, sql, tableau. Perlu diperkuat: machine learning."
    }
  ]
}
```

### POST /api/wage-check
```json
Request:
{
  "location": "Jakarta",
  "offered_salary": 4500000,
  "job_title": "Data Analyst"
}

Response:
{
  "region": "Jakarta",
  "umk_value": 5372139,
  "offered_salary": 4500000,
  "status": "TIDAK LAYAK",
  "selisih": -872139,
  "persentase": 83.8,
  "pesan": "⚠️ PERINGATAN: Gaji Rp 4,500,000 DI BAWAH UMK Jakarta..."
}
```

---

## 🤖 Pilihan Model

| Model | Ukuran | Bahasa ID | Kecepatan | Rekomendasi |
|---|---|---|---|---|
| `paraphrase-multilingual-MiniLM-L12-v2` | ~450MB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Hackathon |
| `paraphrase-multilingual-mpnet-base-v2` | ~1.1GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Produksi umum |
| `LazarusNLP/indobert-base-p2` | ~500MB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ **TERBAIK untuk InklusiKerja** |
| `LazarusNLP/IndoNanoT5-base` | ~850MB | ⭐⭐⭐⭐⭐ | ⭐⭐ | Alternatif |

**Kenapa `indobert-base-p2` lebih baik untuk use case ini?**
- Fine-tuned pada dataset semantic similarity Bahasa Indonesia
- Memahami nuansa frasa seperti "tunanetra", "tunarungu", "aksesibilitas"
- Embedding lebih diskriminatif antar kategori disabilitas
- Ukuran kompetitif dengan MiniLM, akurasi jauh lebih tinggi

**Keterbatasan `paraphrase-multilingual-MiniLM-L12-v2`:**
- Model generik, tidak terlatih pada teks disabilitas/aksesibilitas Indonesia
- 384 dimensi lebih sedikit → representasi kurang kaya
- Cenderung menganggap teks serupa secara sintaksis = semantik sama
- Untuk hackathon: CUKUP. Untuk produksi: upgrade ke IndoBERT.

---

## 📊 Strategi Evaluasi

### Metrik yang digunakan:
1. **Silhouette Score** — kualitas clustering embedding per disability type
2. **Disability Precision@K** — % top-K hasil yang cocok disability type
3. **Score Distribution** — apakah skor terdistribusi wajar (std dev > 10)
4. **Manual Review** — spot check 20–30 hasil rekomendasi

### Target performa:
- Silhouette > 0.4 → clustering bagus
- Disability Precision@5 > 0.6 → 3 dari 5 hasil relevan
- Score std dev: 10–25 (diskriminatif tapi tidak ekstrem)

---

## 🔧 Fine-Tuning (jika perlu)

Lihat `fine_tuning_guide.py` untuk implementasi lengkap.

Ringkasan:
1. Generate positive/negative pairs dari dataset (pasangan kandidat-pekerjaan)
2. Gunakan `CosineSimilarityLoss` atau `MultipleNegativesRankingLoss`
3. Fine-tune 3–5 epoch, batch size 16
4. Re-build FAISS index dengan model baru

Butuh minimal ~500 pasangan data untuk fine-tuning yang efektif.
Dengan 250 kandidat × 450 pekerjaan → potensi 2000+ pasangan.

---

## 👥 Integrasi dengan Tim

| Tim | Yang perlu dilakukan |
|---|---|
| **Zikri (ML)** | Jalankan step 1-5, deploy ke Railway/Render |
| **Trilen (Backend)** | Consume `/api/match` dan `/api/wage-check` dari Supabase Edge Function |
| **Dimas (Frontend)** | Tampilkan `recommendations[]` dan `accommodation_suggestions[]` |

### Format response untuk Dimas:
```javascript
// Setelah dapat response dari /api/match:
const { recommendations } = response;
recommendations.forEach(job => {
  // Tampilkan: job.job_title, job.final_score, job.skill_gap
  // Badge warna: final_score > 80 → hijau, 60-80 → kuning, <60 → merah
  // Akomodasi: job.accommodation_suggestions (render sebagai card)
});
```
