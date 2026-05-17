Build a professional, production-grade web app called **InklusiKerja** — an AI-powered inclusive recruitment platform for people with disabilities in Indonesia, with built-in wage protection (Smart Wage Guard).

---

## DESIGN DIRECTION

**Aesthetic:** Refined civic-tech — authoritative yet warm. Think the intersection of a modern Indonesian government service and a premium B2B SaaS product. NOT corporate-cold. NOT startup-bubbly. The feeling should be: "This is trustworthy and this was built with purpose."

**Visual Identity:**
- **Primary Color:** Deep Teal `#0D7377` (trust, inclusivity)
- **Accent:** Amber `#F5A623` (justice, warmth — used for Wage Guard badges and CTAs)
- **Neutral Base:** Off-white `#F8F7F4` background (not pure white — feels more human)
- **Dark Surface:** `#1A1A2E` for headers, sidebars
- **Success:** `#2ECC71` for LAYAK status
- **Danger:** `#E74C3C` for TIDAK LAYAK status
- **Typography:**
  - Display / Headings: `DM Serif Display` (authoritative, elegant)
  - Body / UI: `Plus Jakarta Sans` (modern, Indonesian-made, highly legible)
- **Motion:** Subtle fade-ins on page load, smooth state transitions on badges and score bars. No flashy animations — purposeful only.
- **Grain texture** overlay on hero section (very subtle, 3–5% opacity noise) to avoid flat AI-generated look.

---

## PAGES TO BUILD

### 1. Landing Page (`/`)

**Hero Section:**
- Full-width, dark teal background (`#0D7377`) with subtle grain overlay
- Large DM Serif Display headline (2 lines max):
  > "Rekrutmen Inklusif. Upah yang Adil. Untuk Semua."
- Subheadline in Plus Jakarta Sans, muted white:
  > "Platform pertama di Indonesia yang menggabungkan rekrutmen disabilitas dengan proteksi upah otomatis berbasis UMP/UMK 2026."
- Two CTA buttons side by side:
  - Primary (Amber `#F5A623`, dark text): "Daftar sebagai Kandidat"
  - Secondary (outline white): "Daftar sebagai Perusahaan"
- Below: A floating 3-column stat strip (white card, slight shadow):
  - "< 0.01% serapan tenaga kerja disabilitas saat ini"
  - "UU No. 8/2016 mewajibkan kuota 1–2%"
  - "Jutaan pekerja tidak tahu hak upah mereka"

**How It Works Section:**
- 3-step horizontal flow with connecting line:
  1. "Input Profil & Skill" (kandidat) or "Input Job & Kondisi Kantor" (perusahaan)
  2. "AI Matching Otomatis" — icon of neural network
  3. "Terima Laporan Layak + Validasi Upah Real-time"
- Each step: icon, bold number, short label, 1-sentence description

**Feature Cards Section (2 main features):**
- Card 1 — **Semantic Job Matcher:**
  - Icon: two puzzle pieces connecting
  - Title: "Pencocokan Skill Cerdas"
  - Desc: "Model AI berbahasa Indonesia mencocokkan skill kandidat dengan lowongan dan merekomendasikan akomodasi kerja yang spesifik — screen reader, workstation ergonomis, hingga sistem visual alert."
- Card 2 — **Smart Wage Guard:**
  - Icon: shield with checkmark
  - Title: "Perisai Keadilan Upah"
  - Accent Amber badge: "BARU"
  - Desc: "Validasi otomatis apakah gaji yang ditawarkan memenuhi UMP/UMK 2026 berdasarkan lokasi perusahaan. Transparan, real-time, berbasis hukum."

**Footer:**
- Dark (`#1A1A2E`), logo left, tagline center, "InklusiKerja © 2026" right
- Very minimal — no clutter

---

### 2. Register / Login Pages (`/register`, `/login`)

- Split-layout: Left side = brand panel (teal bg, logo, tagline, abstract geometric pattern with diagonal lines), Right side = form
- Register: Role selector first — two large toggle cards:
  - "Saya Pencari Kerja" (person icon)
  - "Saya Perusahaan" (building icon)
  Selected state: teal border + amber dot indicator
- Then: Email + Password fields, "Daftar" button (full width, teal)
- Login: Email + Password + "Masuk" button + link to register
- Form fields: rounded `8px`, `1.5px` border `#D4D0C8`, focus state = teal border glow
- No decorative gradients. Clean, spacious.

---

### 3. Candidate Dashboard (`/kandidat/profile`)

**Layout:** Fixed left sidebar (dark `#1A1A2E`) + main content area (off-white)

**Sidebar:**
- Logo top
- Nav items with icons: Profil Saya, Cari Kerja, Hasil Matching, Keluar
- Active state: amber left border + teal background tint

**Main Content — Profile Form:**
- Section header: "Lengkapi Profilmu" in DM Serif Display
- Form in a clean white card with `16px` padding, `12px` border-radius, soft shadow
- Fields:
  - Nama Lengkap
  - Jenis Disabilitas (dropdown: Tunanetra, Tunarungu, Tunadaksa, Disabilitas Kognitif, Lainnya)
  - Lokasi (dropdown provinsi/kota)
  - Skill Teknis (tag-style multi-input — user types, presses Enter, tag appears in teal chip)
  - Profil Fungsional (textarea, placeholder: "Ceritakan cara terbaik kamu bekerja...")
  - Upload CV (drag-and-drop zone, dashed border, cloud upload icon)
- Save button: teal, full-width

---

### 4. Candidate — Job List (`/kandidat/jobs`)

- Search bar top with filter: Lokasi, Jenis Disabilitas Akomodasi
- Job cards in 2-column grid:
  - Company name + logo placeholder
  - Job title (DM Serif Display, `20px`)
  - Location badge (pill, grey)
  - Top 3 required skills as chips
  - Salary range
  - "Lamar & Cek Kecocokan" button (teal, full width on card)
- Card hover: slight lift shadow, teal top-border appears

---

### 5. Candidate — Match Result (`/kandidat/hasil`)

- Top: "Hasil Analisis AI" heading + company + job title

**Match Score Block (hero card, teal bg):**
- Large circular progress ring showing score (e.g., 78%)
- Label: "Tingkat Kecocokan"
- Sub-label: "Berdasarkan skill dan profil fungsional kamu"

**Skill Gap Card (white):**
- Title: "Skill yang Perlu Dikembangkan"
- List of gap skills as amber chips with a small "!" icon

**Accommodation Report Card (white, left accent border teal):**
- Title: "Rekomendasi Akomodasi Kantor"
- Icon-list format (not bullet points):
  - 🖥️ Screen reader (NVDA/JAWS) — untuk akses komputer
  - 🔔 Visual alert system — notifikasi visual untuk tunarungu
  - ♿ Ramp akses pintu utama — modifikasi fisik diperlukan

**Smart Wage Guard Card:**
- Left half: "UMK Jakarta 2026: Rp 5.067.381"
- Right half: "Gaji Ditawarkan: Rp 4.500.000"
- Large status badge:
  - If LAYAK: green pill "✓ LAYAK — Memenuhi Standar UMP"
  - If TIDAK LAYAK: red pill "✗ TIDAK LAYAK — Di bawah Rp 567.381 dari standar"
- Small footnote: "Berdasarkan Peraturan Gubernur / UMP/UMK 2026"

---

### 6. Company Dashboard (`/perusahaan/post-job`)

- Same sidebar layout as candidate but with company-focused nav
- Job posting form in white card:
  - Job Title
  - Deskripsi Pekerjaan (rich textarea)
  - Skill yang Dibutuhkan (tag input, same as candidate skill input)
  - Gaji Ditawarkan (number input with Rp prefix)
  - Lokasi Perusahaan (dropdown — triggers UMK lookup)
  - Kondisi Fisik Kantor (checkbox group styled as icon-cards):
    - ♿ Ramp tersedia
    - 🛗 Lift aksesibel
    - 🚻 Toilet disabilitas
    - 🖥️ Screen reader di komputer
    - 🔔 Sistem visual alert
  - "Posting & Mulai Matching" button

---

### 7. Company — Laporan Layak (`/perusahaan/laporan/:id`)

- Two-panel layout:

**Left Panel — Candidate Summary:**
- Name, disability type badge, match score ring (same component as candidate view)
- Skill match breakdown

**Right Panel — Laporan Layak:**
- Section title: "Instruksi Teknis Modifikasi Kantor" in DM Serif Display
- Ordered instruction list (not bullets — numbered, large numeral in teal):
  1. Pasang ramp di pintu utama (spesifikasi: kemiringan maks 1:12)
  2. Sediakan kursi ergonomis adjustable di workstation kandidat
  3. Install software NVDA (gratis) di komputer kerja kandidat
- "Estimasi Biaya Modifikasi: Rp 2.500.000 – Rp 8.000.000" info chip

**Bottom: Wage Guard Summary (same card component)**
- Shows UMK vs offered salary with status badge

---

## DESIGN SYSTEM RULES

- Border radius: `8px` cards, `6px` inputs, `999px` pills/badges
- Shadows: `0 2px 8px rgba(0,0,0,0.06)` default, `0 8px 24px rgba(0,0,0,0.12)` hover/elevated
- Spacing scale: `4px` base — use multiples: 4, 8, 12, 16, 24, 32, 48, 64
- No gradients except hero section (solid teal with grain texture)
- Icons: Lucide React icon set only — consistent stroke width `1.5px`
- All status badges: pill shape, colored background at `15%` opacity, full-color text + icon
- Input focus: `2px` teal outline, no shadow-glow effects
- Disabled states: `50%` opacity, cursor `not-allowed`

---

## TECH STACK

- **React** (functional components, hooks)
- **Supabase** for auth (`@supabase/supabase-js`) and database
- **React Router v6** for routing
- **Tailwind CSS** for utility styling
- **Lucide React** for icons
- All components should be modular and reusable (e.g., `<WageGuardCard />`, `<MatchScoreRing />`, `<SkillChip />`)
- Supabase client initialized in `src/lib/supabaseClient.js`

---

## WHAT TO AVOID

- No purple gradients
- No glassmorphism
- No generic hero illustrations (use geometric shapes or none)
- No Inter or Roboto font
- No card borders as the only visual separator — use shadow + spacing
- No more than 3 font weights per page
- No AI-stock-photo style imagery