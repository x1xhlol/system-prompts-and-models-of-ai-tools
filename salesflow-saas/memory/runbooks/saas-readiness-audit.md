# SaaS Readiness Audit — Dealix

**Last Updated**: 2026-04-11
**Overall Status**: 6/11 categories need work before public launch

---

## Readiness Matrix

| # | Category | Status | Priority | Effort |
|---|----------|--------|----------|--------|
| 1 | Authentication & RBAC | Completed | — | — |
| 2 | Billing & Subscriptions | Partial | P0 | 2 sprints |
| 3 | Tenant Onboarding | Partial | P0 | 1 sprint |
| 4 | Admin Dashboard | Partial | P1 | 1 sprint |
| 5 | Analytics & Reporting | Partial | P1 | 2 sprints |
| 6 | Help Center & Docs | Missing | P1 | 2 sprints |
| 7 | Deployment & Infra | Completed | — | — |
| 8 | Monitoring & Alerting | Partial | P0 | 0.5 sprint |
| 9 | Feature Flags | Missing | P1 | 0.5 sprint |
| 10 | Customer Support Flow | Missing | P0 | 1 sprint |
| 11 | PDPL Compliance | Completed | — | — |

---

## Detailed Gap Analysis

### 1. Authentication & RBAC — Completed

**What exists:**
- JWT-based authentication with refresh token rotation
- Four-role hierarchy: `owner` > `manager` > `agent` > `admin`
- OTP-based login flow for WhatsApp-first users
- Multi-tenant isolation — all queries scoped by `tenant_id`
- Password hashing with bcrypt
- Session management with Redis

**What works well:**
- Token expiry and refresh flow are production-ready
- Role-based route guards on all API endpoints
- Tenant context extracted from JWT (not URL or body)

**Remaining items:**
- None blocking launch. Consider adding SSO (SAML/OIDC) for enterprise tenants post-launch.

---

### 2. Billing & Subscriptions — Partial (P0)

**What exists:**
- `stripe_service.py` — creates payment intents in SAR currency
- `payment_service.py` — basic payment recording
- `invoice_service.py` / `invoice_generator.py` — invoice creation stubs

**Critical gaps:**
- [ ] **Subscription lifecycle**: No plan creation, upgrade, downgrade, or cancellation flow
- [ ] **Usage metering**: AI agent calls, WhatsApp messages, and storage not tracked per tenant
- [ ] **Stripe webhooks**: No webhook handler for `invoice.paid`, `subscription.updated`, `payment_intent.failed`
- [ ] **Trial management**: No free trial period logic or trial-to-paid conversion
- [ ] **Plan enforcement**: No middleware to check if tenant's plan allows the requested feature
- [ ] **Dunning**: No handling for failed payments (grace period, downgrade, suspension)
- [ ] **SAR invoicing**: ZATCA e-invoicing compliance not wired to billing flow

**Recommended approach:**
1. Define 3 plans: Starter (SAR 299/mo), Professional (SAR 799/mo), Enterprise (custom)
2. Implement Stripe Checkout Sessions for subscription creation
3. Add webhook handler at `/api/v1/webhooks/stripe`
4. Create `SubscriptionMiddleware` that checks plan limits on each request
5. Wire ZATCA compliance from existing `zatca_compliance.py` into invoice generation

---

### 3. Tenant Onboarding — Partial (P0)

**What exists:**
- `customer_onboarding_journey.py` — basic journey tracking
- Account creation flow (signup -> verify email -> create tenant)

**Critical gaps:**
- [ ] **Guided setup wizard**: No step-by-step onboarding (company info -> import contacts -> connect WhatsApp -> invite team)
- [ ] **Sample data**: No option to load demo leads/deals for new tenants
- [ ] **WhatsApp connection**: UltraMSG setup requires manual API key entry, no guided flow
- [ ] **Team invitation**: Invite-by-email exists but no onboarding for invited users
- [ ] **Industry templates**: Seeds exist in `seeds/` but no UI to select and apply them
- [ ] **Progress tracking**: No onboarding completion percentage or checklist UI

**Recommended approach:**
1. Create 5-step onboarding wizard in frontend (company -> team -> channels -> data -> go-live)
2. API endpoint to apply seed templates: `POST /api/v1/onboarding/apply-template`
3. Onboarding progress stored in Redis for fast access
4. Auto-dismiss wizard after all steps complete or "skip" pressed

---

### 4. Admin Dashboard — Partial (P1)

**What exists:**
- Basic analytics endpoint in `analytics_service.py`
- Tenant-level KPIs (leads, deals, revenue)

**Gaps:**
- [ ] **System admin panel**: No super-admin view across all tenants (for Dealix operations team)
- [ ] **Tenant health monitoring**: No view of per-tenant usage, errors, or activity
- [ ] **User management**: Owner can manage team, but no bulk operations
- [ ] **Audit log viewer**: Audit service exists but no UI to browse logs
- [ ] **Configuration UI**: Feature flags, plan limits, and system settings require code changes

**Recommended approach:**
1. Build `/admin` routes (super-admin only, not tenant-scoped)
2. Tenant list with health indicators (active users, API calls, errors, last login)
3. Wire `audit_service.py` logs to a searchable table component

---

### 5. Analytics & Reporting — Partial (P1)

**What exists:**
- `analytics_service.py` — basic KPIs (lead count, deal value, conversion rate)
- `predictive_revenue_service.py` — revenue forecasting stub
- `executive_roi_service.py` — ROI calculation

**Gaps:**
- [ ] **Dashboard charts**: No frontend charting (need chart library integration)
- [ ] **Custom date ranges**: API supports basic period filters but no custom range
- [ ] **Export**: No CSV/PDF export for reports
- [ ] **Funnel analytics**: No pipeline stage conversion tracking
- [ ] **Agent performance**: No per-agent activity and performance metrics
- [ ] **AI usage analytics**: No tracking of AI agent interactions, cost, success rate
- [ ] **Scheduled reports**: No email-based weekly/monthly report delivery

**Recommended approach:**
1. Integrate Recharts or Chart.js in frontend dashboard
2. Add `/api/v1/analytics/funnel`, `/api/v1/analytics/agents`, `/api/v1/analytics/ai-usage`
3. Celery task for weekly report generation and email delivery
4. CSV export endpoint: `GET /api/v1/analytics/export?format=csv`

---

### 6. Help Center & Documentation — Missing (P1)

**What exists:**
- Developer-facing `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`
- No user-facing documentation

**Gaps:**
- [ ] **User guide**: How to use Dealix (Arabic + English)
- [ ] **API documentation**: Auto-generated from FastAPI OpenAPI spec, but not styled or hosted
- [ ] **In-app help**: No contextual help tooltips or guided tours
- [ ] **FAQ / Knowledge base**: No searchable help articles
- [ ] **Video tutorials**: None (important for Saudi market, WhatsApp/voice preferred)
- [ ] **Changelog**: No user-facing release notes

**Recommended approach:**
1. Host FastAPI auto-docs at `/docs` with custom branding
2. Build help center with Markdown articles (Arabic-first) served via Next.js
3. Add `?` help icons on key UI pages linking to relevant articles
4. Create 3-5 short video walkthroughs (Arabic voiceover)

---

### 7. Deployment & Infrastructure — Completed

**What exists:**
- `docker-compose.yml` — full stack (FastAPI, Next.js, PostgreSQL, Redis, Celery worker)
- Nginx configuration in `nginx/`
- `.env.example` with all required variables documented
- GitHub Actions CI in `.github/`

**What works well:**
- Single-command deployment with Docker Compose
- Service health checks configured
- Environment variable separation

**Remaining items:**
- Consider adding Kubernetes manifests for horizontal scaling (post-launch)
- Add Docker image tagging strategy for versioned deployments

---

### 8. Monitoring & Alerting — Partial (P0)

**What exists:**
- Sentry DSN placeholder in `.env.example`
- Basic error logging throughout the codebase

**Critical gaps:**
- [ ] **Sentry configuration**: DSN exists but SDK not initialized in `main.py`
- [ ] **Performance monitoring**: No APM (request duration, DB query time, AI latency)
- [ ] **Health check endpoint**: Need `/health` and `/ready` endpoints
- [ ] **Uptime monitoring**: No external uptime check (UptimeRobot, Pingdom, etc.)
- [ ] **Log aggregation**: No structured logging or log shipping
- [ ] **Alerting rules**: No PagerDuty/Slack alerts for errors, high latency, or downtime
- [ ] **Resource monitoring**: No CPU/memory/disk alerts on the server

**Recommended approach:**
1. Initialize Sentry SDK in `main.py` with `traces_sample_rate=0.2`
2. Add `/api/v1/health` endpoint (DB + Redis connectivity check)
3. Add structured JSON logging with `structlog`
4. Set up Sentry alert rules: error spike, P95 latency > 2s, unhandled exceptions
5. External uptime monitor on health endpoint (5-minute interval)

---

### 9. Feature Flags — Missing (P1)

**What exists:**
- Nothing. Features are enabled/disabled by deploying code.

**Gaps:**
- [ ] **Flag storage**: No feature flag service or configuration
- [ ] **Per-tenant flags**: Cannot enable features for specific tenants (beta testing)
- [ ] **Runtime toggling**: Requires redeployment to change feature availability
- [ ] **Flag-based UI**: Frontend cannot conditionally show/hide features

**Recommended approach:**
1. Implement `feature_flags.py` service with Redis (fast reads) + PostgreSQL (persistence)
2. Built-in flags: `ai_sales_agent`, `sequences`, `cpq`, `signal_intelligence`, `autopilot`
3. API endpoints: `GET /api/v1/flags`, `PUT /api/v1/flags/{flag_name}`
4. Frontend hook: `useFeatureFlag("flag_name")` returns boolean
5. Default all flags to `False` for new tenants, `True` for beta testers

**Implementation**: See `backend/app/services/feature_flags.py`

---

### 10. Customer Support Flow — Missing (P0)

**What exists:**
- Nothing. No support ticketing, chat, or contact flow.

**Gaps:**
- [ ] **Support email**: No `support@dealix.sa` with ticket routing
- [ ] **In-app support**: No chat widget or support ticket form
- [ ] **WhatsApp support**: Ironic gap — CRM with WhatsApp but no WhatsApp support channel
- [ ] **SLA tracking**: No response time or resolution time tracking
- [ ] **Knowledge base search**: No self-service support before contacting team
- [ ] **Escalation flow**: `escalation.py` exists for deal escalation, not support escalation

**Recommended approach:**
1. Set up support email with auto-reply (Arabic)
2. Add in-app "Help & Support" page with contact form
3. Create WhatsApp Business support number with auto-routing
4. Track support tickets in a simple model (can use Dealix's own lead pipeline internally)
5. Define SLAs: P0 (1h), P1 (4h), P2 (24h), P3 (72h)

---

### 11. PDPL Compliance — Completed

**What exists:**
- `pdpl/consent_manager.py` — consent tracking with purpose and channel
- `pdpl/data_rights.py` — data access, correction, and deletion handlers
- `security/pdpl-checklist.md` — compliance documentation
- Audit trail on all consent changes
- 12-month consent auto-expiry

**What works well:**
- Consent checked before all outbound messaging
- Data subject rights API endpoints
- Audit logging for compliance evidence

**Remaining items:**
- None blocking launch. Consider third-party PDPL audit for certification.

---

## Launch Readiness Score

```
Completed:  3/11  (Auth, Deployment, PDPL)
Partial:    5/11  (Billing, Onboarding, Admin, Analytics, Monitoring)
Missing:    3/11  (Docs, Feature Flags, Support)

Overall:    ~45% ready for public SaaS launch
```

## Recommended Sprint Plan

### Sprint 1 (P0 — Must Have for Launch)
1. Billing: Stripe subscriptions + webhook handler + plan enforcement
2. Monitoring: Sentry init + health endpoint + structured logging
3. Support: Support email + in-app contact form
4. Onboarding: 5-step wizard with template selection

### Sprint 2 (P1 — Should Have for Launch)
1. Feature flags: Redis-backed service + API + frontend hook
2. Analytics: Dashboard charts + funnel analytics + export
3. Admin: Super-admin panel + tenant health view

### Sprint 3 (P1 — Nice to Have)
1. Documentation: Help center + in-app help + API docs styling
2. Admin: Audit log viewer + configuration UI
3. Analytics: Scheduled reports + AI usage tracking
