# Technology Radar — Tier 1

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md)  
> **Plane**: Operating | **Tracks**: Operations, Intelligence  
> **Version**: 1.0 | **Status**: Canonical

---

## Overview

The Technology Radar classifies every technology Dealix uses or considers. Classification determines governance, investment, and documentation requirements.

**Review cadence**: Quarterly  
**Promotion/demotion**: Requires ADR with evidence

---

## Core — Production, Non-Negotiable

These technologies are in production and foundational. Removing any of them would require a major architectural decision.

| Technology | Version | Purpose | Plane |
|-----------|---------|---------|-------|
| **FastAPI** | 0.115.x | Backend API framework | Execution |
| **SQLAlchemy** | 2.0.x | Async ORM | Data |
| **PostgreSQL** | 16 | Primary database | Data |
| **asyncpg** | 0.30.x | Async PostgreSQL driver | Data |
| **pgvector** | 0.3.x | Vector embeddings for RAG | Data |
| **Redis** | 7 | Cache + task broker | Data |
| **Celery** | 5.x | Async task queue | Execution |
| **Next.js** | 15.x | Frontend framework | Decision |
| **TypeScript** | 5.7 | Frontend type safety | Decision |
| **Tailwind CSS** | 3.4 | Styling | Decision |
| **OpenClaw** | 2026.4.x | Durable execution engine | Execution |
| **Groq** | 0.12.x | Primary LLM (fast, Arabic) | Intelligence |
| **WhatsApp Cloud API** | - | Primary communication channel | Execution |
| **Pydantic** | 2.10.x | Data validation | All |
| **Alembic** | 1.14.x | Database migrations | Data |
| **Docker Compose** | - | Container orchestration | Operating |
| **GitHub Actions** | - | CI/CD | Operating |
| **JWT (PyJWT)** | - | Authentication | Trust |
| **StructLog** | 24.x | Structured logging | Operating |
| **pytest** | - | Testing framework | Operating |

---

## Strong — Validated, Deploying or Near-Ready

These have been validated and are either deployed or actively being integrated.

| Technology | Version | Purpose | Plane | Evidence |
|-----------|---------|---------|-------|----------|
| **Claude Opus** | 4.6 | Strategic LLM (via model_router) | Intelligence | Configured in model_router.py |
| **OpenAI** | 2.8.x | Fallback LLM | Intelligence | Configured as fallback |
| **Salesforce Agentforce** | - | CRM sync | Data | Plugin exists in openclaw/plugins/ |
| **Stripe** | - | Payment processing | Execution | Plugin + service exist |
| **LiteLLM** | 1.74.x | Multi-provider abstraction | Intelligence | In requirements.txt |
| **Instructor** | 1.14.x | Structured LLM outputs | Intelligence | In requirements.txt |
| **LangChain** | - | Chain orchestration | Execution | In requirements.txt |
| **LangGraph** | 0.2.x | Workflow graphs | Execution | In requirements.txt |
| **CrewAI** | - | Multi-agent coordination | Execution | In requirements.txt |
| **Mem0** | - | Agent long-term memory | Data | In requirements.txt |
| **Sentry** | 2.x | Error tracking | Operating | In requirements.txt |
| **Prometheus** | - | Metrics | Operating | In requirements.txt |
| **CAMEL-Tools** | 1.5.x | Arabic NLP | Intelligence | In requirements.txt |
| **WeasyPrint** | 60.x | PDF generation (Arabic RTL) | Execution | In requirements.txt |
| **Playwright** | - | E2E testing | Operating | In frontend package.json |

---

## Pilot — Experimenting, Behind Feature Flags

These are being tested but not committed to. Usage is limited and behind feature flags.

| Technology | Purpose | Plane | Notes |
|-----------|---------|-------|-------|
| **Voice Agents** (Twilio) | Voice call integration | Execution | Plugin exists, limited testing |
| **Contract Intelligence** | Contract analysis | Intelligence | Plugin exists, early stage |
| **Gemini** | Alternative LLM routing | Intelligence | In model_router config |
| **DeepSeek** | Coding assistance routing | Intelligence | In model_router config |
| **DocuSign/Adobe Sign** | E-signatures | Execution | Env vars defined, not live |
| **cal.com** | Meeting booking | Execution | Integration path defined |

---

## Watch — Evaluating, No Code Yet

These are being evaluated for future adoption. No production code exists.

| Technology | Purpose | Evaluation Criteria |
|-----------|---------|-------------------|
| **Temporal** | Long-running durable workflows | Compare vs OpenClaw durable_flow |
| **OPA** | Policy engine | Compare vs openclaw/policy.py |
| **OpenFGA** | Authorization graph | Compare vs RBAC + tenant isolation |
| **Vault** | Secrets management | Compare vs env vars |
| **Keycloak** | Identity provider | Compare vs JWT auth |
| **Gong** | Revenue intelligence | API integration feasibility |
| **Apollo** | Lead enrichment | Data quality evaluation |
| **HubSpot** | CRM alternative | Env var defined, not active |

---

## Hold — Explicitly Not Adopting

These have been evaluated and rejected for Dealix.

| Technology | Reason for Rejection |
|-----------|---------------------|
| **External RAG SaaS** (Onyx, etc.) | Policy: PostgreSQL + pgvector + KnowledgeService only |
| **Schema-per-tenant** | Unnecessary complexity; row-level isolation sufficient |
| **GraphQL** | REST + structured outputs adequate; GraphQL adds complexity |
| **MongoDB** | PostgreSQL covers all use cases including JSON (JSONB) |
| **Firebase** | Not suitable for Saudi data residency requirements |
| **Supabase** | PostgreSQL self-hosted preferred for control |

---

## Governance Rules

1. **No technology enters Core without 90 days in Strong** and a passing ADR.
2. **No technology enters Strong without a Pilot** demonstrating value.
3. **Pilot technologies must have feature flags** and can be disabled without downtime.
4. **Watch technologies have no code** — only evaluation documents.
5. **Hold decisions are permanent** unless a new ADR overturns them with evidence.
6. **pgvector security patches** must be applied within 7 days of release.
7. **LLM provider diversity** is maintained — never depend on a single provider.
