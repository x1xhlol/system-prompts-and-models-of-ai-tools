# CLAUDE.md — Dealix Project Context for AI Agents

## Quick Context
Dealix is a **Sovereign Enterprise Growth OS for GCC Companies**. It manages Revenue, Partnerships, Corporate Development/M&A, Expansion, PMI, and Trust/Governance — with AI agents, durable workflows, and policy-enforced execution.

**Operating Constitution**: See `MASTER_OPERATING_PROMPT.md` for the canonical reference.

## Key Directories
- `backend/app/api/v1/` — API routes (FastAPI)
- `backend/app/models/` — SQLAlchemy models
- `backend/app/services/` — Business logic layer
- `backend/app/services/ai/` — AI engine (Arabic NLP, scoring, forecasting)
- `backend/app/services/pdpl/` — PDPL compliance engine
- `backend/app/services/cpq/` — Configure, Price, Quote
- `backend/app/services/agents/` — Multi-agent orchestration
- `backend/app/services/llm/` — LLM provider abstraction
- `backend/app/workers/` — Celery async tasks
- `backend/app/integrations/` — WhatsApp, Email, SMS adapters
- `frontend/src/app/` — Next.js pages
- `seeds/` — Industry templates (JSON)
- `memory/` — Project knowledge base
- `docs/governance/` — Governance framework (execution-fabric, trust-fabric, compliance, radar)
- `docs/adr/` — Architecture Decision Records
- `scripts/` — Architecture brief and tooling
- `MASTER_OPERATING_PROMPT.md` — Operating constitution (five planes, six tracks, policy classes)

## Database
- PostgreSQL 16 with async driver (asyncpg)
- Multi-tenant: every table has `tenant_id`
- Alembic for migrations
- Money fields use `Numeric` type (never Float)

## AI Architecture — Autonomous Revenue OS (Level 5)
- Provider abstraction: Groq → OpenAI fallback
- Model router: task-specific model selection
- Arabic NLP: intent, sentiment, entity extraction
- Lead scoring: 0-100 composite score (4 axes)
- Multi-agent system: **20 specialized AI agents**

### Agent System (`services/agents/`)
- `router.py` — Agent registry with priority, parallel/sequential execution, retry
- `executor.py` — LLM calls + output parsing + escalation + action dispatch
- `autonomous_pipeline.py` — 11-stage state machine (NEW → WON/LOST)
- `action_dispatcher.py` — Routes 13 action types to external services
- `manus_orchestrator.py` — Multi-agent orchestration layer

### AI Agent Prompts (`ai-agents/prompts/`) — 20 files
| Category | Agents |
|----------|--------|
| Sales Core | closer, lead_qualification, outreach_writer, meeting_booking |
| Communication | arabic_whatsapp, english_conversation, voice_call |
| Intelligence | objection_handler, proposal_drafter, sector_strategist, ai_rehearsal |
| Analytics | revenue_attribution, management_summary, knowledge_retrieval |
| Compliance | compliance_reviewer, fraud_reviewer, qa_reviewer |
| Affiliates | affiliate_evaluator, onboarding_coach, guarantee_reviewer |

### Pipeline Stages
`NEW → QUALIFYING → QUALIFIED → OUTREACH → MEETING_SCHEDULED → MEETING_PREP → NEGOTIATION → CLOSING → WON/LOST/NURTURING`

### Key API Endpoints
- `POST /pipeline/process-lead` — Full autonomous pipeline
- `POST /pipeline/advance-stage` — Manual stage advance
- `GET /agent-health/status` — System health check
- `POST /agent-health/self-improve` — Trigger optimization cycle

## PDPL Compliance (Critical)
- Check consent before ANY outbound message
- Track consent purpose, channel, timestamp
- Support data subject rights (access, correct, delete)
- Audit trail for all consent changes
- Auto-expire consent after 12 months
- Penalty: up to SAR 5 million per violation

## Testing
```bash
pytest -v                           # All tests
pytest tests/test_ai/ -v            # AI engine tests
pytest tests/test_pdpl/ -v          # PDPL compliance tests
pytest tests/test_api/ -v           # API endpoint tests
```

## Common Tasks
- Add new API endpoint: create route in `api/v1/`, register in `main.py`
- Add new model: create in `models/`, add to `models/__init__.py`, create migration
- Add new AI feature: create in `services/ai/`, wire to relevant API/worker
- Add industry template: create JSON in `seeds/`, match existing schema

## gstack Planning Discipline

Before writing code, classify your task:

| Tier | When | What to do |
|------|------|-----------|
| **SIMPLE** | 1 file, obvious change | Just do it |
| **MEDIUM** | Multi-file, needs thought | Read files → 5-line plan → resolve ambiguity → self-review → report |
| **HEAVY** | Complex, needs specific skill | Load skill → execute workflow → verify → report |
| **FULL** | End-to-end feature/release | Plan → review → implement → test → ship → report |
| **PLAN** | Research/architecture only | Plan only, save to `memory/`, no implementation |

**RULE**: Append to this file, never replace existing instructions.

## Hermes Profiles

| Profile | Mission | Scope |
|---------|---------|-------|
| `growth` | Customer acquisition | leads, messaging, analytics, content |
| `sales` | Deal closing | deals, proposals, sequences, WhatsApp |
| `security` | Platform protection | compliance, audit, Shannon scans |
| `ops` | Deployment & reliability | workers, monitoring, releases |
| `knowledge` | Wiki & memory management | brain, wiki, indexes |
| `founder` | Strategic decisions | everything (highest permissions) |
| `arabic-ops` | Arabic content & dialect | summarization, dialect detection, RTL |

## Arabic Operations

- Use `arabic_ops.py` for: call notes compression, market research digests, executive briefs
- Always detect dialect before processing (saudi/gulf/msa)
- Check for Arabizi and suggest Arabic conversion
- Check code-switching (Arabic+English mixed) for readability

## claude-mem (Persistent Memory)

Installed and active. Automatically captures every session's work and injects context into new sessions.

- **Worker**: `npx claude-mem start` (port 37777)
- **Web UI**: http://localhost:37777
- **Search**: Use `/mem-search` in Claude Code
- **Data**: `~/.claude-mem/claude-mem.db` (SQLite + Chroma vectors)
- **Privacy**: Wrap sensitive content in `<private>...</private>` tags
- **Token savings**: ~95% reduction via 3-layer progressive retrieval
- **Auto-captures**: tool executions, session summaries, decisions, bugs, patterns

## Governance Framework (Tier-1)

- **Five Planes**: Decision, Execution, Trust, Data, Operating — see `docs/ai-operating-model.md`
- **Six Tracks**: Revenue, Intelligence, Compliance, Expansion, Operations, Trust — see `docs/dealix-six-tracks.md`
- **Policy Classes**: A (auto), B (approval), C (forbidden) — enforced by `openclaw/policy.py`
- **Contradiction Engine**: Detect/track system conflicts — `services/contradiction_engine.py`
- **Evidence Packs**: Tamper-evident audit proof — `services/evidence_pack_service.py`
- **Saudi Compliance Matrix**: Live PDPL/ZATCA/SDAIA/NCA controls — `services/saudi_compliance_matrix.py`
- **Architecture Preflight**: `python scripts/architecture_brief.py` (run from repo root)
