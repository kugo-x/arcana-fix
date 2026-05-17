# Product

## Register

product

## Users

Two distinct user groups with different jobs to do:

**Candidates:** People with disabilities in Indonesia (Tunanetra, Tunarungu, Tunadaksa, Disabilitas Kognitif, and others) seeking employment. Context: navigating a labor market where <0.01% of jobs are filled by people with disabilities despite a legal quota of 1-2% (UU No. 8/2016). Many are unaware of their wage rights. Some use assistive technology (screen readers, visual alert systems). Primary task: complete their profile, find matching jobs, and understand whether an offer is legally fair.

**Companies:** Indonesian employers (private, government, BUMN) legally required to hire 1-2% people with disabilities. Context: often compliance-driven, unsure how to adapt their workplace or validate wage offers. Primary task: post a job, see matched candidates, and receive a concrete technical "Laporan Layak" with workplace modification instructions.

## Product Purpose

InklusiKerja is an AI-powered inclusive recruitment platform that closes the double barrier: access (matching) and justice (wage). It connects candidates with disabilities to employers via semantic skill matching (Indonesian NLP model), generates accommodation recommendations specific to each disability type, and validates every job offer against UMP/UMK 2026 in real time via Smart Wage Guard. Built in Indonesia for Indonesian labor law. The product succeeds when a candidate with a disability gets a legally compliant job offer and knows exactly what workplace modifications to expect.

## Brand Personality

Refined civic-tech. Authoritative yet warm. "This was built with purpose."

Three words: **Trusted. Purposeful. Warm.**

Emotional goal: users should feel that the product is on their side — not a neutral marketplace, but an active advocate for fairness. The tone is confident without being cold, official without being bureaucratic.

## Anti-references

- Purple / blue gradients anywhere (generic SaaS)
- Glassmorphism effects (decorative blur cards)
- Generic hero illustrations or AI stock imagery
- Inter or Roboto as body font
- Corporate-cold government-website aesthetic
- Startup-bubbly rounded-everything aesthetic
- More than 3 font weights per page
- Card borders as the only visual separator
- Flashy or decorative animations
- Status information buried in prose — wage compliance result (LAYAK / TIDAK LAYAK) must be the most visually prominent element on any screen that contains it

## Design Principles

1. **Justice made visible.** LAYAK / TIDAK LAYAK is the most important output the product produces. It must be immediately legible — not a buried label, not a muted chip. Design for the moment when someone reads their wage status for the first time.

2. **Authoritative without alienating.** The product references Indonesian law and government wage standards. The visual language should carry civic credibility (structure, precision, seriousness) without the coldness or inaccessibility of government websites.

3. **Accessibility by default.** A meaningful portion of users are the product's subject matter: people with visual, auditory, or motor disabilities. Every interaction pattern — focus states, contrast ratios, touch target sizes, motion — must work for screen reader users, keyboard-only navigation, and high-motion-sensitivity users before anything else.

4. **Show the work, not just the result.** The product's value is explainability — why does a score say 78%? Which skills are missing? Why is this wage TIDAK LAYAK? The UI should surface reasoning visually (gap chips, numbered instructions, UMK vs offered side-by-side), not just outcomes.

5. **Separate the contexts.** Candidate flows and company flows are fundamentally different jobs. Never conflate them, blur them, or make a user navigate across both. The sidebar nav, the page titles, and the data on screen should always make it unmistakable which role you are acting as.

## Accessibility & Inclusion

WCAG 2.1 AA minimum. Priority considerations:

- **Tunanetra users:** full screen reader compatibility (NVDA / JAWS), semantic HTML, meaningful alt text, no icon-only interactive elements
- **Tunarungu users:** no audio-only information, visual alternatives for all alerts and notifications
- **Tunadaksa users:** minimum 44×44px touch targets, no precision-required interactions
- **Reduced motion:** all transitions and animations respect `prefers-reduced-motion`
- **Color:** status badges (LAYAK green / TIDAK LAYAK red) must pass WCAG AA contrast at their background opacity; never rely on color alone
