# Dealix System Architecture Overview

**Type**: architecture
**Date**: 2026-04-11
**Status**: active
**Confidence**: high

## Summary
Dealix is a multi-tenant AI-powered CRM SaaS targeting Saudi SMBs. Architecture follows a microservices-ready monolith pattern.

## Components
```
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                  │
├──────────────────────┬──────────────────────────────────┤
│   Next.js Frontend   │         FastAPI Backend           │
│   (Port 3000)        │         (Port 8000)               │
│   - Dashboard        │   ┌─────────────────────────┐    │
│   - Landing          │   │   API Layer (v1)         │    │
│   - Auth             │   │   - Auth, Leads, Deals   │    │
│   - Pipeline         │   │   - Inbox, Sequences     │    │
│                      │   │   - Compliance, Proposals │    │
│                      │   ├─────────────────────────┤    │
│                      │   │   Services Layer          │    │
│                      │   │   - AI Engine (Arabic)    │    │
│                      │   │   - PDPL Compliance       │    │
│                      │   │   - Sequence Engine       │    │
│                      │   │   - CPQ System            │    │
│                      │   │   - Agent Orchestrator    │    │
│                      │   ├─────────────────────────┤    │
│                      │   │   Integration Layer       │    │
│                      │   │   - WhatsApp, Email, SMS  │    │
│                      │   │   - Stripe, ZATCA         │    │
├──────────────────────┴───┴─────────────────────────┤    │
│        Celery Workers (4)    │    Celery Beat        │    │
├──────────────────────────────┴──────────────────────┤    │
│   PostgreSQL 16     │     Redis 7                    │    │
└─────────────────────┴───────────────────────────────┘
```

## Key Design Decisions
- **Multi-tenant isolation**: tenant_id on every table, enforced at query level
- **Arabic-first**: RTL layout, Arabic NLP, Saudi dialect support
- **WhatsApp-first**: Primary communication channel (85% Saudi penetration)
- **PDPL-native**: Consent checked before every outbound message
- **LLM fallback chain**: Groq → OpenAI for cost optimization
- **Async everything**: asyncpg, async SQLAlchemy, async HTTP clients

## Related Topics
- [ADR-001: Multi-tenant architecture](../adr/001-multi-tenant.md)
- [ADR-002: WhatsApp as primary channel](../adr/002-whatsapp-first.md)
- [Provider routing strategy](../providers/routing-strategy.md)
