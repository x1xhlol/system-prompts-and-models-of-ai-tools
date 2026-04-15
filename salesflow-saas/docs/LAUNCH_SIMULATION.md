# محاكاة إطلاق Dealix (Staging → جاهزية)

وثيقة قصيرة لتشغيل **سيناريو إطلاق** يدوياً والتسجيل في سجل التشغيل. تكمّل [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md).

## 1. التحضير

1. فرع كود محدث؛ قاعدة بيانات متوافقة مع آخر هجرات Alembic.
2. نسخ متغيرات البيئة من الأمثلة (`backend/.env`، `frontend/.env.local` / `NEXT_PUBLIC_API_URL`).
3. من جذر `salesflow-saas`:  
   `node scripts/sync-marketing-to-public.cjs`

## 2. البناء والتحقق

1. `.\verify-launch.ps1 -WithOpenApiGate` (أو `.\verify-launch.ps1` ثم الخطوتين 2–3 يدوياً).
2. إن لم تستخدم `-WithOpenApiGate`: `py -3 scripts/verify_frontend_openapi_paths.py`
3. إن لم تستخدم `-WithOpenApiGate`: `py -3 scripts/check_go_live_gate.py`
4. `py -3 scripts/release_hardening_gate.py`
5. `py -3 scripts/ai_quality_gate.py`
4. تشغيل API: `py -3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000` من `backend/`.

## 3. بوابة go-live

1. استدعاء `GET /api/v1/autonomous-foundation/integrations/go-live-gate` (مع JWT إن لزم حسب البيئة).
2. تسجيل: `launch_allowed`، `blocked_reasons`، و`blocking` في ملاحظات الإصدار.

## 4. فحوص تكامل (رملي حيث أمكن)

| النظام | فعل مقترح | نتيجة متوقعة |
|--------|-----------|---------------|
| CRM Salesforce | `POST /api/v1/integrations/crm/salesforce/test` | `ok: true` أو رسالة خطأ واضحة |
| CRM HubSpot | `POST /api/v1/integrations/crm/hubspot/test` | كما فوق |
| واجهة | تبويب الإعدادات → تكاملات؛ مركز المسوق في الداشبورد | تحميل الحالة بدون أخطاء console حرجة |

## 5. الخاتمة

- وثّق التاريخ، البيئة (staging)، ونسخة الـ commit.
- أي فشل: أضف بنداً في `LAUNCH_CHECKLIST` أو issue مع `blocked_reasons` المنسوخة من الـ API.
- نفّذ من `backend/`: `py -3 scripts/revenue_discovery_e2e_probe.py` (ومع JWT عند اختبار الربط الاستراتيجي).
