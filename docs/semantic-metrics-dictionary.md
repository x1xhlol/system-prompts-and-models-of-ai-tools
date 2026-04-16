# Semantic metrics dictionary (draft v0)

**Status:** Pilot — definitions here precede code centralization. Update when analytics modules converge.

| Metric key | Definition | Primary source | Owner |
|------------|------------|----------------|-------|
| `revenue_sar` | Recognized revenue in SAR for period P | Billing / finance system of record | Finance |
| `pipeline_value_sar` | Weighted pipeline in SAR | CRM deals | RevOps |
| `qualified_lead_count` | Leads meeting ICP + score threshold | CRM + scoring | Sales |
| `partner_sourced_pipeline_sar` | Pipeline attributed to partner channel | CRM attribution | Partnerships |
| `synergy_realization_sar` | Post-close synergy captured vs plan | Finance + PMI tracker | CorpDev |

## Rules

- Do not redefine the same key in multiple services.  
- Dashboards and agent memos must reference **keys** from this table (or a future `app/analytics/metrics_catalog.py`).
