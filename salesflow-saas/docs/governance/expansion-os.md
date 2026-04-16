# Expansion OS — Geographic & Vertical Growth

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md)  
> **Plane**: Decision + Execution | **Tracks**: Expansion, Revenue  
> **Version**: 1.0 | **Status**: Canonical

---

## Overview

The Expansion OS manages Dealix's growth into new geographies and industry verticals. Every market launch is a Class B action with C-Level approval and mandatory stop-loss logic.

---

## Expansion Framework

```
SCAN → PRIORITIZE → READY → LAUNCH (Canary) → SCALE → MONITOR
```

### Phase 1: Scan
- **AI Role**: Market intelligence, competitive analysis
- **Input**: Macro indicators, sector size, regulatory landscape
- **Output**: Market opportunity matrix

### Phase 2: Prioritize
- **Criteria**: Market size, regulatory complexity, Arabic support needs, competitive density
- **Output**: Ranked expansion targets

### Phase 3: Ready
- **Compliance**: Regulatory readiness by market
- **Localization**: Dialect adaptation, pricing, channel strategy
- **GTM**: Go-to-market plan with ICP per market
- **Output**: Market readiness checklist

### Phase 4: Launch (Canary)
- **Method**: Canary launch — limited tenant cohort
- **Stop-loss**: Automated triggers if metrics below threshold
- **Output**: Canary results report

### Phase 5: Scale
- **Criteria**: Canary success metrics met
- **Action**: Open market to all tenants
- **Output**: Market GA announcement

### Phase 6: Monitor
- **Ongoing**: Actual vs forecast per market
- **Triggers**: Expansion, contraction, or exit decisions
- **Output**: Market health dashboard

---

## Geographic Expansion Path

### Phase 1: Saudi Arabia (Current)
| City | Status | Priority |
|------|--------|----------|
| Riyadh | Live | Primary |
| Jeddah | Live | Primary |
| Dammam | Ready | High |
| Other cities | Planned | Medium |

### Phase 2: GCC Markets
| Market | Complexity | Arabic Dialect | Target |
|--------|-----------|----------------|--------|
| UAE | Medium | Gulf/MSA | 2027 H1 |
| Bahrain | Low | Gulf | 2027 H1 |
| Kuwait | Medium | Gulf | 2027 H2 |
| Qatar | Medium | Gulf | 2027 H2 |
| Oman | Low | Gulf | 2028 |

### Phase 3: Broader MENA
| Market | Complexity | Dialect | Target |
|--------|-----------|---------|--------|
| Egypt | High | Egyptian | 2028 |
| Jordan | Medium | Levantine | 2028 |
| Morocco | High | Maghrebi/French | 2029 |

---

## Vertical Expansion

### Current Verticals (Live)
- Real Estate — `seeds/realestate_template.json`
- Healthcare — `seeds/healthcare_template.json`
- Retail — `seeds/retail_template.json`
- Contracting — `seeds/contracting_template.json`
- Education — `seeds/education_template.json`

### Target Verticals
| Vertical | Priority | Regulatory Complexity |
|----------|----------|---------------------|
| Financial Services | High | Very High (SAMA) |
| Automotive | High | Medium |
| Legal | Medium | High |
| Hospitality | Medium | Low |
| Government | High | Very High |

---

## Dialect Handling

| Dialect | Code | Supported | Service |
|---------|------|-----------|---------|
| Saudi | `saudi` | Live | `ai/saudi_dialect.py` |
| Gulf | `gulf` | Live | `ai/arabic_nlp.py` |
| MSA | `msa` | Live | `ai/arabic_nlp.py` |
| Egyptian | `egyptian` | Planned | — |
| Levantine | `levantine` | Planned | — |
| Maghrebi | `maghrebi` | Planned | — |

---

## Stop-Loss Logic

| Metric | Threshold | Action |
|--------|-----------|--------|
| Canary conversion rate | <5% after 30 days | Pause expansion |
| Customer complaints | >10% rate | Investigate |
| Revenue vs forecast | <50% after 60 days | Review / exit |
| Compliance violations | Any critical | Halt immediately |
| Churn rate | >20% monthly | Pause acquisition |

---

## Code Mapping

| Component | File |
|-----------|------|
| Territory Manager | `services/territory_manager.py` |
| Feature Flags | `services/feature_flags.py` |
| Canary Context | `openclaw/canary_context.py` |
| Industry Templates | `seeds/` |
| Sector Assets | `models/knowledge.py (SectorAsset)` |
| Presentations | `presentations/` (11 sectors) |
