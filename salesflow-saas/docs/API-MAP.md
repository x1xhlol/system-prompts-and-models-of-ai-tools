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
