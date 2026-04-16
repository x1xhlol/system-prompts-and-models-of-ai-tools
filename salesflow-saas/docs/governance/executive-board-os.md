# Executive & Board OS — Decision Surface Framework

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md)  
> **Plane**: Decision | **Tracks**: All  
> **Version**: 1.0 | **Status**: Canonical

---

## Overview

The Executive & Board OS defines what leadership sees, how decisions are escalated, and what constitutes a complete board pack. The goal is to make Dealix **Board-usable** — executives can make informed decisions from system-generated surfaces.

---

## Executive Surfaces

### 1. Executive Room
**Purpose**: Single view of everything an executive needs to know right now.

| Section | Data Source | Refresh |
|---------|-----------|---------|
| Revenue Overview | `analytics_service.py` | Real-time |
| Actual vs Forecast | `forecast_control_center.py` | Daily |
| Pipeline Health | `deal_service.py` | Real-time |
| Approval Queue | `ApprovalRequest` model | Real-time |
| Connector Health | `connector_governance.py` | 5 min |
| Compliance Posture | `saudi_compliance_matrix.py` | Daily |
| Active Contradictions | `contradiction_engine.py` | Real-time |
| Strategic Deals | `strategic_deals/` services | Real-time |
| Risk Summary | Aggregated | Daily |

**API**: `GET /api/v1/executive-room/snapshot`

### 2. Approval Center
**Purpose**: All pending approvals with SLA timers.

| Feature | Description |
|---------|------------|
| Queue | Filterable by category, priority, SLA status |
| SLA Timer | Color-coded countdown (green → yellow → red) |
| Bulk Actions | Approve/reject low-risk items in batch |
| History | Full approval history with audit trail |

**API**: `GET /api/v1/approval-center`

### 3. Evidence Pack Viewer
**Purpose**: Browse and review assembled evidence packs.

| Feature | Description |
|---------|------------|
| Pack List | By type (deal, compliance, board, incident) |
| Detail View | Expandable evidence items |
| Review Workflow | Mark reviewed, add notes |
| Integrity Check | SHA256 hash verification |

**API**: `GET /api/v1/evidence-packs`

### 4. Risk Heatmap
**Purpose**: Visual risk matrix across all domains.

| Axis | Categories |
|------|-----------|
| X (Category) | Revenue, Compliance, Technology, Operations, Partners, M&A |
| Y (Severity) | Critical, High, Medium, Low |
| Color | Red (active + unmitigated), Yellow (active + mitigated), Green (resolved) |

Data aggregated from: Compliance Matrix, Contradiction Engine, Connector Health, SLA Breaches.

### 5. Actual vs Forecast Dashboard
**Purpose**: Unified view across all tracks.

| Track | Actual | Forecast | Variance |
|-------|--------|----------|----------|
| Revenue | Live pipeline value | AI + manual forecast | Auto-calculated |
| Partnerships | Active partner count | Partner targets | Auto-calculated |
| M&A | Deals in progress | Pipeline target | Auto-calculated |
| Expansion | Markets launched | Launch plan | Auto-calculated |

**API**: `GET /api/v1/forecast-control/unified`

### 6. Next-Best-Action Board
**Purpose**: AI-recommended actions prioritized by impact.

| Source | Action Type |
|--------|------------|
| Revenue | Follow up on stale deals, upsell signals |
| Compliance | Controls needing attention |
| Operations | Connectors needing maintenance |
| Trust | Contradictions needing resolution |

### 7. Pipeline Boards
**Purpose**: Kanban views for strategic pipelines.

| Board | Stages |
|-------|--------|
| Partner Pipeline | Scout → Evaluate → Negotiate → Onboard → Active |
| M&A Pipeline | Source → Screen → Diligence → Negotiate → Close |
| Expansion Pipeline | Scan → Prioritize → Ready → Canary → Scale |

### 8. Policy Violations Board
**Purpose**: Active policy violations and contradictions.

| Column | Description |
|--------|------------|
| Violation | What was detected |
| Severity | Critical / High / Medium / Low |
| Source | Which system detected it |
| Status | Detected → Investigating → Resolved |
| Owner | Who is responsible for resolution |

---

## Board Pack Template

Produced quarterly (or on-demand for special meetings):

### Section 1: Executive Summary
- Overall business health (RAG status)
- Key achievements this period
- Key risks requiring board attention

### Section 2: Financial Performance
- Revenue actual vs forecast
- Customer acquisition metrics (CAC, LTV, payback)
- Runway / burn rate (if applicable)

### Section 3: Product & Technology
- Platform uptime and reliability
- AI agent performance metrics
- Technology radar changes
- Security posture summary

### Section 4: Compliance & Governance
- PDPL compliance status
- ZATCA compliance status
- Active audit findings
- Policy violations summary

### Section 5: Strategic Initiatives
- Partnership pipeline status
- M&A pipeline status
- Expansion roadmap progress

### Section 6: People & Culture
- Team size and Saudization ratio
- Key hires and departures
- Training and development

### Section 7: Risk Register
- Top 10 risks with mitigation status
- New risks identified this period
- Risk heatmap visualization

### Section 8: Decisions Required
- Items requiring board vote
- Recommendation for each item
- Supporting evidence packs

---

## Decision Escalation Matrix

| Decision Type | Operational | Manager | Director | VP | C-Level | Board |
|--------------|-------------|---------|----------|-----|---------|-------|
| Lead routing | x | | | | | |
| Message send | | x | | | | |
| Discount <10% | | x | | | | |
| Discount 10-25% | | | x | | | |
| Discount >25% | | | | x | | |
| New integration | | | x | | | |
| DB migration | | | | x | | |
| Partner activation | | | | x | | |
| M&A short list | | | | | x | |
| M&A offer | | | | | | x |
| Market launch | | | | | x | |
| Production deployment | | | | x | | |
| Policy change | | | | | x | |
| Budget >100K SAR | | | | | x | |
| Budget >1M SAR | | | | | | x |

---

## Code Mapping

| Surface | Backend | Frontend |
|---------|---------|----------|
| Executive Room | `services/executive_roi_service.py` (expanded) | `components/dealix/executive-room.tsx` |
| Approval Center | `api/v1/approval_center.py` | `components/dealix/approval-center.tsx` |
| Evidence Packs | `services/evidence_pack_service.py` | `components/dealix/evidence-pack-viewer.tsx` |
| Risk Heatmap | Aggregated service | `components/dealix/risk-heatmap.tsx` |
| Forecast Control | `services/forecast_control_center.py` | `components/dealix/actual-vs-forecast-dashboard.tsx` |
| Partner Pipeline | `api/v1/strategic_deals.py` | `components/dealix/partner-pipeline-board.tsx` |
| Policy Violations | `services/contradiction_engine.py` | `components/dealix/policy-violations-board.tsx` |
| Compliance Dashboard | `services/saudi_compliance_matrix.py` | `components/dealix/saudi-compliance-dashboard.tsx` |
| Connector Governance | `services/connector_governance.py` | `components/dealix/connector-governance-board.tsx` |
