# فهرس مصدر الحقيقة (Canonical vs Shadow)

**الغرض:** تقليل **ازدواجية** المسارات بين `docs/` جذر الريبو و[`salesflow-saas/docs/`](../salesflow-saas/docs/) عبر جدول صريح: أي موضوع يُعتبر **canonical**، وأين تبقى نسخ **legacy / shadow** للمرجع فقط.

| الموضوع | Canonical (مصدر الحقيقة) | Shadow / legacy | المالك | دورة المراجعة |
|---------|---------------------------|-----------------|--------|----------------|
| دستور التشغيل للوكلاء | [`MASTER_OPERATING_PROMPT.md`](../MASTER_OPERATING_PROMPT.md) | [`AGENTS.md`](../AGENTS.md)، [`CLAUDE.md`](../CLAUDE.md) (ملخصات) | Architect | عند تغيير حوكمة رئيسية |
| إغلاق Tier-1 (عربي) | [`TIER1_MASTER_CLOSURE_CHECKLIST_AR.md`](TIER1_MASTER_CLOSURE_CHECKLIST_AR.md) | — | Program | كل أسبوعين مع السجل |
| إغلاق Tier-1 (50 بندًا EN) | [`salesflow-saas/docs/tier1-master-closure-checklist.md`](../salesflow-saas/docs/tier1-master-closure-checklist.md) | — | Program | مع PR إغلاق |
| سجل الأنظمة الفرعية | [`architecture-register.md`](architecture-register.md) | تكرار حالة في checklists طالما عمود واحد للحالة | Platform | أسبوعيًا |
| مصفوفة التنفيذ | [`adr/0002-execution-matrix-canonical-source.md`](adr/0002-execution-matrix-canonical-source.md) + الملف الذي يحدده الـ ADR | نسخ قديمة بأسماء متعددة إن وُجدت | PMO | عند إعادة تسمية المصفوفة |
| حوكمة الموصلات / Data plane | [`governance/connectors-and-data-plane.md`](governance/connectors-and-data-plane.md) | [`ws5-connector-events-metrics.md`](ws5-connector-events-metrics.md) (تفاصيل WS5) | Integrations | مع كل موصل جديد |
| أحداث وعقود | [`governance/events-and-schema.md`](governance/events-and-schema.md) | حقول **CloudEvents** الخارجية — انظر الملحق أدناه | Platform | عند تغيير الحدث |
| جاهزية الإصدار (RC) | [`RELEASE_READINESS_MATRIX_AR.md`](RELEASE_READINESS_MATRIX_AR.md) | — | Release | كل RC |

## ملحق: مراجع خارجية (تجمع هنا لتقليل rot)

انظر [`references/tier1-external-index.md`](references/tier1-external-index.md).
