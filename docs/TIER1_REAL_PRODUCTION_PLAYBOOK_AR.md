---
version: "1.0"
owner: "Program + Release"
status: "canonical"
review_cadence: "قبل كل RC أو بعد كل canary"
last_updated: "2026-04-16"
related:
  - "golden-path-partner-intake-runbook.md"
  - "TIER1_PRODUCTION_ACTIVATION_PROGRAM_AR.md"
  - "RELEASE_READINESS_MATRIX_AR.md"
---

# Real Production Playbook (من التحقق إلى إطلاق)

Playbook تنفيذي **ساعة بساعة (كمقاطع عمل)** من حالة «Verified» إلى **إطلاق مدعوم بأدلة**، مع الاعتماد على ممارسات جاهزية الإنتاج (اختبار، أداء، أمن، تدرج، استرجاع). ([TechTarget][1])

**مرجع المسار الفعلي في الكود:** [`golden-path-partner-intake-runbook.md`](golden-path-partner-intake-runbook.md) — أي خطوة هنا تتبع نفس التسلسل حيث ينطبق.

---

## Phase 0 — Preflight (30–60 دقيقة)

### الهدف

التأكد أن البيئة **قابلة للتشغيل** قبل أي «تشغيل حي» طويل.

### أوامر (من جذر الريبو)

```bash
python scripts/architecture_brief.py
python scripts/check_docs_links.py
```

### أوامر الاختبار (من `salesflow-saas/backend`)

```bash
cd salesflow-saas/backend
python -m pytest tests -q
```

### Exit

* كل ما سبق **PASS**؛ أي فشل → **أوقف** ولا تكمل المراحل التالية حتى الإصلاح.

---

## Phase 1 — Golden Path Run (أول تشغيل حي)

### الهدف

تشغيل **المسار الذهبي** كما هو موثّق في الـ API الحالي (v1 demo-backed حيث ينطبق).

### تسلسل HTTP (انظر الـ runbook للتفاصيل والأجسام)

| الخطوة | الطلب |
|--------|--------|
| 1 | `GET /api/v1/approval-center/class-b-decision-bundle` |
| 2 | `POST /api/v1/approval-center/validate-class-b-bundle` (body = ناتج 1) |
| 3 | `POST /api/v1/approval-center/{approval_id}/approve` مع `hitl` + `decision_bundle` |
| 4 | `GET /api/v1/executive-room/snapshot` |
| 5 | `GET /api/v1/evidence-packs/tier1-demo` |
| 6 | `GET /api/v1/connectors/governance` |
| 7 | `POST /api/v1/proposals/{id}/send` (مسار سعودي حساس عند `external_company_contacts`) |

### مخرجات متوقعة (مستوى العقود)

* حزمة Class B تمر `validate` مع `correlation_id` سليم.
* `tier1_exec_surface` يطابق `ExecWeeklyGovernanceContract` (حقول `changes_summary`, `pending_decisions`, `provenance.trace_id`, …).
* Evidence وconnector governance يعيدان حقولًا مهيكلة وليس نصًا حرًا فقط.

### Exit

* **لا** تعديل يدوي على JSON لتجاوز الفشل.
* **لا** حقول ناقطة حرجة في المسار المختبر.
* **لا** bypass للموافقة حيث السياسة تفرض الحزمة.

> ملاحظة: مسارات مثل `POST /api/v1/partners/intake` **ليست** جزءًا من المسار الذهبي الموثّق اليوم؛ أي توسيع لاحق يحدّث الـ runbook أولًا ثم هذا الـ Playbook.

---

## Phase 2 — Trace + Evidence Validation

### الهدف

التأكد أن **التتبع والأدلة** متصلان بالقرار.

### تحقق يدوي / عبر اختبار

* `execution_intent_json.correlation_id` موجود وغير فارغ للمسارات الخارجية.
* `provenance.trace_id` في `ExecWeeklyGovernanceContract` يطابق مسار الـ bundle عند الـ demo.
* فشل متعمد (مثلاً `correlation_id` فارغ مع `external_*`) → **422** كما في الـ runbook.

### أتمتة

```bash
cd salesflow-saas/backend
python -m pytest tests/test_tier1_golden_path_partner.py -q
```

---

## Phase 3 — Chaos Test (كسر النظام)

### الهدف

إثبات السلوك عند **غير المسار السعيد**.

| الحالة | المتوقع (مبدأيًا) |
|--------|---------------------|
| بدون موافقة / bundle غير صالح | رفض (`422` / 4xx حسب المسار) |
| Evidence ناقص حيث يلزم | فشل صريح |
| فشل موصل | إعادة محاولة / تنبيه (حسب تنفيذ الموصل) |
| تكرار طلب بنفس المفتاح | سلوك idempotent حيث عُرّف |
| timeout في workflow طويل | استئناف / checkpoint (LangGraph حيث ينطبق) |

> فشل الإنتاج غالبًا من **حالات الحافة** لا من المسار السعيد وحده. ([TechTarget][1])

---

## Phase 4 — Production Simulation

### الهدف

ضغط خفيف على بيئة **شبيهة بالإنتاج**.

### أنشطة

* محاذاة إعدادات staging مع prod (متغيرات، حدود، flags).
* اختبار حمل **محدود** (10–50 مستخدمًا متزامنًا أو ما يعادله) على المسارات الحرجة فقط.

### تحقق

* زمن استجابة ضمن هدف الفريق.
* لا انهيار عملية؛ سجلات واضحة؛ تتبع (traces) عند التفعيل.
* قنوات تنبيه للأخطاء الحرجة.

---

## Phase 5 — Executive Test

### الطلب

`GET /api/v1/executive-room/snapshot`

### تحقق

* حقول العقد الأسبوعي ظاهرة للقارئ التنفيذي: `changes_summary`, `pending_decisions`, `blockers_summary`, `at_risk_items`, `next_best_actions`.

### سؤال قرار

هل يمكن لصاحب قرار أن **يعتمد** ما يُعرض بدون شرح تقني طويل؟

---

## Phase 6 — Release Candidate

### فروع ووسوم

* فرع إصدار (مثال): `release/tier1-…` حسب اتفاق الفريق.
* على PR: تسمية **`release-candidate`** حيث تُفعّل السياسة.

### CI صارم للمصفوفة

```bash
RELEASE_MATRIX_RC_ROW_REQUIRED=1 python scripts/check_release_readiness_matrix.py
```

(يُشغّل تلقائيًا عبر [`.github/workflows/release-readiness-rc-gate.yml`](../.github/workflows/release-readiness-rc-gate.yml) عند الشروط الموثّقة في [`governance/github-and-release.md`](governance/github-and-release.md).)

---

## Phase 7 — Canary Release

* توجيه **5–10%** من الحركة (أو tenants canary) نحو الإصدار الجديد.
* مراقبة: أخطاء، زمن، SLA موافقات، طابور تعارضات إن وُجد.

---

## Phase 8 — Full Production

* عند استقرار المؤشرات: توسيع التدرج إلى **100%** مع بقاء خطة **rollback** جاهزة.

---

## المراجع

[1]: https://www.techtarget.com/searchsoftwarequality/tip/A-production-readiness-checklist-for-software-development "A production readiness checklist for software development | TechTarget"
