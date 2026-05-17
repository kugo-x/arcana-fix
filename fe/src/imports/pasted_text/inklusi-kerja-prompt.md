Ini prompt siap pakai untuk Figma Make — InklusiKerja:

Prompt untuk Figma Make — InklusiKerja:

Design a professional, production-grade web app called InklusiKerja — an AI-powered inclusive recruitment platform for people with disabilities in Indonesia, with built-in wage protection called Smart Wage Guard.
Design Philosophy: Refined civic-tech. Authoritative yet warm. The feeling should be: "This was built with purpose." NOT corporate-cold. NOT startup-bubbly.
Design System:

Primary: Deep Teal #0D7377
Accent: Amber #F5A623 (for badges, CTAs, highlights)
Background: Off-white #F8F7F4 (not pure white)
Dark surface: #1A1A2E (headers, sidebars)
Success: #2ECC71 | Danger: #E74C3C
Heading font: DM Serif Display
Body/UI font: Plus Jakarta Sans
Border radius: 8px cards, 6px inputs, 999px pills/badges
Shadows: 0 2px 8px rgba(0,0,0,0.06) default, 0 8px 24px rgba(0,0,0,0.12) hover
Icons: Lucide icon set, stroke 1.5px
No gradients, no glassmorphism, no purple, no Inter/Roboto
Status badges: pill shape, 15% opacity background, full-color text


Create 7 screens:

Screen 1 — Landing Page (Desktop, full width)
Hero section: full-width deep teal #0D7377 background with very subtle grain texture overlay (3–5% opacity noise pattern). Large DM Serif Display headline centered, white: "Rekrutmen Inklusif. Upah yang Adil. Untuk Semua." Below it, Plus Jakarta Sans subheadline in muted white: "Platform pertama di Indonesia yang menggabungkan rekrutmen disabilitas dengan proteksi upah otomatis berbasis UMP/UMK 2026." Two CTA buttons side by side: Primary filled amber #F5A623 with dark text "Daftar sebagai Kandidat", Secondary white outline "Daftar sebagai Perusahaan". Below the buttons, a floating white card strip spanning 3 columns with soft shadow showing 3 stats: "< 0.01% serapan tenaga kerja disabilitas saat ini", "UU No. 8/2016 mewajibkan kuota 1–2%", "Jutaan pekerja tidak tahu hak upah mereka" — each separated by a vertical divider.
How It Works section: white background, section title "Cara Kerja" centered in DM Serif Display teal. Three steps in a horizontal row connected by a dashed line: Step 1 "Input Profil & Skill", Step 2 "AI Matching Otomatis", Step 3 "Terima Laporan Layak + Validasi Upah" — each step has a large outlined Lucide icon, bold number in teal, label in DM Serif, one-sentence description in Plus Jakarta Sans muted gray.
Feature Cards section: two large side-by-side cards on off-white background. Card 1 "Pencocokan Skill Cerdas" — puzzle-piece Lucide icon in teal, DM Serif title, Plus Jakarta Sans description about Indonesian AI model. Card 2 "Perisai Keadilan Upah" — shield-check Lucide icon, small amber pill badge labeled "BARU", DM Serif title, description about UMP/UMK 2026 automatic validation.
Footer: dark #1A1A2E, logo left, "InklusiKerja © 2026" right. Minimal.

Screen 2 — Register Page (Desktop)
Split layout: Left panel (40% width) in deep teal #0D7377 with the InklusiKerja logo centered, tagline below in white Plus Jakarta Sans, and a subtle geometric pattern of diagonal lines at low opacity covering the lower half of the panel. Right panel (60% width) off-white background with the register form centered vertically.
Form: Section title "Buat Akun" in DM Serif Display dark. Below, two large role selector cards side by side — Card 1 "Saya Pencari Kerja" with a person Lucide icon, Card 2 "Saya Perusahaan" with a building Lucide icon. Selected state: teal border 2px with a small amber dot indicator in the top-right corner. Below the cards: Email input field, Password input field (both with 6px border-radius, 1.5px border #D4D0C8, teal focus state), full-width teal "Daftar" button. Small link below: "Sudah punya akun? Masuk di sini."

Screen 3 — Candidate Profile Dashboard (Desktop)
Fixed left sidebar (220px wide, dark #1A1A2E): InklusiKerja logo at top with amber accent. Nav items with Lucide icons: Profil Saya (active), Cari Kerja, Hasil Matching, Keluar. Active item has amber left border 3px and teal background tint on the row. User avatar initials circle at the bottom of sidebar.
Main content area (off-white): Page title "Lengkapi Profilmu" in DM Serif Display dark #1A1A2E. Below, one large white card with soft shadow, 12px border-radius, 24px padding. Inside the card: form with fields — Nama Lengkap (text input), Jenis Disabilitas (dropdown with options: Tunanetra, Tunarungu, Tunadaksa, Disabilitas Kognitif, Lainnya), Lokasi (dropdown), Skill Teknis (tag input — show 3 example teal chips already entered: "Microsoft Excel", "Customer Service", "Komunikasi"), Profil Fungsional (tall textarea with placeholder "Ceritakan cara terbaik kamu bekerja..."), CV Upload zone (dashed border rectangle with cloud-upload Lucide icon centered, text "Drag & drop CV kamu di sini atau klik untuk pilih file", muted gray). Full-width teal "Simpan Profil" button at the bottom of the card.

Screen 4 — Candidate Job List (Desktop, same sidebar layout)
Main content: Search bar at top with a filter row below it — filter pills for Lokasi and Jenis Akomodasi. Section title "Lowongan Tersedia" in DM Serif. 2-column grid of job cards, each white card with soft shadow, 8px border-radius. Inside each card: company logo placeholder circle (gray), job title in DM Serif 20px, gray location pill badge with map-pin Lucide icon, row of 3 teal skill chips (small, 999px radius), salary range in Plus Jakarta Sans medium, full-width teal button "Lamar & Cek Kecocokan". Show 4 job cards total. Card hover state shows teal 2px top border appearing and shadow deepening.

Screen 5 — Candidate Match Result (Desktop, same sidebar layout)
Main content: Heading "Hasil Analisis AI" in DM Serif + company name and job title below in muted gray Plus Jakarta Sans.
Hero card (teal #0D7377 background, 12px border-radius): centered circular progress ring showing 78% score, large number "78%" in white DM Serif, label "Tingkat Kecocokan" in white Plus Jakarta Sans, sub-label "Berdasarkan skill dan profil fungsional kamu" in muted white smaller text.
Below, three white cards in a column:
Card 1 "Skill yang Perlu Dikembangkan": title in DM Serif, row of amber chips with a small "!" Lucide icon each — show 3 skills: "Pivot Table Excel", "Public Speaking", "Bahasa Inggris Bisnis".
Card 2 "Rekomendasi Akomodasi Kantor": title in DM Serif, left accent border 3px teal. Icon-list rows (not bullets) using Lucide icons: monitor icon "Screen reader (NVDA/JAWS) — untuk akses komputer", bell icon "Visual alert system — notifikasi visual untuk tunarungu", accessibility icon "Ramp akses pintu utama — modifikasi fisik diperlukan".
Card 3 "Smart Wage Guard": two-column layout inside the card. Left half: label "UMK Jakarta 2026" muted gray small, value "Rp 5.067.381" in DM Serif dark large. Right half: label "Gaji Ditawarkan" muted gray small, value "Rp 4.500.000" in DM Serif dark large. Full-width status badge below: red pill "✗ TIDAK LAYAK — Di bawah Rp 567.381 dari standar" (red text on 15% red background). Small footnote in muted gray: "Berdasarkan Peraturan Gubernur / UMP/UMK 2026".

Screen 6 — Company Post Job Dashboard (Desktop)
Same sidebar layout as candidate but nav items are: Dashboard, Posting Lowongan (active), Kandidat Saya, Keluar.
Main content: Title "Buat Lowongan Baru" in DM Serif. White card form: Job Title input, Deskripsi Pekerjaan tall textarea, Skill yang Dibutuhkan tag input (show 2 chips already: "Analisis Data", "Excel"), Gaji Ditawarkan number input with "Rp" prefix label inside the field, Lokasi Perusahaan dropdown (triggers UMK lookup — show a small teal info chip below: "UMK Kota Bandung 2026: Rp 4.482.914"), Kondisi Fisik Kantor section title with 5 icon-cards in a 3-2 grid layout — each is a small card with a Lucide icon and label, checkbox state — show 2 checked (teal border + amber dot): "Ramp tersedia", "Lift aksesibel"; 3 unchecked: "Toilet disabilitas", "Screen reader", "Sistem visual alert". Full-width teal button "Posting & Mulai Matching".

Screen 7 — Company Laporan Layak (Desktop, same sidebar)
Two-panel layout inside main content area, side by side with a divider.
Left panel (40%): Candidate summary card — name "Budi Santoso", disability badge pill (teal, 15% opacity) "Tunanetra", match score ring same style as Screen 5 showing 78%, skill match breakdown list with Lucide check icons in teal for matched skills.
Right panel (60%): Section title "Instruksi Teknis Modifikasi Kantor" in DM Serif. Ordered instruction list — each item has a large teal number (DM Serif, 32px), bold instruction text in Plus Jakarta Sans, and a gray sub-description below. Show 3 instructions: "1. Pasang ramp di pintu utama — spesifikasi: kemiringan maks 1:12", "2. Sediakan kursi ergonomis adjustable di workstation kandidat", "3. Install software NVDA (gratis) di komputer kerja kandidat". Below the list, a gray info chip: "Estimasi Biaya Modifikasi: Rp 2.500.000 – Rp 8.000.000".
At the bottom spanning full width: Smart Wage Guard card — same two-column layout as Screen 5 but this time show LAYAK status — large green pill "✓ LAYAK — Memenuhi Standar UMP" (green text on 15% green background #2ECC71). Footnote in muted gray: "Berdasarkan Peraturan Gubernur / UMP/UMK 2026".

Global notes for all screens:

All UI copy in natural Bahasa Indonesia
No stock photo imagery — use geometric shapes or empty states with Lucide icons only
Consistent spacing scale: 4px base, multiples of 4
No more than 3 font weights per screen
All screens desktop-first, 1440px wide frame
Sidebar is always 220px fixed, main content scrollable