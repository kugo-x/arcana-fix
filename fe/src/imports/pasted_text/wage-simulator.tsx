Continue building InklusiKerja. Apply the EXACT same design system:
- Background: #F5F5F7 · White cards · Dark sidebar #1D1D1F
- Fonts: DM Serif Display (headlines) + Plus Jakarta Sans (body/UI)
- Teal #0D7377 · Amber #F5A623 · Success #2ECC71 · Danger #E74C3C
- Cards: white, border-radius 18px, border 1px solid rgba(0,0,0,0.06), shadow on hover only
- Buttons: 999px radius, 44px height
- All transitions: cubic-bezier(0.4, 0, 0.2, 1)

This is a NEW STANDALONE PAGE — accessible from the Landing Page navbar
AND from the Candidate sidebar. It requires NO login to use (public tool).

Add to Landing Page navbar: "Simulator Upah" link (between nav items)
Add to Candidate sidebar: `Calculator` icon — "Simulator Upah"

---

## PAGE: Wage Simulator (`/simulator-upah`)

A free public tool. Anyone can check if their salary is legally compliant
with UMP/UMK 2026 without logging in. This is InklusiKerja's viral feature.

---

### LAYOUT

Full page, NO sidebar. Uses the same navbar as the landing page (frosted glass).
Background: #F5F5F7

---

### HERO SECTION

White background, center-aligned, generous padding (120px top/bottom).

- Eyebrow pill: teal bg rgba(13,115,119,0.1) + teal text "Gratis · Tanpa Login · Berbasis UMP/UMK 2026"
- Title: "Berapa Upah Minimum yang Berhak Kamu Terima?" DM Serif Display 56px center
- Subtitle: "Masukkan pekerjaan dan lokasi kamu. Kami hitung hak upah minimalmu berdasarkan regulasi resmi pemerintah." Plus Jakarta Sans 19px #6E6E73 center, max-width 580px

Below headline: the simulator card (this is the hero, not a separate section)

---

### SIMULATOR CARD

White card, 18px radius, 40px padding, max-width 680px, centered, shadow: 0 8px 40px rgba(0,0,0,0.08)

**Step indicator at top of card:**
3 steps shown as horizontal pills connected by thin lines:
"1 · Pekerjaan" → "2 · Lokasi & Gaji" → "3 · Hasil"
Active step: teal filled pill. Completed: teal outlined. Upcoming: grey outlined.

---

**STEP 1 — Input Pekerjaan:**

Label: "Jenis Pekerjaan Kamu" 13px medium above
- Large input field (height 52px, bg #F5F5F7, no border, 12px radius)
- Placeholder: "cth: Staff Administrasi, Frontend Developer, Operator Produksi..."

Label: "Kategori Industri" 13px medium
- Dropdown (same input style):
  Options: Teknologi · Manufaktur · Jasa & Retail · Konstruksi · Kesehatan · Pendidikan · Lainnya

Label: "Pengalaman Kerja" 13px medium
- 4 toggle pills in a row (single select):
  "< 1 tahun" · "1–3 tahun" · "3–5 tahun" · "> 5 tahun"
  Selected: teal fill white text. Unselected: #F5F5F7 bg grey text.

"Lanjut →" button: teal filled, full width, 44px height, 999px radius

---

**STEP 2 — Lokasi & Gaji:**

Label: "Provinsi" → Dropdown (34 provinsi Indonesia)
Label: "Kota / Kabupaten" → Dropdown (filtered by province)

After city selected — show inline info chip:
bg rgba(13,115,119,0.08), teal text, 12px radius:
`ℹ️ UMK [Kota] 2026: Rp X.XXX.XXX per bulan`

Label: "Gaji yang Kamu Terima Saat Ini (opsional)"
- Input with "Rp" prefix, number format
- Hint text below: "Biarkan kosong jika ingin melihat standar UMK saja"

Label: "Status Kamu"
- 3 toggle pills: "Belum Bekerja" · "Sedang Bekerja" · "Penyandang Disabilitas"
  (if "Penyandang Disabilitas" selected → show extra note: "Hak upahmu SAMA dengan pekerja lain. UU No. 8/2016 Pasal 11 menjamin kesetaraan upah.")

"Hitung Sekarang →" button: amber filled, dark text, full width, 44px height

---

**STEP 3 — Hasil (replaces form content, animated slide-in):**

Top of result — Status Banner (full width inside card):
- If user input salary AND it's below UMK:
  Red bg rgba(231,76,60,0.08) · red border · `AlertCircle` icon
  "Gaji kamu Rp 4.500.000 berada DI BAWAH standar UMK [Kota] 2026"

- If user input salary AND it's above/equal UMK:
  Green bg rgba(46,204,113,0.08) · green border · `CheckCircle` icon
  "Gaji kamu sudah memenuhi standar UMK [Kota] 2026 ✓"

- If no salary input:
  Teal bg rgba(13,115,119,0.08) · teal border
  "Berikut standar UMK yang berlaku di [Kota]"

---

Main result breakdown (below banner), 2-column grid:

Result Card 1 — UMK Pokok:
- Label: "UMK [Kota] 2026" grey 13px
- Value: "Rp 5.067.381" DM Serif Display 36px teal
- Footnote: "Per bulan · Berdasarkan Pergub/Permenaker 2026"

Result Card 2 — Gaji Kamu (only if input provided):
- Label: "Gaji yang Kamu Terima" grey 13px
- Value: "Rp 4.500.000" DM Serif Display 36px (red if below, green if above)
- Footnote: selisih — "Kurang Rp 567.381 dari standar" in red · or "Lebih Rp 432.619 dari standar" in green

---

Hak Tambahan Wajib Section (accordion-style, 3 items, expandable):
Each item: row with chevron right → click → expands with details
- "BPJS Kesehatan" → "Wajib ditanggung perusahaan 4%, kamu 1% dari gaji"
- "BPJS Ketenagakerjaan" → "JKK, JKM, JHT — wajib didaftarkan perusahaan"
- "Hak Cuti Tahunan" → "12 hari/tahun setelah 12 bulan bekerja (UU Ketenagakerjaan)"

---

CTA Section below result (inside card):
2 buttons side by side:
- "Laporkan Pelanggaran" — red outlined, small
- "Daftar ke InklusiKerja" — teal filled

"Hitung Ulang" text link below, grey, small

---

### BELOW SIMULATOR — FAQ SECTION

Off-white #F5F5F7 background, full bleed.
Title: "Pertanyaan Umum" DM Serif Display 40px center
Subtitle: "Tentang hak upah dan regulasi ketenagakerjaan Indonesia" grey center

4 FAQ items — accordion style, white cards, 12px radius, clean expand/collapse:
1. "Apakah UMK berlaku sama untuk penyandang disabilitas?"
   → "Ya. UU No. 8/2016 Pasal 11 secara eksplisit menyatakan hak upah setara tanpa diskriminasi."
2. "Apa bedanya UMP dan UMK?"
   → "UMP (Upah Minimum Provinsi) adalah standar provinsi. UMK (Upah Minimum Kota/Kabupaten) bisa lebih tinggi dan bersifat lebih spesifik."
3. "Apa yang bisa saya lakukan jika gaji di bawah UMK?"
   → Dropdown → Kamu bisa melaporkan ke Dinas Tenaga Kerja setempat atau menggunakan fitur laporan InklusiKerja.
4. "Apakah simulator ini resmi?"
   → "Data UMK bersumber dari Keputusan Gubernur dan Peraturan Menteri Ketenagakerjaan 2026."

---

### FOOTER (same as landing page footer)

---

Tech stack: React + Supabase + Tailwind CSS + Lucide React
No login required for this page. Data UMK hardcoded for MVP demo.
Step transitions: animated with opacity + translateY(16px → 0) over 0.3s