# M&A OS — Corporate Development Lifecycle

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md)  
> **Plane**: Decision + Execution | **Tracks**: Expansion  
> **Version**: 1.0 | **Status**: Canonical

---

## Overview

The M&A OS manages corporate development activities from target identification through post-merger integration. All M&A commitments are Class B actions with C-Level or Board approval required.

---

## M&A Lifecycle

```
SOURCE → SCREEN → DILIGENCE → NEGOTIATE → CLOSE → INTEGRATE
```

### Phase 1: Source
- **AI Role**: `acquisition_scouting.py` identifies targets
- **Input**: Sector focus, revenue thresholds, geographic criteria
- **Output**: Target long list with preliminary scores

### Phase 2: Screen
- **AI Role**: `deal_matcher.py` + `company_profiler.py` deep analysis
- **Input**: Target long list
- **Output**: `TargetScreeningMemo` (structured) — short list

### Phase 3: Diligence
- **Orchestration**: DD room control with workstream assignments
- **Workstreams**: Financial, Legal, Technical, Product, Security, Cultural
- **AI Role**: `portfolio_intelligence.py` analyzes each workstream
- **Human Role**: Reviews findings, flags risks (Class B)
- **Output**: `DueDiligenceReport` (structured)

### Phase 4: Negotiate
- **AI Role**: `strategic_simulator.py` models scenarios, `roi_engine.py` calculates ranges
- **Human Role**: Negotiation strategy approval (Class B → Board)
- **Output**: IC Memo, Board Pack Draft, Offer Terms

### Phase 5: Close
- **Checklist**: Regulatory approvals, legal finalization, signing
- **Human Role**: Final approval (Board)
- **Output**: Signed agreements, closing documentation

### Phase 6: Integrate
- **Handoff**: To PMI OS (see `pmi-os.md`)
- **Output**: Integration plan, Day-1 readiness checklist

---

## Code Mapping

| Component | File | Purpose |
|-----------|------|---------|
| Acquisition Scouting | `services/strategic_deals/acquisition_scouting.py` | Target identification |
| Company Profiler | `services/strategic_deals/company_profiler.py` | Deep company analysis |
| Company Twin | `services/strategic_deals/company_twin.py` | Digital twin modeling |
| Portfolio Intelligence | `services/strategic_deals/portfolio_intelligence.py` | Portfolio analysis |
| Strategic Simulator | `services/strategic_deals/strategic_simulator.py` | Scenario modeling |
| ROI Engine | `services/strategic_deals/roi_engine.py` | Financial modeling |
| Deal Taxonomy | `services/strategic_deals/deal_taxonomy.py` | Deal classification |

---

## Structured Outputs

- `TargetScreeningMemo` — fit score, revenue, sector, risks, recommendation
- `DueDiligenceReport` — workstream findings, risk register, valuation impact
- `SynergyModel` — revenue synergies, cost synergies, integration costs, timeline
- `ICMemo` — investment committee memo with recommendation
- `BoardPack` — executive summary for board approval
- `OfferTerms` — valuation range, deal structure, conditions

---

## Saudi/GCC Specific

| Factor | Requirement |
|--------|------------|
| CMA approvals | Capital Market Authority for listed companies |
| GACA approvals | General Authority for Competition |
| Saudization compliance | Target must meet or plan to meet quotas |
| CR transfer | Commercial Registration transfer process |
| PDPL data room | Due diligence data must comply with PDPL |
| Arabic documentation | Legal agreements must be bilingual |

---

## Approval Matrix

| Action | Approver |
|--------|---------|
| Add target to long list | VP Corporate Dev |
| Move to short list | SVP + CFO |
| Initiate due diligence | CEO |
| Submit offer | Board |
| Sign agreement | Board + Legal |
| Integration plan approval | CEO |
