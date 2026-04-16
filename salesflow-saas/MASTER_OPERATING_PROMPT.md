# MASTER OPERATING PROMPT — Dealix Sovereign Enterprise Growth OS

> **Version**: 1.0  
> **Status**: Canonical  
> **Effective**: 2026-04-16  
> **Scope**: All agents, services, documents, and humans operating within Dealix

---

## 1. Identity

**Dealix** is a **Sovereign Enterprise Growth OS for GCC Companies**.

It is a single platform that manages:
- **Revenue** — lead-to-cash lifecycle
- **Partnerships** — alliance scouting to co-sell
- **Corporate Development / M&A** — target sourcing to PMI
- **Expansion** — market scanning to post-launch
- **PMI / Strategic PMO** — Day-1 readiness to synergy realization
- **Trust / Governance / Executive Decisioning** — policy gates to board packs

**Central Law**:  
> AI explores, analyzes, and proposes. Systems execute. Humans approve critical decisions. Everything is proven by evidence.

**Design Philosophy**:  
> Agentic by design, governed by policy, proven by evidence.

---

## 2. Five-Plane Architecture

Every component in Dealix belongs to exactly one plane:

| Plane | Purpose | Key Code |
|-------|---------|----------|
| **Decision** | Strategic reasoning, forecasting, memo generation | `executive_roi_service.py`, `analytics_service.py`, management agents |
| **Execution** | Durable workflows, task routing, agent dispatch | `openclaw/gateway.py`, `durable_flow.py`, `task_router.py`, Celery workers |
| **Trust** | Policy enforcement, approval gates, audit, compliance | `policy.py`, `approval_bridge.py`, `hooks.py`, `pdpl/`, `audit_service.py` |
| **Data** | Storage, retrieval, enrichment, vector search, events | PostgreSQL + pgvector, Redis, `knowledge_service.py`, domain events |
| **Operating** | Monitoring, self-improvement, deployment, CI/CD | `observability.py`, `self_improvement.py`, `feature_flags.py`, GitHub Actions |

Full specification: [`docs/ai-operating-model.md`](docs/ai-operating-model.md)

---

## 3. Six Tracks

All work is organized into six strategic tracks:

| Track | Domain | Owner Focus |
|-------|--------|-------------|
| **Revenue** | Lead capture → qualification → deal → close → renewal | Sales & Growth |
| **Intelligence** | Signal detection, behavior analysis, forecasting, AI agents | AI & Data |
| **Compliance** | PDPL, ZATCA, SDAIA, sector regulations, audit trails | Legal & Security |
| **Expansion** | Strategic deals, M&A, partnerships, geographic expansion | Corporate Dev |
| **Operations** | Deployment, monitoring, connectors, infrastructure | Engineering & Ops |
| **Trust** | Policy gates, approval SLAs, evidence packs, contradiction detection | Governance |

Full specification: [`docs/dealix-six-tracks.md`](docs/dealix-six-tracks.md)

---

## 4. Policy Classes

Every action in the system is classified:

| Class | Behavior | Examples |
|-------|----------|----------|
| **A — Auto-allowed** | Execute without approval | `read_status`, `classify`, `summarize`, `research`, `generate_draft` |
| **B — Approval-gated** | Requires human approval token | `send_whatsapp`, `send_email`, `create_charge`, `sync_salesforce`, `send_contract_for_signature` |
| **C — Forbidden** | Blocked unconditionally | `exfiltrate_secrets`, `delete_data_without_audit`, `bypass_auth` |

Implementation: [`backend/app/openclaw/policy.py`](backend/app/openclaw/policy.py)

**Default rule**: Unknown actions are classified as **Class B** (approval required).

---

## 5. Execution Principles

1. **Decision-native** — Every critical path produces structured output (JSON Schema), not free text.
2. **Execution-durable** — Workflows checkpoint, resume after failure, and support compensation.
3. **Trust-enforced** — No sensitive action bypasses the policy gate.
4. **Data-governed** — All data flows through governed ingestion with quality checks.
5. **Arabic-first** — All user-facing content defaults to Arabic, with English as secondary.
6. **Saudi-ready** — PDPL, ZATCA, SDAIA, NCA controls are live, not aspirational.
7. **Board-usable** — Executive surfaces show what changed, what needs decision, what is at risk.
8. **Enterprise-saleable** — Evidence packs, audit trails, and compliance matrices are exportable.

---

## 6. Non-Negotiable Rules

1. **Tenant isolation**: Every query is scoped by `tenant_id`. Cross-tenant access is blocked at ORM layer.
2. **Consent-before-send**: No outbound message (WhatsApp, email, SMS, voice) without verified PDPL consent.
3. **Audit everything**: Every state change writes to `audit_logs`. Every AI decision writes to `ai_conversations`.
4. **No overclaim**: Documents must distinguish **Current State** (deployed) from **Target State** (planned). Never claim what is not in production.
5. **Structured outputs**: All critical memos, scores, and packs use defined schemas, not prose.
6. **Human-in-the-loop**: Term sheets, signatures, market launches, M&A offers, discounts outside policy, production promotions, and high-sensitivity data sharing require human approval.
7. **Root-anchored execution**: All scripts and commands execute from repository root. `scripts/architecture_brief.py` is the official preflight.

---

## 7. Contradiction Resolution

When documents or systems conflict:

1. **MASTER_OPERATING_PROMPT.md** wins over all other documents.
2. Governance docs (`docs/governance/*`) win over operational docs.
3. `CLAUDE.md` / `AGENTS.md` win over `memory/` docs.
4. Code behavior wins over comments about code behavior.
5. Active contradictions are tracked in the **Contradiction Engine** (`/api/v1/contradictions/`).

---

## 8. Technology Radar Summary

| Tier | Technologies |
|------|-------------|
| **Core** (production) | FastAPI, SQLAlchemy, PostgreSQL 16, Redis, Celery, Next.js 15, OpenClaw 2026.4.x, Groq, WhatsApp Cloud API |
| **Strong** (validated) | Claude Opus, Salesforce Agentforce, Stripe, pgvector, Mem0, LangGraph |
| **Pilot** (behind flags) | Voice agents, Contract intelligence, Gemini/DeepSeek routing |
| **Watch** (evaluating) | Temporal, OPA, OpenFGA, Vault, Gong, Apollo |
| **Hold** (not adopting) | External RAG SaaS, schema-per-tenant, GraphQL |

Full specification: [`docs/governance/technology-radar-tier1.md`](docs/governance/technology-radar-tier1.md)

---

## 9. Document Index

| Document | Path | Purpose |
|----------|------|---------|
| AI Operating Model | `docs/ai-operating-model.md` | Five-plane architecture |
| Six Tracks | `docs/dealix-six-tracks.md` | Strategic track framework |
| Execution Fabric | `docs/governance/execution-fabric.md` | Execution plane deep dive |
| Trust Fabric | `docs/governance/trust-fabric.md` | Trust plane deep dive |
| Saudi Compliance | `docs/governance/saudi-compliance-and-ai-governance.md` | Regulatory controls |
| Technology Radar | `docs/governance/technology-radar-tier1.md` | Technology classification |
| Partnership OS | `docs/governance/partnership-os.md` | Partnership lifecycle |
| M&A OS | `docs/governance/ma-os.md` | Corporate development |
| Expansion OS | `docs/governance/expansion-os.md` | Geographic/vertical expansion |
| PMI OS | `docs/governance/pmi-os.md` | Post-merger integration |
| Executive Board OS | `docs/governance/executive-board-os.md` | Board reporting framework |
| 90-Day Matrix | `docs/execution-matrix-90d-tier1.md` | Sprint execution plan |
| ADR 0001 | `docs/adr/0001-tier1-execution-policy-spikes.md` | Tier-1 policy decisions |
| Current vs Target | `docs/current-vs-target-register.md` | Subsystem maturity register |
| Doc Consistency Audit | `docs/governance/document-consistency-audit.md` | Cross-reference verification |
| Structured Outputs | `backend/app/schemas/structured_outputs.py` | 17 Pydantic decision schemas |
| Workflow Inventory | `docs/governance/workflow-inventory.md` | Short/medium/long classification |
| Trust Closure Plan | `docs/governance/trust-closure-plan.md` | Trust plane completion gates |
| Connector Standard | `docs/governance/connector-standard.md` | Connector facade + metrics |
| Operating Checklist | `docs/governance/operating-plane-checklist.md` | Enterprise delivery controls |
| Saudi Readiness | `docs/governance/saudi-enterprise-readiness.md` | PDPL/NCA/SDAIA operationalization |
| Executive Surface Plan | `docs/governance/executive-surface-closure.md` | Surface wiring plan |
| Market Dominance | `docs/governance/market-dominance-plan.md` | Packaging + ROI + competitive wedge |
| Master Closure Checklist | `docs/tier1-master-closure-checklist.md` | 50-item definitive checklist |
| Architecture | `docs/ARCHITECTURE.md` | System diagram |
| Data Model | `docs/DATA-MODEL.md` | Database schema |
| Agent Map | `docs/AGENT-MAP.md` | 19 AI agents |
| API Map | `docs/API-MAP.md` | 70+ endpoints |

---

## 10. Enforcement

This document is enforced by:
- `scripts/architecture_brief.py` — validates document existence and cross-references
- `backend/app/openclaw/policy.py` — enforces action classification
- `backend/app/openclaw/approval_bridge.py` — enforces approval gates
- `.github/workflows/dealix-ci.yml` — runs tests and checks on every PR
- Contradiction Engine — detects and tracks document/system conflicts
