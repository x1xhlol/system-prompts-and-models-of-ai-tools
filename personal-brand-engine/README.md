# Personal Brand Engine

**AI-powered personal brand automation system with 7 autonomous agents running 24/7.**

Built for **Sami Mohammed Assiri** - Field Services Engineer at METCO (Smiths Detection Airport Security), King Khalid International Airport, Riyadh.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  APScheduler (24/7)                  │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│ LinkedIn │  Email   │ Social   │ Content  │   CV    │
│  Agent   │  Agent   │  Media   │Strategist│Optimizer│
├──────────┴──────────┴──────────┴──────────┴─────────┤
│              Opportunity Scout Bot                    │
├─────────────────────────────────────────────────────┤
│         FastAPI (Webhooks + Dashboard)               │
├──────────┬──────────────────────────────────────────┤
│ WhatsApp │        Landing Page (GitHub Pages)        │
│  Agent   │        + Digital Business Card            │
├──────────┴──────────────────────────────────────────┤
│     LLM Layer: Ollama (local) → Groq → OpenAI       │
├─────────────────────────────────────────────────────┤
│          SQLite/PostgreSQL + Docker                   │
└─────────────────────────────────────────────────────┘
```

## 7 AI Agents

| Agent | What it Does | Schedule |
|-------|-------------|----------|
| **LinkedIn Agent** | Posts content, engages with network, optimizes profile | 3x/week posts, 3x/day engagement |
| **Email Agent** | Monitors inbox, classifies, drafts responses | Every 15 min |
| **Social Media Agent** | Twitter/X posting, content repurposing | Daily |
| **WhatsApp Agent** | Personal assistant, auto-responses, booking | Always-on (webhook) |
| **CV Optimizer** | Updates resume, generates PDF | Monthly |
| **Content Strategist** | Trend analysis, weekly content calendar | Weekly plan + daily trends |
| **Opportunity Scout** | Monitors jobs, news, industry events | Every 2 hours + daily digest |

## Quick Start

```bash
# 1. Clone and setup
cd personal-brand-engine
make setup

# 2. Edit your credentials
nano .env

# 3. Start everything
make up

# 4. Pull the LLM model
make pull-model

# 5. Check status
make status
```

## Cost

| Service | Cost |
|---------|------|
| GitHub Pages (landing page) | Free |
| Cal.com (booking) | Free tier |
| Groq API (LLM) | Free tier |
| Ollama (local LLM) | Free |
| Twitter/X API | Free tier |
| WhatsApp Meta Cloud API | Free (1K conv/month) |
| Gmail SMTP/IMAP | Free |
| **Total** | **$0-5/month** (VPS only) |

## API Endpoints

- `GET /health` - Health check
- `GET /dashboard/status` - System stats
- `GET /dashboard/agents` - Recent agent activity
- `GET /dashboard/opportunities` - Found opportunities
- `GET /dashboard/content` - Content calendar
- `POST /webhooks/whatsapp` - WhatsApp incoming (Meta)
- `POST /webhooks/whatsapp/twilio` - WhatsApp incoming (Twilio)

## Configuration

- `.env` - API keys and credentials
- `config/brand_profile.yaml` - Your professional profile
- `config/schedule.yaml` - Agent schedules (cron)
- `config/content_strategy.yaml` - Content pillars and tone

## Tech Stack

- **Python 3.12** + FastAPI + APScheduler
- **LLM**: Ollama (Qwen 2.5) / Groq / OpenAI
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Deployment**: Docker Compose + supervisord
- **Landing Page**: Static HTML/CSS/JS on GitHub Pages

## Commands

```bash
make help          # Show all commands
make up            # Start services
make down          # Stop services
make logs          # View logs
make status        # Check health
make pull-model    # Pull Ollama model
make test          # Run tests
make shell         # Container shell
```

---

## License

MIT
