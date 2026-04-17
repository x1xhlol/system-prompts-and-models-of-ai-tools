---
version: "1.1"
owner: "Founder + Program"
status: "canonical"
review_cadence: "أسبوعيًا حتى أول عميل مدفوع؛ ثم مع كل pilot"
last_updated: "2026-04-16"
related:
  - "TIER1_PRODUCTION_ACTIVATION_PROGRAM_AR.md"
  - "TIER1_REAL_PRODUCTION_PLAYBOOK_AR.md"
  - "golden-path-partner-intake-runbook.md"
  - "enterprise-readiness.md"
  - "FIRST_THREE_CLIENTS_PLAN_AR.md"
  - "LIVE_DEPLOYMENT_GUIDE_AR.md"
  - "AUTOMATED_REVENUE_ENGINE_AR.md"
---

# GO-LIVE Revenue Activation System

بعد إكمال **البنية + الحوكمة + العقود + CI**، الخطورة التالية ليست «ميزة إضافية» بل **تشغيل إيراد**: السوق يقيس بعميل، بصفقة، بـROI واضح — لا بعدد ملفات الحوكمة.

هذا المستند يحدد **تشغيلًا واقعيًا** (outreach → demo → pilot → دفع) مع **تثبيت إنتاجي** خفيف بعد الإطلاق، دون انتظار «كمال» يقتل الزمن.

**مرافق تقني:** [`TIER1_PRODUCTION_ACTIVATION_PROGRAM_AR.md`](TIER1_PRODUCTION_ACTIVATION_PROGRAM_AR.md) · [`TIER1_REAL_PRODUCTION_PLAYBOOK_AR.md`](TIER1_REAL_PRODUCTION_PLAYBOOK_AR.md) · [`enterprise-readiness.md`](enterprise-readiness.md) · [`FIRST_THREE_CLIENTS_PLAN_AR.md`](FIRST_THREE_CLIENTS_PLAN_AR.md) · [`LIVE_DEPLOYMENT_GUIDE_AR.md`](LIVE_DEPLOYMENT_GUIDE_AR.md) · [`AUTOMATED_REVENUE_ENGINE_AR.md`](AUTOMATED_REVENUE_ENGINE_AR.md)

---

## الحقيقة التشغيلية

| لديك الآن | ما يزال مطلوبًا لإيراد |
|-----------|-------------------------|
| Tier-1 architecture، governance، CI، trust، contracts | **صفقات مدفوعة**، قرار تنفيذي يُستخدم، دليل أثر (وقت/وضوح/دورة) |

---

## Phase 1 — Revenue Engine LIVE (أول 48 ساعة عمل)

### 1) هدف عميل واضح

مثال اتجاه (قابل للتعديل): B2B في السعودية، مبيعات معقّدة، شراكات، pipeline ثقيل — **شرط واحد**: تستطيع الوصول إليهم خلال أسبوع.

### 2) عرض واحد (بدون تعقيد)

صياغة مقترحة للعرض:

> نركّب لكم طبقة تشغيل تحسّن سرعة الإغلاق، الموافقات، وصفقات الشراكة خلال **14 يومًا** (pilot محدود النطاق).

### 3) استخدام ما هو موجود في المنصة

| قدرة | مرجع في المشروع |
|------|------------------|
| Outreach / حملات | [`outreach_engine.py`](../salesflow-saas/backend/app/api/v1/outreach_engine.py) — API تحت `/api/v1/outreach-engine/` |
| WhatsApp / قنوات | إعدادات البيئة + مسارات القنوات في [`INTEGRATION_MASTER_AR.md`](../salesflow-saas/docs/INTEGRATION_MASTER_AR.md) حيث ينطبق |
| عروض / PDF | [`proposals.py`](../salesflow-saas/backend/app/api/v1/proposals.py) + مولّد العروض في `app/services/cpq/` |

### 4) حجم أولي للاتصال (مثال يوم 1)

* 30 رسالة LinkedIn (أو ما يعادلها قانونيًا)
* 20 WhatsApp (ضمن سياسة الاشتراك والـ PDPL)
* 10 بريد إلكتروني

### سكربت رسالة قصيرة (مثال)

```
نشتغل مع شركات شبيهة بـ[قطاعكم].
نركّب طبقة تشغيل تسرّع الموافقات، توضّح صفقات الشراكة، وتعطي الإدارة رؤية مباشرة للقرار.
إن رغبتم pilot لمدة أسبوعين، نرتّب لكم جلسة قصيرة مع demo تنفيذي.
```

---

## Phase 2 — Demo Engine (تنفيذي لا تقني فقط)

### مبدأ

لا تعرض «شاشات تقنية» فقط؛ عرض **Executive Simulation**:

* Executive Room / الملخص الأسبوعي — [`executive-room-completion-spec.md`](executive-room-completion-spec.md) و`GET /api/v1/executive-room/snapshot`
* Approval Center — مسار Class B في [`golden-path-partner-intake-runbook.md`](golden-path-partner-intake-runbook.md)
* Evidence Pack — `GET /api/v1/evidence-packs/tier1-demo` (أو مسار حي عند الجاهزية)
* Pipeline / صفقة نموذجية — حسب ما هو مفعّل لدى العميل

### سؤال قرار للعميل

> لو كان هذا لديكم اليوم — كم يوفر من **وقت** أو **تكلفة فرصة** أو **مخاطر تأخير موافقة**؟

---

## Phase 3 — إغلاق أول صفقة (Critical)

* الهدف: **أول دفعة pilot** — لا عقد «مثالي» ولا scale كامل.
* تسعير مقترح للنقاش: **15K–50K SAR** لمدة **2–4 أسابيع** (حسب النطاق والالتزامات القانونية).

---

## Phase 4 — نشر Pilot حقيقي

### يركّب فقط

* مسار الإيراد + الموافقات + لوحة تنفيذية — كما في اتفاق الـ pilot.

### لا يركّب في الـ pilot الأول

* M&A كامل، توسع موصلات بلا حد، «كل النظام» — يبقى خارج النطاق حتى إثبات القيمة.

---

## Phase 5 — Evidence Generation (إثبات الأثر)

يثبت الـ pilot (أرقام أو مؤشرات اتجاهية):

* انخفاض زمن الموافقة (approval time)
* زيادة وضوح الصفقة (deal clarity)
* انخفاض دورة القرار (cycle time)

اربط الأرقام بسجلات النظام (سجلات موافقة، طوابع زمنية، evidence packs) حيث متاح.

---

## تثبيت ما بعد الإطلاق (Production Hardening للإيراد)

بعد بدء دفع العميل، ثبّت **ثلاثة** فقط مع الأولوية:

1. **Observability:** `trace_id` / `correlation_id` على الطلبات الحرجة؛ أخطاء مسجّلة؛ لوحة مراقبة حية.
2. **Failure recovery:** إعادة محاولة، idempotency، خطة rollback (انظر [`governance/github-and-release.md`](governance/github-and-release.md)).
3. **سجلات حقيقية:** ليست سجلات اختبار فقط — احتفظ بمسار تدقيق للـ pilot.

---

## Revenue Loop (قمع لا يُهمل)

1. Lead  
2. Demo  
3. Pilot  
4. Case study (موثّق)  
5. Referral  

بدون حلقة إحالة وقصة نجاج، يبقى النظام **قويًا تقنيًا** وضعيفًا تجاريًا.

---

## خطة أسبوع واقعية (مثال)

| الأيام | التركيز |
|--------|---------|
| 1–2 | Outreach + تجهيز demo |
| 3–5 | Demos |
| 6–7 | إغلاق أول التزام مدفوع (أو جدولة واضحة بتاريخ + مبلغ) |

---

## مؤشرات نجاح (غير تقنية بحتة)

* عميل دفع pilot (أو عقد موقّع بمبلغ محدد).
* تنفيذي يستخدم لوحة/ملخص أسبوعي **مرة على الأقل** خلال الـ pilot.
* قرار مهم مرّ عبر النظام (موافقة + أدلة) وليس خارجها.
* تحسّن ملحوظ في زمن موافقة **قابل للإثبات** من السجلات.

---

## تحذير تشغيلي

غالبية المشاريع القوية تقف عند «اكتمال التقنية» بسبب:

* over-engineering،
* تأخير البيع،
* انتظار كمال غير ضروري للـ pilot.

الفوز: **system → decision → deal → money** بأصغر نطاق ممكن أولًا.

---

## الملحقات (مفعّلة — وثائق كاملة)

1. [`FIRST_THREE_CLIENTS_PLAN_AR.md`](FIRST_THREE_CLIENTS_PLAN_AR.md) — استهداف، رسائل، إيقاع أسبوع، إغلاق pilot.  
2. [`LIVE_DEPLOYMENT_GUIDE_AR.md`](LIVE_DEPLOYMENT_GUIDE_AR.md) — تركيب عند عميل، بيئة، بوابات، مراقبة.  
3. [`AUTOMATED_REVENUE_ENGINE_AR.md`](AUTOMATED_REVENUE_ENGINE_AR.md) — تدفق capture→qualify→outreach مع حدود قانونية وبوابة بشرية.

---

*هذا المستند عملي وتجاري؛ لا يستبدل الاستشارة القانونية أو عقود المبيعات.*
