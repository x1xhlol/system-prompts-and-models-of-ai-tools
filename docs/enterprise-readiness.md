# Enterprise readiness — Dealix Sovereign OS

This checklist helps **internal teams** prepare for **B2B / enterprise** conversations and deployments. It is not a substitute for customer-specific due diligence, legal review, or penetration testing.

## 1. Read in order (governance spine)

1. [`MASTER_OPERATING_PROMPT.md`](../MASTER_OPERATING_PROMPT.md) — constitution and TOC.  
2. [`dealix-six-tracks.md`](dealix-six-tracks.md) — six product lanes and honest **Implemented / Partial / Planned** status.  
3. [`governance/approval-policy.md`](governance/approval-policy.md) — A/R/S and Class A/B/C.  
4. [`governance/trust-fabric.md`](governance/trust-fabric.md) — trust substrate and tool verification.  
5. [`governance/saudi-compliance-and-ai-governance.md`](governance/saudi-compliance-and-ai-governance.md) — PDPL / NCA readiness register and AI governance frames.  
6. [`governance/github-and-release.md`](governance/github-and-release.md) — branch protection, environments, OIDC, audit retention.  
7. [`execution-matrix-90d-tier1.md`](execution-matrix-90d-tier1.md) — Phase 0–1 measurable outcomes.  
8. [`completion-program-workstreams.md`](completion-program-workstreams.md) — eight workstreams from constitution to production.  
9. [`architecture-register.md`](architecture-register.md) — subsystem status snapshot.

## 2. Product and legal surface

- Review customer-facing and internal policies under [`salesflow-saas/docs/legal/`](../salesflow-saas/docs/legal/) (consent, privacy, data protection, PDPL-oriented copy where present).  
- Align marketing claims with **evidence**: tests, `verify-launch`, and run artifacts — see [`governance/discovery-and-output-checklist.md`](governance/discovery-and-output-checklist.md).

## 3. Technical evidence before “production-ready” claims

| Gate | Command / artifact |
|------|---------------------|
| Backend regression | `cd salesflow-saas/backend && pytest -v --tb=short` |
| Launch / hardening script | `salesflow-saas/verify-launch.ps1` (extend flags per [`salesflow-saas/docs/LAUNCH_CHECKLIST.md`](../salesflow-saas/docs/LAUNCH_CHECKLIST.md)) |
| Architecture traceability | [`blueprint-master-architecture.md`](blueprint-master-architecture.md) + [`Architecture_Pack.md`](../Architecture_Pack.md) + [`Execution_Matrix.md`](../Execution_Matrix.md) |

## 4. What not to promise yet

Until ADR [`adr/0001-tier1-execution-policy-spikes.md`](adr/0001-tier1-execution-policy-spikes.md) exit criteria are met, do **not** represent the following as fully shipped production standards:

- Temporal (or equivalent) as the **sole** system of record for all long workflows.  
- OPA / OpenFGA / Vault / Keycloak as **in-path** dependencies without integration tests and security sign-off.

Use [`governance/technology-radar-tier1.md`](governance/technology-radar-tier1.md) for **official vs optional vs pilot** language.

## 5. Security and procurement FAQs (internal)

- **Data residency and subprocessors:** document actual regions and vendors; update when adding LLM or SaaS connectors.  
- **RBAC and tenancy:** confirm `tenant_id` isolation and admin boundaries in code review for every net-new API.  
- **Audit logs:** retention, export, and SIEM streaming per customer tier — see notes in [`governance/github-and-release.md`](governance/github-and-release.md).

## 6. Continuous improvement

Revisit this file after each major release or enterprise pilot; update [`dealix-six-tracks.md`](dealix-six-tracks.md) status table when capabilities move from Partial to Verified.

## 7. Maintainer sync

`scripts/architecture_brief.py` includes this path in `CONSTITUTION_PATHS`; `.claude/settings.json` references it in `projectInstructions` for Claude Code. Update both when adding new enterprise-facing governance files.
