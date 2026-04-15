# API Route Map

All routes are prefixed with `/api/v1`. Authentication is required unless marked `[public]`. Tenant scoping is automatic via JWT.

---

## Auth

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Register new tenant + owner `[public]` |
| POST | `/auth/login` | Email/password login `[public]` |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate session |
| GET | `/auth/me` | Current user profile |
| PUT | `/auth/me` | Update profile |
| POST | `/auth/forgot-password` | Request password reset `[public]` |
| POST | `/auth/reset-password` | Reset with token `[public]` |
| POST | `/auth/verify-otp` | OTP verification |

## Leads

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/leads` | List leads (filterable, paginated) |
| POST | `/leads` | Create lead |
| GET | `/leads/{id}` | Get lead details |
| PUT | `/leads/{id}` | Update lead |
| DELETE | `/leads/{id}` | Soft-delete lead |
| POST | `/leads/{id}/qualify` | Trigger AI qualification |
| POST | `/leads/{id}/assign` | Assign to agent |
| POST | `/leads/{id}/convert` | Convert to deal |
| GET | `/leads/{id}/activities` | Lead activity timeline |
| GET | `/leads/{id}/messages` | Lead message history |
| POST | `/leads/import` | Bulk import (CSV/Excel) |
| GET | `/leads/export` | Export leads |

## Deals

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/deals` | List deals (filterable, paginated) |
| POST | `/deals` | Create deal |
| GET | `/deals/{id}` | Get deal details |
| PUT | `/deals/{id}` | Update deal |
| DELETE | `/deals/{id}` | Soft-delete deal |
| PUT | `/deals/{id}/stage` | Move deal stage |
| GET | `/deals/{id}/proposals` | List proposals for deal |
| POST | `/deals/{id}/proposals` | Generate proposal |
| GET | `/deals/pipeline` | Pipeline summary by stage |
| GET | `/deals/forecast` | Revenue forecast |

## Dashboard

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard/summary` | KPI summary |
| GET | `/dashboard/pipeline` | Pipeline analytics |
| GET | `/dashboard/revenue` | Revenue metrics |
| GET | `/dashboard/agents` | Agent performance |
| GET | `/dashboard/affiliates` | Affiliate overview |
| GET | `/dashboard/activity` | Recent activity feed |

## Affiliates

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/affiliates` | List affiliates |
| POST | `/affiliates` | Create affiliate application |
| GET | `/affiliates/{id}` | Get affiliate details |
| PUT | `/affiliates/{id}` | Update affiliate |
| PUT | `/affiliates/{id}/approve` | Approve affiliate |
| PUT | `/affiliates/{id}/suspend` | Suspend affiliate |
| GET | `/affiliates/{id}/performance` | Performance metrics |
| GET | `/affiliates/{id}/deals` | Attributed deals |
| GET | `/affiliates/{id}/commissions` | Commission history |
| GET | `/affiliates/leaderboard` | Ranked leaderboard |

## AI Agents

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/agents` | List available agents |
| POST | `/agents/{agent_type}/invoke` | Invoke agent manually |
| GET | `/agents/{agent_type}/history` | Agent invocation history |
| GET | `/agents/conversations` | All AI conversations |
| GET | `/agents/conversations/{id}` | Conversation detail |

---

## New Routes

## Companies

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/companies` | List companies |
| POST | `/companies` | Create company |
| GET | `/companies/{id}` | Get company details |
| PUT | `/companies/{id}` | Update company |
| DELETE | `/companies/{id}` | Soft-delete company |
| GET | `/companies/{id}/contacts` | List contacts at company |
| GET | `/companies/{id}/deals` | Deals linked to company |

## Contacts

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/contacts` | List contacts |
| POST | `/contacts` | Create contact |
| GET | `/contacts/{id}` | Get contact details |
| PUT | `/contacts/{id}` | Update contact |
| DELETE | `/contacts/{id}` | Soft-delete contact |
| GET | `/contacts/{id}/messages` | Message history |
| GET | `/contacts/{id}/calls` | Call history |
| GET | `/contacts/{id}/consents` | Consent records |

## Conversations

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/conversations` | List AI conversations |
| GET | `/conversations/{id}` | Get conversation detail |
| GET | `/conversations/{id}/messages` | Message thread |
| POST | `/conversations/{id}/escalate` | Escalate to human |

## Calls

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/calls` | List calls |
| POST | `/calls` | Log a call |
| GET | `/calls/{id}` | Call detail |
| GET | `/calls/{id}/transcript` | AI transcript |
| PUT | `/calls/{id}/outcome` | Set call outcome |

## Meetings

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/meetings` | List meetings |
| POST | `/meetings` | Create meeting |
| GET | `/meetings/{id}` | Meeting detail |
| PUT | `/meetings/{id}` | Update meeting |
| PUT | `/meetings/{id}/confirm` | Confirm meeting |
| PUT | `/meetings/{id}/cancel` | Cancel meeting |
| PUT | `/meetings/{id}/reschedule` | Reschedule meeting |
| GET | `/meetings/availability` | Check agent availability |

## Commissions

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/commissions` | List commissions |
| GET | `/commissions/{id}` | Commission detail |
| PUT | `/commissions/{id}/approve` | Approve commission |
| PUT | `/commissions/{id}/dispute` | Dispute commission |
| GET | `/commissions/summary` | Period summary |

## Payouts

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/payouts` | List payouts |
| POST | `/payouts` | Create payout batch |
| GET | `/payouts/{id}` | Payout detail |
| PUT | `/payouts/{id}/process` | Process payout |
| GET | `/payouts/pending` | Pending payouts |

## Disputes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/disputes` | List disputes |
| POST | `/disputes` | Open dispute |
| GET | `/disputes/{id}` | Dispute detail |
| PUT | `/disputes/{id}/resolve` | Resolve dispute |
| PUT | `/disputes/{id}/escalate` | Escalate dispute |

## Guarantees

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/guarantees` | List guarantee claims |
| POST | `/guarantees` | Submit claim |
| GET | `/guarantees/{id}` | Claim detail |
| PUT | `/guarantees/{id}/review` | Review claim |
| PUT | `/guarantees/{id}/approve` | Approve claim |
| PUT | `/guarantees/{id}/deny` | Deny claim |
| POST | `/guarantees/{id}/refund` | Trigger refund |

## Consents

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/consents` | List consent records |
| POST | `/consents` | Record consent |
| PUT | `/consents/{id}/revoke` | Revoke consent |
| GET | `/consents/contact/{contact_id}` | Consents for contact |

## Complaints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/complaints` | List complaints |
| POST | `/complaints` | File complaint |
| GET | `/complaints/{id}` | Complaint detail |
| PUT | `/complaints/{id}/assign` | Assign to agent |
| PUT | `/complaints/{id}/resolve` | Resolve complaint |

## Knowledge

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/knowledge` | List articles |
| POST | `/knowledge` | Create article |
| GET | `/knowledge/{id}` | Article detail |
| PUT | `/knowledge/{id}` | Update article |
| DELETE | `/knowledge/{id}` | Archive article |
| POST | `/knowledge/search` | Semantic search (RAG) |

## Sectors

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/sectors` | List sectors |
| GET | `/sectors/{sector}` | Sector detail |
| GET | `/sectors/{sector}/assets` | Sector assets |
| POST | `/sectors/{sector}/assets` | Upload asset |
| GET | `/sectors/{sector}/strategy` | AI sector strategy |
| GET | `/sectors/{sector}/scorecards` | Sector scorecards |

## Presentations

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/presentations` | List presentations |
| POST | `/presentations` | Generate presentation |
| GET | `/presentations/{id}` | Get presentation |
| PUT | `/presentations/{id}` | Update presentation |
| POST | `/presentations/{id}/send` | Send to contact |

## Supervisor

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/supervisor/agents` | Agent workload overview |
| GET | `/supervisor/queue` | Unassigned lead queue |
| POST | `/supervisor/reassign` | Bulk reassign leads |
| GET | `/supervisor/scorecards` | Team scorecards |
| GET | `/supervisor/alerts` | Escalation alerts |

## Admin

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/tenants` | List tenants (superadmin) |
| GET | `/admin/tenants/{id}` | Tenant detail |
| PUT | `/admin/tenants/{id}` | Update tenant |
| GET | `/admin/users` | List all users |
| GET | `/admin/audit-logs` | Audit log viewer |
| GET | `/admin/policies` | List policies |
| POST | `/admin/policies` | Create policy |
| PUT | `/admin/policies/{id}` | Update policy |
| GET | `/admin/subscriptions` | Subscription overview |
| POST | `/admin/seed` | Seed demo data (dev only) |

## Health

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | Basic health check `[public]` |
| GET | `/health/ready` | Readiness (DB + Redis) `[public]` |
| GET | `/health/version` | App version `[public]` |

## Strategic Deals (Dealix OS / B2B)

Prefix: `/strategic-deals`. Company profiles, matches, deals, negotiation, governance.

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/strategic-deals/profiles` | List tenant company profiles (paginated) |
| POST | `/strategic-deals/profiles` | Create company profile |
| PUT | `/strategic-deals/profiles/{id}/enrich` | AI-enrich profile |
| POST | `/strategic-deals/profiles/{id}/analyze-needs` | Needs analysis |
| GET | `/strategic-deals/matches` | List AI matches |
| POST | `/strategic-deals/matches/{id}/approve` | Approve match |
| POST | `/strategic-deals/scan` | Discovery scan |
| POST | `/strategic-deals/barter-scan` | Barter chain scan |
| POST | `/strategic-deals` | Create strategic deal (`lead_id`, `sales_deal_id` optional) |
| GET | `/strategic-deals` | List deals (filters: status, deal_type, profile_id) |
| GET | `/strategic-deals/operating-model` | Current OS mode + all modes + roles/SLA hints |
| PUT | `/strategic-deals/operating-model` | Set operating mode (0–4) on tenant profile |
| GET | `/strategic-deals/taxonomy/deal-types` | 15-type partnership taxonomy |
| GET | `/strategic-deals/taxonomy/deal-types/{type_id}` | One taxonomy type |
| GET | `/strategic-deals/partner-archetypes` | Map `deal_type` → operational archetypes |
| GET | `/strategic-deals/playbooks` | Vertical sector playbooks |
| GET | `/strategic-deals/playbooks/{id}` | One playbook |
| POST | `/strategic-deals/policy/evaluate` | Graded policy: auto_execute / approval_required / blocked |
| GET | `/strategic-deals/identity/graph` | Light account graph (`profile_id` query) |
| GET | `/strategic-deals/governance/snapshot` | Governance KPIs + operating mode |
| GET | `/strategic-deals/growth/checklist` | M&A-style checklist (guidance) |
| GET | `/strategic-deals/agent-quality/snapshot` | Agent quality proxy metrics |
| GET | `/strategic-deals/{deal_id}` | Deal detail |
| PATCH | `/strategic-deals/{deal_id}/links` | Link CRM `lead_id` / `sales_deal_id` |
| PUT | `/strategic-deals/{deal_id}/negotiate` | Negotiation round |
| POST | `/strategic-deals/{deal_id}/outreach` | Outreach |
| POST | `/strategic-deals/{deal_id}/proposal` | Generate proposal |
| POST | `/strategic-deals/{deal_id}/term-sheet` | Term sheet |
| GET | `/strategic-deals/analytics/overview` | Deal analytics |

## Integrations (CRM)

Prefix: `/integrations`. Salesforce / HubSpot sync and health (JWT).

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/integrations/crm/status` | Config presence + last probe (no secrets) |
| POST | `/integrations/crm/salesforce/test` | Probe Salesforce token/API |
| POST | `/integrations/crm/salesforce/push-lead/{lead_id}` | Push one lead to Salesforce |
| POST | `/integrations/crm/salesforce/pull-leads` | Pull leads (optional `since`) |
| POST | `/integrations/crm/hubspot/test` | Probe HubSpot API |
| POST | `/integrations/crm/hubspot/push-lead/{lead_id}` | Push one contact to HubSpot |
| POST | `/integrations/crm/hubspot/pull-contacts` | Pull contacts page |

## AI routing (tenant)

Prefix: `/ai`. Model routing policy per task category (no API keys in response).

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/ai/routing` | Effective routing map for current tenant |
| PUT | `/ai/routing` | Update tenant `settings.llm_routing` (owner/manager) |

## Dealix Master API (demo / internal widgets)

Prefix: `/dealix`. Several routes are `[public]` when `DEALIX_INTERNAL_API_TOKEN` is unset (see `internal_api.py`). Responses may include `discovery_manifest` / `sector_insights` for provenance and workspace UI.

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/dealix/generate-leads` | Sector/city lead list + `discovery_manifest`, optional cache + rate limit |
| POST | `/dealix/enrich-exploration` | Single-lead structured enrichment + vertical playbook linkage + optional Tavily |
| POST | `/dealix/channel-drafts` | Governed WhatsApp/Email/LinkedIn (human-in-loop) draft templates `[public]` |
| GET | `/dealix/intelligence-flags` | Effective intel feature flags for tenant/session (no secrets) `[public]` |
| POST | `/dealix/enrich-exploration/async` | Queue enrichment; poll `GET .../jobs/{job_id}` `[public]` |
| GET | `/dealix/enrich-exploration/jobs/{job_id}` | Job status: `pending` / `running` / `done` / `error` `[public]` |
| GET | `/dealix/ai-eval/golden` | Golden rubric JSON for QA / regression `[public]` |
| POST | `/dealix/full-power` | Research + pipeline bundle (existing) |
| POST | `/dealix/research-company` | Company deep research |
| POST | `/dealix/daily-leads` | Hub batch generation |
