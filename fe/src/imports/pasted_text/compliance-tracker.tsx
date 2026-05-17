Continue building InklusiKerja. Apply the EXACT same design system:
- Background: #F5F5F7 · White cards · Dark sidebar #1D1D1F
- Fonts: DM Serif Display (headlines) + Plus Jakarta Sans (body/UI)
- Teal #0D7377 · Amber #F5A623 · Success #2ECC71 · Danger #E74C3C
- Cards: white, border-radius 18px, border 1px solid rgba(0,0,0,0.06), shadow on hover only
- Buttons: 999px radius, 44px height
- All transitions: cubic-bezier(0.4, 0, 0.2, 1)
- font-smoothing: antialiased on all text

This is a NEW PAGE added to the Company Dashboard sidebar.
Add nav item: `ShieldCheck` icon — "Kepatuhan UU" to the company sidebar.

---

## PAGE: Compliance Tracker (`/perusahaan/compliance`)

This page shows a company's legal compliance status against UU No. 8 Tahun 2016
(disability worker quota law) and UMP/UMK wage standards.

---

### LAYOUT

Same dashboard layout: fixed dark sidebar left + scrollable main content right.

Page header:
- Eyebrow: small grey uppercase "DASBOR KEPATUHAN" 12px letter-spacing 0.1em
- Title: "Kepatuhan UU No. 8/2016" in DM Serif Display 48px
- Subtitle: Plus Jakarta Sans 17px #6E6E73 — "Pantau status pemenuhan kuota disabilitas dan standar upah perusahaan Anda secara real-time."
- Top-right corner: "Terakhir diperbarui: Hari ini, 14.32 WIB" in 13px grey

---

### SECTION 1 — Compliance Score Hero

Full-width white card, 18px radius, 40px padding, NO shadow at rest.

Left side (60%):
- Large circular SVG arc progress — 140px diameter
- Arc fills clockwise based on score (e.g. 68%)
- Arc color: if ≥80% → teal, if 50–79% → amber, if <50% → red
- Center of arc: score percentage in DM Serif Display 36px + "Skor Kepatuhan" label below in 13px grey
- Right of the arc:
  - Title: "Status Kepatuhan Perusahaan" DM Serif Display 28px
  - Description: "Skor dihitung berdasarkan pemenuhan kuota disabilitas (UU No. 8/2016) dan kepatuhan upah UMP/UMK 2026 di seluruh lowongan aktif Anda."
  - Status pill badge below description:
    - If ≥80%: green pill "● Patuh" 
    - If 50–79%: amber pill "● Perlu Perhatian"
    - If <50%: red pill "● Tidak Patuh"

Right side (40%):
- 3 mini stat boxes stacked vertically, each: grey bg #F5F5F7, 12px radius, 16px padding
  - Stat 1: "Total Karyawan" → large number + "orang"
  - Stat 2: "Karyawan Disabilitas" → large teal number + "orang"  
  - Stat 3: "Kewajiban Kuota (1%)" → large number + "orang wajib"

---

### SECTION 2 — Kuota Disabilitas Progress

White card, 18px radius, 32px padding.
Section label inside card: "PEMENUHAN KUOTA DISABILITAS" 12px uppercase grey

Two-column layout:

Left column:
- Title: "Progress Kuota Saat Ini" Plus Jakarta Sans 17px medium
- Large horizontal progress bar:
  - Height: 12px, border-radius 999px
  - Track: #F5F5F7
  - Fill: teal gradient from #0D7377 to #14a3a8
  - Animated fill on page load (width 0 → actual % over 1s ease-out)
- Below bar: "3 dari 5 posisi wajib terpenuhi" in 15px + "Perlu 2 rekrutmen disabilitas lagi" in 13px amber
- Small footnote: "Kewajiban 1% berdasarkan UU No. 8/2016 Pasal 53 untuk perusahaan swasta"

Right column:
- Donut SVG chart (120px) — showing ratio disability vs non-disability workers
- Legend below: teal dot "Disabilitas (3%)" · grey dot "Non-Disabilitas (97%)"
- Target indicator: dashed arc line showing where 1% marker is

Alert box below (if quota not met):
- Background: rgba(245,166,35,0.08), border: 1px solid rgba(245,166,35,0.3), 12px radius, 16px padding
- Icon: Lucide `AlertTriangle` amber
- Text: "Perusahaan Anda masih membutuhkan 2 rekrutmen disabilitas untuk memenuhi kewajiban hukum."
- Button right: "Buka Lowongan Baru" — amber filled, small, 999px radius

---

### SECTION 3 — Wage Compliance per Lowongan

White card, 18px radius, 32px padding.
Section label: "KEPATUHAN UPAH PER LOWONGAN" 12px uppercase grey
Subtitle: "Status validasi gaji seluruh lowongan aktif terhadap UMP/UMK 2026"

Table-style list (NOT an actual HTML table — use flex rows):

Header row: grey bg #F5F5F7, 8px radius, 12px padding
Columns: "Posisi" · "Lokasi" · "Gaji Ditawarkan" · "UMK Wilayah" · "Selisih" · "Status"

Data rows (3-4 example rows): white bg, 1px bottom border rgba(0,0,0,0.05)
- Posisi: job title in medium weight + disability type badge (small grey pill) below
- Lokasi: city name + province in grey below
- Gaji Ditawarkan: "Rp 5.500.000" teal color
- UMK Wilayah: "Rp 5.067.381" grey
- Selisih: if positive → "+Rp 432.619" green · if negative → "-Rp 567.000" red
- Status: pill badge — LAYAK (green) or TIDAK LAYAK (red), same styling as design system

Below table:
- Summary row: "2 lowongan LAYAK · 1 lowongan TIDAK LAYAK" in 14px
- "Perbaiki Lowongan Bermasalah" text button in red, right-aligned

---

### SECTION 4 — Timeline Riwayat Kepatuhan

White card, 18px radius, 32px padding.
Section label: "RIWAYAT KEPATUHAN" 12px uppercase grey

Vertical timeline (left-side vertical line in teal, 2px):
Each event = circle dot on the line (filled teal if positive, amber if warning, grey if neutral) + content right:

- [Today] "Lowongan 'UI Designer' divalidasi — LAYAK (UMK+8%)" → green dot
- [3 hari lalu] "Peringatan: Lowongan 'Admin' gaji di bawah UMK Jakarta" → amber dot  
- [1 minggu lalu] "Rekrutmen kandidat disabilitas berhasil (Tunanetra, Frontend Dev)" → teal dot
- [2 minggu lalu] "Laporan kepatuhan bulanan digenerate" → grey dot

Each event: timestamp in 12px grey · event text in 14px · optional badge right

---

### SECTION 5 — Rekomendasi Tindakan

Off-white #F5F5F7 background section (NOT a card — full bleed background)
Section title center-aligned: "Langkah Selanjutnya" DM Serif Display 36px

3 action cards in a row, white bg, 18px radius, 28px padding, hover lift:

Card 1 — Rekrut Disabilitas:
- SVG icon: two person silhouettes with a plus sign, teal
- Title: "Penuhi Kuota Segera" 
- Desc: "Buka 2 lowongan inklusif untuk memenuhi kewajiban 1% dan hindari risiko sanksi hukum."
- CTA button: "Buka Lowongan" teal filled

Card 2 — Perbaiki Upah:
- SVG icon: shield with an upward arrow inside, amber
- Title: "Koreksi 1 Lowongan Bermasalah"
- Desc: "Lowongan 'Admin' menawarkan upah di bawah UMK Jakarta 2026. Perbarui segera."
- CTA button: "Koreksi Sekarang" amber filled, dark text

Card 3 — Unduh Laporan:
- SVG icon: document with a downward arrow, grey
- Title: "Unduh Laporan Kepatuhan"
- Desc: "Generate laporan PDF bulanan untuk keperluan audit internal atau pelaporan ke Disnaker."
- CTA button: "Unduh PDF" white outlined

---

Tech stack: React + Supabase + Tailwind CSS + Lucide React + inline SVGs
All data shown is illustrative/hardcoded for MVP demo purposes.