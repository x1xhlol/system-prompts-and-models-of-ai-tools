# Dealix Glossary (مسرد مصطلحات ديلكس)

**Type**: glossary
**Summary**: Bilingual (Arabic/English) glossary of all key terms used across the Dealix platform.
**Summary_AR**: مسرد ثنائي اللغة (عربي/إنجليزي) لجميع المصطلحات الرئيسية المستخدمة في منصة ديلكس.
**Key Facts**:
  - 30+ terms covering CRM, AI, compliance, and platform concepts
  - Each term has English name, Arabic name, and definition
  - Terms are grouped by domain for easy navigation
  - Used as reference by AI agents and human team members
**Provenance**: AGENTS.md, CLAUDE.md, backend source code, PDPL documentation
**Confidence**: high
**Related Pages**: [architecture](./architecture.md), [PDPL checklist](../security/pdpl-checklist.md)
**Last Updated**: 2026-04-11
**Stale**: false

---

## CRM Core (إدارة علاقات العملاء)

| # | English | العربية | Definition |
|---|---------|---------|------------|
| 1 | **Lead** | عميل محتمل | A potential customer who has shown interest or been identified through outreach. Scored 0-100 in Dealix. |
| 2 | **Deal** | صفقة | A sales opportunity tied to a lead, tracked through pipeline stages with value in SAR. |
| 3 | **Pipeline** | مسار المبيعات | The sequence of stages a deal progresses through from qualification to close. |
| 4 | **Stage** | مرحلة | A discrete step in the pipeline (e.g., Qualification, Proposal, Negotiation, Closed Won). |
| 5 | **Contact** | جهة اتصال | An individual person associated with a lead or company. |
| 6 | **Company** | شركة | An organization entity linked to one or more contacts and deals. |
| 7 | **Account** | حساب | A company record with enrichment data (industry, size, revenue). |
| 8 | **Opportunity** | فرصة | Synonym for Deal in some contexts; a qualified sales prospect. |
| 9 | **Conversion** | تحويل | The act of a lead becoming a qualified deal or a deal reaching Closed Won. |
| 10 | **Win Rate** | معدل الفوز | Percentage of deals that reach Closed Won vs total deals in a period. |

## Sales Operations (عمليات المبيعات)

| # | English | العربية | Definition |
|---|---------|---------|------------|
| 11 | **Sequence** | تسلسل | An automated multi-step outreach cadence (e.g., WhatsApp → Email → Call → Follow-up). |
| 12 | **Cadence** | إيقاع | The timing pattern between sequence steps (e.g., Day 0, Day 2, Day 5). |
| 13 | **CPQ** | تسعير (التهيئة والتسعير والعرض) | Configure, Price, Quote — system for generating accurate proposals with SAR pricing. |
| 14 | **Proposal** | عرض سعر | A formal document sent to a prospect detailing scope, pricing, and terms. |
| 15 | **Territory** | منطقة | A geographic or industry-based area assigned to a sales rep for lead ownership. |
| 16 | **Assignment** | تعيين | The act of routing a lead or deal to a specific sales rep or team. |
| 17 | **SLA** | اتفاقية مستوى الخدمة | Service Level Agreement — response time commitments for lead follow-up. |
| 18 | **Escalation** | تصعيد | Routing a stalled or high-priority item to a manager or specialist. |

## AI & Intelligence (الذكاء الاصطناعي)

| # | English | العربية | Definition |
|---|---------|---------|------------|
| 19 | **Lead Score** | درجة العميل المحتمل | A 0-100 composite score indicating lead quality based on behavior, fit, and engagement. |
| 20 | **Intent Detection** | كشف النية | AI analysis of message text to determine customer intent (buy, inquire, complain, etc.). |
| 21 | **Sentiment Analysis** | تحليل المشاعر | AI classification of message tone as positive, negative, or neutral. |
| 22 | **Entity Extraction** | استخلاص الكيانات | AI identification of named entities (people, companies, amounts, dates) from Arabic text. |
| 23 | **Conversation Intelligence** | ذكاء المحادثات | AI analysis of sales conversations for coaching insights and deal signals. |
| 24 | **Model Router** | موجه النماذج | Service that selects the optimal LLM provider and model for each AI task. |
| 25 | **Agent** | وكيل ذكي | An autonomous AI worker with a specialized role (e.g., Lead Qualifier, Deal Advisor). |
| 26 | **Orchestrator** | منسق الوكلاء | The system that routes events to appropriate agents and manages their execution. |

## Platform & Infrastructure (المنصة والبنية التحتية)

| # | English | العربية | Definition |
|---|---------|---------|------------|
| 27 | **Tenant** | مستأجر | An isolated customer organization on the platform. All data is scoped by `tenant_id`. |
| 28 | **Multi-Tenant** | متعدد المستأجرين | Architecture where multiple customers share infrastructure but data is isolated. |
| 29 | **Feature Flag** | مفتاح الميزة | A toggle that controls feature availability per tenant or globally. |
| 30 | **Webhook** | خطاف ويب | An HTTP callback that notifies external systems of events (e.g., deal closed, lead scored). |
| 31 | **Worker** | عامل خلفي | A Celery process that handles async tasks (scoring, delivery, analytics). |
| 32 | **Migration** | ترحيل قاعدة البيانات | An Alembic script that modifies the database schema. |

## Compliance & Security (الامتثال والأمان)

| # | English | العربية | Definition |
|---|---------|---------|------------|
| 33 | **PDPL** | نظام حماية البيانات الشخصية | Saudi Personal Data Protection Law — governs collection, processing, and storage of personal data. |
| 34 | **Consent** | موافقة | Explicit permission from a data subject to process their data for a stated purpose. |
| 35 | **Data Subject** | صاحب البيانات | The individual whose personal data is being processed. |
| 36 | **Data Subject Rights** | حقوق صاحب البيانات | Rights to access, correct, and delete personal data under PDPL. |
| 37 | **Audit Trail** | سجل المراجعة | Immutable log of all consent changes and data access events. |
| 38 | **Security Gate** | بوابة الأمان | Pre-execution check that blocks risky actions (cross-tenant access, ungoverned messaging). |
| 39 | **ZATCA** | هيئة الزكاة والضريبة والجمارك | Saudi tax authority — Dealix integrates with ZATCA for e-invoicing compliance. |

## Communication (التواصل)

| # | English | العربية | Definition |
|---|---------|---------|------------|
| 40 | **WhatsApp Business** | واتساب للأعمال | Primary communication channel in Saudi Arabia (85% penetration). |
| 41 | **Inbox** | صندوق الوارد | Unified view of all conversations across WhatsApp, Email, and SMS. |
| 42 | **Template Message** | رسالة نموذجية | Pre-approved WhatsApp message template for outbound marketing/transactional use. |
| 43 | **Outbound Governance** | حوكمة الرسائل الصادرة | Rules controlling message volume, timing, and consent requirements. |

## Business Metrics (مؤشرات الأعمال)

| # | English | العربية | Definition |
|---|---------|---------|------------|
| 44 | **MRR** | الإيرادات الشهرية المتكررة | Monthly Recurring Revenue — total subscription revenue per month. |
| 45 | **ARR** | الإيرادات السنوية المتكررة | Annual Recurring Revenue — MRR multiplied by 12. |
| 46 | **Churn Rate** | معدل الانسحاب | Percentage of customers who cancel their subscription in a period. |
| 47 | **LTV** | القيمة الدائمة للعميل | Lifetime Value — total revenue expected from a customer over their relationship. |
| 48 | **CAC** | تكلفة اكتساب العميل | Customer Acquisition Cost — total spend to acquire one new customer. |
| 49 | **NPS** | صافي نقاط الترويج | Net Promoter Score — measure of customer satisfaction and loyalty. |
| 50 | **ICP** | ملف العميل المثالي | Ideal Customer Profile — the target customer characteristics for Dealix. |
