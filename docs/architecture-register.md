# Architecture register — subsystem status (Completion Program WS1)

**Purpose:** Single **code-backed** snapshot of **Current / Partial / Pilot / Production** for major subsystems. Refresh per milestone or release.  
**Canonical agent matrix:** [`Execution_Matrix.md`](../Execution_Matrix.md) (see [`adr/0002-execution-matrix-canonical-source.md`](adr/0002-execution-matrix-canonical-source.md) for v2 draft status).

| Subsystem | Path / anchor | Status | Owner | Last verified | Evidence / notes |
|-----------|---------------|--------|-------|----------------|-------------------|
| FastAPI API surface | `salesflow-saas/backend/app/main.py`, `app/api/` | **Production** (dev/staging/prod per deploy) | *assign* | *date on merge* | pytest API suites |
| Agent router / executor | `salesflow-saas/backend/app/services/agents/` | **Partial** | *assign* | *date* | LangGraph + routing; extend structured bundle (WS2) |
| Decision memo (Pydantic) | `salesflow-saas/backend/app/services/core_os/decision_memo.py` | **Production** | *assign* | *date* | Schema used as universal memo contract |
| Decision plane bundle (A/R/S + intent) | `salesflow-saas/backend/app/services/core_os/decision_plane_contracts.py` | **Production** (initial) | *assign* | *date* | WS2 + `GET .../approval-center/class-b-decision-bundle` |
| Tool verification ledger | `salesflow-saas/backend/app/services/core_os/verification_ledger.py` | **Partial** | *assign* | *date* | `test_verification_ledger_contradiction.py` |
| Durable flows (LangGraph) | `salesflow-saas/backend/app/flows/` | **Partial** | *assign* | *date* | `prospecting_durable_flow.py`, `self_improvement_flow.py` |
| Celery workers | `salesflow-saas/backend/app/workers/` | **Production** | *assign* | *date* | Tasks for sequences, agents, notifications, affiliates |
| Temporal durable engine | — | **Planned** | *assign* | — | [`adr/0001-tier1-execution-policy-spikes.md`](adr/0001-tier1-execution-policy-spikes.md) |
| Policy engine (in-app) | `salesflow-saas/backend/app/services/dealix_os/policy_engine.py` | **Partial** | *assign* | *date* | OPA/FGA target in [`governance/trust-fabric.md`](governance/trust-fabric.md) |
| Strategic deals / M&A helpers | `salesflow-saas/backend/app/services/strategic_deals/` | **Partial** | *assign* | *date* | Multiple modules; HITL in matrix |
| Security gate | `salesflow-saas/backend/app/services/security_gate.py` | **Partial** | *assign* | *date* | Expand release gates (WS6) |
| Audit log model | `salesflow-saas/backend/app/models/audit_log.py` | **Partial** | *assign* | *date* | Enterprise audit streaming TBD (WS6) |
| OpenTelemetry | — | **Planned / partial** | *assign* | — | Correlation IDs in some paths; full OTel per radar |
| OPA / OpenFGA / Vault / Keycloak | — | **Planned** | *assign* | — | ADR-0001 spikes only |
| Semantic metrics dictionary | `docs/semantic-metrics-dictionary.md` | **Pilot** (doc) | Data lead | *date* | Code single source TBD (WS5) |
| Lineage catalog | `docs/lineage-catalog-choice.md` | **Pilot** (doc) | Data lead | *date* | Default recommendation: OpenLineage until ADR |
| PDPL / NCA / AI control matrices | `docs/governance/pdpl-nca-ai-control-matrices.md` | **Pilot** (doc) | Compliance | *date* | Operationalize per release (WS7) + enterprise readiness gate |
| Executive room UI/API | `salesflow-saas/frontend/`, `executive_room` API | **Planned / partial** | Product | *date* | [`executive-room-completion-spec.md`](executive-room-completion-spec.md) |

## Rules

- Promote a row to **Production** only with tests + runbook + owner sign-off.  
- **Pilot** requires feature flag, scope note, and rollback.  
- **Planned** rows must link to an ADR or workstream ID.

See [`completion-program-workstreams.md`](completion-program-workstreams.md) for the eight workstreams and exit criteria.  
**قائمة إغلاق Tier-1 (عربي):** [`TIER1_MASTER_CLOSURE_CHECKLIST_AR.md`](TIER1_MASTER_CLOSURE_CHECKLIST_AR.md) — **50 بندًا (إنجليزي):** [`salesflow-saas/docs/tier1-master-closure-checklist.md`](../salesflow-saas/docs/tier1-master-closure-checklist.md).
