# AI Agent Registry

Dealix runs 19 specialized AI agents (including customer-facing onboarding). Each agent executes as a Celery task, receives structured input, returns structured output, and follows defined escalation rules. All invocations are logged to `ai_conversations` for audit.

---

## 1. Lead Qualification Agent

| Property | Value |
|----------|-------|
| **ID** | `lead_qualification` |
| **Role** | Score and qualify inbound leads based on profile, behavior, and sector fit |
| **Inputs** | Lead record (name, phone, email, company, sector, city, source), activity history, tenant scoring rules |
| **Outputs** | Qualification score (0-100), status recommendation (qualified/unqualified), reasoning, suggested next action |
| **Escalation** | Score between 40-60 (ambiguous) -> flag for human review. Missing critical fields -> request enrichment before scoring |

## 2. Affiliate Recruitment Evaluator

| Property | Value |
|----------|-------|
| **ID** | `affiliate_evaluator` |
| **Role** | Evaluate affiliate applications for approval based on profile, network reach, and sector alignment |
| **Inputs** | Affiliate application (profile, experience, sector, network size, motivation), tenant criteria |
| **Outputs** | Approval recommendation (approve/reject/review), tier suggestion, risk flags, onboarding notes |
| **Escalation** | High-risk indicators (fraud history, competitor affiliation) -> escalate to admin. Borderline cases -> queue for manual review |

## 3. Onboarding Coach

| Property | Value |
|----------|-------|
| **ID** | `onboarding_coach` |
| **Role** | Guide new affiliates and agents through platform onboarding with step-by-step instructions |
| **Inputs** | User profile, role (affiliate/agent), completed onboarding steps, language preference |
| **Outputs** | Next onboarding step, instructional message (Arabic or English), checklist status, resource links |
| **Escalation** | User stuck for >48 hours -> notify manager. Repeated confusion on same step -> flag UX issue |

## 4. Outreach Writer

| Property | Value |
|----------|-------|
| **ID** | `outreach_writer` |
| **Role** | Draft personalized outreach messages for leads across channels (WhatsApp, email, SMS) |
| **Inputs** | Lead profile, sector, channel, language, campaign context, previous interactions, template (optional) |
| **Outputs** | Draft message, subject line (email), suggested send time, A/B variant (optional) |
| **Escalation** | Compliance flag on content (regulated sector) -> route to Compliance Reviewer. Lead marked do-not-contact -> block and alert |

## 5. Arabic WhatsApp Agent

| Property | Value |
|----------|-------|
| **ID** | `arabic_whatsapp` |
| **Role** | Handle Arabic WhatsApp conversations with leads and contacts autonomously |
| **Inputs** | Inbound WhatsApp message, conversation history, lead/contact record, active campaign context |
| **Outputs** | Reply message (Arabic), detected intent, sentiment, extracted entities, conversation state update |
| **Escalation** | Negative sentiment for 2+ consecutive messages -> transfer to human. Request for pricing/legal terms -> transfer to agent. Unrecognized intent after 2 attempts -> transfer to human |

## 6. English Conversation Agent

| Property | Value |
|----------|-------|
| **ID** | `english_conversation` |
| **Role** | Handle English conversations across WhatsApp, email, and chat |
| **Inputs** | Inbound message, channel, conversation history, lead/contact record |
| **Outputs** | Reply message (English), detected intent, sentiment, extracted entities, conversation state update |
| **Escalation** | Same rules as Arabic WhatsApp Agent. Language switch detected -> hand off to Arabic WhatsApp Agent |

## 7. Voice Call Agent

| Property | Value |
|----------|-------|
| **ID** | `voice_call` |
| **Role** | Analyze voice call transcripts and provide real-time call guidance |
| **Inputs** | Call transcript (live or post-call), lead/contact record, deal context, call direction |
| **Outputs** | Call summary, sentiment analysis, key topics extracted, recommended follow-up actions, objections detected |
| **Escalation** | Customer threat or legal mention -> alert supervisor immediately. Competitor mention -> flag for strategy review |

## 8. Meeting Booking Agent

| Property | Value |
|----------|-------|
| **ID** | `meeting_booking` |
| **Role** | Negotiate and book meeting times with leads via conversational exchange |
| **Inputs** | Lead record, assigned agent calendar availability, preferred channel, language, timezone |
| **Outputs** | Proposed time slots, booking confirmation message, calendar event payload, auto_booking record |
| **Escalation** | Lead rejects 3+ proposed times -> escalate to human agent. Calendar conflict detected -> alert assigned agent |

## 9. Sector Strategist

| Property | Value |
|----------|-------|
| **ID** | `sector_strategist` |
| **Role** | Generate sector-specific sales strategies, talking points, and competitive positioning |
| **Inputs** | Sector identifier, company profile, deal context, knowledge base articles, competitor data |
| **Outputs** | Strategy brief, key talking points, objection predictions, recommended assets, pricing guidance |
| **Escalation** | Unknown sector with no knowledge base data -> flag for content team. Conflicting market data -> flag for review |

## 10. Objection Handler

| Property | Value |
|----------|-------|
| **ID** | `objection_handler` |
| **Role** | Detect objections in conversations and generate contextual responses |
| **Inputs** | Conversation message(s), detected objection type, lead/deal context, sector, language |
| **Outputs** | Objection classification, recommended response (Arabic/English), supporting evidence, confidence score |
| **Escalation** | Pricing objection on deal >100K SAR -> involve manager. Legal/compliance objection -> route to Compliance Reviewer |

## 11. Proposal Drafter

| Property | Value |
|----------|-------|
| **ID** | `proposal_drafter` |
| **Role** | Generate structured proposals and pitch decks based on deal context and sector assets |
| **Inputs** | Deal record, company profile, sector assets, pricing data, template, language |
| **Outputs** | Proposal document (structured JSON), executive summary, pricing table, terms section, version number |
| **Escalation** | Deal value >500K SAR -> require manager approval before sending. Custom terms requested -> flag for legal review |

## 12. QA Reviewer

| Property | Value |
|----------|-------|
| **ID** | `qa_reviewer` |
| **Role** | Review AI-generated content (messages, proposals, responses) for quality, accuracy, and tone |
| **Inputs** | Generated content, content type, target audience, language, context |
| **Outputs** | Quality score (0-100), issues found, suggested corrections, approval status (pass/revise/fail) |
| **Escalation** | Score below 50 -> block content from sending, alert content team. Factual error detected -> block and flag |

## 13. Compliance Reviewer

| Property | Value |
|----------|-------|
| **ID** | `compliance_reviewer` |
| **Role** | Check messages, proposals, and actions for regulatory compliance (Saudi regulations, data protection, marketing laws) |
| **Inputs** | Content to review, content type, target region, sector, applicable policies |
| **Outputs** | Compliance status (compliant/non_compliant/review_needed), violations found, required changes, regulation references |
| **Escalation** | Clear violation -> block action and alert compliance officer. Ambiguous case -> queue for human legal review |

## 14. Knowledge Retrieval Agent

| Property | Value |
|----------|-------|
| **ID** | `knowledge_retrieval` |
| **Role** | Search and retrieve relevant knowledge base articles using semantic search (RAG) |
| **Inputs** | Query (natural language), sector filter, language, context (which agent is requesting) |
| **Outputs** | Ranked article list with relevance scores, extracted snippets, source references |
| **Escalation** | No relevant results found (all scores below threshold) -> flag knowledge gap for content team |

## 15. Revenue Attribution Agent

| Property | Value |
|----------|-------|
| **ID** | `revenue_attribution` |
| **Role** | Attribute revenue to affiliates, campaigns, and channels using multi-touch attribution |
| **Inputs** | Deal record, lead journey (touchpoints), affiliate referral data, campaign history |
| **Outputs** | Attribution breakdown (affiliate %, campaign %, channel %), commission calculation, confidence score |
| **Escalation** | Multiple affiliates claim same lead -> flag for dispute resolution. Attribution confidence below 70% -> flag for manual review |

## 16. Fraud Reviewer

| Property | Value |
|----------|-------|
| **ID** | `fraud_reviewer` |
| **Role** | Detect fraudulent patterns in affiliate activity, lead generation, and commission claims |
| **Inputs** | Affiliate activity log, lead generation patterns, commission history, IP/device data, behavioral signals |
| **Outputs** | Risk score (0-100), fraud indicators found, recommended action (clear/monitor/suspend/block), evidence summary |
| **Escalation** | Risk score >80 -> auto-suspend affiliate and alert admin. Coordinated fraud pattern (multiple accounts) -> escalate to platform security |

## 17. Guarantee Reviewer

| Property | Value |
|----------|-------|
| **ID** | `guarantee_reviewer` |
| **Role** | Evaluate gold guarantee claims for validity and recommend approval or denial |
| **Inputs** | Guarantee claim, deal record, customer record, service delivery evidence, policy rules |
| **Outputs** | Validity assessment, recommendation (approve/deny/partial), refund amount suggestion, reasoning, policy references |
| **Escalation** | Claim >50K SAR -> require director approval. Repeat claimant (3+ claims) -> flag for fraud review. Policy ambiguity -> escalate to legal |

## 18. Management Summary Agent

| Property | Value |
|----------|-------|
| **ID** | `management_summary` |
| **Role** | Generate executive summaries and reports for management dashboards |
| **Inputs** | Time period, metrics scope (revenue, pipeline, affiliates, agents, guarantees), tenant data |
| **Outputs** | Executive summary (Arabic/English), key metrics, trend analysis, alerts, recommended actions |
| **Escalation** | Revenue decline >20% period-over-period -> urgent alert to owner. Data anomaly detected -> flag for investigation |

## 19. Customer Integration Concierge

| Property | Value |
|----------|-------|
| **ID** | `integration_concierge` |
| **Role** | Guide paying B2B customers and their IT/channel owners through environment setup, integrations, WhatsApp, and go-live checks — step by step, in Arabic/English |
| **Inputs** | Current onboarding step id, tenant context, optional go-live matrix snapshot, user question, last connectivity-test or API error (sanitized) |
| **Outputs** | Next actions for customer vs Dealix CSM, verification hints (no secrets), escalation flag to human |
| **Escalation** | Repeated credential failures, Meta/Salesforce org access blocked, or policy-sensitive requests -> human CSM |

---

## Agent Invocation Flow

```
Event Received
     |
     v
Agent Router --> selects agent(s) by event type
     |
     v
Input Validation --> schema check
     |
     v
Celery Task Dispatch --> async execution
     |
     v
LLM Call --> OpenAI / provider
     |
     v
Output Parsing --> structured response
     |
     v
Escalation Check --> meets escalation criteria?
     |                    |
     No                  Yes
     |                    |
     v                    v
Action Handler      Human Handoff
(DB update,         (notify agent,
 send message,       create task,
 book meeting)       alert manager)
     |                    |
     v                    v
Log to ai_conversations
```

## LLM routing policy (per tenant)

وكلاء الجدول أعلاه يستهلكون نماذج LLM عبر طبقة التطبيق. **اختيار المزود والنموذج لكل فئة مهمة** (مثل استكشاف، تفاوض، امتثال، ملخص استراتيجي، تضمينات) يُخزَّن في `tenant.settings["llm_routing"]` ويُعرض ويُحدَّث عبر واجهة موحّدة:

| Method | Path | ملاحظة |
|--------|------|--------|
| GET | `/api/v1/ai/routing` | خريطة فعّالة + قائمة `available_providers` (بدون مفاتيح API) |
| PUT | `/api/v1/ai/routing` | تحديث جزئي لسياسة المستأجر (صلاحيات owner / manager / admin) |

تفاصيل الحقول والمسارات المجاورة: [`API-MAP.md`](API-MAP.md) (قسم AI routing). عند إضافة وكيل جديد، اربط نوع مهمته بأقرب مفتاح في سياسة التوجيه حتى يبقى السلوك قابلاً للضبط من لوحة واحدة.

## Agent Configuration

Each agent is defined in `ai-agents/` with:

- `prompt.md` - System prompt and instructions
- `schema.json` - Input/output JSON schema
- `config.yml` - Model, temperature, max tokens, retry policy, escalation rules
- `tests/` - Example inputs and expected outputs
