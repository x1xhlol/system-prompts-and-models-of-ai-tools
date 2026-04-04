# رحلة العميل — تشغيل كامل لـ Dealix OS

## 1) من يدفع ومن يربط؟

| الدور عند العميل | المسؤولية |
|-------------------|-----------|
| صاحب قرار مالي | العقد، النطاق، تعيين مسؤول تقني ومسؤول قنوات |
| مسؤول تقني | خادم، HTTPS، أسرار، Salesforce، Stripe، Webhooks |
| مسؤول قنوات | Meta Business، واتساب، قوالب، اختبار إرسال |
| مدير نجاح Dealix (بشري) | جدولة، تصعيد، قبول مراحل |
| **وكيل Integration Concierge (ذكي)** | شرح خطوة بخطوة، تلخيص الأخطاء، FAQ — يُنفَّذ عبر المنتج عند الربط مع `AgentExecutor` |

## 2) مسار مراحل (ملخص)

1. **التعاقد** — SOW، مستأجرون، قنوات اتصال مشروع.
2. **المنصة** — Docker/خادم، PostgreSQL، Redis، `SECRET_KEY`، LLM.
3. **التكاملات** — Salesforce، Stripe، توقيع.
4. **واتساب** — تطبيق، رقم، `WHATSAPP_MOCK_MODE=false`، Webhook عام.
5. **صوت وبريد** — Twilio (اختياري)، SendGrid/SMTP.
6. **Go-Live** — مواءمة `NEXT_PUBLIC_API_URL`، تدريب، مراجعة أسبوعية.

**JSON كامل:** `GET /api/v1/customer-onboarding/journey`

## 3) اختبار كأنك عميل

**قبل الاتصال:** نطاق + HTTPS، مسؤول تقني متاح، Meta جاهز إن وُجدت واتساب.

**فحوص آلية:**

- `GET /api/v1/health`
- `GET /api/v1/ready`
- `GET /api/v1/autonomous-foundation/integrations/go-live-gate`
- `POST /api/v1/autonomous-foundation/integrations/connectivity-test`

**قائمة مختصرة:** `GET /api/v1/customer-onboarding/acceptance-test`

## 4) واتساب في الرحلة

- ترحيل رسمي + ملخص PASS/FAIL بعد الفحص الآلي.
- اختبار إرسال بعد تفعيل القناة.
- تذكير أسبوعي (مستقبلاً: أتمتة من workflows).

## 5) فجوات نحو «Full OS» (أين نُبني وكلاء/أتمتة أكثر)

| الفجوة | المقترح |
|--------|---------|
| ربط حالة `go-live-gate` تلقائياً برسالة واتساب للعميل | Workflow + قالب رسالة حسب `missing` |
| SLA بشري عند توقف خطوة > N ساعات | جدولة Celery + إشعار CSM |
| UAT موقّع لكل عميل | قالب PDF/Notion + حقل في tenant |
| وكيل Concierge متصل فعلياً بـ LLM من لوحة «مسار التشغيل» | زر «اسأل الوكيل» → `/api/v1/...` (لاحقاً) |

## 6) مراجع

- `docs/INTEGRATION_MASTER_AR.md`
- `docs/LAUNCH_CHECKLIST.md`
- `ai-agents/prompts/customer-integration-concierge.md`
- `docs/AGENT-MAP.md` — البند **Customer Integration Concierge**
