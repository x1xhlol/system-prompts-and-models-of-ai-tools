# AGENTS.md — Dealix AI Revenue OS

## Project Identity
- **Name**: Dealix (ديلكس)
- **Type**: AI-Powered CRM SaaS for Saudi Arabia
- **Stack**: FastAPI + Next.js 15 + PostgreSQL + Redis + Celery
- **Market**: Saudi SMBs (real estate, healthcare, retail, contracting, education)
- **Language**: Arabic-first, bilingual (AR/EN)

## Architecture Boundaries

### Backend (`salesflow-saas/backend/`)
- FastAPI 0.115.6 on Python 3.12
- SQLAlchemy 2.0 async with PostgreSQL 16
- Celery 5.x with Redis broker
- JWT authentication (PyJWT)
- Multi-tenant data isolation via `tenant_id`

### Frontend (`salesflow-saas/frontend/`)
- Next.js 15 with App Router
- TypeScript 5.7, Tailwind CSS 3.4
- RTL-first layout (dir="rtl")
- Fonts: IBM Plex Sans Arabic (primary), Tajawal (secondary)

### AI Layer (`backend/app/services/ai/`)
- LLM Provider: Groq (primary) → OpenAI (fallback)
- Arabic NLP with Saudi dialect support
- Model routing via `services/model_router.py`

### Agent System (`backend/app/services/agents/`)
- Manus-style orchestrator with 8 specialized roles
- Event-to-agent routing via `router.py`
- Executor with retry logic and escalation

## Coding Conventions
- Python: async/await, type hints, Pydantic models, 4-space indent
- TypeScript: strict mode, functional components, Tailwind classes
- Database: all queries through SQLAlchemy ORM, never raw SQL
- API: RESTful, versioned (/api/v1/), proper HTTP status codes
- Naming: snake_case (Python), camelCase (TypeScript)
- Arabic: all user-facing strings must have Arabic versions
- Currency: SAR default, Numeric type for money fields
- Timezone: Asia/Riyadh (UTC+3)

## Forbidden Actions
- Never hardcode API keys or secrets
- Never bypass tenant isolation
- Never send messages without PDPL consent check
- Never delete data without soft-delete first
- Never push directly to main branch
- Never skip security review for auth/payment changes
- Never use synchronous DB calls in async endpoints
- Never store PII in logs

## Policy Classes

### Class A — Auto-allowed
- Code reading and inspection
- Test generation and execution
- Documentation updates
- Memory/knowledge base updates
- Linting and formatting
- Architecture analysis

### Class B — Approval Required
- Database migrations
- Customer-facing message sends
- Payment/billing changes
- Permission model changes
- External API integrations
- Production deployments
- PDPL consent configuration changes

### Class C — Forbidden
- Secret exfiltration
- Bypassing branch protections
- Silent destructive changes
- Disabling security gates
- Cross-tenant data access
- Ungoverned bulk messaging

## How to Install
```bash
cd salesflow-saas
cp .env.example .env  # Configure your environment
docker-compose up -d
make migrate
make seed
```

## How to Test
```bash
cd salesflow-saas/backend
pytest -v
# Or with coverage
pytest --cov=app --cov-report=html
```

## How to Run
```bash
docker-compose up  # All services
# Or individually:
cd backend && uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

## Provider Preferences
1. **Fast classification**: Groq (llama-3.1-70b)
2. **Arabic NLP**: Groq with Arabic context prompts
3. **Sales copy/proposals**: Claude (via model_router)
4. **Research/analysis**: Gemini (via model_router)
5. **Coding tasks**: DeepSeek (via model_router)
6. **Fallback**: OpenAI GPT-4o-mini

## Release Process
1. Feature branch → PR → Code review
2. Run tests + security scan
3. Deploy to staging
4. Smoke test (Arabic + English)
5. Deploy to production with canary (10%)
6. Monitor 30 min → full rollout
7. Rollback plan documented per release

## Repository constitution (monorepo root)

The **institutional** operating prompt and governance library live at the **repository root** (parent of `salesflow-saas/`). This app must stay aligned with those files.

**Entry points**

- [`../MASTER_OPERATING_PROMPT.md`](../MASTER_OPERATING_PROMPT.md) — canonical Master Operating Prompt (TOC links to all topics).
- [`../AGENTS.md`](../AGENTS.md) — repo agents constitution + full governance index.
- [`../CLAUDE.md`](../CLAUDE.md) — Claude/repo-native rules; Cursor slash commands live under [`../.cursor/commands/`](../.cursor/commands/).

**Operating overview**

- [`../docs/ai-operating-model.md`](../docs/ai-operating-model.md) — planes (incl. operating), mermaid flow, product-type routing, Dealix code pointers.
- [`../docs/dealix-six-tracks.md`](../docs/dealix-six-tracks.md) — six OS tracks, code pointers, implementation status snapshot.
- [`../docs/blueprint-master-architecture.md`](../docs/blueprint-master-architecture.md) — master blueprint index.
- [`../docs/execution-matrix-90d-tier1.md`](../docs/execution-matrix-90d-tier1.md) — Phase 0–1 Tier-1 execution matrix.
- [`../docs/enterprise-readiness.md`](../docs/enterprise-readiness.md) — B2B / enterprise readiness checklist.

**Governance library** (`../docs/governance/`)

- [`../docs/governance/README.md`](../docs/governance/README.md) — index of governance docs.
- [`../docs/governance/planes-and-runtime.md`](../docs/governance/planes-and-runtime.md) — planes, layers, runtimes, operating plane.
- [`../docs/governance/approval-policy.md`](../docs/governance/approval-policy.md) — A/R/S, Class A/B/C, evidence packs, cross-matrices.
- [`../docs/governance/events-and-schema.md`](../docs/governance/events-and-schema.md) — events, JSON Schema, AsyncAPI.
- [`../docs/governance/trust-fabric.md`](../docs/governance/trust-fabric.md) — trust substrate, tool verification, security gate, Tier-1 targets (OPA, FGA, Vault, IdP).
- [`../docs/governance/execution-fabric.md`](../docs/governance/execution-fabric.md) — Celery/LangGraph vs Temporal criteria.
- [`../docs/governance/connectors-and-data-plane.md`](../docs/governance/connectors-and-data-plane.md) — facades, data plane, semantic metrics.
- [`../docs/governance/github-and-release.md`](../docs/governance/github-and-release.md) — GitHub SDLC, environments, OIDC.
- [`../docs/governance/design-and-arabic.md`](../docs/governance/design-and-arabic.md) — design system, RTL, Arabic-first.
- [`../docs/governance/discovery-and-output-checklist.md`](../docs/governance/discovery-and-output-checklist.md) — discovery, phasing, 20-point report, Arabic bootstrap.
- [`../docs/governance/strategic-ops-pmi.md`](../docs/governance/strategic-ops-pmi.md) — strategic ops, M&A, PMI.
- [`../docs/governance/technology-radar-tier1.md`](../docs/governance/technology-radar-tier1.md) — official / optional / pilot stack.
- [`../docs/governance/saudi-compliance-and-ai-governance.md`](../docs/governance/saudi-compliance-and-ai-governance.md) — PDPL/NCA readiness, NIST/OWASP.

**ADR (gated spikes)**

- [`../docs/adr/0001-tier1-execution-policy-spikes.md`](../docs/adr/0001-tier1-execution-policy-spikes.md) — Temporal / OPA / OpenFGA spike policy.

This file (`salesflow-saas/AGENTS.md`) is **app-specific** (stack, conventions, Class A/B/C for shipping). It must **not** contradict root policy or the governance library.

## Governance integration (Tier-1 surfaces)

Class A/B/C enforcement, evidence, and structured outputs align with the root [`../docs/governance/approval-policy.md`](../docs/governance/approval-policy.md) and app policy classes above. Tier-1 read APIs (snapshots for executive / trust dashboards):

- `GET /api/v1/executive-room/snapshot` — Executive Room
- `GET /api/v1/contradictions/` — Contradiction engine
- `GET /api/v1/evidence-packs/` — Evidence pack viewer
- `GET /api/v1/approval-center/` — Approval center
- `GET /api/v1/connectors/governance` — Connector governance
- `GET /api/v1/model-routing/dashboard` — Model routing
- `GET /api/v1/compliance/matrix/` — Saudi compliance matrix
- `GET /api/v1/forecast-control/unified` — Actual vs forecast

**Architecture preflight** (from repo root — canonical monorepo script):

```bash
cd ..   # repository root (parent of salesflow-saas)
py -3 scripts/architecture_brief.py
```

Optional app-local brief (if maintained under `salesflow-saas/scripts/`):

```bash
cd salesflow-saas
py -3 scripts/architecture_brief.py
```
