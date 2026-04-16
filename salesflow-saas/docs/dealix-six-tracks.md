# Dealix Six-Track Framework

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../MASTER_OPERATING_PROMPT.md)  
> **Version**: 1.0 | **Status**: Canonical

---

## Overview

All strategic and operational work in Dealix is organized into six tracks. Each track has defined KPIs, current maturity, target maturity, and maps to specific code components.

---

## Track 1: Revenue

**Domain**: Lead capture → qualification → deal pipeline → closing → post-sale → renewal

### Scope
- Intake (website, WhatsApp, email, referrals, forms)
- Enrichment and entity linking
- Qualification / scoring / routing
- Multi-channel outreach
- Meeting orchestration
- Proposal / CPQ / pricing governance
- Contract handoff
- Onboarding handoff
- Renewal / upsell / cross-sell
- Account expansion intelligence
- Actual vs forecast
- Churn / expansion signals

### Code Mapping
| Component | File |
|-----------|------|
| Lead Service | `services/lead_service.py` |
| Deal Service | `services/deal_service.py` |
| Sales OS Service | `services/sales_os_service.py` |
| Revenue Room API | `api/v1/revenue_room.py` |
| Lead Qualification Agent | `ai-agents/prompts/lead-qualification-agent.md` |
| Outreach Writer Agent | `ai-agents/prompts/outreach-message-writer.md` |
| Closer Agent | `ai-agents/prompts/closer-agent.md` (backend/app/ai/prompts/) |
| Meeting Booking Agent | `ai-agents/prompts/meeting-booking-agent.md` |
| Proposal Drafting Agent | `ai-agents/prompts/proposal-drafting-agent.md` |
| Sequence Engine | `services/sequence_engine.py` |
| Auto Pipeline | `services/auto_pipeline.py` |
| Predictive Revenue | `services/predictive_revenue_service.py` |
| CPQ Service | `services/cpq/` |
| Signal Selling | `services/signal_selling_service.py` |

### Structured Outputs
- `LeadScoreCard` — score 0-100, signals, recommendation
- `QualificationMemo` — structured deal qualification
- `ProposalPack` — pricing + terms + value proposition
- `PricingDecisionRecord` — pricing rationale + approval status
- `HandoffChecklist` — sales-to-onboarding transition

### KPIs
- Pipeline velocity (days)
- Win rate (%)
- Revenue lift vs baseline (%)
- CAC payback (months)
- Forecast accuracy (%)

### Maturity: **Strong** — Core pipeline live, CPQ exists, need unified actual-vs-forecast

---

## Track 2: Intelligence

**Domain**: Signal detection, behavior analysis, AI agents, forecasting

### Code Mapping
| Component | File |
|-----------|------|
| Signal Intelligence | `services/signal_intelligence.py` |
| Behavior Intelligence | `services/behavior_intelligence.py` |
| Meeting Intelligence | `services/meeting_intelligence.py` |
| Model Router | `services/model_router.py` |
| Arabic NLP | `services/ai/arabic_nlp.py` |
| Knowledge Brain | `services/knowledge_brain.py` |
| WhatsApp Brain | `services/whatsapp_brain.py` |
| Email Brain | `services/email_brain.py` |
| LinkedIn Brain | `services/linkedin_brain.py` |
| Social Media Brain | `services/social_media_brain.py` |
| Comparison Engine | `services/comparison_engine.py` |
| Company Research | `services/company_research.py` |
| OSINT Service | `services/osint_service.py` |

### KPIs
- Model latency p95 (ms)
- Schema adherence rate (%)
- Arabic memo quality score
- Tool-call reliability (%)
- Cost per successful workflow (SAR)

### Maturity: **Strong** — Multi-model routing live, Arabic NLP live, need model routing dashboard

---

## Track 3: Compliance

**Domain**: PDPL, ZATCA, SDAIA, sector regulations, audit trails

### Code Mapping
| Component | File |
|-----------|------|
| PDPL Consent Manager | `services/pdpl/consent_manager.py` |
| PDPL Data Rights | `services/pdpl/data_rights.py` |
| ZATCA Compliance | `services/zatca_compliance.py` |
| Compliance API | `api/v1/compliance.py` |
| Consent API | `api/v1/consents.py` |
| Audit Service | `services/audit_service.py` |
| Audit Log Model | `models/audit_log.py` |
| Complaint Model | `models/compliance.py` |
| PDPL Consent Model | `models/consent.py` |
| Compliance Reviewer Agent | `ai-agents/prompts/compliance-reviewer.md` |
| Shannon Security | `services/shannon_security.py` |

### Compliance Controls
- **PDPL**: Consent lifecycle, data subject rights, cross-border, retention, breach notification
- **ZATCA**: E-invoicing Phase 2, VAT 15%, SAR formatting
- **SDAIA**: AI governance registration, explainability
- **NCA**: Cybersecurity controls, data residency
- **Sector**: Real estate brokerage, healthcare data, financial services

### KPIs
- Consent coverage rate (%)
- Compliance control pass rate (%)
- Mean time to resolve complaints (hours)
- Audit trail completeness (%)

### Maturity: **Moderate** — PDPL engine live, ZATCA basic, need Saudi Compliance Matrix (live controls)

---

## Track 4: Expansion

**Domain**: Strategic deals, M&A, partnerships, geographic expansion

### Code Mapping
| Component | File |
|-----------|------|
| Acquisition Scouting | `services/strategic_deals/acquisition_scouting.py` |
| Deal Matcher | `services/strategic_deals/deal_matcher.py` |
| Deal Negotiator | `services/strategic_deals/deal_negotiator.py` |
| Deal Room | `services/strategic_deals/deal_room.py` |
| Ecosystem Mapper | `services/strategic_deals/ecosystem_mapper.py` |
| Portfolio Intelligence | `services/strategic_deals/portfolio_intelligence.py` |
| Strategic Simulator | `services/strategic_deals/strategic_simulator.py` |
| ROI Engine | `services/strategic_deals/roi_engine.py` |
| Company Profiler | `services/strategic_deals/company_profiler.py` |
| Company Twin | `services/strategic_deals/company_twin.py` |
| Deal Taxonomy | `services/strategic_deals/deal_taxonomy.py` |
| Channel Compliance | `services/strategic_deals/channel_compliance.py` |
| Territory Manager | `services/territory_manager.py` |

### KPIs
- Strategic pipeline value (SAR)
- Time-to-close for partnerships (days)
- Partner-sourced revenue (%)
- Geographic coverage (markets)

### Maturity: **Moderate** — 15 strategic deal services live, need governance docs and pipeline board

---

## Track 5: Operations

**Domain**: Deployment, monitoring, connectors, infrastructure

### Code Mapping
| Component | File |
|-----------|------|
| Operations Hub | `services/operations_hub.py` |
| Go-Live Matrix | `services/go_live_matrix.py` |
| Observability | `services/observability.py` |
| Self-Improvement | `services/self_improvement.py` |
| Feature Flags | `services/feature_flags.py` |
| Execution Router | `services/execution_router.py` |
| Integration Sync State | `models/operations.py` |
| Operations API | `api/v1/operations.py` |
| Docker Compose | `docker-compose.yml` |
| CI/CD | `.github/workflows/dealix-ci.yml` |
| Hermes Orchestrator | `services/hermes_orchestrator.py` |
| Channel Orchestrator | `services/channel_orchestrator.py` |

### KPIs
- System uptime (%)
- API p95 latency (ms)
- Connector health rate (%)
- Deployment frequency (per week)
- Mean time to recovery (minutes)

### Maturity: **Moderate** — Docker + CI live, need connector governance + model routing dashboard

---

## Track 6: Trust

**Domain**: Policy gates, approval SLAs, evidence packs, contradiction detection

### Code Mapping
| Component | File |
|-----------|------|
| Policy Engine | `openclaw/policy.py` |
| Approval Bridge | `openclaw/approval_bridge.py` |
| Trust Score Service | `services/trust_score_service.py` |
| Security Gate | `services/security_gate.py` |
| SLA Escalation | `services/sla_escalation_alerts.py` |
| Tool Verification | `services/tool_verification.py` |
| Tool Receipts | `services/tool_receipts.py` |
| Skill Governance | `services/skill_governance.py` |
| Outbound Governance | `services/outbound_governance.py` |
| Approval Request Model | `models/operations.py` |
| Trust Score Model | `models/advanced.py` |
| Domain Event Model | `models/operations.py` |

### KPIs
- Approval SLA compliance (%)
- Active contradictions count
- Evidence pack coverage (%)
- Policy violation rate (%)
- Mean time to resolve contradictions (hours)

### Maturity: **Moderate** — Policy engine + approval bridge live, need contradiction engine + evidence packs
