# Executive room & customer readiness — WS8 spec

**Goal:** Executive-visible surfaces backed by **trusted data only** (no hallucinated KPIs).

## Structured weekly contract (WS8 — single UI/API shape)

**Canonical schema:** [`ExecWeeklyGovernanceContract`](../salesflow-saas/backend/app/schemas/structured_outputs.py) — حقول `changes_summary`, `pending_decisions`, `blockers_summary`, `at_risk_items`, `next_best_actions`, `week_of`, `provenance`.  
**Legacy / PMI richness:** [`ExecWeeklyPack`](../salesflow-saas/backend/app/schemas/structured_outputs.py) (RAG، synergy SAR، إلخ) يبقى للتقارير المالية؛ الواجهات التنفيذية الجديدة تفضّل `ExecWeeklyGovernanceContract`.

## Milestones

0. **Class B bundle API (pilot)** — `GET /api/v1/approval-center/class-b-decision-bundle` returns a validated bundle (`validate_class_b_bundle`); frontend can bind read-only viewers to this shape before DB-backed queues exist.  
1. **Read-only executive dashboard** — memos + evidence pack viewer fed from APIs returning [`decision_plane_contracts.assemble_decision_bundle`](../salesflow-saas/backend/app/services/core_os/decision_plane_contracts.py) payloads.  
2. **Approval center** — queue of Class B items with A/R/S and approver roles.  
3. **Policy violations board** — feed from audit log + tool ledger contradictions.  
4. **Partner scorecards** — metrics from [`semantic-metrics-dictionary.md`](semantic-metrics-dictionary.md) keys only.  
5. **Actual vs forecast** — charts bound to semantic metrics + finance exports.  
6. **Risk heatmaps** — aggregated from `risk_register` on latest memos per initiative.

## Security

- RBAC / tenant isolation mandatory; sensitive rows require OpenFGA-style checks when available (WS4).  
- No PII in client-side logs.

## Dependencies

WS2 (bundles), WS4 (ledger), WS5 (metrics), partial WS3 (workflow state for approvals).
