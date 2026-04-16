# Saudi compliance & AI governance register (design-time)

**Not legal advice.** This is an engineering **readiness register** for building Dealix as a **Tier-1** operating system in KSA/GCC. Legal review remains required for production claims and customer contracts.

**Canonical trust model:** [trust-fabric.md](trust-fabric.md). **Product legal texts:** [`salesflow-saas/docs/legal/`](../../salesflow-saas/docs/legal/).

---

## 1. PDPL / personal data (design checklist)

When processing data that may identify individuals in the Kingdom:

- **Inventory** data categories, purposes, lawful basis, retention, subprocessors, and cross-border transfers (if any).
- **Minimize** collection; default deny for exports and bulk analytics on personal fields.
- **Consent and notices** aligned with product copy ([`salesflow-saas/docs/legal/consent-policy-ar.md`](../../salesflow-saas/docs/legal/consent-policy-ar.md), privacy / data protection docs).
- **AI-specific:** training, enrichment, search, scoring, messaging, and **logs** can all be processing — classify sensitivity (S0–S3) per [approval-policy.md](approval-policy.md) and route S2/S3 away from unreviewed third-party models/tools.
- **Subject rights / export:** define operational runbooks before offering enterprise SLAs.

**References (external):** Saudi PDPL / SDAIA knowledge center and official guidance — verify current text with counsel.

---

## 2. NCA cybersecurity posture (readiness, not certification)

Design so the platform **can** align with **ECC** and related cloud/data controls (**DCC**, **CCC**) as the customer tier demands:

- Asset inventory, patch cadence, access control, logging, incident response hooks.
- **Segregation** of prod/staging; break-glass for admin; audit streaming for long retention (pair with [github-and-release.md](github-and-release.md) audit notes).

**References (external):** NCA published controls and updates (e.g. ECC 2-2024 track) — map controls to features in an ADR when pursuing attestation.

---

## 3. AI governance (NIST + OWASP)

Use as a **risk and testing** frame for agentic features:

| Frame | Use in Dealix |
|-------|----------------|
| **NIST AI RMF** | Govern, map, measure, manage — tie to release gates and evidence packs |
| **NIST Generative AI profile** | Supplement for LLM-specific risks |
| **OWASP Top 10 for LLM Apps** | Prompt injection, insecure output handling, excessive agency, sensitive disclosure — explicit test cases in CI where feasible |

Pair with [trust-fabric.md](trust-fabric.md): red-team workflows, structured output validation, tool allowlists, and rollback plans for Class B / R2+.

**References (external):** NIST publications portal; OWASP LLM Top 10 and GenAI security project pages.

---

## 4. Arabic-first execution (product, not theme)

Beyond RTL UI:

- Arabic **classification** and **summaries** for internal notes where policy allows.
- **Partner memos** and **notification templates** with terminology normalization (sector-specific).
- **Retrieval quality** for Arabic queries (embedding model + chunking + evaluation).
- **Trust cues** in UX (support, compliance, local expectations).

See [design-and-arabic.md](design-and-arabic.md).

---

## 5. Review cadence

- **Quarterly:** re-read this register against shipped features and incident postmortems.  
- **Per major release:** update PDPL/NCA mapping appendix when product surface area changes.

See also: [technology-radar-tier1.md](technology-radar-tier1.md), [`../execution-matrix-90d-tier1.md`](../execution-matrix-90d-tier1.md), [pdpl-nca-ai-control-matrices.md](pdpl-nca-ai-control-matrices.md).
