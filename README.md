<div align="center">

# 🌟 ARCANA — InklusiKerja Platform

**Platform rekrutmen inklusif berbasis AI untuk penyandang disabilitas di Indonesia**

![Platform](https://img.shields.io/badge/platform-web-blue?style=for-the-badge)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20Python-brightgreen?style=for-the-badge)
![Status](https://img.shields.io/badge/status-active-success?style=for-the-badge)

</div>

---

## 📖 Tentang Proyek

**InklusiKerja** adalah platform rekrutmen berbasis kecerdasan buatan yang dirancang khusus untuk mempertemukan pencari kerja penyandang disabilitas dengan perusahaan-perusahaan inklusif. Platform ini menggunakan teknologi *Semantic Job Matching* dengan model bahasa SBERT (Sentence-BERT) untuk menghasilkan rekomendasi pekerjaan yang relevan, akurat, dan inklusif.

### ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🤖 **AI Job Matching** | Rekomendasi pekerjaan semantik berbasis SBERT + FAISS dengan multi-factor re-ranking |
| ♿ **Profil Inklusif** | Pencocokan berdasarkan jenis disabilitas, skill, dan preferensi kandidat |
| 🏢 **Dashboard Perusahaan** | Kelola lowongan, pantau kepatuhan inklusi, dan lihat kandidat terverifikasi |
| 💰 **Simulator UMK** | Cek kewajaran gaji terhadap UMK/UMP daerah secara real-time |
| 🛡️ **Badge Inklusif** | Sistem verifikasi dan sertifikasi perusahaan ramah disabilitas |
| 📊 **Analytics** | Laporan kepatuhan, statistik rekrutmen, dan insight platform |

---

## 🗂️ Struktur Monorepo

```
ARCANA/
├── fe/               # Frontend — React + Vite + TypeScript
├── be-core3d/        # Backend API — Node.js + Express + MySQL
└── inklusi/          # ML Pipeline — Python + FastAPI + SBERT + FAISS
```

---

## ⚙️ Prasyarat

Pastikan semua software berikut sudah terinstal sebelum memulai:

| Software | Versi Minimum | Cek Instalasi |
|---|---|---|
| **Node.js** | v18+ | `node -v` |
| **npm** | v9+ | `npm -v` |
| **pnpm** | v8+ | `pnpm -v` |
| **MySQL** | v8.0+ | `mysql --version` |
| **Python** | v3.10+ | `python --version` |
| **pip** | v23+ | `pip --version` |

> **Install pnpm** (jika belum): `npm install -g pnpm`

---

## 🚀 Cara Menjalankan (Lengkap)

> ⚠️ Jalankan **tiga terminal/tab terpisah** secara bersamaan: satu untuk backend, satu untuk ML API, dan satu untuk frontend.

---

### Langkah 1 — Clone & Masuk ke Direktori

```bash
git clone <url-repo-ini>
cd ARCANA
```

---

### Langkah 2 — Setup Backend (be-core3d)

#### 2a. Install dependencies

```bash
cd be-core3d
npm install
```

#### 2b. Konfigurasi environment

```bash
# Salin template env
copy .env.example .env    # Windows
# atau
cp .env.example .env      # Mac/Linux
```

Edit file `.env` sesuai konfigurasi lokal:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_mysql_anda
DB_NAME=inklusikerja_db

# Server
PORT=3000
NODE_ENV=development

# JWT (ganti dengan string acak yang kuat)
JWT_SECRET=ganti_dengan_secret_yang_kuat_minimal_64_karakter
JWT_EXPIRES_IN=7d

# ML API
ML_API_URL=http://localhost:8000
```

#### 2c. Setup database

Pastikan MySQL sudah berjalan, lalu buat database:

```sql
-- Di MySQL client / phpMyAdmin / DBeaver:
CREATE DATABASE inklusikerja_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Kemudian jalankan migrasi dan seed data:

```bash
# Jalankan migrasi tabel
npm run migrate

# Isi data awal (referensi disabilitas, UMK, dll)
npm run seed
```

> Atau shortcut: `npm run setup` (migrate + seed sekaligus)

#### 2d. Jalankan backend

```bash
npm run dev
```

✅ Backend berjalan di: `http://localhost:3000`  
✅ Health check: `http://localhost:3000/health`

---

### Langkah 3 — Setup ML Pipeline (inklusi)

#### 3a. Buat virtual environment Python

```bash
cd ../inklusi

# Buat venv
python -m venv .venv

# Aktifkan venv
.venv\Scripts\activate      # Windows
# atau
source .venv/bin/activate   # Mac/Linux
```

#### 3b. Install dependencies Python

```bash
pip install -r requirements.txt
```

> ⏱️ Proses ini bisa memakan waktu 5–10 menit karena mengunduh model SBERT (~450 MB).

#### 3c. Inisialisasi data & index (hanya perlu sekali)

```bash
# Step 1: Preprocessing data
python 01_preprocessing.py

# Step 2: Build embedding index FAISS
python 02_embedding.py
```

> ⏱️ `02_embedding.py` membutuhkan waktu 1–5 menit tergantung CPU/GPU.

#### 3d. Jalankan ML API

```bash
uvicorn 04_api:app --host 0.0.0.0 --port 8000 --reload
```

✅ ML API berjalan di: `http://localhost:8000`  
✅ Dokumentasi interaktif: `http://localhost:8000/docs`

---

### Langkah 4 — Setup Frontend (fe)

#### 4a. Install dependencies

```bash
cd ../fe
pnpm install
```

#### 4b. Konfigurasi environment

```bash
# Buat file .env
echo VITE_API_URL=http://localhost:3000 > .env
```

#### 4c. Jalankan frontend

```bash
pnpm dev
```

✅ Frontend berjalan di: `http://localhost:5173`

---

## 🖥️ Ringkasan Port & URL

| Layanan | URL | Keterangan |
|---|---|---|
| **Frontend** | `http://localhost:5173` | Antarmuka pengguna |
| **Backend API** | `http://localhost:3000` | REST API utama |
| **ML API** | `http://localhost:8000` | Rekomendasi AI |
| **ML API Docs** | `http://localhost:8000/docs` | Swagger UI interaktif |
| **Health Check** | `http://localhost:3000/health` | Status backend |

---

## 📡 API Endpoints Utama

### Authentication
| Method | Endpoint | Keterangan |
|---|---|---|
| `POST` | `/api/auth/register` | Registrasi kandidat/perusahaan |
| `POST` | `/api/auth/login` | Login |

### Kandidat
| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/kandidat/profile` | Ambil profil kandidat |
| `PUT` | `/api/kandidat/profile` | Update profil |

### Perusahaan
| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/perusahaan/profile` | Profil perusahaan |
| `GET` | `/api/perusahaan/compliance` | Status kepatuhan inklusi |

### Pekerjaan & Matching
| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/jobs` | Daftar lowongan |
| `POST` | `/api/jobs` | Buat lowongan baru |
| `POST` | `/api/match` | AI job matching untuk kandidat |

### Referensi & UMK
| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/ref/disability-types` | Jenis disabilitas |
| `GET` | `/api/umk/:region` | Data UMK per daerah |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐     HTTP      ┌──────────────────┐
│   React + Vite  │ ────────────► │  Express API     │
│   (Port 5173)   │               │  (Port 3000)     │
└─────────────────┘               └────────┬─────────┘
                                           │ HTTP
                                           ▼
                                  ┌──────────────────┐
                                  │  FastAPI + SBERT │
                                  │  (Port 8000)     │
                                  └────────┬─────────┘
                                           │
                              ┌────────────┴────────────┐
                              │                         │
                     ┌────────▼────────┐    ┌──────────▼──────────┐
                     │   MySQL DB      │    │  FAISS Vector Index  │
                     │  (inklusikerja) │    │  (data/index/)       │
                     └─────────────────┘    └─────────────────────┘
```

---

## 🔧 Troubleshooting

### ❌ Backend gagal connect ke database
- Pastikan MySQL service berjalan
- Cek `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` di `.env`
- Pastikan database `inklusikerja_db` sudah dibuat

### ❌ ML API error saat startup
- Pastikan sudah menjalankan `01_preprocessing.py` dan `02_embedding.py` terlebih dahulu
- Cek folder `data/index/` sudah berisi file `jobs.faiss` dan `jobs_metadata.pkl`
- Pastikan virtual environment Python sudah aktif

### ❌ Frontend tidak bisa connect ke backend
- Pastikan `VITE_API_URL` di `fe/.env` mengarah ke `http://localhost:3000`
- Pastikan backend sudah berjalan dan tidak ada error di terminal backend

### ❌ `pnpm: command not found`
```bash
npm install -g pnpm
```

---

## 🛠️ Tech Stack

### Frontend (`fe/`)
- **Framework**: React 18 + Vite 6
- **Language**: TypeScript
- **UI Library**: Radix UI + shadcn/ui + MUI
- **Styling**: Tailwind CSS v4
- **Animasi**: Framer Motion
- **Charts**: Recharts
- **Routing**: React Router v7

### Backend (`be-core3d/`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8 (via `mysql2`)
- **Auth**: JWT (`jsonwebtoken` + `bcryptjs`)
- **Dev**: Nodemon

### ML Pipeline (`inklusi/`)
- **Language**: Python 3.10+
- **API Framework**: FastAPI + Uvicorn
- **Embedding Model**: SBERT (`paraphrase-multilingual-MiniLM-L12-v2`)
- **Vector Search**: FAISS
- **Data Processing**: Pandas + NumPy + Scikit-learn

---

## 👥 Tim

| Nama | Role |
|---|---|
| **Zikri** | Machine Learning Engineer |
| **Trilen** | Backend Developer |
| **Dimas** | Frontend Developer |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan kompetisi/hackathon. Seluruh hak cipta dimiliki oleh tim ARCANA.
