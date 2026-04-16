# 90-day Tier-1 execution matrix (Phase 0–1)

**Purpose:** Translate **Phase 0 (0–30d)** and **Phase 1 (30–90d)** outcomes from the Tier-1 roadmap into **measurable** deliverables tied to existing repo artifacts.  
**Agent truth source:** [`Execution_Matrix.md`](../Execution_Matrix.md) — this file does not duplicate all agent rows; it maps **milestones** to **evidence** and **matrix coverage**.

**Blueprint index:** [`blueprint-master-architecture.md`](blueprint-master-architecture.md).

---

## Phase 0 (days 0–30): control + operating baseline

**Goal:** Stabilize **control plane** and **operating plane** so later agent and workflow expansion is auditable.

| # | Outcome | Evidence / artifact | Execution_Matrix touchpoints (examples) |
|---|---------|----------------------|----------------------------------------|
| P0.1 | **A / R / S** on governed events and APIs documented and used in reviews | [`governance/approval-policy.md`](governance/approval-policy.md); PR checklist | Policy & Compliance agent (row 15); any row with HITL |
| P0.2 | **Event envelope + schema discipline** agreed and referenced in new events | [`governance/events-and-schema.md`](governance/events-and-schema.md); schema folder or ADR | All rows with Events In/Out |
| P0.3 | **Trace/correlation** standard across API + workers + agent runs | OTel or structured logging ADR; sample trace | Executive Intelligence, Strategic PMO |
| P0.4 | **GitHub governance** (rulesets, required checks, no direct push to main) documented for org | [`governance/github-and-release.md`](governance/github-and-release.md) | Operating plane |
| P0.5 | **Executive room skeleton** — doc + minimal UI/API stub behind flag | `salesflow-saas/docs/` + backend route spec | Executive Intelligence (row 16) |
| P0.6 | **AI governance baseline** (NIST AI RMF / OWASP LLM alignment register) | [`governance/saudi-compliance-and-ai-governance.md`](governance/saudi-compliance-and-ai-governance.md) | Trust fabric |
| P0.7 | **PDPL / NCA readiness register** (non-legal checklist) | Same + [`salesflow-saas/docs/legal/`](../salesflow-saas/docs/legal/) | Policy & Compliance; DD Analyst |

**Exit criteria for Phase 0:** checklist items P0.1–P0.4 **done** in repo/docs; P0.5–P0.7 **at least drafted** with owner and review date.

---

## Phase 1 (days 30–90): Revenue + Partner OS MVP

**Goal:** First **partner + revenue** loop with **evidence pack v1** and **tool verification v1** on critical paths.

| # | Outcome | Evidence / artifact | Execution_Matrix touchpoints (examples) |
|---|---------|----------------------|----------------------------------------|
| P1.1 | **Partnership Scout** path: scouted → scored with audit fields | Tests + API or worker logs | Partnership Scout (row 2) |
| P1.2 | **Qualification / triage** for leads with structured memo output | JSON memo contract + tests | Lead Intelligence (row 10) |
| P1.3 | **Strategic PMO** milestone tracking integrated with real task source | Integration note + API | Strategic PMO (row 14) |
| P1.4 | **Connector / action facades** for first external channel (e.g. messaging) with retries + idempotency | Facade module + contract tests | Executive Outreach (row 11); Policy gates |
| P1.5 | **Partner scorecards** reproducible from data (not ad-hoc LLM text) | Query or report + snapshot tests | Partnership Scout; Alliance Structuring (row 3) |
| P1.6 | **Forecast vs actual** slice for one KPI (pipeline or revenue) | Semantic metric definition in one place | Customer Expansion (row 13); analytics docs |
| P1.7 | **Evidence pack v1** template used on Class B decisions | Template in docs + one exemplar PR | Alliance Structuring (term sheet HITL); Proposal (row 12) |
| P1.8 | **Tool verification v1** on at least one tool surface (intended vs actual logged) | Log schema or table + test | Trust fabric; any tool-using agent |

**Exit criteria for Phase 1:** P1.1–P1.4 **shipped behind flags or staging** with tests; P1.5–P1.8 **documented + one end-to-end demo** with evidence references (no production claims without `verify-launch` / pytest where applicable).

---

## Dependency order

1. Phase 0 operating + policy + events **before** widening external connectors.  
2. Evidence pack + tool verification **in parallel** with first Partner/Revenue MVP features.  
3. **Temporal / OPA / OpenFGA** only after [`adr/0001-tier1-execution-policy-spikes.md`](adr/0001-tier1-execution-policy-spikes.md) approval and spike evidence — see execution fabric doc.

See also: [`dealix-six-tracks.md`](dealix-six-tracks.md), [`governance/discovery-and-output-checklist.md`](governance/discovery-and-output-checklist.md).
