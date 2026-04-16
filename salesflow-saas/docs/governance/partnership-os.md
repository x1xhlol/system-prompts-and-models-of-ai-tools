# Partnership OS — Alliance Lifecycle Management

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md)  
> **Plane**: Decision + Execution | **Tracks**: Expansion, Revenue  
> **Version**: 1.0 | **Status**: Canonical

---

## Overview

The Partnership OS manages the full lifecycle of strategic alliances — from scouting to co-sell optimization. Every partnership commitment is a Class B action requiring human approval.

---

## Partnership Lifecycle

```
SCOUT → EVALUATE → NEGOTIATE → ONBOARD → MANAGE → OPTIMIZE → RENEW/EXIT
```

### Phase 1: Scout
- **Input**: Market signals, ecosystem gaps, customer requests
- **AI Role**: `ecosystem_mapper.py` identifies potential partners
- **Output**: Partner prospect list with strategic fit scores

### Phase 2: Evaluate
- **Input**: Partner prospect list
- **AI Role**: `deal_matcher.py` scores strategic fit
- **Output**: `PartnerFitScoreCard` (structured)

### Phase 3: Negotiate
- **Input**: Approved partner candidates
- **AI Role**: `deal_negotiator.py` drafts term proposals
- **Human Role**: Reviews and approves terms (Class B)
- **Output**: Term sheet (versioned)

### Phase 4: Onboard
- **Input**: Signed agreement
- **Execution**: Activation playbooks, system integration, training
- **Output**: Partner activated in system

### Phase 5: Manage
- **Input**: Live partnership
- **Monitoring**: Partner scorecards, contribution margin, health signals
- **Output**: Monthly partner performance report

### Phase 6: Optimize
- **Input**: Performance data
- **AI Role**: Co-sell/co-market recommendations
- **Output**: Optimization playbook

---

## Partnership Types

| Type | Description | Approval Level |
|------|------------|---------------|
| Referral | Lead exchange, commission-based | Manager |
| Distribution | Resale rights, channel partner | Director |
| Technology | API integration, co-development | VP |
| Strategic | Joint ventures, co-investment | C-Level |
| Government | Public sector partnerships | C-Level + Legal |

---

## Code Mapping

| Component | File | Purpose |
|-----------|------|---------|
| Ecosystem Mapper | `services/strategic_deals/ecosystem_mapper.py` | Partner discovery |
| Deal Matcher | `services/strategic_deals/deal_matcher.py` | Fit scoring |
| Deal Negotiator | `services/strategic_deals/deal_negotiator.py` | Term drafting |
| Deal Room | `services/strategic_deals/deal_room.py` | Negotiation workspace |
| Channel Compliance | `services/strategic_deals/channel_compliance.py` | Channel governance |
| ROI Engine | `services/strategic_deals/roi_engine.py` | Partnership ROI |
| Strategic Deal Model | `models/strategic_deal.py` | Data model |
| Strategic Deals API | `api/v1/strategic_deals.py` | API endpoints |

---

## Structured Outputs

- `PartnerFitScoreCard` — strategic alignment, revenue potential, risk assessment
- `PartnerTermSheet` — economics, obligations, SLAs, exit clauses
- `PartnerScorecard` — monthly performance, contribution margin, health
- `PartnerActivationChecklist` — integration steps, training, go-live criteria

---

## GCC-Specific Considerations

| Factor | Requirement |
|--------|------------|
| Saudization | Partners must meet Saudization quotas for joint operations |
| Local partner mandate | Some sectors require Saudi partner (>51% ownership) |
| CR verification | Commercial Registration must be verified before activation |
| Arabic agreements | All partnership agreements must be available in Arabic |
| PDPL data sharing | Data sharing between partners requires PDPL consent |

---

## KPIs

| Metric | Target |
|--------|--------|
| Partner-sourced revenue | >15% of total |
| Time to activate (days) | <30 |
| Partner satisfaction score | >4.0/5.0 |
| Co-sell deal conversion | >25% |
| Partner churn rate | <10% annual |
