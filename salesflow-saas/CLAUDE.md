# CLAUDE.md — Dealix Project Context for AI Agents

## Quick Context
Dealix is an AI-powered CRM built for the Saudi market. It combines Salesforce-grade AI with WhatsApp-first communication, PDPL compliance, and Arabic-first UX.

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

## Database
- PostgreSQL 16 with async driver (asyncpg)
- Multi-tenant: every table has `tenant_id`
- Alembic for migrations
- Money fields use `Numeric` type (never Float)

## AI Architecture
- Provider abstraction: Groq → OpenAI fallback
- Model router: task-specific model selection
- Arabic NLP: intent, sentiment, entity extraction
- Lead scoring: 0-100 composite score
- Conversation intelligence: Arabic dialogue analysis
- Sales agent: autonomous WhatsApp qualification bot

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
