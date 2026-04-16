# Architecture register — subsystem status (Completion Program WS1)

**Purpose:** Single **code-backed** snapshot of **Current / Partial / Pilot / Production** for major subsystems. Refresh per milestone or release.  
**Canonical agent matrix:** [`Execution_Matrix.md`](../Execution_Matrix.md) (see [`adr/0002-execution-matrix-canonical-source.md`](adr/0002-execution-matrix-canonical-source.md) for v2 draft status).

| Subsystem | Path / anchor | Status | Evidence / notes |
|-----------|---------------|--------|-------------------|
| FastAPI API surface | `salesflow-saas/backend/app/main.py`, `app/api/` | **Production** (dev/staging/prod per deploy) | pytest API suites |
| Agent router / executor | `salesflow-saas/backend/app/services/agents/` | **Partial** | LangGraph + routing; extend structured bundle (WS2) |
| Decision memo (Pydantic) | `salesflow-saas/backend/app/services/core_os/decision_memo.py` | **Production** | Schema used as universal memo contract |
| Decision plane bundle (A/R/S + intent) | `salesflow-saas/backend/app/services/core_os/decision_plane_contracts.py` | **Production** (initial) | WS2 — compose `memo` + `evidence_pack` + `approval_packet` + `execution_intent` |
| Tool verification ledger | `salesflow-saas/backend/app/services/core_os/verification_ledger.py` | **Partial** | File-based proofs; wire to DB/API for multi-instance (WS4) |
| Durable flows (LangGraph) | `salesflow-saas/backend/app/flows/` | **Partial** | `prospecting_durable_flow.py`, `self_improvement_flow.py` |
| Celery workers | `salesflow-saas/backend/app/workers/` | **Production** | Tasks for sequences, agents, notifications, affiliates |
| Temporal durable engine | — | **Planned** | [`adr/0001-tier1-execution-policy-spikes.md`](adr/0001-tier1-execution-policy-spikes.md) |
| Policy engine (in-app) | `salesflow-saas/backend/app/services/dealix_os/policy_engine.py` | **Partial** | OPA/FGA target in [`governance/trust-fabric.md`](governance/trust-fabric.md) |
| Strategic deals / M&A helpers | `salesflow-saas/backend/app/services/strategic_deals/` | **Partial** | Multiple modules; HITL in matrix |
| Security gate | `salesflow-saas/backend/app/services/security_gate.py` | **Partial** | Expand release gates (WS6) |
| Audit log model | `salesflow-saas/backend/app/models/audit_log.py` | **Partial** | Enterprise audit streaming TBD (WS6) |
| OpenTelemetry | — | **Planned / partial** | Correlation IDs in some paths; full OTel per radar |
| OPA / OpenFGA / Vault / Keycloak | — | **Planned** | ADR-0001 spikes only |
| Semantic metrics dictionary | `docs/semantic-metrics-dictionary.md` | **Pilot** (doc) | Code single source TBD (WS5) |
| Lineage catalog | `docs/lineage-catalog-choice.md` | **Pilot** (doc) | Default recommendation: OpenLineage until ADR |
| PDPL / NCA / AI control matrices | `docs/governance/pdpl-nca-ai-control-matrices.md` | **Pilot** (doc) | Operationalize per release (WS7) |
| Executive room UI/API | `salesflow-saas/frontend/`, APIs TBD | **Planned / partial** | [`executive-room-completion-spec.md`](executive-room-completion-spec.md) |

## Rules

- Promote a row to **Production** only with tests + runbook + owner sign-off.  
- **Pilot** requires feature flag, scope note, and rollback.  
- **Planned** rows must link to an ADR or workstream ID.

See [`completion-program-workstreams.md`](completion-program-workstreams.md) for the eight workstreams and exit criteria.
