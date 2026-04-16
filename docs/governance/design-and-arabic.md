# Design system and Arabic-first / bilingual layer

**Canonical:** [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md).

## Design system goals

- **Premium** and **restrained** — engineering-grade polish, not noisy marketing chrome.  
- **Conversion-aware** — clarity of primary actions and trust-building patterns.  
- **RTL-safe** — layout, icons, and animations must not assume LTR-only.  
- **Culturally aware** — GCC-relevant tone, imagery, and business context where applicable.  
- **Accessible** — contrast, focus order, semantics, motion preferences.  
- **Performant** — avoid unnecessary font and bundle bloat; measure Core Web Vitals where relevant.

## Typography (Dealix rule)

- **IBM Plex Sans Arabic** — primary UI font.  
- **29LT Azal** — hero / display only; do not use for dense UI body.  
- App-specific secondary fonts (e.g. Tajawal in `salesflow-saas`) must remain consistent with product design decisions; new surfaces should align with root constitution for Arabic-first products.

## Components

Each significant component should define:

- Purpose and invariants  
- States (default, hover, active, disabled, read-only)  
- Loading, empty, and error states  
- Accessibility expectations  
- Mobile behavior  
- Analytics hooks only when product metrics require them (avoid leaking PII)

## Arabic-first / bilingual (GCC relevance)

When the product targets Saudi or broader GCC:

- **RTL-safe UI** — `dir`, logical properties, mirrored layouts tested.  
- **Arabic copy QA** — gender, formality, product terminology; avoid machine-glossy placeholder Arabic.  
- **Bilingual consistency** — API messages and UI strings stay aligned across AR/EN.  
- **Arabic summarization/classification** — routed per sensitivity (S2/S3 to private/local paths per policy).  
- **Local market vocabulary** — real estate, healthcare, etc., as appropriate.  
- **Trust cues** — licenses, support channels, PDPL consent patterns in UX.  
- **Notifications** — Arabic-first templates where the user locale is Arabic.  
- **SEO / content** — Arabic content strategy where public marketing applies.

## Dealix pointers

- Frontend: `salesflow-saas/frontend/` (App Router, Tailwind, RTL patterns).  
- Arabic NLP services: `salesflow-saas/backend/app/services/ai/arabic_nlp.py`.  
- Prompts (tone, not policy): `salesflow-saas/ai-agents/prompts/`.

See also: [approval-policy.md](approval-policy.md) (sensitivity classes), [trust-fabric.md](trust-fabric.md).
