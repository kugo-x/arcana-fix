# CLAUDE.md — Design System & Guidelines

Dokumen ini adalah panduan utama untuk semua pekerjaan desain dan pengembangan frontend pada proyek ini.
Baca dan ikuti seluruh aturan di bawah sebelum menyentuh apapun yang berkaitan dengan UI/UX.

---

## 🎨 Color Palette

Gunakan CSS variables berikut secara konsisten. **Jangan hardcode warna di luar variabel ini.**

```css
:root {
  /* Core */
  --color-primary:       #12747a;   /* teal — CTA, link, icon aktif */
  --color-primary-dark:  #0d5459;   /* hover & pressed state */
  --color-primary-light: #e8f4f5;   /* badge, highlight ringan, bg section */

  /* Background */
  --color-bg:            #f8f7f4;   /* background halaman utama */
  --color-surface:       #ffffff;   /* card, modal, dropdown */
  --color-surface-raised:#f0efec;   /* card hover, table row alt */

  /* Text */
  --color-text:          #1a1a1a;   /* body text, judul */
  --color-text-muted:    #6b7280;   /* label, caption, placeholder */
  --color-text-subtle:   #9ca3af;   /* disabled, hint */

  /* Border & Divider */
  --color-border:        #e5e4e1;
  --color-border-strong: #c9c8c4;

  /* Semantic */
  --color-success:       #16a34a;
  --color-warning:       #ca8a04;
  --color-danger:        #dc2626;
  --color-info:          #12747a;   /* sama dengan primary */
}
```

---

## 📐 Spacing System

Gunakan kelipatan **8px** untuk semua spacing (padding, margin, gap).

```
4px   → micro (icon gap, badge padding)
8px   → xs
16px  → sm
24px  → md
32px  → lg
48px  → xl
64px  → 2xl
96px  → 3xl
```

**Jangan gunakan angka acak** seperti 13px, 22px, 37px. Pakai grid di atas.

---

## 🔤 Typography

### Font yang digunakan:
- **Heading**: `Plus Jakarta Sans` — import dari Google Fonts
- **Body**: `DM Sans` — import dari Google Fonts
- **Monospace (kode)**: `JetBrains Mono` — jika ada kebutuhan

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono&display=swap');

:root {
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
}
```

### Scale:
```
text-xs:   12px / line-height 1.4
text-sm:   14px / line-height 1.5
text-base: 16px / line-height 1.6
text-lg:   18px / line-height 1.5
text-xl:   20px / line-height 1.4
text-2xl:  24px / line-height 1.3
text-3xl:  32px / line-height 1.2
text-4xl:  40px / line-height 1.1
```

---

## 🧱 Border Radius

```
--radius-sm:   6px    → input, badge, tag kecil
--radius-md:   10px   → button, card kecil
--radius-lg:   16px   → card utama, modal
--radius-xl:   24px   → hero section, panel besar
--radius-full: 9999px → pill, avatar
```

**Jangan pakai radius > 16px secara sembarangan** — terlihat terlalu "bubbly" dan generik.

---

## 🌑 Shadow

```css
:root {
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(18, 116, 122, 0.10);
  --shadow-lg: 0 8px 32px rgba(18, 116, 122, 0.12);
}
```

Gunakan shadow berbasis warna primary (`#12747a`) bukan pure black — terasa lebih cohesive.

---

## 🧩 Komponen — Aturan Desain

### Button
```
Primary   → bg: --color-primary,      text: white
Secondary → bg: --color-primary-light, text: --color-primary
Ghost     → bg: transparent,           text: --color-primary, border: --color-border
Danger    → bg: --color-danger,        text: white

Padding   : 10px 20px (md), 8px 16px (sm)
Radius    : --radius-md
Font      : 500 weight, DM Sans
Transition: all 0.15s ease
Hover     : gelapkan 8-10%, slight shadow
```

### Card
```
bg        : --color-surface
border    : 1px solid --color-border
radius    : --radius-lg
padding   : 24px
shadow    : --shadow-sm
hover     : shadow naik ke --shadow-md, border ke --color-border-strong
transition: 0.2s ease
```

### Input / Form
```
bg        : --color-surface
border    : 1px solid --color-border
radius    : --radius-sm
padding   : 10px 14px
font-size : 14px, --color-text
focus     : border --color-primary, ring 3px --color-primary-light
placeholder: --color-text-subtle
```

### Navbar
```
bg        : --color-surface (dengan blur jika sticky: backdrop-filter: blur(12px))
border-bottom: 1px solid --color-border
height    : 64px
logo      : font heading, weight 700, warna --color-primary
link      : --color-text-muted, hover --color-primary
active    : --color-primary, weight 500
```

---

## ❌ Anti-Pattern — Yang DILARANG

Ini yang membuat design terlihat AI-slop dan generik:

| ❌ Dilarang | ✅ Gantinya |
|---|---|
| Gradient purple/biru di mana-mana | Warna solid dari palette |
| Shadow `0 0 20px rgba(0,0,0,0.3)` | Shadow subtle berbasis primary |
| Border radius > 20px semua elemen | Radius konsisten sesuai komponen |
| Font Inter atau Roboto saja | Plus Jakarta Sans + DM Sans |
| Pure black `#000000` sebagai text | `#1a1a1a` |
| Pure white `#ffffff` sebagai bg | `#f8f7f4` |
| Animasi berlebihan di semua elemen | Animasi hanya di momen penting |
| Warna acak di luar design system | Selalu pakai CSS variables |
| Padding/margin angka acak | Grid 8px |

---

## ✅ Checklist Sebelum Commit UI

Sebelum menyelesaikan perubahan UI apapun, pastikan:

- [ ] Semua warna menggunakan CSS variables
- [ ] Spacing menggunakan kelipatan 8px
- [ ] Font heading = Plus Jakarta Sans, body = DM Sans
- [ ] Border radius sesuai role komponen
- [ ] Hover state ada di semua interactive element
- [ ] Focus state visible (aksesibilitas)
- [ ] Tidak ada hardcode warna di luar variables
- [ ] Tampilan dicek di mobile (min 375px) dan desktop

---

## 🗂️ Urutan Prioritas Redesign

Jika melakukan redesign bertahap, kerjakan dalam urutan ini:

1. **CSS Variables & Global Styles** — fondasi dulu
2. **Typography** — pasang font dan scale
3. **Navbar / Header**
4. **Button & Form Elements**
5. **Cards & Containers**
6. **Halaman utama / Hero**
7. **Footer**
8. **Halaman lainnya**

---

## 📝 Instruksi untuk Claude Code

Saat diminta memperbaiki atau membuat UI:

1. **Selalu baca file ini terlebih dahulu**
2. Ikuti semua aturan di atas tanpa pengecualian
3. Jangan membuat warna atau spacing baru di luar sistem ini
4. Jika ada ambiguitas desain, pilih opsi yang **lebih minimal dan clean**
5. Komponen baru harus konsisten dengan komponen yang sudah ada
6. Prioritaskan **konsistensi** di atas kreativitas individual per-komponen
