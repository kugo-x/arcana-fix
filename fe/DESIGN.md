---
name: InklusiKerja
description: AI-powered inclusive recruitment platform for people with disabilities in Indonesia, with integrated Smart Wage Guard.
colors:
  primary: "#12747a"
  primary-dark: "#0d5459"
  primary-light: "#e8f4f5"
  bg-parchment: "#f8f7f4"
  surface: "#ffffff"
  surface-raised: "#f0efec"
  text-near-black: "#1a1a1a"
  text-muted: "#6b7280"
  text-subtle: "#9ca3af"
  border-warm: "#e5e4e1"
  border-strong: "#c9c8c4"
  status-success: "#16a34a"
  status-warning: "#ca8a04"
  status-danger: "#dc2626"
typography:
  display:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.5px"
  headline:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.3px"
  title:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  caption:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-destructive:
    backgroundColor: "{colors.status-danger}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-near-black}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
---

# Design System: InklusiKerja

## 1. Overview

**Creative North Star: "The Civic Advocate"**

InklusiKerja's design speaks from a position of institutional authority used in service of fairness. This is not a neutral marketplace: it is an active advocate for candidates navigating real barriers, and the visual language must carry that conviction. The palette is anchored by Advocate Teal, a color that reads as purposeful, trustworthy, and distinctly Indonesian in its civic register. Surfaces are warm parchment, not clinical white. Type is structured but never mechanical.

The system earns its authority through precision: exact wage figures displayed side-by-side, match scores shown as percentages with an animated ring, accommodation checklists with named items and icons. Nothing is vague, nothing is decorative for its own sake. The most important moment in the entire product is when a user reads their wage verdict — LAYAK or TIDAK LAYAK — and the design must make that moment unmissable.

This system explicitly refuses: startup-bubbly rounded-everything aesthetics, purple or blue gradient SaaS tropes, glassmorphism effects, generic hero illustrations or AI stock imagery, and the dead zone between corporate-cold government website and cheerful generic job board. When someone sees InklusiKerja, they should recognize it as something purpose-built, not template-chosen.

**Key Characteristics:**
- Advocate Teal as the load-bearing identity color, used with restraint so its appearances carry weight
- Warm parchment base surfaces (never clinical white) throughout the app shell
- Teal-tinted shadows rather than pure black — the system's most distinctive technical choice
- Structural sidebar navigation for the app context; fixed top bar with blur for the landing page
- Wage verdict (LAYAK / TIDAK LAYAK) as the highest-priority visual element in the system
- All six icon-bearing accommodation items use Lucide icons at 1.5px stroke — consistent stroke weight throughout

## 2. Colors: The Civic Palette

A purposeful palette with one strong identity color, warm neutrals, and unambiguous semantic signals. Color is used to communicate role, not decoration.

### Primary

- **Advocate Teal** (`#12747a`): The trust anchor and brand identity. Fills CTA buttons, the match score hero card background, active nav state backgrounds, logo icon chips, and interactive focus rings. Every appearance is a signal — active, verified, trusted.
- **Deep Advocate** (`#0d5459`): Hover and pressed states for Advocate Teal elements only. Never used as a standalone fill or decorative color.
- **Teal Mist** (`#e8f4f5`): The ambient teal. Used as background tint for active nav rows, skill chips, badge highlights, and the 3px focus ring. Carries the brand hue without visual weight.

### Neutral

- **Parchment** (`#f8f7f4`): The page background. Warm, not sterile. The slight warmth (toward amber, not blue) makes the interface feel human rather than institutional. Never replace with pure white.
- **Clean White** (`#ffffff`): Card and modal surfaces. The contrast layer against parchment that gives cards their lift without shadows.
- **Ash Lift** (`#f0efec`): Slightly darker than parchment. Used as form field backgrounds (inputs appear gently sunken into card surfaces) and table row alternates.
- **Near Black** (`#1a1a1a`): Body text. Warm rather than pure black — the warmth connects it to parchment and prevents the harshness of high-contrast black-on-white.
- **Mid Slate** (`#6b7280`): Secondary text. Labels, captions, nav items at rest, metadata. Everything that supports but does not lead.
- **Quiet Slate** (`#9ca3af`): Hint text, placeholders, disabled states. Present but barely.
- **Warm Border** (`#e5e4e1`): Default dividers, card borders, input borders at rest. The warmth prevents clinical appearance.
- **Strong Border** (`#c9c8c4`): Card borders on hover, focused containers, strong separators. Used sparingly to mark state change.

### Semantic

- **Success Green** (`#16a34a`): LAYAK status text, confirmation states, success toasts. Used with a 15% opacity background tint (`#dcfce7`) for the verdict pill.
- **Warning Amber** (`#ca8a04`): Skill gap chips and cautionary badges. Used with a 15% opacity background tint (`#fef3c7`) for the gap chip.
- **Danger Red** (`#dc2626`): TIDAK LAYAK status text, destructive actions, error states. Used with a 15% opacity background tint (`#fee2e2`) for the verdict pill.

### Named Rules

**The Advocate Rule.** Advocate Teal appears on fewer than 30% of any given screen at full saturation. Its power comes from selectivity: active states, CTAs, the match score hero. When it fills the hero card, that card IS the signal — everything else recedes.

**The Verdict Rule.** LAYAK (`#16a34a`) and TIDAK LAYAK (`#dc2626`) are the most visually dominant elements on any screen that contains them. No decorative element, header, or illustration competes with their legibility. The verdict pill is always `font-weight: 700`, full width, `border-radius: 9999px`.

**The Warm Palette Rule.** Every neutral — backgrounds, borders, text — tilts warm (toward the amber-hued axis), not cool. This is what separates the system from the cold institutional palette it deliberately avoids.

## 3. Typography

**Display / Heading Font:** Plus Jakarta Sans (wght 400–700, with `sans-serif` fallback)
**Body / UI Font:** DM Sans (wght 300–500, with `sans-serif` fallback)
**Monospace (code only):** JetBrains Mono

**Character:** Plus Jakarta Sans was designed for Indonesian language contexts. Its structured letterforms give headings civic credibility and modern precision without the severity of serif display faces. DM Sans is warm and legible at small sizes; it handles label-dense form interfaces without feeling mechanical. The pairing is distinctly non-generic — these fonts identify the product as Indonesian-made.

### Hierarchy

- **Display** (700, 40px / line-height 1.1, letter-spacing –0.5px): Hero headlines only. Reserved for the landing page hero section — never inside the app dashboards where structural UI outranks editorial impact.
- **Headline** (700, 32px / line-height 1.2, letter-spacing –0.3px): Page-level titles in full-bleed views and major section headers. The `## Hasil Matching` heading on the candidate results page.
- **Title** (600–700, 18–24px / line-height 1.3): Card titles, modal headers, sidebar section labels. The `Rekomendasi Akomodasi Kantor` heading on a results card.
- **Body** (400, 16px / line-height 1.6): Prose, descriptions, and multi-sentence content. Cap at 65–75 characters per line for readability.
- **Label** (500, 14px / line-height 1.5): The workhorse. Nav items, form labels, button text, metadata chips, table headers. The most-used size in the product.
- **Caption** (400, 12px / line-height 1.4): Legal footnotes (`Berdasarkan UMP/UMK 2026 · Peraturan Gubernur`), timestamps, secondary metadata.

### Named Rules

**The Indonesian First Rule.** Plus Jakarta Sans is non-negotiable for headings. It was designed for Indonesian language and carries the product's identity as an Indonesian-made platform. Roboto, Inter, Poppins, and their variants are prohibited as heading faces.

**The Label Rule.** DM Sans 500 at 14px is the most-used type in the entire system. It is not a supporting character — it is the primary legibility vehicle for form-heavy app screens. Never drop below 13px for interactive or informational content.

## 4. Elevation

The system is flat by default. Surfaces are differentiated by background color (parchment vs. white vs. ash-lift) rather than shadows. Shadows appear only as a response to state or to communicate structural role.

### Shadow Vocabulary

- **Whisper** (`0 1px 2px rgba(0, 0, 0, 0.05)`): The sticky navbar at rest. Barely present — just enough to separate the nav from the page.
- **Resting** (`0 1px 4px rgba(0, 0, 0, 0.08)`): Card default. A card at rest has a resting shadow; without it the card would dissolve into the white surface.
- **Lifted** (`0 4px 16px rgba(18, 116, 122, 0.10)`): Card hover state, elevated dialogs, focused form containers. The teal tint becomes perceptible here.
- **Prominent** (`0 8px 32px rgba(18, 116, 122, 0.12)`): The match score hero card and any pinned structural element. The most pronounced shadow in the system.

### Named Rules

**The Teal Shadow Rule.** All shadows at the Lifted and Prominent levels use `rgba(18, 116, 122, ...)` — the Advocate Teal hue — rather than `rgba(0, 0, 0, ...)`. This is the system's single most distinctive technical choice. It makes elevated surfaces feel cohesive with the brand rather than generically lifted. Whisper and Resting use neutral black at very low opacity where the tint would be imperceptible.

**The Flat-by-Default Rule.** Surfaces are flat at rest. Shadows appear as a response to state (hover, focus, pinned) or structural role (match score hero). Do not add shadow to a card simply to create visual interest; use background contrast or spacing instead.

## 5. Components

### Buttons

Warm precision: firm shape, clear hierarchy, no decorative flourishes.

- **Shape:** Gently curved edges, `--radius-md` (10px). Not pill-shaped (that reads as passive labels), not square (that reads as cold).
- **Primary:** Advocate Teal fill (`#12747a`), white text. 10px 20px padding. 500 weight, DM Sans. Hover: Deep Advocate (`#0d5459`), `shadow: 0 4px 12px rgba(18,116,122,0.20)` appears. Transition: 0.15s ease.
- **Secondary:** Teal Mist fill (`#e8f4f5`), Advocate Teal text. Same shape and padding. No border. Hover: slightly deepens to `#d4ecee`.
- **Ghost:** Transparent bg, Advocate Teal text, 1px Warm Border (`#e5e4e1`). Hover: Teal Mist fill, border shifts to primary.
- **Destructive:** Danger Red fill (`#dc2626`), white text. Same shape.
- **Disabled:** All variants at 50% opacity, `cursor: not-allowed`.
- **Focus:** 3px ring in Teal Mist (`rgba(232,244,245,0.8)`). No glow effect; no shadow-based focus ring.

### Chips and Tags

Two distinct chip roles; shape is identical (pill, `--radius-full`).

- **Skill chip:** Teal Mist bg (`#e8f4f5`), Advocate Teal text (`#12747a`). 6px 14px padding. 13px, 600 weight. Applied to confirmed skills the candidate has listed.
- **Gap chip:** `#fef3c7` bg, Warning Amber text (`#ca8a04`). 6px 14px padding. 13px, 600 weight. `border: 1px solid #fde68a`. Prefixed with a `!` indicator. Applied to skills missing from the candidate's profile.

### Cards / Containers

The interface is built on a two-layer surface system: parchment page → white card. Cards do not float on white — they require the parchment base to provide lift.

- **Corner Style:** Rounded large, `--radius-lg` (16px). This is the product's primary content container radius.
- **Background:** Clean White (`#ffffff`).
- **Border:** 1px solid Warm Border (`#e5e4e1`) at rest; strengthens to Strong Border (`#c9c8c4`) on hover.
- **Shadow:** Resting (`0 1px 4px rgba(0,0,0,0.08)`) at rest; transitions to Lifted (`0 4px 16px rgba(18,116,122,0.10)`) on hover.
- **Internal Padding:** 24px uniform, or 28px 32px for hero-weight cards.
- **Transition:** `box-shadow 0.2s ease, border-color 0.2s ease`.

Nested cards are always wrong. The match score hero card (teal bg) is not a "card inside a page" — it is a full-bleed section within the content area. Never put a white card inside another white card.

### Inputs and Form Fields

Inputs appear gently sunken relative to the white card surface that contains them.

- **Style:** Ash Lift background (`#f0efec`), 1px Warm Border, `--radius-sm` (6px), 10px 14px padding.
- **Focus:** Border shifts to Advocate Teal (`#12747a`); 3px ring appears in Teal Mist (50% opacity). Background shifts to white (`#ffffff`). No shadow-glow effect.
- **Placeholder:** Quiet Slate (`#9ca3af`).
- **Error:** Border shifts to Danger Red (`#dc2626`); ring appears in `rgba(220,38,38,0.20)`.
- **Disabled:** 50% opacity, `cursor: not-allowed`.

### Navigation (Sidebar and Mobile Tab Bar)

The sidebar is the structural spine of the app for all logged-in users. It is white, not dark — matching the card surface, separated from parchment by a right border.

- **Sidebar width:** 240px, fixed, white bg, 1px Warm Border on the right.
- **Nav item default:** Transparent bg, Mid Slate icon and label (`#6b7280`), 14px 400 weight. Hover: Ash Lift bg, no border change.
- **Nav item active:** Teal Mist bg (`#e8f4f5`), 2px Advocate Teal left border, Advocate Teal icon and label, 14px 600 weight.
- **Logo:** Advocate Teal wordmark, `--radius-sm` (6px) icon chip with teal bg and white ShieldCheck icon.
- **User block:** Bottom of sidebar. Avatar circle (teal bg, white initials), name in Near Black 13px 600, role label in Quiet Slate 11px.
- **Mobile:** Bottom tab bar replaces sidebar. Tab has top border (2px Advocate Teal) for active indicator. Tab bg shifts to Teal Mist when active. Icon 18px; label 9px (truncated).

### Signature: MatchScoreRing

The product's most distinctive UI element — an SVG circular progress ring used inside the teal match score hero card.

- Track circle: `rgba(255,255,255,0.20)` stroke, 10px width.
- Fill circle: white stroke, 10px width, `stroke-linecap: round`. Animated on mount: `stroke-dashoffset` transitions with `0.6s ease`.
- Score numeral: Plus Jakarta Sans, `size * 0.22`, 700 weight, white.
- Sub-label "cocok": 75% white opacity, 9% of ring size.
- Used exclusively inside the Advocate Teal hero card. Never on a white card surface.

### Signature: WageGuardCard

The most consequential component in the system. Every design decision here prioritizes legibility of the verdict.

- Split two-column layout: UMK 2026 value / offered salary value. Separated by a 1px vertical border divider.
- Value labels: 11px, Quiet Slate, 700 weight, `text-transform: uppercase`, `letter-spacing: 0.8px`.
- Value numerals: Plus Jakarta Sans, 22px, 700 weight, Near Black.
- Verdict pill: full-width, `--radius-full`. LAYAK: `#dcfce7` bg, Success Green text (`#16a34a`), 14px 700 weight, `border: 1px solid #bbf7d0`. TIDAK LAYAK: `#fee2e2` bg, Danger Red text (`#dc2626`), `border: 1px solid #fecaca`. Always the most visually prominent element in its card.
- Legal footnote: 12px, Quiet Slate, centered.

## 6. Do's and Don'ts

### Do:

- **Do** use Advocate Teal (`#12747a`) as the primary trust signal: CTAs, active nav states, icon chip backgrounds, the match score hero card.
- **Do** use teal-tinted shadows at Lifted/Prominent levels: `rgba(18, 116, 122, ...)` not `rgba(0, 0, 0, ...)`.
- **Do** use Plus Jakarta Sans for all headings. It is the product's Indonesian identity in typographic form.
- **Do** make LAYAK / TIDAK LAYAK the visually dominant element — `font-weight: 700`, full-width pill, uncompeted contrast — on any screen that contains it.
- **Do** use parchment (`#f8f7f4`) as the page background. The warmth is intentional.
- **Do** use Ash Lift (`#f0efec`) as the form field background so inputs appear gently sunken within white card surfaces.
- **Do** keep spacing in 8px multiples: 8, 16, 24, 32, 48, 64px. No arbitrary values.
- **Do** cap body prose at 65–75ch per line.
- **Do** apply `prefers-reduced-motion` — a meaningful share of users may have motion sensitivity.
- **Do** use Lucide React icons at `strokeWidth={1.5}` exclusively. Consistent stroke weight is a system rule.
- **Do** show `focus-visible` as a 3px ring in Teal Mist on all interactive elements. Screen reader users navigate this interface.

### Don't:

- **Don't** use purple, violet, or blue gradients anywhere. (Direct anti-reference from PRODUCT.md.)
- **Don't** use glassmorphism: decorative blur cards, `backdrop-filter: blur(...)` on content surfaces. Prohibited.
- **Don't** use generic hero illustrations or AI stock imagery.
- **Don't** use Inter, Roboto, Poppins, or any font other than Plus Jakarta Sans (headings) and DM Sans (body).
- **Don't** use pure black (`#000000`) for text — use Near Black (`#1a1a1a`).
- **Don't** use pure white (`#ffffff`) for the page background — use Parchment (`#f8f7f4`).
- **Don't** use `border-left` or `border-right` greater than 1px as a decorative colored stripe on content cards, callouts, or alerts. Replace with background tints or full borders.
- **Don't** use gradient text (`background-clip: text`). Single solid color only.
- **Don't** bury the wage verdict. LAYAK / TIDAK LAYAK is never a small badge, a muted chip, or a secondary element.
- **Don't** use flashy or choreographed animations. All transitions are state responses: 0.15–0.20s ease. No choreographed page entrances.
- **Don't** use more than 3 font weights per page.
- **Don't** use card borders as the only visual separator. Use shadow + spacing + background contrast.
- **Don't** use a corporate-cold government-website aesthetic: that is one of the two failure modes this system explicitly navigates between.
- **Don't** use the startup-bubbly all-radius-xl rounded-everything aesthetic: that is the other failure mode.
- **Don't** make candidate and company flows visually or navigationally ambiguous. The role context must be unmistakable at all times.
- **Don't** nest a white card inside another white card. The parchment page bg is required for cards to read as lifted surfaces.
