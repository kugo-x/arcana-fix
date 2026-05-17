# ✅ InklusiKerja — Hackathon Master Checklist

> **Stack:** React (Frontend) · Supabase (Backend) · HuggingFace Indonesian Model (ML)  
> **Tim:** Zakky (Pitching) · Rafi (Media & Demo) · Dimas (Frontend) · Trilen (Backend) · Zikri (ML)

---

## 🧠 ZIKRI — Machine Learning

### Setup & Environment
- [ ] Setup Python environment + install dependencies (`transformers`, `fastapi`, `uvicorn`, `scikit-learn`, `pandas`)
- [ ] Download & test HuggingFace Indonesian model (rekomendasi: `indolem/indobert-base-uncased` atau `LazarusNLP/IndoNanoT5`)
- [ ] Buat endpoint FastAPI lokal untuk menerima input dan mengembalikan hasil matching

### Semantic Matcher & Gap Analysis
- [ ] Buat fungsi encode skill kandidat → vektor embedding
- [ ] Buat fungsi encode job description perusahaan → vektor embedding
- [ ] Implementasi cosine similarity untuk matching score (0–100%)
- [ ] Logic mapping kebutuhan akomodasi berdasarkan profil disabilitas:
  - [ ] Tunanetra → rekomendasi screen reader, workstation
  - [ ] Tunarungu → rekomendasi visual alert, caption tools
  - [ ] Tunadaksa → rekomendasi aksesibilitas fisik, ergonomis
  - [ ] Disabilitas kognitif → rekomendasi task management tools
- [ ] Output: JSON `{ match_score, skill_gap[], accommodation_suggestions[] }`

### Smart Wage Classifier
- [ ] Buat/import database UMP/UMK 2026 per provinsi/kota (CSV/JSON)
- [ ] Buat logic klasifikasi jenis pekerjaan (berdasarkan job title + skill)
- [ ] Mapping otomatis: lokasi perusahaan → UMP/UMK yang berlaku
- [ ] Fungsi validasi: gaji yang ditawarkan ≥ atau < UMP/UMK?
- [ ] Output: JSON `{ region, umk_value, offered_salary, status: "LAYAK"/"TIDAK LAYAK", selisih }`

### Integrasi & Deployment
- [ ] Wrap semua fungsi ML dalam 2 endpoint FastAPI:
  - [ ] `POST /api/match` → semantic matching + accommodation
  - [ ] `POST /api/wage-check` → wage validation
- [ ] Test endpoint dengan Postman / curl
- [ ] Deploy ke server yang bisa diakses frontend (Railway / ngrok / Render — pilih yang paling cepat)
- [ ] Dokumentasikan response format untuk Trilen & Dimas

---

## 🗄️ TRILEN — Backend (Supabase)

### Setup Supabase
- [ ] Buat project baru di Supabase
- [ ] Setup environment variables (URL + anon key) dan bagikan ke Dimas
- [ ] Enable Row Level Security (RLS) di semua tabel

### Database Schema — Buat Tabel
- [ ] Tabel `candidates`
  - [ ] `id`, `user_id`, `name`, `disability_type`, `location`, `skills[]`, `cv_url`, `functional_profile`, `created_at`
- [ ] Tabel `companies`
  - [ ] `id`, `user_id`, `company_name`, `location`, `office_conditions`, `created_at`
- [ ] Tabel `job_posts`
  - [ ] `id`, `company_id`, `title`, `description`, `required_skills[]`, `offered_salary`, `location`, `created_at`
- [ ] Tabel `match_results`
  - [ ] `id`, `candidate_id`, `job_id`, `match_score`, `skill_gap`, `accommodation_report`, `wage_status`, `created_at`
- [ ] Tabel `users` (role-based: `candidate` / `company`)

### Auth
- [ ] Setup Supabase Auth (email/password)
- [ ] Tambahkan kolom `role` di metadata user saat register
- [ ] Buat RLS policy: kandidat hanya bisa lihat data sendiri, perusahaan hanya bisa lihat job mereka sendiri

### Storage
- [ ] Setup Supabase Storage bucket `cv-uploads` (untuk upload CV kandidat)
- [ ] Set policy: hanya user yang login bisa upload, file hanya bisa dibaca oleh pemilik + perusahaan terkait

### API Integration dengan ML
- [ ] Buat Supabase Edge Function atau endpoint proxy untuk memanggil ML API Zikri:
  - [ ] `trigger-match` → kirim data ke `/api/match` → simpan hasil ke `match_results`
  - [ ] `trigger-wage-check` → kirim data ke `/api/wage-check` → update `match_results`
- [ ] Test end-to-end flow: insert data → trigger ML → hasil tersimpan di Supabase

### Dokumentasi untuk Dimas
- [ ] Kirimkan semua nama tabel + kolom ke Dimas
- [ ] Kirimkan contoh query Supabase JS (`select`, `insert`, `auth.signIn`)
- [ ] Konfirmasi CORS sudah allow origin frontend

---

## 💻 DIMAS — Frontend (React)

### Setup Project
- [ ] `npx create-react-app inklusikerja` atau `npm create vite@latest` (Vite lebih cepat)
- [ ] Install dependencies: `@supabase/supabase-js`, `react-router-dom`, `axios`, `tailwindcss`
- [ ] Setup Tailwind CSS
- [ ] Setup Supabase client (`src/lib/supabaseClient.js`)
- [ ] Setup React Router: definisikan semua routes

### Halaman & Komponen

#### Auth
- [ ] Halaman `/register` — form pilih role (Kandidat / Perusahaan) + email + password
- [ ] Halaman `/login` — form login, redirect sesuai role
- [ ] Guard route: halaman dashboard hanya bisa diakses jika sudah login

#### Dashboard Kandidat
- [ ] Halaman `/kandidat/profile` — form input:
  - [ ] Nama, jenis disabilitas (dropdown), lokasi
  - [ ] Skill teknis (input tag / multi-select)
  - [ ] Profil fungsional (textarea)
  - [ ] Upload CV (connect ke Supabase Storage)
- [ ] Halaman `/kandidat/jobs` — list semua job posting
- [ ] Halaman `/kandidat/hasil` — tampilkan hasil matching:
  - [ ] Match score (progress bar / badge warna)
  - [ ] Skill gap yang perlu diisi
  - [ ] Rekomendasi akomodasi (card dengan ikon)
  - [ ] Status Wage Guard: **LAYAK** (hijau) / **TIDAK LAYAK** (merah) + selisih nominal

#### Dashboard Perusahaan
- [ ] Halaman `/perusahaan/profile` — form input:
  - [ ] Nama perusahaan, lokasi, kondisi fisik kantor (checkbox: lift, ramp, toilet aksesibel, dll.)
- [ ] Halaman `/perusahaan/post-job` — form:
  - [ ] Job title, deskripsi, skill yang dibutuhkan, gaji yang ditawarkan, lokasi
- [ ] Halaman `/perusahaan/kandidat` — list kandidat yang match + tombol "Lihat Laporan Layak"
- [ ] Modal / halaman `/perusahaan/laporan/:id` — tampilkan:
  - [ ] **Laporan Layak** (instruksi teknis modifikasi kantor)
  - [ ] **Validasi Upah** real-time (UMK wilayah vs. gaji ditawarkan)

#### Komponen Global
- [ ] Navbar dengan logo InklusiKerja + menu sesuai role
- [ ] Loading spinner saat menunggu hasil ML
- [ ] Toast notification (sukses/error)
- [ ] Halaman 404

### Integrasi
- [ ] Connect form kandidat → `INSERT` ke Supabase `candidates`
- [ ] Connect form perusahaan → `INSERT` ke Supabase `companies` + `job_posts`
- [ ] Tombol "Cari Match" → panggil Edge Function Trilen → polling hasil dari `match_results`
- [ ] Render hasil matching dari Supabase secara real-time (gunakan Supabase `subscribe` jika sempat)

### UI Polish (koordinasi dengan Rafi)
- [ ] Implementasikan feedback visual dari Rafi setelah review tampilan
- [ ] Pastikan tampilan responsif (mobile & desktop)
- [ ] Warna tema: konsisten dengan branding InklusiKerja (koordinasi dengan Rafi)

---

## 🎬 RAFI — Media, Video Demo & UI Review

### Branding & Aset Visual
- [ ] Tentukan palet warna + font utama InklusiKerja
- [ ] Buat logo InklusiKerja (bisa Canva / Figma)
- [ ] Buat mockup tampilan utama (Figma / Canva) untuk referensi Dimas

### UI Review (Iteratif bersama Dimas)
- [ ] Review halaman register & login — feedback ke Dimas
- [ ] Review dashboard kandidat — feedback ke Dimas
- [ ] Review dashboard perusahaan — feedback ke Dimas
- [ ] Review halaman hasil matching & laporan layak — feedback ke Dimas
- [ ] Final sign-off: semua halaman sudah "enak dilihat" sebelum demo

### Video Demo
- [ ] Buat storyboard / script alur video demo (maks. 3–5 menit):
  1. Problem statement (data kuota disabilitas vs. realita)
  2. Demo register sebagai kandidat
  3. Demo input skill + upload CV
  4. Demo register sebagai perusahaan + post job
  5. Demo hasil matching → Laporan Layak + Smart Wage Guard
  6. Closing pitch line
- [ ] Record screen demo menggunakan OBS / Loom
- [ ] Edit video: tambahkan teks, highlight fitur utama, background musik ringan
- [ ] Tambahkan subtitle bahasa Indonesia
- [ ] Export video format MP4, upload ke drive tim
- [ ] Siapkan versi pendek (60 detik) untuk highlight reel jika diperlukan

### Presentasi / Slide (bantu Zakky)
- [ ] Buat deck slide pitch (Canva / Google Slides):
  - [ ] Slide 1: Problem — Double Barrier (data UU + realita)
  - [ ] Slide 2: Solusi — InklusiKerja overview
  - [ ] Slide 3: How it works (diagram alur sistem)
  - [ ] Slide 4: ML Components (Semantic Matcher + Smart Wage Guard)
  - [ ] Slide 5: Market Gap (tidak ada platform serupa di Indonesia)
  - [ ] Slide 6: Demo (screenshot / link video)
  - [ ] Slide 7: Tim + Closing pitch line

---

## 🎤 ZAKKY — Pitching

### Materi Pitch
- [ ] Hafal pitch line utama: *"Kami tidak hanya menghubungkan orang dengan kerja, kami memastikan keadilan hukum terjadi di setiap kontrak kerja."*
- [ ] Pahami data kunci:
  - [ ] UU No. 8 Tahun 2016: kuota 2% (Pemerintah/BUMN) & 1% (Swasta)
  - [ ] Realita serapan: < 0,01%
  - [ ] Pasal 11: hak upah setara
- [ ] Kuasai narasi "Double Barrier" (Hambatan Akses + Hambatan Keadilan)
- [ ] Siapkan jawaban untuk pertanyaan umum juri:
  - [ ] "Bagaimana monetisasinya?" → B2B SaaS ke perusahaan (compliance fee), freemium untuk kandidat
  - [ ] "Bagaimana akurasi ML-nya?" → koordinasi dengan Zikri untuk angka akurasi
  - [ ] "Kenapa Supabase?" → koordinasi dengan Trilen
  - [ ] "Apa bedanya dengan LinkedIn / Jobstreet?" → tidak ada platform yang gabungkan rekrutmen inklusif + wage protection otomatis

### Latihan & Simulasi
- [ ] Latihan pitch sendirian (timer 5 menit)
- [ ] Latihan pitch di depan tim → minta feedback
- [ ] Simulasi Q&A dengan tim sebagai juri
- [ ] Final run-through lengkap dengan slide + video demo

---

## 🔗 INTEGRASI TIM — Checklist Bersama

- [ ] **Kick-off:** Semua anggota baca dokumen ini + sepakati timeline
- [ ] Buat group chat / channel khusus koordinasi (WhatsApp / Discord)
- [ ] Tentukan environment variable bersama (Supabase URL, ML API URL) — simpan di `.env` dan bagikan secara privat
- [ ] **Checkpoint 1:** Backend Supabase (tabel + auth) selesai → Dimas bisa mulai connect
- [ ] **Checkpoint 2:** 1 endpoint ML selesai → Trilen bisa test integrasi
- [ ] **Checkpoint 3:** Happy path flow end-to-end berhasil (kandidat input → hasil muncul di UI)
- [ ] **Checkpoint 4:** Rafi selesai review UI → Dimas polish final
- [ ] **Checkpoint 5:** Video demo selesai → Zakky latihan dengan material lengkap
- [ ] **Final:** Semua fitur inti jalan, video siap, slide siap, Zakky siap — **GO!** 🚀

---

> 💡 **Prioritas inti jika waktu mepet:** Fokus pada happy path — Kandidat input skill → Match dengan 1 job → Muncul Laporan Layak + status Wage Guard. Fitur lain adalah bonus.