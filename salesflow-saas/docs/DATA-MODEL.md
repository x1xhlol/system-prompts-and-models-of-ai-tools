# Data Model

Complete schema reference for the Dealix platform. All tenant-scoped tables include a `tenant_id` foreign key. Timestamps (`created_at`, `updated_at`) are present on every table unless noted.

---

## Core Tables

### users

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| email | VARCHAR(255) | unique per tenant |
| phone | VARCHAR(20) | |
| hashed_password | TEXT | |
| full_name | VARCHAR(255) | |
| role | ENUM | owner, admin, manager, agent, affiliate, viewer |
| language | VARCHAR(5) | ar, en |
| is_active | BOOLEAN | |
| last_login_at | TIMESTAMP | |

### tenants

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | VARCHAR(255) | |
| slug | VARCHAR(100) | unique |
| plan | ENUM | free, starter, pro, enterprise |
| domain | VARCHAR(255) | custom domain |
| settings | JSONB | tenant-level config |
| is_active | BOOLEAN | |

### leads

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| assigned_to | UUID | FK -> users |
| source | VARCHAR(50) | whatsapp, web, referral, import, affiliate |
| status | ENUM | new, contacted, qualified, converted, lost |
| score | INTEGER | AI-computed 0-100 |
| full_name | VARCHAR(255) | |
| phone | VARCHAR(20) | |
| email | VARCHAR(255) | |
| company_name | VARCHAR(255) | |
| sector | VARCHAR(100) | |
| city | VARCHAR(100) | |
| notes | TEXT | |
| qualified_at | TIMESTAMP | |
| converted_at | TIMESTAMP | |

### deals

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| lead_id | UUID | FK -> leads |
| assigned_to | UUID | FK -> users |
| title | VARCHAR(255) | |
| stage | ENUM | discovery, proposal, negotiation, closed_won, closed_lost |
| value | DECIMAL(12,2) | SAR |
| currency | VARCHAR(3) | default SAR |
| probability | INTEGER | 0-100 |
| expected_close | DATE | |
| closed_at | TIMESTAMP | |
| lost_reason | TEXT | |

### customers

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| lead_id | UUID | FK -> leads |
| deal_id | UUID | FK -> deals |
| full_name | VARCHAR(255) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(20) | |
| company_name | VARCHAR(255) | |
| lifetime_value | DECIMAL(12,2) | |

### activities

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| user_id | UUID | FK -> users |
| lead_id | UUID | FK -> leads, nullable |
| deal_id | UUID | FK -> deals, nullable |
| type | ENUM | call, email, whatsapp, meeting, note, task |
| subject | VARCHAR(255) | |
| body | TEXT | |
| scheduled_at | TIMESTAMP | |
| completed_at | TIMESTAMP | |

### messages

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| lead_id | UUID | FK -> leads, nullable |
| contact_id | UUID | FK -> contacts, nullable |
| channel | ENUM | whatsapp, email, sms, in_app |
| direction | ENUM | inbound, outbound |
| content | TEXT | |
| status | ENUM | queued, sent, delivered, read, failed |
| sent_at | TIMESTAMP | |

### proposals

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| deal_id | UUID | FK -> deals |
| version | INTEGER | |
| title | VARCHAR(255) | |
| content | JSONB | structured proposal data |
| status | ENUM | draft, sent, viewed, accepted, rejected |
| sent_at | TIMESTAMP | |
| viewed_at | TIMESTAMP | |

### notifications

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| user_id | UUID | FK -> users |
| type | VARCHAR(50) | |
| title | VARCHAR(255) | |
| body | TEXT | |
| channel | ENUM | in_app, email, whatsapp, sms |
| is_read | BOOLEAN | |
| read_at | TIMESTAMP | |

### subscriptions

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| plan | ENUM | free, starter, pro, enterprise |
| status | ENUM | active, past_due, cancelled, trialing |
| current_period_start | TIMESTAMP | |
| current_period_end | TIMESTAMP | |
| payment_provider | VARCHAR(50) | |
| external_id | VARCHAR(255) | provider subscription ID |

### templates

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants, nullable (global templates) |
| type | ENUM | whatsapp, email, sms, proposal |
| name | VARCHAR(255) | |
| language | VARCHAR(5) | ar, en |
| subject | VARCHAR(255) | |
| body | TEXT | supports variables |
| is_active | BOOLEAN | |

### properties

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| entity_type | VARCHAR(50) | lead, deal, contact, company |
| entity_id | UUID | |
| key | VARCHAR(100) | |
| value | TEXT | |

### audit_logs

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| user_id | UUID | FK -> users |
| action | VARCHAR(50) | create, update, delete, login, export |
| entity_type | VARCHAR(50) | |
| entity_id | UUID | |
| changes | JSONB | before/after diff |
| ip_address | VARCHAR(45) | |

---

## Affiliate Tables

### affiliates

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| user_id | UUID | FK -> users |
| status | ENUM | applied, approved, active, suspended, terminated |
| tier | ENUM | bronze, silver, gold, platinum |
| referral_code | VARCHAR(20) | unique |
| commission_rate | DECIMAL(5,2) | percentage |
| approved_at | TIMESTAMP | |

### affiliate_performances

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| affiliate_id | UUID | FK -> affiliates |
| period | DATE | month start |
| leads_generated | INTEGER | |
| deals_closed | INTEGER | |
| revenue_attributed | DECIMAL(12,2) | |
| commission_earned | DECIMAL(12,2) | |
| conversion_rate | DECIMAL(5,2) | |

### affiliate_deals

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| affiliate_id | UUID | FK -> affiliates |
| deal_id | UUID | FK -> deals |
| lead_id | UUID | FK -> leads |
| attributed_revenue | DECIMAL(12,2) | |
| commission_amount | DECIMAL(12,2) | |
| status | ENUM | pending, confirmed, paid, disputed |

---

## AI Tables

### ai_conversations

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| agent_type | VARCHAR(50) | agent identifier |
| lead_id | UUID | FK -> leads, nullable |
| contact_id | UUID | FK -> contacts, nullable |
| input_payload | JSONB | |
| output_payload | JSONB | |
| tokens_used | INTEGER | |
| latency_ms | INTEGER | |
| status | ENUM | success, error, escalated |

### auto_bookings

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| lead_id | UUID | FK -> leads |
| agent_id | UUID | FK -> users (assigned agent) |
| proposed_time | TIMESTAMP | |
| confirmed_time | TIMESTAMP | |
| status | ENUM | proposed, confirmed, rescheduled, cancelled, completed |
| channel | VARCHAR(20) | whatsapp, email |
| calendar_event_id | VARCHAR(255) | external calendar ref |

---

## New Tables

### companies

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| name | VARCHAR(255) | |
| name_ar | VARCHAR(255) | Arabic name |
| sector | VARCHAR(100) | |
| size | ENUM | micro, small, medium, large, enterprise |
| city | VARCHAR(100) | |
| region | VARCHAR(100) | |
| cr_number | VARCHAR(20) | commercial registration |
| website | VARCHAR(255) | |
| is_active | BOOLEAN | |

### contacts

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| company_id | UUID | FK -> companies, nullable |
| lead_id | UUID | FK -> leads, nullable |
| full_name | VARCHAR(255) | |
| job_title | VARCHAR(100) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(20) | |
| whatsapp | VARCHAR(20) | |
| language | VARCHAR(5) | ar, en |
| consent_status | ENUM | granted, revoked, pending |

### prospects

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| company_id | UUID | FK -> companies, nullable |
| contact_id | UUID | FK -> contacts, nullable |
| source | VARCHAR(50) | |
| status | ENUM | identified, researching, approaching, engaged, disqualified |
| priority | ENUM | low, medium, high, critical |
| sector | VARCHAR(100) | |
| estimated_value | DECIMAL(12,2) | |
| notes | TEXT | |

### calls

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| lead_id | UUID | FK -> leads, nullable |
| contact_id | UUID | FK -> contacts, nullable |
| user_id | UUID | FK -> users |
| direction | ENUM | inbound, outbound |
| status | ENUM | ringing, answered, missed, voicemail, failed |
| duration_seconds | INTEGER | |
| recording_url | TEXT | |
| transcript | TEXT | AI-generated |
| sentiment | VARCHAR(20) | positive, neutral, negative |
| outcome | VARCHAR(50) | |

### commissions

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| affiliate_id | UUID | FK -> affiliates |
| deal_id | UUID | FK -> deals |
| amount | DECIMAL(12,2) | |
| currency | VARCHAR(3) | SAR |
| rate | DECIMAL(5,2) | percentage applied |
| status | ENUM | pending, approved, paid, disputed, cancelled |
| approved_by | UUID | FK -> users, nullable |
| approved_at | TIMESTAMP | |
| period | DATE | commission period |

### payouts

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| affiliate_id | UUID | FK -> affiliates |
| amount | DECIMAL(12,2) | |
| currency | VARCHAR(3) | |
| method | ENUM | bank_transfer, wallet, check |
| status | ENUM | pending, processing, completed, failed |
| reference | VARCHAR(100) | payment reference |
| bank_name | VARCHAR(100) | |
| iban | VARCHAR(34) | |
| processed_at | TIMESTAMP | |

### disputes

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| commission_id | UUID | FK -> commissions, nullable |
| affiliate_id | UUID | FK -> affiliates |
| type | ENUM | commission, attribution, payout, guarantee |
| status | ENUM | open, under_review, resolved, escalated, closed |
| description | TEXT | |
| resolution | TEXT | |
| resolved_by | UUID | FK -> users, nullable |
| resolved_at | TIMESTAMP | |

### guarantee_claims

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| deal_id | UUID | FK -> deals |
| customer_id | UUID | FK -> customers |
| claim_type | ENUM | performance, quality, delivery, other |
| status | ENUM | submitted, reviewing, approved, denied, refunded |
| description | TEXT | |
| evidence | JSONB | uploaded proof references |
| amount_claimed | DECIMAL(12,2) | |
| amount_approved | DECIMAL(12,2) | |
| reviewed_by | UUID | FK -> users, nullable |
| reviewed_at | TIMESTAMP | |

### refunds

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| guarantee_claim_id | UUID | FK -> guarantee_claims |
| deal_id | UUID | FK -> deals |
| amount | DECIMAL(12,2) | |
| currency | VARCHAR(3) | |
| status | ENUM | pending, processing, completed, failed |
| method | ENUM | bank_transfer, original_method, wallet |
| processed_at | TIMESTAMP | |
| reference | VARCHAR(100) | |

### consents

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| contact_id | UUID | FK -> contacts |
| channel | ENUM | whatsapp, email, sms, phone |
| status | ENUM | granted, revoked |
| granted_at | TIMESTAMP | |
| revoked_at | TIMESTAMP | |
| ip_address | VARCHAR(45) | |
| source | VARCHAR(50) | how consent was collected |

### complaints

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| contact_id | UUID | FK -> contacts, nullable |
| customer_id | UUID | FK -> customers, nullable |
| category | ENUM | service, billing, communication, privacy, other |
| status | ENUM | open, investigating, resolved, closed |
| severity | ENUM | low, medium, high, critical |
| description | TEXT | |
| resolution | TEXT | |
| assigned_to | UUID | FK -> users, nullable |
| resolved_at | TIMESTAMP | |

### policies

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants, nullable (platform-wide) |
| type | ENUM | commission, guarantee, refund, compliance, privacy |
| name | VARCHAR(255) | |
| content | TEXT | |
| version | INTEGER | |
| is_active | BOOLEAN | |
| effective_from | DATE | |

### knowledge_articles

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants, nullable (shared) |
| category | VARCHAR(100) | |
| title | VARCHAR(255) | |
| title_ar | VARCHAR(255) | |
| body | TEXT | |
| body_ar | TEXT | |
| embedding | VECTOR(1536) | for RAG retrieval |
| sector | VARCHAR(100) | nullable |
| is_published | BOOLEAN | |

### sector_assets

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants, nullable |
| sector | VARCHAR(100) | |
| asset_type | ENUM | pitch_deck, case_study, objection_map, pricing_guide, competitor_matrix |
| title | VARCHAR(255) | |
| content | JSONB | structured asset data |
| language | VARCHAR(5) | ar, en |
| is_active | BOOLEAN | |

### scorecards

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | FK -> tenants |
| user_id | UUID | FK -> users |
| period | DATE | scoring period |
| leads_handled | INTEGER | |
| deals_closed | INTEGER | |
| revenue_generated | DECIMAL(12,2) | |
| avg_response_time | INTEGER | seconds |
| customer_satisfaction | DECIMAL(3,2) | 0.00-5.00 |
| ai_assist_rate | DECIMAL(5,2) | percentage of AI-assisted interactions |
| composite_score | DECIMAL(5,2) | weighted aggregate |

---

## Entity Relationships

```
tenants 1--* users
tenants 1--* leads
tenants 1--* deals
tenants 1--* companies
tenants 1--* contacts

leads *--1 users (assigned_to)
leads 1--* deals
leads 1--* activities
leads 1--* messages
leads 1--* ai_conversations
leads 1--* auto_bookings
leads 1--* calls

deals 1--* proposals
deals 1--* commissions
deals 1--* guarantee_claims

companies 1--* contacts
contacts 1--* messages
contacts 1--* calls
contacts 1--* consents

affiliates 1--1 users
affiliates 1--* affiliate_deals
affiliates 1--* affiliate_performances
affiliates 1--* commissions
affiliates 1--* payouts
affiliates 1--* disputes

guarantee_claims 1--* refunds
commissions 1--* disputes
```
