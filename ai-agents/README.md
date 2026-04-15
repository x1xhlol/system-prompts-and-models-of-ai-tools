# 🤖 Dealix AI Agent System

## نظرة عامة

20 وكيل AI متخصص يعملون بشكل مستقل لإدارة دورة حياة المبيعات B2B في السوق السعودي.

## البنية

```
ai-agents/prompts/          ← 20 ملف تعليمات (System Prompts)
salesflow-saas/backend/
├── app/services/agents/
│   ├── __init__.py          ← Module exports
│   ├── router.py            ← Event → Agent routing (30 events)
│   ├── executor.py          ← LLM execution engine
│   ├── autonomous_pipeline.py ← 11-stage state machine
│   ├── action_dispatcher.py ← 13 action types → services
│   └── manus_orchestrator.py ← Multi-agent orchestration
├── app/api/v1/
│   ├── pipeline_engine.py   ← Pipeline REST API
│   └── agent_health.py      ← Health check + diagnostics
├── app/workers/
│   ├── agent_tasks.py       ← Celery agent tasks
│   └── pipeline_tasks.py    ← Celery pipeline tasks
└── app/flows/
    ├── prospecting_durable_flow.py ← Multi-channel prospecting
    └── self_improvement_flow.py    ← 6-phase self-optimization
```

## الوكلاء الـ 20

| # | الوكيل | الملف | المهمة |
|---|--------|-------|--------|
| 1 | Closer | `closer-agent.md` | إغلاق الصفقات |
| 2 | Lead Qualification | `lead-qualification-agent.md` | تأهيل العملاء |
| 3 | Arabic WhatsApp | `arabic-whatsapp-agent.md` | محادثات واتساب عربية |
| 4 | English Conversation | `english-conversation-agent.md` | محادثات إنجليزية |
| 5 | Outreach Writer | `outreach-message-writer.md` | كتابة رسائل تواصل |
| 6 | Meeting Booking | `meeting-booking-agent.md` | حجز اجتماعات |
| 7 | Objection Handler | `objection-handling-agent.md` | معالجة اعتراضات |
| 8 | Proposal Drafter | `proposal-drafting-agent.md` | صياغة عروض |
| 9 | Sector Strategist | `sector-sales-strategist.md` | استراتيجية قطاعية |
| 10 | Knowledge Retrieval | `knowledge-retrieval-agent.md` | استرجاع معرفة |
| 11 | Compliance Reviewer | `compliance-reviewer.md` | مراجعة امتثال |
| 12 | Fraud Reviewer | `fraud-reviewer.md` | كشف احتيال |
| 13 | Revenue Attribution | `revenue-attribution-agent.md` | تتبع إيرادات |
| 14 | Management Summary | `management-summary-agent.md` | ملخصات إدارية |
| 15 | QA Reviewer | `conversation-qa-reviewer.md` | مراجعة جودة |
| 16 | Affiliate Evaluator | `affiliate-recruitment-evaluator.md` | تقييم مسوقين |
| 17 | Onboarding Coach | `affiliate-onboarding-coach.md` | تدريب مسوقين |
| 18 | Guarantee Reviewer | `guarantee-claim-reviewer.md` | مراجعة ضمان |
| 19 | Voice Call | `voice-call-flow-agent.md` | مكالمات هاتفية |
| 20 | AI Rehearsal | `ai-rehearsal-agent.md` | تحضير اجتماعات |

## مراحل Pipeline

```
NEW → QUALIFYING → QUALIFIED → OUTREACH → MEETING_SCHEDULED →
MEETING_PREP → NEGOTIATION → CLOSING → WON / LOST / NURTURING
```

## API Endpoints

```bash
# معالجة lead كامل
POST /api/v1/pipeline/process-lead?tenant_id=xxx

# تقدم يدوي
POST /api/v1/pipeline/advance-stage?tenant_id=xxx

# فحص صحة النظام
GET /api/v1/agent-health/status

# تحسين ذاتي
POST /api/v1/agent-health/self-improve

# تشغيل وكيل مباشرة
POST /api/v1/pipeline/run-agent/{agent_type}?tenant_id=xxx
```

## إضافة وكيل جديد

1. أنشئ ملف `.md` في `ai-agents/prompts/`
2. أضف الوكيل في `router.py` → `AGENT_REGISTRY`
3. أضف الـ mapping في `executor.py` → `filename_map`
4. أضف الـ actions في `executor.py` → `_build_actions`
5. أضف الـ temperature/tokens في `executor.py`
6. شغل `python tests/test_agent_system.py` للتحقق
