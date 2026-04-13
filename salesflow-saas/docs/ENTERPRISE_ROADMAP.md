# Dealix Enterprise roadmap

Concise path from pilot to enterprise-grade deployment. This document complements `INTEGRATION_MASTER_AR.md` and the in-app go-live gate.

## Phase 1 — Tenant isolation and audit (0–90 days)

- Enforce tenant scoping on every strategic-deals and CRM read/write (verify RLS or equivalent on PostgreSQL).
- Structured audit log for: operating mode changes, outbound sends, policy blocks, and human approvals.
- Backup and restore runbook per tenant (or per region).

## Phase 2 — Identity and access (90–180 days)

- SSO (SAML/OIDC) for owner and compliance roles.
- SCIM or admin API for user lifecycle (optional).
- Role matrix aligned with UI: owner, RevOps, partner manager, compliance — mapped to API scopes.

## Phase 3 — Data governance (180–365 days)

- Data retention policies per tenant and per channel (PDPL-aware).
- Export and delete workflows for subject requests.
- Encryption at rest review; field-level encryption for highly sensitive notes if required.

## Phase 4 — Scale and SLOs

- Per-tenant rate limits on agent and strategic-deals endpoints.
- Observability: RED metrics on API, agent latency histograms, error budgets.
- Multi-region readiness assessment (data residency constraints).

## Dependencies in this repo

- Strategic deals and OS endpoints: `backend/app/api/v1/strategic_deals.py`
- Operating modes: `backend/app/services/strategic_deals/operating_modes.py`
- Policy evaluation: `backend/app/services/dealix_os/policy_engine.py`
- Frontend hubs: `frontend/src/app/dashboard/page.tsx`
