# Dealix System Architecture (بنية نظام ديلكس)

**Type**: architecture
**Summary**: Multi-tenant AI CRM built on FastAPI + Next.js + PostgreSQL + Redis + Celery with Arabic-first UX and PDPL compliance.
**Summary_AR**: نظام إدارة علاقات عملاء ذكي متعدد المستأجرين مبني على FastAPI و Next.js و PostgreSQL مع واجهة عربية أولاً والتوافق مع نظام حماية البيانات.
**Key Facts**:
  - Backend: FastAPI 0.115.6 on Python 3.12, async everywhere (asyncpg, async SQLAlchemy)
  - Frontend: Next.js 15 with App Router, TypeScript 5.7, RTL-first layout
  - Database: PostgreSQL 16 with tenant_id isolation on every table; Alembic migrations
  - Cache/Queue: Redis 7 for caching + Celery 5.x task broker with 4 workers + Celery Beat scheduler
  - AI Engine: Groq (primary) with OpenAI fallback; Arabic NLP, lead scoring, conversation intelligence
  - Compliance: PDPL-native — consent checked before every outbound message; SAR 5M penalty per violation
  - Multi-agent system: Manus-style orchestrator with 8 specialized roles and event-to-agent routing
**Provenance**: AGENTS.md, CLAUDE.md, memory/architecture/system-overview.md, docker-compose.yml
**Confidence**: high
**Related Pages**: [glossary](./glossary.md), [system-overview](../architecture/system-overview.md)
**Last Updated**: 2026-04-11
**Stale**: false

---

## High-Level Architecture

```
                        ┌──────────────────────────┐
                        │     Nginx Reverse Proxy    │
                        └─────────┬────────┬─────────┘
                                  │        │
                    ┌─────────────┘        └──────────────┐
                    ▼                                      ▼
         ┌──────────────────┐                  ┌──────────────────┐
         │  Next.js Frontend │                  │  FastAPI Backend  │
         │  (Port 3000)      │                  │  (Port 8000)      │
         │  - Dashboard       │                  │  - API v1          │
         │  - Landing Page    │                  │  - Services Layer  │
         │  - Auth Flows      │                  │  - AI Engine       │
         │  - Pipeline View   │                  │  - Agent System    │
         │  - RTL / Arabic    │                  │  - Integrations    │
         └──────────────────┘                  └────────┬───────────┘
                                                        │
                                          ┌─────────────┼──────────────┐
                                          ▼             ▼              ▼
                                   ┌───────────┐ ┌───────────┐ ┌────────────┐
                                   │ PostgreSQL │ │   Redis    │ │  Celery    │
                                   │    16      │ │     7      │ │  Workers   │
                                   │ (asyncpg)  │ │ (cache +   │ │  (4) +     │
                                   │            │ │  broker)   │ │  Beat      │
                                   └───────────┘ └───────────┘ └────────────┘
```

## Backend Layers

### API Layer (`backend/app/api/v1/`)
RESTful endpoints versioned under `/api/v1/`. JWT authentication via python-jose. All endpoints require tenant context.

Key route groups:
- **Auth**: registration, login, token refresh, password reset
- **Leads**: CRUD, scoring, bulk import, assignment
- **Deals**: pipeline management, stage transitions, forecasting
- **Inbox**: unified WhatsApp + Email + SMS conversation view
- **Sequences**: automated outreach cadences
- **Compliance**: PDPL consent management, data subject rights
- **Proposals / CPQ**: configure-price-quote with Arabic PDF generation

### Services Layer (`backend/app/services/`)
Business logic is isolated from API routes. Each service is a class with async methods.

Core services:
- `ai/` — Arabic NLP (intent, sentiment, entity extraction), lead scoring (0-100), conversation intelligence
- `pdpl/` — Consent manager, data rights handler, audit trail
- `cpq/` — Configure-Price-Quote with SAR currency handling
- `agents/` — Multi-agent orchestrator, 8 specialized roles, event routing, executor with retry
- `sequence_engine.py` — Automated multi-step outreach with channel rotation
- `model_router.py` — Task-specific LLM model selection across providers
- `security_gate.py` — Runtime security verification, PDPL enforcement
- `tool_verification.py` — Agent action audit trail (intent vs claim vs execution)

### Integration Layer (`backend/app/integrations/`)
Adapters for external services:
- **WhatsApp**: UltraMsg API (primary Saudi channel, 85% penetration)
- **Email**: SMTP with template rendering
- **SMS**: Twilio / local Saudi provider
- **Payments**: Stripe with SAR support
- **Tax**: ZATCA e-invoicing compliance

### Worker Layer (`backend/app/workers/`)
Celery tasks for async processing:
- Lead scoring recalculation
- Sequence step execution
- Email/WhatsApp delivery
- Analytics aggregation
- Scheduled reports

## Frontend Architecture

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.7 in strict mode
- **Styling**: Tailwind CSS 3.4 with RTL-first layout (`dir="rtl"`)
- **Fonts**: IBM Plex Sans Arabic (primary), Tajawal (secondary)
- **Components**: Functional components with hooks
- **State**: Server components by default, client where interactivity needed

## Data Architecture

### Multi-Tenant Isolation
Every table includes a `tenant_id` column. All queries are scoped by tenant at the ORM level. Cross-tenant access is a Class C forbidden action.

### Key Models
- **Lead**: Contact with scoring, source tracking, assignment
- **Deal**: Pipeline stage, value (SAR), probability, close date
- **Company**: Organization with enrichment data
- **Sequence**: Multi-step outreach cadence
- **Consent**: PDPL consent record with purpose, channel, expiry (12 months)
- **Meeting**: Scheduled interactions with intelligence extraction

### Database Conventions
- All money fields use `Numeric` type (never Float)
- Soft-delete before hard-delete
- Alembic for all migrations
- Timezone: Asia/Riyadh (UTC+3)
- Currency: SAR default

## AI Architecture

### LLM Provider Chain
1. **Groq** (llama-3.1-70b): Fast classification, Arabic NLP
2. **Claude**: Sales copy, proposals, complex reasoning
3. **Gemini**: Research, analysis
4. **DeepSeek**: Code generation
5. **OpenAI GPT-4o-mini**: Fallback

### Agent System
Manus-style orchestrator with specialized agents:
- Lead Qualifier, Deal Advisor, Meeting Prep, Sequence Optimizer
- Content Generator, Analytics Reporter, Compliance Checker, Escalation Handler

Event-to-agent routing via `router.py`. Executor handles retry logic and escalation to human.

## Security & Compliance

### PDPL (نظام حماية البيانات الشخصية)
- Consent required before any outbound message
- Consent tracks: purpose, channel, timestamp, expiry
- Data subject rights: access, correction, deletion
- Full audit trail for consent changes
- Auto-expire after 12 months
- Penalty: up to SAR 5,000,000 per violation

### Authentication
- JWT tokens via python-jose
- Role-based access: owner, admin, manager, sales_rep, viewer
- Tenant-scoped permissions

### Policy Classes
- **Class A** (Auto-allowed): Reading, testing, documentation, analysis
- **Class B** (Approval required): Migrations, messaging, payments, deployments
- **Class C** (Forbidden): Secret exfiltration, cross-tenant access, ungoverned bulk messaging

## Deployment

- **Containerized**: Docker Compose for all services
- **Reverse proxy**: Nginx
- **CI/CD**: GitHub Actions (feature branch → PR → review → staging → canary 10% → production)
- **Monitoring**: Health checks, error tracking, performance metrics
