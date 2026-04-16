# Executive Surface Closure Plan — Track 9

> **Parent**: [`executive-board-os.md`](executive-board-os.md)  
> **Plane**: Decision | **Version**: 1.0

---

## Objective

Transform executive surfaces from placeholder UIs into real-data-driven decision tools used weekly by at least one stakeholder.

---

## Surface Inventory & Wiring Status

| Surface | Frontend | API | Real Data? | Priority |
|---------|----------|-----|-----------|----------|
| Executive Room | `executive-room.tsx` | `executive_room.py` | Placeholder | P1 |
| Approval Center | `approval-center.tsx` | `approval_center.py` | Placeholder | P1 |
| Evidence Pack Viewer | `evidence-pack-viewer.tsx` | `evidence_packs.py` | Placeholder | P2 |
| Saudi Compliance Dashboard | `saudi-compliance-dashboard.tsx` | `saudi_compliance.py` | Seed data | P1 |
| Actual vs Forecast | `actual-vs-forecast-dashboard.tsx` | `forecast_control.py` | Placeholder | P2 |
| Risk Heatmap | `risk-heatmap.tsx` | Aggregated | No data | P2 |
| Policy Violations Board | `policy-violations-board.tsx` | From contradictions | No data | P2 |
| Connector Governance Board | `connector-governance-board.tsx` | `connector_governance.py` | Known connectors | P1 |
| Partner Pipeline Board | `partner-pipeline-board.tsx` | From `strategic_deals` | Partial | P2 |

---

## Wiring Plan: Executive Room (P1)

The Executive Room API (`GET /api/v1/executive-room/snapshot`) needs to aggregate from real services:

```python
# Target implementation for executive_room.py
async def build_snapshot(db: AsyncSession, tenant_id: str):
    return {
        "revenue": await analytics_service.get_revenue_summary(db, tenant_id),
        "approvals": await count_approval_status(db, tenant_id),
        "connectors": await connector_governance.get_health_summary(db, tenant_id),
        "compliance": await saudi_compliance_matrix.get_posture(db, tenant_id),
        "contradictions": await contradiction_engine.get_stats(db, tenant_id),
        "strategic_deals": await count_strategic_deals(db, tenant_id),
        "evidence_packs": await count_evidence_packs(db, tenant_id),
    }
```

### Data Source Mapping

| Section | Query | Table(s) |
|---------|-------|----------|
| Revenue actual | SUM(deals.value) WHERE status='won' | `deals` |
| Pipeline value | SUM(deals.value) WHERE status IN ('open','negotiating') | `deals` |
| Win rate | COUNT(won) / COUNT(closed) | `deals` |
| Pending approvals | COUNT WHERE status='pending' | `approval_requests` |
| SLA warning | COUNT WHERE deadline < now+4h AND status='pending' | `approval_requests` |
| Connector health | GROUP BY status | `integration_sync_states` |
| Compliance posture | FROM `saudi_compliance_matrix.get_posture()` | `compliance_controls` |
| Active contradictions | COUNT WHERE status IN ('detected','reviewing') | `contradictions` |
| Strategic deals | COUNT WHERE status='active' | `strategic_deals` |
| Evidence packs ready | COUNT WHERE status='ready' | `evidence_packs` |

---

## Wiring Plan: Approval Center (P1)

The Approval Center needs to query real `ApprovalRequest` records:

```python
# Target query
SELECT * FROM approval_requests
WHERE tenant_id = :tid AND status = 'pending'
ORDER BY
    CASE priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
    END,
    created_at ASC
```

### Required Model Enhancement
Add to `ApprovalRequest` in `models/operations.py`:
- `sla_deadline_at` (DateTime) — when approval must be completed
- `escalation_level` (Integer, default 0) — current escalation
- `category` (String) — deal, message, integration, billing, compliance
- `priority` (String) — critical, high, normal, low

---

## Wiring Plan: Connector Governance Board (P1)

Already partially wired:
- `ConnectorGovernanceService` returns known connectors + registered states
- Needs: live health probes for active connectors (WhatsApp API check, Stripe status, etc.)

---

## Wiring Plan: Saudi Compliance Dashboard (P1)

Already partially wired:
- `SaudiComplianceMatrix` seeds default controls
- Needs: live checks that update control status from real service results
- Example: PDPL-C01 should query consent coverage from real `consents` table

---

## Board-Ready Export Path

### Requirements
1. Any executive surface can export to JSON
2. Evidence packs export to PDF (via WeasyPrint with Arabic RTL)
3. Board pack combines multiple surfaces into single PDF

### Implementation
- JSON export: Already supported (API returns JSON)
- PDF export: Use `invoice_generator.py` pattern (WeasyPrint)
- Board pack: New service that calls all surfaces and renders combined PDF

---

## Gate: Executive Surface Closure

- [ ] Executive Room shows real revenue, approvals, compliance data
- [ ] Approval Center queries real ApprovalRequest records
- [ ] Saudi Compliance Dashboard runs real checks
- [ ] Connector Governance Board shows actual connector status
- [ ] At least one surface used in a real weekly review
- [ ] Board-ready export path works for at least one surface
