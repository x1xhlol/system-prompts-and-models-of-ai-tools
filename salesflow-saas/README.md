# Dealix - Saudi AI Revenue Operating System

AI-powered revenue operations platform built for the Saudi market. Dealix combines lead management, affiliate recruitment, sales automation, meeting scheduling, deal tracking, and commission processing into a single operating system driven by specialized AI agents.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.11+) |
| Frontend | Next.js 15 (React, TypeScript) |
| Database | PostgreSQL 15 |
| Cache / Broker | Redis 7 |
| Task Queue | Celery 5 |
| Reverse Proxy | Nginx |
| Containerization | Docker Compose |

## Quick Start

```bash
git clone https://github.com/VoXc2/dealix.git
cd dealix
cp .env.example .env        # fill in your secrets
docker-compose up --build
```

Backend: `http://localhost:8000/docs`
Frontend: `http://localhost:3000`

**Customer onboarding (B2B):** `GET /api/v1/customer-onboarding/journey` and `docs/CUSTOMER_OS_ONBOARDING_AR.md`. Dashboard tab: **مسار التشغيل مع العميل**.

**Launch verification:** see `docs/LAUNCH_CHECKLIST.md`. From `salesflow-saas`: copy `frontend/.env.example` to `frontend/.env.local` and set `NEXT_PUBLIC_API_URL`. Run `.\verify-launch.ps1 -HttpCheck -SoftReady` (use `-BaseUrl` if the API is not on port 8000).

**CI:** GitHub Actions workflow `.github/workflows/dealix-ci.yml` (repo root) runs backend `pytest` and frontend `lint` + `build` when `salesflow-saas/**` changes.

**DB migrations:** from `backend`, set `PYTHONPATH` to the backend folder (e.g. `set PYTHONPATH=%CD%` on Windows), then `alembic upgrade head`. For Postgres schema evolution, prefer `alembic revision --autogenerate` against a dev database after the baseline revision.

## Project Structure

```
salesflow-saas/
  backend/             # FastAPI application (routes, models, services, agents)
  frontend/            # Next.js dashboard and client portal
  ai-agents/           # AI agent definitions, prompts, and orchestration
  affiliate-system/    # Affiliate recruitment, tracking, commissions
  guarantee/           # Gold guarantee claim processing
  knowledge-base/      # RAG knowledge articles and sector data
  presentations/       # Proposal and pitch generation
  nginx/               # Reverse proxy configuration
  seeds/               # Database seed data
  docs/                # Architecture, API map, data model, deployment notes
  docker-compose.yml   # Full-stack orchestration
  Makefile             # Developer shortcuts
```

## Key Features

- **Multi-Tenant** - Isolated data per organization with role-based access
- **Arabic-First** - UI, AI prompts, and WhatsApp flows in Arabic with full English support
- **WhatsApp Business API** - Automated outreach, conversations, and booking via WhatsApp
- **18 AI Agents** - Lead qualification, outreach, objection handling, compliance, fraud review, and more
- **Affiliate System** - Recruitment, onboarding, performance tracking, and tiered commissions
- **Gold Guarantee** - Claim processing, dispute resolution, and automated refunds
- **Meeting Booking** - AI-driven scheduling integrated with calendar providers
- **Deal Pipeline** - Stage-based tracking with revenue attribution
- **Commission Engine** - Automated calculation, payout scheduling, and dispute handling
- **Sector Intelligence** - Industry-specific strategies, assets, and scoring

## What Is Excluded from This Repository

This is a public repository for visibility and version tracking. The following are **never committed**:

- `.env` files and environment secrets
- Private keys, certificates, and SSL materials (`.pem`, `.key`, `.crt`)
- Log files and runtime output
- Docker volumes and persistent data
- Third-party API credentials

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## Safety Note

This repository is public. **No secrets, credentials, or private customer data are stored here.** All sensitive configuration is injected at deploy time via environment variables and secret managers.

## Maintainer

**Sami Assiri** / [VoXc2](https://github.com/VoXc2)
