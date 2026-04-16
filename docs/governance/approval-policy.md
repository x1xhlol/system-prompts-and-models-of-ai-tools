# Approval, reversibility, sensitivity — policy model

Canonical context: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md). This file is the **short operational reference** for classifying work before it ships.

## Approval class (A)

| Class | Who signs off | Typical examples |
|-------|----------------|------------------|
| **A0** | None | Read-only discovery, local drafts, internal notes |
| **A1** | Manager / lead | Staging config, non-prod feature flags, routine refactors behind flag |
| **A2** | Function head + legal/finance as needed | Billing, contracts, data retention, permission model changes |
| **A3** | Executive / board | Irreversible commitments, major market launch, regulated disclosures |

## Reversibility class (R)

| Class | Reverse | Typical examples |
|-------|---------|------------------|
| **R0** | Automatic | Feature flag off, revert commit, rollback migration (if designed) |
| **R1** | Limited ops effort | Revert deploy, disable integration, compensate with credits |
| **R2** | Costly / painful | Customer-visible data already acted on, partial external commitments |
| **R3** | Irreversible or binding externally | Signed terms, regulatory filing, money movement, public statement |

**Rule of thumb:** R2/R3 require explicit HITL (human-in-the-loop) or committee path before execution-plane runs.

## Sensitivity class (S)

| Class | Data |
|-------|------|
| **S0** | Public / low sensitivity |
| **S1** | Internal operational |
| **S2** | Confidential / commercial |
| **S3** | Regulated / highly sensitive / personal / board |

**Rule:** No S2/S3 across tools, providers, or LLM endpoints without policy review and routing (e.g. local/private inference where required).

## Actor type

`human` | `observer_agent` | `recommender_agent` | `executor_system` | `automated_workflow`

Observers and recommenders do **not** commit. Executors and workflows act only through **execution plane** paths with policy metadata.

## Action classes (ship discipline)

- **Class A** — Auto-allowed: maps, docs, tests generation, lint, read-only analysis.  
- **Class B** — Approval required: prod config, public publish, customer messages, migrations, RBAC, release promotion, external APIs.  
- **Class C** — Forbidden: exfiltration, bypass protections, silent destructive changes, disabling gates, claims without evidence.

## Evidence pack (minimum)

For Class B and any R2/R3 decision: sources, assumptions, timestamps/freshness, compliance notes where relevant, alternatives, rollback/compensation, provenance score, pointers to tests or run artifacts.

A **decision memo without an evidence pack is incomplete.**

## GitHub governance (surface)

Protected `main`; required reviews and checks; CODEOWNERS as team scales; secret scanning and dependency review; prefer OIDC for cloud deploy keys. Align branch rules with environment promotion (dev → staging → canary → prod).
