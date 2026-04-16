# Current vs Target Register — Dealix Subsystem Maturity

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../MASTER_OPERATING_PROMPT.md)  
> **Purpose**: Single source of truth for what is deployed vs what is planned.  
> **Rule**: No document may claim "production" for anything marked Target/Pilot here.  
> **Version**: 1.0 | **Last Audited**: 2026-04-16

---

## Legend

| Status | Meaning |
|--------|---------|
| **Production** | Deployed, tested, used by tenants |
| **Partial** | Code exists, not fully integrated or tested |
| **Pilot** | Behind feature flag, limited testing |
| **Target** | Designed/documented, no production code |
| **Watch** | Evaluating, no code at all |

---

## 1. Decision Plane

| Component | Status | Evidence | Gap |
|-----------|--------|----------|-----|
| Executive ROI Service | **Partial** | `services/executive_roi_service.py` (20 lines, basic snapshot) | Needs full aggregation from 6+ services |
| Analytics Service | **Production** | `services/analytics_service.py` | — |
| Management Summary Agent | **Production** | `ai-agents/prompts/management-summary-agent.md` | — |
| Revenue Attribution Agent | **Production** | `ai-agents/prompts/revenue-attribution-agent.md` | — |
| Predictive Revenue | **Production** | `services/predictive_revenue_service.py` | — |
| Strategic Simulator | **Production** | `services/strategic_deals/strategic_simulator.py` | — |
| ROI Engine | **Production** | `services/strategic_deals/roi_engine.py` | — |
| Executive Room (full) | **Partial** | `api/v1/executive_room.py` + `components/dealix/executive-room.tsx` | Returns placeholder data; needs real aggregation |
| Evidence Pack Assembly | **Partial** | `services/evidence_pack_service.py` + `models/evidence_pack.py` | Model + service exist; needs integration with deal/compliance flows |
| Forecast Control Center | **Partial** | `services/forecast_control_center.py` + `api/v1/forecast_control.py` | Returns placeholder; needs real forecast data |
| Structured Output Schemas | **Target** | — | Need Pydantic schemas for LeadScoreCard, QualificationMemo, ProposalPack, etc. |
| Board Pack Generator | **Target** | — | No code |

---

## 2. Execution Plane

| Component | Status | Evidence | Gap |
|-----------|--------|----------|-----|
| OpenClaw Gateway | **Production** | `openclaw/gateway.py` | — |
| Policy Engine (A/B/C) | **Production** | `openclaw/policy.py` | — |
| Approval Bridge | **Production** | `openclaw/approval_bridge.py` | — |
| Durable Task Flow | **Production** | `openclaw/durable_flow.py` | In-memory checkpoints; no persistent storage |
| Task Router | **Production** | `openclaw/task_router.py` | — |
| Observability Bridge | **Production** | `openclaw/observability_bridge.py` | — |
| Canary Context | **Production** | `openclaw/canary_context.py` | — |
| Hooks | **Production** | `openclaw/hooks.py` | — |
| Celery Workers | **Production** | `workers/` | — |
| Sequence Engine | **Production** | `services/sequence_engine.py` | — |
| Plugin: WhatsApp | **Production** | `openclaw/plugins/whatsapp_plugin.py` | — |
| Plugin: Salesforce | **Partial** | `openclaw/plugins/salesforce_agentforce_plugin.py` | Needs OAuth flow testing |
| Plugin: Stripe | **Partial** | `openclaw/plugins/stripe_plugin.py` | Webhook testing incomplete |
| Plugin: Voice | **Pilot** | `openclaw/plugins/voice_plugin.py` | Behind flag, limited |
| Plugin: Contract Intel | **Pilot** | `openclaw/plugins/contract_intelligence_plugin.py` | Early stage |
| Temporal Integration | **Watch** | ADR spike planned | No code; requires evidence before adoption |
| Compensation/Rollback | **Target** | Documented in execution-fabric.md | No code |
| Idempotency Keys | **Target** | — | No code |
| Dead Letter Queue | **Target** | — | No code |

---

## 3. Trust Plane

| Component | Status | Evidence | Gap |
|-----------|--------|----------|-----|
| Policy Classes (A/B/C) | **Production** | `openclaw/policy.py` | — |
| Approval Bridge | **Production** | `openclaw/approval_bridge.py` | — |
| Trust Score Service | **Production** | `services/trust_score_service.py` | — |
| Security Gate | **Production** | `services/security_gate.py` | — |
| Shannon Security | **Production** | `services/shannon_security.py` | — |
| PDPL Consent Manager | **Production** | `services/pdpl/consent_manager.py` | — |
| PDPL Data Rights | **Production** | `services/pdpl/data_rights.py` | — |
| Audit Service | **Production** | `services/audit_service.py` | — |
| Outbound Governance | **Production** | `services/outbound_governance.py` | — |
| Tool Verification | **Production** | `services/tool_verification.py` | — |
| Tool Receipts | **Production** | `services/tool_receipts.py` | — |
| SLA Escalation Alerts | **Production** | `services/sla_escalation_alerts.py` | — |
| Skill Governance | **Production** | `services/skill_governance.py` | — |
| Contradiction Engine | **Partial** | `services/contradiction_engine.py` + `models/contradiction.py` | Model + service + API exist; no AI scan integration yet |
| Evidence Pack System | **Partial** | `services/evidence_pack_service.py` + `models/evidence_pack.py` | Model + service + API exist; no auto-assembly from deal flows |
| Saudi Compliance Matrix | **Partial** | `services/saudi_compliance_matrix.py` + `models/compliance_control.py` | Seed controls exist; live checks not wired to real services |
| Approval Center (SLA) | **Partial** | `api/v1/approval_center.py` | API exists; SLA fields not on ApprovalRequest model yet |
| OPA Policy Engine | **Watch** | Documented in trust-fabric.md | No code; requires ADR + spike |
| OpenFGA Authorization | **Watch** | Documented in trust-fabric.md | No code; requires ADR + spike |
| Vault Secrets Mgmt | **Watch** | Documented in trust-fabric.md | No code |
| Keycloak Identity | **Watch** | Documented in trust-fabric.md | No code |

---

## 4. Data Plane

| Component | Status | Evidence | Gap |
|-----------|--------|----------|-----|
| PostgreSQL 16 + asyncpg | **Production** | `database.py`, `docker-compose.yml` | — |
| pgvector Embeddings | **Production** | In requirements.txt, used by KnowledgeService | — |
| Redis 7 (cache + broker) | **Production** | `docker-compose.yml` | — |
| Multi-tenant Isolation | **Production** | `TenantModel` base class, JWT middleware | — |
| Alembic Migrations | **Production** | `alembic/` | — |
| Knowledge Service (RAG) | **Production** | `services/knowledge_service.py` | — |
| Domain Events | **Production** | `models/operations.py (DomainEvent)` | — |
| Integration Sync State | **Production** | `models/operations.py (IntegrationSyncState)` | — |
| Mem0 Memory Engine | **Partial** | In requirements.txt | Integration depth unclear |
| Connector Governance Board | **Partial** | `services/connector_governance.py` + `api/v1/connector_governance.py` | Returns known connectors; no live probe |
| CloudEvents Schema | **Target** | Documented in ai-operating-model.md | No code |
| AsyncAPI Event Docs | **Target** | — | No code |
| Semantic Metrics Layer | **Target** | — | No code |
| Data Quality Checks | **Target** | — | No code |
| Lineage/Catalog | **Watch** | — | No code |
| Connector Facade Standard | **Target** | Documented in trust-fabric.md | No formalized interface |

---

## 5. Operating Plane

| Component | Status | Evidence | Gap |
|-----------|--------|----------|-----|
| Observability | **Production** | `services/observability.py` | — |
| Self-Improvement Loop | **Production** | `services/self_improvement.py` | — |
| Feature Flags | **Production** | `services/feature_flags.py` | — |
| Go-Live Matrix | **Production** | `services/go_live_matrix.py` | — |
| Operations Hub | **Production** | `services/operations_hub.py` | — |
| GitHub Actions CI | **Production** | `.github/workflows/dealix-ci.yml` | Backend + frontend jobs |
| Claude Commands | **Production** | `.claude/commands/` (5 commands) | — |
| Claude Hooks | **Production** | `.claude/hooks/` | — |
| Architecture Brief | **Production** | `scripts/architecture_brief.py` | 40/40 checks pass |
| Model Routing Dashboard | **Partial** | `services/model_routing_dashboard.py` + `api/v1/model_routing.py` | Static provider list; no live metrics collection |
| Docker Compose | **Production** | `docker-compose.yml` (7 services) | — |
| Protected Branches | **Target** | — | Not configured on GitHub |
| Required Checks | **Target** | — | CI exists but not required |
| CODEOWNERS | **Target** | — | File not created |
| Environments | **Target** | — | Not configured on GitHub |
| Deployment Protection | **Target** | — | No rules configured |
| OIDC Auth | **Target** | — | Using long-lived secrets |
| Artifact Attestations | **Target** | — | Requires Enterprise plan for private repos |
| Audit Log Streaming | **Target** | — | No external streaming |
| Rulesets | **Target** | — | Not configured |

---

## 6. Revenue OS

| Component | Status | Evidence |
|-----------|--------|----------|
| Lead Capture (WhatsApp/Web) | **Production** | `api/v1/leads.py`, `whatsapp_webhook.py` |
| Lead Enrichment | **Production** | `services/company_research.py`, `services/osint_service.py` |
| Lead Qualification (0-100) | **Production** | `ai-agents/prompts/lead-qualification-agent.md` |
| Multi-channel Outreach | **Production** | `services/sequence_engine.py`, outreach plugins |
| Meeting Orchestration | **Production** | `api/v1/meetings.py` |
| Proposal / CPQ | **Production** | `services/cpq/`, `ai-agents/prompts/proposal-drafting-agent.md` |
| Deal Pipeline | **Production** | `api/v1/deals.py`, `services/deal_service.py` |
| Commission Engine | **Production** | `api/v1/commissions.py` |
| Affiliate System | **Production** | `api/v1/affiliates.py`, `affiliate-system/` |
| Invoice / ZATCA | **Partial** | `services/zatca_compliance.py` |
| Renewal / Upsell | **Partial** | `services/predictive_revenue_service.py` |
| Account Expansion Intel | **Partial** | Signal intelligence exists |

---

## 7. Partnership OS

| Component | Status | Evidence |
|-----------|--------|----------|
| Partner Scouting | **Production** | `services/strategic_deals/ecosystem_mapper.py` |
| Strategic Fit Scoring | **Production** | `services/strategic_deals/deal_matcher.py` |
| Term Negotiation | **Production** | `services/strategic_deals/deal_negotiator.py` |
| Deal Room | **Production** | `services/strategic_deals/deal_room.py` |
| Partner Pipeline Board | **Partial** | `components/dealix/partner-pipeline-board.tsx` (UI ready, needs data) |
| Partner Scorecards | **Target** | — |
| Co-sell Workflows | **Target** | — |

---

## 8. Corporate Development / M&A OS

| Component | Status | Evidence |
|-----------|--------|----------|
| Acquisition Scouting | **Production** | `services/strategic_deals/acquisition_scouting.py` |
| Company Profiling | **Production** | `services/strategic_deals/company_profiler.py` |
| Portfolio Intelligence | **Production** | `services/strategic_deals/portfolio_intelligence.py` |
| Strategic Simulation | **Production** | `services/strategic_deals/strategic_simulator.py` |
| ROI Engine | **Production** | `services/strategic_deals/roi_engine.py` |
| DD Orchestration | **Target** | Governance doc exists, no durable workflow |
| IC Memo Generator | **Target** | — |
| Board Pack Draft | **Target** | — |

---

## 9. Expansion OS

| Component | Status | Evidence |
|-----------|--------|----------|
| Territory Manager | **Production** | `services/territory_manager.py` |
| Feature Flags (canary) | **Production** | `services/feature_flags.py`, `openclaw/canary_context.py` |
| Industry Templates (5) | **Production** | `seeds/` |
| Sector Presentations (11) | **Production** | `presentations/` |
| Dialect Detection | **Production** | `ai/saudi_dialect.py`, `ai/arabic_nlp.py` |
| Market Scanning | **Target** | Governance doc exists |
| Stop-Loss Logic | **Target** | Documented, no live triggers |
| Post-Launch Actual vs Forecast | **Partial** | `forecast_control_center.py` (placeholder) |

---

## 10. PMI / Strategic PMO OS

| Component | Status | Evidence |
|-----------|--------|----------|
| PMI Framework | **Target** | `docs/governance/pmi-os.md` documented |
| Day-1 Readiness Checklist | **Target** | Template in doc |
| 30/60/90 Plans | **Target** | Template in doc |
| Dependency Tracking | **Target** | — |
| Escalation Engine | **Target** | SLA escalation exists for approvals |
| Synergy Realization | **Target** | — |
| Exec Weekly Pack | **Target** | — |

---

## 11. Executive / Governance OS

| Component | Status | Evidence |
|-----------|--------|----------|
| Executive Room | **Partial** | `executive-room.tsx` + `executive_room.py` (UI + API, placeholder data) |
| Approval Center | **Partial** | `approval-center.tsx` + `approval_center.py` (UI + API, placeholder data) |
| Evidence Pack Viewer | **Partial** | `evidence-pack-viewer.tsx` + `evidence_packs.py` (UI + API) |
| Risk Heatmap | **Partial** | `risk-heatmap.tsx` (UI ready, needs aggregated data) |
| Actual vs Forecast | **Partial** | `actual-vs-forecast-dashboard.tsx` + `forecast_control.py` |
| Policy Violations Board | **Partial** | `policy-violations-board.tsx` (UI ready) |
| Saudi Compliance Dashboard | **Partial** | `saudi-compliance-dashboard.tsx` + `saudi_compliance.py` |
| Connector Governance Board | **Partial** | `connector-governance-board.tsx` + `connector_governance.py` |
| Partner Pipeline Board | **Partial** | `partner-pipeline-board.tsx` (UI ready) |
| Board Pack Export | **Target** | — |
| Next-Best-Action Board | **Target** | — |

---

## Summary

| Plane / OS | Production | Partial | Pilot | Target | Watch |
|-----------|-----------|---------|-------|--------|-------|
| Decision | 7 | 4 | 0 | 2 | 0 |
| Execution | 12 | 2 | 2 | 3 | 1 |
| Trust | 13 | 4 | 0 | 0 | 4 |
| Data | 8 | 2 | 0 | 4 | 1 |
| Operating | 10 | 1 | 0 | 7 | 0 |
| Revenue OS | 9 | 3 | 0 | 0 | 0 |
| Partnership OS | 4 | 1 | 0 | 2 | 0 |
| M&A OS | 5 | 0 | 0 | 3 | 0 |
| Expansion OS | 5 | 1 | 0 | 2 | 0 |
| PMI OS | 0 | 0 | 0 | 7 | 0 |
| Executive OS | 0 | 9 | 0 | 2 | 0 |
| **TOTAL** | **73** | **27** | **2** | **32** | **6** |

**Maturity Score**: 73 Production / 140 Total = **52.1%**  
**With Partial**: (73+27) / 140 = **71.4%**
