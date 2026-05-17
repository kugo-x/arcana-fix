STOP. Do not add new pages or features.

This is a FULL VISUAL REDESIGN of the existing InklusiKerja app.
Keep all existing content, routes, and functionality exactly as-is.
Only redesign the visual layer: layout, typography, spacing, color application, components, and SVG illustrations.

The goal: make every page feel like it was designed by Apple's web team — cinematic, breathable, confident, and premium. Not corporate. Not startup-y. Premium civic-tech.

---

## THE APPLE DESIGN PRINCIPLES TO APPLY

**1. Radical Whitespace**
- Triple all existing padding and margins. Pages should feel like they have room to breathe.
- Hero sections: minimum 160px top/bottom padding
- Between every section: minimum 120px gap
- Cards: minimum 32px internal padding

**2. Typography as Design**
- Headlines must be LARGE and BOLD — Apple uses 56px–80px hero headlines
- Use DM Serif Display for all display text, very large
- Body text: Plus Jakarta Sans, 17px, line-height 1.7, color `#4B4B4B` (never pure black)
- Let typography carry the visual weight — reduce decorative elements, let words breathe
- Never center-align body paragraphs — only headlines

**3. Color Restraint**
- 90% of every page should be white `#FFFFFF` or off-white `#F5F5F7` (Apple's exact bg)
- Teal `#0D7377` used ONLY for: nav logo, key CTAs, active states, and accent lines
- Amber `#F5A623` used ONLY for: wage guard badges, ONE CTA button per page, critical alerts
- No teal backgrounds except the hero section of the landing page
- Dark `#1A1A2E` used ONLY for the sidebar and footer
- All other sections: pure white or `#F5F5F7`

**4. SVG Over Everything**
Replace ALL placeholder icons, stock images, and generic illustrations with custom inline SVGs:

  HERO SVG (Landing Page):
  - Large abstract SVG composition — overlapping geometric circles and arcs in teal `#0D7377` at varying opacities (100%, 40%, 15%)
  - Positioned right side of hero, taking up 45% of hero width
  - Suggests: two people connecting, or a shield + handshake abstraction
  - Style: minimal line art + filled shapes, no gradients, no shadows

  FEATURE SECTION SVGs (one per feature card):
  - Card 1 (Matching): SVG of two nodes connected by a curved line with small dots — represents skill matching
  - Card 2 (Wage Guard): SVG of a shield outline with a checkmark and a horizontal bar chart inside — represents protection + data

  HOW IT WORKS SVGs (one per step):
  - Step 1: SVG of a document with a person silhouette and tag chips
  - Step 2: SVG of interconnected nodes / neural network (3 nodes, 5 connecting lines)
  - Step 3: SVG of a shield + document with checkmark

  CANDIDATE DASHBOARD SVGs:
  - Upload zone: SVG of an upward arrow emerging from a horizontal line (minimalist upload icon, 48px)
  - Empty state (no jobs yet): SVG of a simple open folder with a magnifying glass

  MATCH RESULT SVGs:
  - Circular progress: SVG-based arc progress ring (NOT a CSS hack — proper SVG circle with stroke-dasharray)
  - Accommodation icons: custom SVG per type (screen, bell, ramp, chair) — NOT lucide icons for these, make them feel bespoke

**5. Apple-Style Layout Patterns**
  
  NAVBAR:
  - Height: 52px, frosted glass effect: `backdrop-filter: blur(20px)` + `background: rgba(255,255,255,0.85)`
  - Logo: left, "InklusiKerja" in DM Serif Display 18px teal
  - Nav links: center, Plus Jakarta Sans 13px, `#1D1D1F` (Apple's nav text color), letter-spacing 0
  - Right: "Masuk" ghost + "Daftar" teal pill button, small (height 32px, padding 0 16px)
  - Full-width, sticky, thin `1px` bottom border `rgba(0,0,0,0.08)` — disappears on scroll to hero
  - NO box shadow on navbar

  HERO SECTION (Landing):
  - Background: white — NOT teal anymore
  - Left 55%: text content (eyebrow label above headline)
  - Right 45%: the abstract teal SVG composition
  - Eyebrow label (above headline): small pill — teal bg `rgba(13,115,119,0.1)` + teal text "Platform Rekrutmen Inklusif #1 Indonesia" — 12px, medium weight
  - Headline: DM Serif Display, 72px, `#1D1D1F`, line-height 1.1, max 3 words per line
  - Subheadline: Plus Jakarta Sans 19px, `#6E6E73`, max-width 480px, line-height 1.6
  - CTA row: two buttons, 44px height — Primary (teal filled, white text, `999px` radius) + Secondary (text-only with `→` arrow, teal color)
  - Stat strip: remove the floating card — replace with 3 inline stats separated by thin `1px` vertical lines, no card/shadow, just clean numbers

  SECTION TITLES (every section):
  - Always: small grey eyebrow text above (12px, uppercase, letter-spacing 0.1em)
  - Then: large DM Serif Display headline, 48px
  - Then: subtitle in Plus Jakarta Sans 17px grey
  - Center-align section titles only, left-align body content

  CARDS (all cards across all pages):
  - Remove ALL colored borders on cards
  - Single style only: white bg, `border-radius: 18px`, `border: 1px solid rgba(0,0,0,0.06)`, NO shadow by default
  - Hover: `transform: translateY(-4px)`, shadow appears: `0 12px 40px rgba(0,0,0,0.08)`
  - Transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
  - Remove ALL left-border accent styles (the teal/amber 4px left borders) — replace with a small colored dot or eyebrow label inside the card instead

  BUTTONS:
  - Primary: teal, `999px` radius, height 44px, padding 0 24px, Plus Jakarta Sans 15px medium, NO border
  - Secondary: white bg, `1px` solid `rgba(0,0,0,0.15)`, same radius/height, dark text
  - Text-only: just colored text + arrow, no border/bg
  - Hover on primary: `background: #0a5d60` (darker teal), smooth 0.2s transition
  - NEVER use square or low-radius buttons

  FORM INPUTS:
  - Height: 52px
  - Background: `#F5F5F7`
  - Border: none (no border at rest)
  - Border-radius: `12px`
  - Focus state: `background: white` + `box-shadow: 0 0 0 3px rgba(13,115,119,0.2)` — Apple-style focus ring
  - Label: above input, Plus Jakarta Sans 13px medium, `#1D1D1F`
  - Placeholder: `#AEAEB2`

  SIDEBAR (dashboard):
  - Background: `#1D1D1F` (Apple dark — not navy)
  - Nav items: 44px height, 12px horizontal padding, `14px` Plus Jakarta Sans
  - Icons: 18px, stroke 1.5px, `#98989D` default, white when active
  - Active: white text + icon, NO left border — instead: white pill background `rgba(255,255,255,0.1)`, `8px` radius
  - Hover: `rgba(255,255,255,0.05)` background
  - Bottom section: thin `1px rgba(255,255,255,0.1)` divider before Keluar

  STATUS BADGES (Wage Guard LAYAK / TIDAK LAYAK):
  - Remove the full-width bar style
  - Replace with: inline pill badge, 14px text, medium weight
  - LAYAK: `background: rgba(46,204,113,0.1)`, `color: #1a8a4a`, `border: 1px solid rgba(46,204,113,0.3)`
  - TIDAK LAYAK: `background: rgba(231,76,60,0.1)`, `color: #c0392b`, `border: 1px solid rgba(231,76,60,0.3)`
  - Add a small dot `●` before the text (6px, same color)

  SKILL CHIPS / TAGS:
  - Background: `#F5F5F7`
  - Text: `#1D1D1F`, 13px, medium
  - Border: none
  - Border-radius: `999px`
  - Padding: `4px 12px`
  - Hover: `background: #E5E5EA`
  - Teal variant (active/matched skill): `background: rgba(13,115,119,0.08)`, `color: #0D7377`

**6. Micro-details (Apple obsession)**
- All text: `font-smoothing: antialiased` + `-webkit-font-smoothing: antialiased`
- All transitions: `cubic-bezier(0.4, 0, 0.2, 1)` — never `ease` or `linear`
- Letter-spacing: `-0.02em` on all large headlines (gives premium tightness)
- Line-height: `1.1` for display, `1.6` for body, `1.4` for UI labels
- Scrollbar: styled, thin `4px`, `#D1D1D6` track, `#8E8E93` thumb, visible only on hover
- All images/SVGs: loaded with `loading="lazy"` and smooth fade-in on mount
- Number formatting: always use `Rp 5.067.381` format (dot as thousands separator)

---

## WHAT TO COMPLETELY REMOVE

- ❌ Remove ALL gradient backgrounds (except hero if kept dark)
- ❌ Remove ALL `4px` left-border accent cards — replace per rule above
- ❌ Remove ALL box shadows at rest state — shadow only on hover
- ❌ Remove ALL Lucide icons used as decorative elements in hero/features — replace with custom SVGs
- ❌ Remove ALL colored section backgrounds (no teal sections, no amber sections)
- ❌ Remove ALL full-width colored CTA banner sections
- ❌ Remove ANY text-shadow or drop-shadow on typography
- ❌ Remove ALL use of `Inter`, `Roboto`, or system fonts — strictly DM Serif Display + Plus Jakarta Sans only

---

## WHAT THE FINAL RESULT SHOULD FEEL LIKE

- Open any page → it feels spacious, like there's too much white space (that's correct)
- Scroll down → sections appear with gentle fade-up animation (use Intersection Observer)
- Hover a card → it lifts subtly, shadow appears smoothly
- Click a button → it depresses slightly (`transform: scale(0.98)`) then releases
- The SVGs in hero and feature cards are the ONLY decorative elements
- Typography does the heavy lifting — huge headlines, restrained body text
- Someone looking at it should say "this feels expensive" before reading a single word

---

Tech stack: React + Supabase + Tailwind CSS + Lucide React (UI actions only) + custom inline SVGs for decorative elements