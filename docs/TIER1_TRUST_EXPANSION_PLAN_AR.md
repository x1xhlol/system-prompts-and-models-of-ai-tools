---
version: "1.0"
owner: "Platform + Governance"
status: "canonical"
review_cadence: "مع كل توسع لمسارات external أو موصلات جديدة"
last_updated: "2026-04-16"
related:
  - "governance/approval-policy.md"
  - "trust/ledger-vs-tool-verification.md"
  - "TIER1_PRODUCTION_ACTIVATION_PROGRAM_AR.md"
---

# Trust Expansion Plan (تغطية شاملة للثقة)

هدف البرنامج: أن تصبح المسارات الحساسة **policy-enforced** و**evidence-backed** بشكل يمكن تدقيقه، دون «تضخيم تعقيدي» يعطل التسليم.

> الأنظمة لا تفشل لغياب الذكاء فقط؛ تفشل بغياب **enforcement**، وتنفيذ ضعيف، أو ملاحظة ضعيفة. ([Seisan][2])

---

## المرحلة 1 — Endpoint Inventory

### الهدف

قائمة **شاملة** لمسارات HTTP المعروضة من التطبيق.

### أداة مقترحة (من جذر الريبو)

```bash
rg "@router\\.(get|post|put|delete|patch)" salesflow-saas/backend/app/api -n
```

(على Windows يمكن استخدام `rg` من [ripgrep](https://github.com/BurntSushi/ripgrep) أو بحث المحرّر بنفس النمط.)

### تصنيف أولي (مثال)

| النوع | معنى تشغيلي | مثال نمطي |
|--------|-------------|-----------|
| internal | قراءة/داخلية، أثر محدود | صحة، لوحات داخلية |
| external | أثر خارجي أو بيانات عميل | إرسال، توقيع، دفع |
| critical | أثر مالي/تنظيمي عالٍ | عروض حساسة، M&A عند التفعيل |

---

## المرحلة 2 — Classification (A / R / S)

لكل مسار **حساس**، عيّن وفق [`governance/approval-policy.md`](governance/approval-policy.md):

* `approval_class` (A0–A4 أو ما يعادلها في عقودكم)
* `reversibility` (R0–R3)
* `sensitivity` (S0–S3)

سجّل النتيجة في جدول (داخل الريبو أو أداة إدارة) مع **مالك** وتاريخ المراجعة.

---

## المرحلة 3 — Enforcement Layer

### مبدأ

على الحدود `external_*` (أو ما يعادلها في الكود):

* طلب موافقة / حزمة قرار حيث السياسة تقتضي.
* evidence pack حيث السياسة تقتضي.
* `correlation_id` / `trace_id` حيث السياسة تقتضي.

### في الكود اليوم

مرجع التنفيذ: [`decision_plane_contracts.py`](../salesflow-saas/backend/app/services/core_os/decision_plane_contracts.py) ومسارات [`approval_center.py`](../salesflow-saas/backend/app/api/v1/approval_center.py).

التوسيع = **تطبيق نفس الأنماط** على كل مسار صُنّف external/critical بعد المراجعة.

---

## المرحلة 4 — Tool Verification

### هدف

ربط نتيجة الأداة بما يُخزَّن في السجل/الدليل (حيث ينطبق [`trust/ledger-vs-tool-verification.md`](trust/ledger-vs-tool-verification.md)).

### حقول مفاهيمية (هدف تصميمي)

* `intended_action` / `actual_action` / `result` / `side_effects` / معرّف تكاملي (hash أو proof id) حيث تدعم المنصة.

---

## المرحلة 5 — Contradiction Engine (تغطية منطقية)

### مقارنات يجب أن تبقى قابلة للمراجعة

| المصدر | مقابل |
|--------|--------|
| memo / قرار | ما نُفِّذ فعليًا |
| نتيجة أداة | حالة DB أو سجل |
| موافقة | إجراء تم على المسار |

**API مرجعي:** `POST /api/v1/contradictions/` (مع evidence عند severity حرجة — انظر الاختبارات الحالية).

---

## المرحلة 6 — Coverage Test (هدف أتمتة)

### حالة الريبو

* اختبار شامّل باسم `test_trust_enforcement_all_routes.py` **غير موجود بعد** كـ«100% endpoints» — يُستهدف تدريجيًا (ابدأ بالمسارات `external_*` والمسار الذهبي).

### حتى ذلك الحين

* وسّع `pytest` على المسارات التي تلمس `external_*` والـ Class B (مثل [`test_proposals_saudi_send_validation.py`](../salesflow-saas/backend/tests/test_proposals_saudi_send_validation.py) و[`test_tier1_golden_path_partner.py`](../salesflow-saas/backend/tests/test_tier1_golden_path_partner.py)).

---

## المرحلة 7 — Policy Stress Test

سيناريوهات:

* محاولة override لسياسة.
* سياسة مفقودة أو role خاطئ.
* رمز منتهٍ / غير مصرّح.

المتوقع: **رفض واضح** + سجل تدقيق، لا سلوك صامت.

---

## المرحلة 8 — Audit Proof

لكل إجراء حرج يجب أن يبقى أثر يمكن تسليمه للتدقيق:

* سجل موافقة.
* evidence pack (أو مرجع pack id).
* trace / correlation.
* إيصال أداة حيث ينطبق.

---

## الخلاصة التنفيذية

هذا التوسع يكمّل قوائم جاهزية الإنتاج القياسية (اختبار، أمن، تدرج، استرجاع) عندما تُطبَّق على **حدود الثقة** لا على الواجهات فقط. ([TechTarget][1])

1. Golden path run (حسب الـ runbook).
2. Chaos على الحالات الحرجة.
3. Executive validation.
4. توسع Trust مسارًا مسارًا (جدول + A/R/S + enforcement).
5. Canary ثم full rollout مع rollback جاهز.

**توسيع لاحق (اختياري):** أتمتة PR (رفض تلقائي عند مخالفة governance)، أو **Full Backend Hardening** (DB، تخزين مؤقت، طوابير، توسع أفقي) — يُفضّل مشروع منفصل بحدود زمنية ونطاق واضحين.

---

## المراجع

[1]: https://www.techtarget.com/searchsoftwarequality/tip/A-production-readiness-checklist-for-software-development "A production readiness checklist for software development | TechTarget"  
[2]: https://seisan.com/enterprise-app-readiness/ "Enterprise App Readiness | Seisan"
