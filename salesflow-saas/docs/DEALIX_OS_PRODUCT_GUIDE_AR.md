# دليل منتج Dealix OS — مسارات المستخدمين

يربط هذا الملف بين **واجهة الداشبورد**، **واجهات البرمجة**، والوثائق التفصيلية. للتكاملات والبيئة راجع [`INTEGRATION_MASTER_AR.md`](INTEGRATION_MASTER_AR.md) و[`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md).

## 1) لمن هذا المنتج؟

| الجمهور | المحور في الداشبورد | مرجع تقني |
|--------|----------------------|-----------|
| الإدارة والمالك | المنصة والحوكمة | [`strategic_deals` operating-model](API-MAP.md)، [`go-live-gate`](../backend/app/services/go_live_matrix.py) |
| فريق المبيعات | محرك المبيعات | Leads، Pipeline، Inbox، الوكلاء |
| المسوقون والشركاء | مركز المسوق + المسوقين والموظفين | [`/affiliates/program`](../backend/app/api/v1/affiliates.py)، قسم `marketer-hub` |
| الشراكات B2B | الشراكات الاستراتيجية | [`/strategic-deals`](API-MAP.md)، Partnership Studio |
| الاستراتيجية والنمو | النمو والاستراتيجية | Intelligence، Growth checklist، [`autonomous_core`](../backend/app/services/autonomous_core.py) |

## 2) الثلاثة أعمدة + الحوكمة

- **مبيعات:** اكتشاف، قمع، قنوات، إغلاق — مع موافقات عند الإرسال الحساس.
- **شراكات:** ملفات شركات، مطابقة، تفاوض، ربط اختياري بـ CRM (`lead_id` / `sales_deal_id` على الصفقة الاستراتيجية).
- **نمو:** ذكاء استراتيجي وقوائم مهام؛ الالتزامات القانونية والمالية الكبرى **بشرية**.
- **حوكمة:** أوضاع تشغيل (0–4)، [`policy/evaluate`](API-MAP.md)، سجلات وتكاملات.

مصدر نصي موحّد للرؤية: [`strategy/summary`](../backend/app/api/v1/strategy_summary.py) (`dealix_os_three_pillars`).

## 3) وثائق يجب أن يعرفها فريق التنفيذ

- خريطة الوكلاء: [`AGENT-MAP.md`](AGENT-MAP.md)
- نموذج البيانات: [`DATA-MODEL.md`](DATA-MODEL.md)
- مسار Enterprise: [`ENTERPRISE_ROADMAP.md`](ENTERPRISE_ROADMAP.md)
- مصفوفة تنافسية: [`COMPETITIVE_MATRIX_AR.md`](COMPETITIVE_MATRIX_AR.md)

## 4) فحص تناغم الفرونت مع الـ API

من جذر `salesflow-saas`:

```bash
py -3 scripts/verify_frontend_openapi_paths.py
```

يُنصح بتشغيله قبل الإصدار؛ راجع أيضاً بنود [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md).
