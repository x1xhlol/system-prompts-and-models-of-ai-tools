---
version: "1.0"
owner: "Founder + Sales + Release"
status: "canonical"
review_cadence: "يوميًا خلال الأسبوع 3"
last_updated: "2026-04-17"
related:
  - "FIRST_THREE_CLIENTS_PLAN_AR.md"
  - "LIVE_DEPLOYMENT_GUIDE_AR.md"
  - "RELEASE_READINESS_MATRIX_AR.md"
---

# GTM Week 3 — First Paid Close + Pilot Deploy Prep

هذا الملف ينفّذ To-do الأسبوع 3: إغلاق أول عميل مدفوع وتجهيز خطة نشر العميل الأول.

## الهدف الأسبوعي (Gate)

- إغلاق صفقة مدفوعة واحدة على الأقل (دفعة/توقيع).
- Runbook نشر للعميل الأول جاهز وموقع داخليًا.
- readiness check قبل Go-Live للعميل.

## قائمة الإغلاق التجاري

- [ ] تحديد صاحب القرار النهائي وتاريخ قرار.
- [ ] تثبيت السعر والنطاق ومدة pilot.
- [ ] توثيق KPI النجاح المتفق عليها.
- [ ] تأكيد طريقة الدفع والموعد.
- [ ] توقيع نطاق/اتفاق pilot.

## قائمة ما قبل النشر (عميل 1)

- [ ] `.env` وموصلات القناة حسب [LIVE_DEPLOYMENT_GUIDE_AR.md](LIVE_DEPLOYMENT_GUIDE_AR.md).
- [ ] `go-live-gate` مفهوم (PASS أو أسباب الحظر وخطة المعالجة).
- [ ] handoff owner محدد.
- [ ] rollback خطوة بخطوة موثقة.

## Exit Criteria

- `paid_customers >= 1`
- deployment_plan للعميل الأول مكتوب ومراجع.
- تاريخ تشغيل Pilot مؤكد.
