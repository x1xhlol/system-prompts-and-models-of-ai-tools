# Executive room & customer readiness — WS8 spec

**Goal:** Executive-visible surfaces backed by **trusted data only** (no hallucinated KPIs).

## Milestones

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
