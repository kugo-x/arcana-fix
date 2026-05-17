# Integrasi ML ke ARCANA (be-core3d + fe)

## Arsitektur Integrasi

```
[fe] kandidat/hasil
     ↓ GET /api/match/last
[be-core3d] match.js
     ↓ POST /api/match/direct  ← saat kandidat melamar
[inklusi] 04_api.py (FastAPI, port 8000)
     ↓ encode + cosine similarity
[03_recommendation_engine.py] SentenceTransformers + skill gap + accommodation
```

## Cara Kerja

1. **Kandidat melamar** pekerjaan di `JobDetail` → `POST /api/match` (be-core3d, port 3000)
2. Backend Node.js mengambil:
   - Profil kandidat: `disability_type`, `skills`, `functional_profile`
   - Detail job: `title`, `description`, `required_skills`
3. Backend memanggil **`POST http://localhost:8000/api/match/direct`** dengan payload lengkap
4. ML API melakukan:
   - Encode teks kandidat & teks job dengan **Sentence Transformers** (multilingual-MiniLM)
   - Hitung **cosine similarity** → `semantic_score`
   - Hitung **skill overlap** → `skill_match_score`
   - Hitung **disability match** → `disability_match_score`
   - Gabungkan: `final_score = 0.35×semantic + 0.05×skill + 0.60×disability`
   - Generate **explanation** & **accommodation_suggestions**
5. Hasil disimpan ke DB (kolom `ml_details` JSON, `match_score` FLOAT)
6. Di halaman `http://localhost:5173/kandidat/hasil`:
   - **ScoreRing** besar menampilkan `final_score` dari ML
   - **AI Score Breakdown** memperlihatkan 3 sub-skor + bar animasi
   - **Analisis AI** menampilkan penjelasan naratif dari model
   - **Skill yang Dimiliki** (dari ML matched_skills)
   - **Skill Gap** (dari ML skill_gap)
   - **Rekomendasi Akomodasi** (dari ML accommodation_suggestions)
   - Jika ML tidak tersedia → fallback ke kalkulasi lokal

## Setup

### 1. Jalankan ML API
```bash
cd inklusi
pip install -r requirements.txt
# Pastikan data/index/ sudah ada (jalankan 01_preprocessing.py & 02_embedding.py)
uvicorn 04_api:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Jalankan migrasi DB
```bash
cd be-core3d
npm run migrate:ml
```

### 3. Tambahkan ke .env (be-core3d)
```
ML_API_URL=http://localhost:8000
```

### 4. Jalankan backend
```bash
cd be-core3d
npm run dev
```

### 5. Jalankan frontend
```bash
cd fe
pnpm dev
```

## Endpoint ML yang Digunakan

| Endpoint | Method | Digunakan oleh |
|---|---|---|
| `/api/match/direct` | POST | be-core3d/match.js saat kandidat melamar |
| `/api/health` | GET | Cek status ML API |
| `/api/match` | POST | (opsional) Rekomendasi dari FAISS index |

## Fallback Behavior

Jika ML API tidak berjalan (timeout 10s), sistem otomatis menggunakan kalkulasi lokal:
- `match_score` = skill overlap % + bonus random
- `accommodations` = dari `ACCOMMODATION_MAP` lokal
- `ml_details.source` = `"fallback"` → tidak tampilkan AI Score Breakdown di FE

## Field `ml_details` (disimpan di DB sebagai JSON)

```json
{
  "semantic_score": 74.3,
  "skill_match_score": 60.0,
  "disability_match_score": 100.0,
  "final_score": 85.5,
  "explanation": "Cukup relevan dengan profil...",
  "matched_skills": ["python", "sql"],
  "skill_gap": ["docker", "kubernetes"],
  "accommodation_suggestions": ["Screen reader (NVDA/JAWS/VoiceOver)", "..."],
  "source": "ml_direct"
}
```
