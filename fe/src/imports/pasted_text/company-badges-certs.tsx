Continue building InklusiKerja. Apply the EXACT same design system:
- Background: #F5F5F7 · White cards · Dark sidebar #1D1D1F
- Fonts: DM Serif Display (headlines) + Plus Jakarta Sans (body/UI)
- Teal #0D7377 · Amber #F5A623 · Success #2ECC71 · Danger #E74C3C
- Cards: white, border-radius 18px, border 1px solid rgba(0,0,0,0.06), shadow on hover only
- Buttons: 999px radius, 44px height
- All transitions: cubic-bezier(0.4, 0, 0.2, 1)

This adds TWO things:
1. A new page in the Company Dashboard: Badge & Sertifikat
2. A public Badge Gallery page (no login required)

Add to Company sidebar: `Award` icon — "Badge & Sertifikat"

---

## PAGE 1: Badge & Sertifikat (`/perusahaan/badge`)

---

### SECTION 1 — Status Badge Saat Ini

Full-width white card, 40px padding, 18px radius.
Two-column layout:

LEFT (55%) — Badge Showcase:

If EARNED:
- Large badge SVG (200px × 200px) centered — design below
- Below badge: "PT. Contoh Indonesia" in DM Serif Display 24px
- Then: "Verified Inclusive Employer 2026" in Plus Jakarta Sans 17px teal
- Then: issue date "Diterbitkan: 1 Januari 2026" in 13px grey

BADGE SVG DESIGN (build this as inline SVG, premium feel):
- Outer shape: octagon (8-sided), stroke teal #0D7377, 3px, no fill
- Inner circle: filled teal #0D7377
- Center icon: simplified person silhouette + shield overlap, white
- Bottom ribbon shape: amber #F5A623, contains text "INKLUSIF 2026" in white 10px bold
- Outer ring: small dots evenly spaced around octagon (decorative)
- Overall: looks like an official certification seal, not a cartoon

If NOT EARNED:
- Same badge SVG but: greyscale, 40% opacity, blurred slightly
- Overlay text centered: "Belum Terbuka" in 14px grey
- Lock icon (Lucide `Lock`) above text

RIGHT (45%) — Requirements Checklist:

Title: "Syarat Mendapatkan Badge" Plus Jakarta Sans 17px medium

Checklist items (each = row with icon left + text right):
- ✅ `CheckCircle` teal — "Minimal 1 rekrutmen disabilitas aktif"
- ✅ `CheckCircle` teal — "Semua lowongan aktif wage-compliant (≥ UMK)"
- ⏳ `Clock` amber — "Compliance Score minimal 80%" — current: 68%
- ⬜ `Circle` grey — "Profil perusahaan 100% lengkap"

Progress bar below checklist:
Label: "3 dari 4 syarat terpenuhi"
Bar: same animated progress bar style from Compliance Tracker
Fill: teal, 75% filled

CTA below bar:
- If all met: "Klaim Badge Sekarang 🎉" — amber filled, full width
- If not met: "Perbaiki Compliance Score" — teal outlined, full width

---

### SECTION 2 — Sertifikat Digital (only shown if badge earned)

White card, 32px padding, 18px radius.

Header inside card: "SERTIFIKAT RESMI" 12px uppercase grey

CERTIFICATE SVG/HTML COMPONENT (premium design):
Full-width certificate design, landscape orientation, ~600px × 400px:

- Border: double-line border, outer teal 2px + inner teal 1px, 8px gap between, 12px corner radius
- Top center: InklusiKerja logo in teal (text logo)
- Decorative corner ornaments: 4 small SVG geometric corner pieces (L-shaped lines with dot) in teal, 10% opacity
- Center top: "SERTIFIKAT KEPATUHAN INKLUSIF" in DM Serif Display 13px uppercase letter-spacing 0.15em, grey
- Main text block center:
  - "Diberikan kepada" italic Plus Jakarta Sans 14px grey
  - Company name: DM Serif Display 32px #1D1D1F
  - Body text 14px grey: "Telah memenuhi standar rekrutmen inklusif dan kepatuhan upah berdasarkan UU No. 8 Tahun 2016 tentang Penyandang Disabilitas."
- Bottom row 3 columns:
  - Left: "Berlaku hingga: 31 Des 2026" + thin line above
  - Center: InklusiKerja seal SVG (small 40px version of badge)
  - Right: "Nomor Sertifikat: IK-2026-0042" + thin line above
- Background: very subtle diagonal line pattern (SVG pattern, opacity 3%) — not distracting

Below certificate:

3 action buttons in a row:
- "Unduh PNG" — teal filled, `Download` icon
- "Unduh PDF" — teal outlined, `FileDown` icon  
- "Salin Kode Embed" — grey outlined, `Code2` icon

Embed code preview (below buttons, if "Salin Kode Embed" active):
- Dark code block (#1D1D1F bg, 12px radius, 16px padding)
- Shows HTML snippet: `<a href="inklusikerja.id/verify/IK-2026-0042">...</a>` in monospace font
- "Disalin!" toast on copy

---

### SECTION 3 — Share & Distribusi

Off-white #F5F5F7 background card, 32px padding, 18px radius.
Title: "Bagikan Badge Kamu" Plus Jakarta Sans 17px medium

Share CTA row:
- "LinkedIn" button — blue filled (#0077B5), `Linkedin` icon, "Bagikan di LinkedIn"
- "Website" button — grey outlined, `Globe` icon, "Pasang di Website"
- "WhatsApp" button — green filled (#25D366), `MessageCircle` icon, "Bagikan via WhatsApp"

Below: "Setiap kali badge dibagikan, InklusiKerja otomatis memverifikasi keasliannya." 13px grey

---

## PAGE 2: Public Badge Gallery (`/verified-employers`)

This is a public page — no login required. Accessible from Landing Page footer.
Add to Landing Page footer: "Perusahaan Terverifikasi" link.

---

NAVBAR: Same frosted glass landing page navbar

HERO:
- Background: white
- Eyebrow pill: "Komunitas Employer Inklusif Indonesia"
- Title: "Perusahaan yang Berkomitmen pada Inklusi" DM Serif Display 52px center
- Subtitle: "Mereka telah memenuhi standar rekrutmen inklusif dan keadilan upah berbasis UU No. 8/2016." grey center
- Stats row (3 inline stats, no card):
  - "42 Perusahaan Terverifikasi" · "127 Pekerja Disabilitas Ditempatkan" · "100% Wage-Compliant"

FILTER BAR:
- White pill filter row, center-aligned:
  "Semua" · "Teknologi" · "Manufaktur" · "Kesehatan" · "Pendidikan" · "Jasa"
  Active: teal filled, white text. Others: white bg, grey border.

COMPANY GRID (3 columns):
Each card — white, 18px radius, 28px padding, hover lift:
- Top: company logo placeholder (grey circle 56px) + verified badge icon top-right (small 32px teal badge SVG)
- Company name: Plus Jakarta Sans 17px medium
- Industry badge: small grey pill
- 3 stats in small grey grid:
  - "Karyawan disabilitas: X orang"
  - "Compliance Score: XX%"
  - "Badge sejak: Jan 2026"
- Bottom: "Lihat Profil" text link teal + arrow

BOTTOM CTA SECTION:
White full-bleed, center-aligned, generous padding.
Title: "Daftarkan Perusahaan Anda" DM Serif Display 40px
Subtitle: "Bergabunglah dengan komunitas employer inklusif Indonesia."
Button: "Mulai Sekarang" teal filled, large (52px height)

FOOTER: Same as landing page footer.

---

Tech stack: React + Supabase + Tailwind CSS + Lucide React + inline SVGs
Badge and certificate are SVG/HTML components — NOT images.
All company data shown is illustrative/hardcoded for MVP demo.
Certificate component should be designed so it can be screenshotted or html2canvas'd for PNG download.