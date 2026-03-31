# Architecture Overview

## System Diagram

```
                          +------------------+
                          |   Client / App   |
                          | (Browser/Mobile) |
                          +--------+---------+
                                   |
                              HTTPS (443)
                                   |
                          +--------+---------+
                          |      Nginx       |
                          | (Reverse Proxy)  |
                          +---+---------+----+
                              |         |
                     /api/*   |         |  /*
                              |         |
                +-------------+    +----+-----------+
                |   FastAPI   |    |    Next.js     |
                |   Backend   |    |    Frontend    |
                |  :8000      |    |   :3000        |
                +--+-----+----+    +----------------+
                   |     |
          +--------+     +--------+
          |                       |
  +-------+--------+    +--------+-------+
  |  PostgreSQL 15  |    |    Redis 7     |
  |  (Primary DB)   |    | (Cache/Broker) |
  +----------------+    +-------+--------+
                                |
                        +-------+--------+
                        |  Celery Workers |
                        |  + Celery Beat  |
                        +----------------+
```

## Multi-Tenant Model

```
Request --> Auth Middleware --> Extract tenant_id from JWT
                |
                v
        Query scoping: WHERE tenant_id = :tid
                |
                v
        All reads/writes isolated per tenant
```

- Every database table with tenant-scoped data includes a `tenant_id` foreign key.
- Middleware extracts `tenant_id` from the authenticated JWT on every request.
- Database queries are automatically scoped. Cross-tenant access is blocked at the ORM layer.
- Superadmin role can query across tenants for platform-level reporting.

## AI Agent Layer

```
Incoming Event (lead, message, call, meeting request)
        |
        v
+------------------+
|  Agent Router    |  --> selects agent(s) based on event type
+------------------+
        |
        v
+------------------+     +------------------+
|  Agent Executor  | --> |  LLM Provider    |
|  (Celery Task)   |     |  (OpenAI / etc)  |
+------------------+     +------------------+
        |
        v
+------------------+
|  Action Handler  |  --> update DB, send message, book meeting, escalate
+------------------+
```

- 18 specialized agents (see `docs/AGENT-MAP.md`)
- Each agent has a defined role, input schema, output schema, and escalation rules
- Agents execute as Celery tasks for async processing
- Outputs are logged to `ai_conversations` for audit

## Integration Layer

```
+------------------+     +------------------+     +------------------+
|  WhatsApp        |     |  Email           |     |  SMS             |
|  Business API    |     |  (SMTP/Provider) |     |  (Gateway)       |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                          +-------+--------+
                          |  Message Bus   |
                          |  (Redis Queue) |
                          +-------+--------+
                                  |
                          +-------+--------+
                          |  Celery Worker |
                          +----------------+
```

- WhatsApp Business API for Arabic-first automated conversations
- Email for proposals, notifications, and follow-ups
- SMS for OTP and urgent alerts
- All outbound messages queued through Redis for rate limiting and retry

## Major Modules

| Module | Location | Purpose |
|--------|----------|---------|
| Auth & Tenancy | `backend/auth/` | JWT, RBAC, tenant isolation |
| Lead Management | `backend/leads/` | Capture, scoring, qualification, assignment |
| Deal Pipeline | `backend/deals/` | Stage tracking, revenue forecasting |
| Affiliate System | `affiliate-system/` | Recruitment, onboarding, performance, commissions |
| AI Agents | `ai-agents/` | 18 specialized agents with prompt definitions |
| Knowledge Base | `knowledge-base/` | RAG articles, sector data, FAQ |
| Guarantee | `guarantee/` | Gold guarantee claims, disputes, refunds |
| Presentations | `presentations/` | Proposal and pitch deck generation |
| Meetings | `backend/meetings/` | AI-driven booking, calendar sync |
| Commissions | `backend/commissions/` | Calculation, payouts, dispute resolution |
| Notifications | `backend/notifications/` | Multi-channel delivery (WhatsApp, email, SMS, in-app) |
| Dashboard | `frontend/` | Analytics, pipeline views, admin panels |
