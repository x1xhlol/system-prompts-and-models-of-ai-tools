# فهرس مصدر الحقيقة (Canonical vs Shadow)

**الغرض:** تقليل **ازدواجية** المسارات بين `docs/` جذر الريبو و[`salesflow-saas/docs/`](../salesflow-saas/docs/) عبر جدول صريح: أي موضوع يُعتبر **canonical**، وأين تبقى نسخ **legacy / shadow** للمرجع فقط.

| الموضوع | Canonical (مصدر الحقيقة) | Shadow / legacy | المالك | دورة المراجعة |
|---------|---------------------------|-----------------|--------|----------------|
| دستور التشغيل للوكلاء | [`MASTER_OPERATING_PROMPT.md`](../MASTER_OPERATING_PROMPT.md) | [`AGENTS.md`](../AGENTS.md)، [`CLAUDE.md`](../CLAUDE.md) (ملخصات) | Architect | عند تغيير حوكمة رئيسية |
| إغلاق Tier-1 (عربي) | [`TIER1_MASTER_CLOSURE_CHECKLIST_AR.md`](TIER1_MASTER_CLOSURE_CHECKLIST_AR.md) | — | Program | كل أسبوعين مع السجل |
| برنامج الإغلاق التشغيلي النهائي (AR) | [`FINAL_TIER1_CLOSURE_PROGRAM_AR.md`](FINAL_TIER1_CLOSURE_PROGRAM_AR.md) | — | Program + Architect | عند تغيير معايير Tier-1 أو أدوات الموردين |
| التحقق من إغلاق Tier-1 وما بعد الإغلاق (AR) | [`TIER1_CLOSURE_VERIFICATION_POSTCLOSURE_AR.md`](TIER1_CLOSURE_VERIFICATION_POSTCLOSURE_AR.md) | — | Program + Architect | مع تحديث بوابات الإصدار أو اختبارات الإغلاق الستة |
| تفعيل الإنتاج Tier-1 (AR) | [`TIER1_PRODUCTION_ACTIVATION_PROGRAM_AR.md`](TIER1_PRODUCTION_ACTIVATION_PROGRAM_AR.md) | — | Program + Architect | بعد كل canary أو توسع Trust على endpoints حساسة |
| Playbook إنتاج حقيقي (AR) | [`TIER1_REAL_PRODUCTION_PLAYBOOK_AR.md`](TIER1_REAL_PRODUCTION_PLAYBOOK_AR.md) | — | Program + Release | قبل كل RC / canary |
| توسع الثقة على المسارات (AR) | [`TIER1_TRUST_EXPANSION_PLAN_AR.md`](TIER1_TRUST_EXPANSION_PLAN_AR.md) | — | Platform + Governance | مع كل مسار external جديد أو مراجعة A/R/S |
| تفعيل إيراد Go-Live (AR) | [`GO_LIVE_REVENUE_ACTIVATION_SYSTEM_AR.md`](GO_LIVE_REVENUE_ACTIVATION_SYSTEM_AR.md) | — | Founder + Program | أسبوعيًا حتى أول عميل مدفوع ثم مع كل pilot |
| أول 3 عملاء B2B (AR) | [`FIRST_THREE_CLIENTS_PLAN_AR.md`](FIRST_THREE_CLIENTS_PLAN_AR.md) | — | Founder + Sales | أسبوعيًا حتى 3 pilots موقّعة |
| دليل النشر الحي عند عميل (AR) | [`LIVE_DEPLOYMENT_GUIDE_AR.md`](LIVE_DEPLOYMENT_GUIDE_AR.md) | — | Platform + Release | مع كل pilot أو تغيير بيئة |
| محرك إيراد آلي — حدود وتشغيل (AR) | [`AUTOMATED_REVENUE_ENGINE_AR.md`](AUTOMATED_REVENUE_ENGINE_AR.md) | — | Growth + Platform | عند تغيير سياسة outreach أو قناة inbound |
| تنفيذ GTM أسبوع 1 (AR) | [`GTM_W1_PIPELINE_OUTREACH_EXECUTION_AR.md`](GTM_W1_PIPELINE_OUTREACH_EXECUTION_AR.md) | — | Founder + Sales | يوميًا خلال الأسبوع 1 |
| تنفيذ GTM أسبوع 2 (AR) | [`GTM_W2_DEMO_PROPOSAL_ENGINE_AR.md`](GTM_W2_DEMO_PROPOSAL_ENGINE_AR.md) | — | Founder + Sales + Product | يوميًا خلال الأسبوع 2 |
| تنفيذ GTM أسبوع 3 (AR) | [`GTM_W3_FIRST_PAID_CLOSE_AR.md`](GTM_W3_FIRST_PAID_CLOSE_AR.md) | — | Founder + Sales + Release | يوميًا خلال الأسبوع 3 |
| تنفيذ GTM أسبوع 4 (AR) | [`GTM_W4_PILOT_EVIDENCE_LOOP_AR.md`](GTM_W4_PILOT_EVIDENCE_LOOP_AR.md) | — | Program + Product + Sales | مرتين أسبوعيًا خلال الأسبوع 4 |
| إيقاع GTM + KPI (AR) | [`GTM_GOVERNANCE_KPI_RHYTHM_AR.md`](GTM_GOVERNANCE_KPI_RHYTHM_AR.md) | — | Founder + Program | يومي + أسبوعي خلال 30 يوم |
| إغلاق Tier-1 (50 بندًا EN) | [`salesflow-saas/docs/tier1-master-closure-checklist.md`](../salesflow-saas/docs/tier1-master-closure-checklist.md) | — | Program | مع PR إغلاق |
| سجل الأنظمة الفرعية | [`architecture-register.md`](architecture-register.md) | تكرار حالة في checklists طالما عمود واحد للحالة | Platform | أسبوعيًا |
| مصفوفة التنفيذ | [`adr/0002-execution-matrix-canonical-source.md`](adr/0002-execution-matrix-canonical-source.md) + الملف الذي يحدده الـ ADR | نسخ قديمة بأسماء متعددة إن وُجدت | PMO | عند إعادة تسمية المصفوفة |
| حوكمة الموصلات / Data plane | [`governance/connectors-and-data-plane.md`](governance/connectors-and-data-plane.md) | [`ws5-connector-events-metrics.md`](ws5-connector-events-metrics.md) (تفاصيل WS5) | Integrations | مع كل موصل جديد |
| أحداث وعقود | [`governance/events-and-schema.md`](governance/events-and-schema.md) | حقول **CloudEvents** الخارجية — انظر الملحق أدناه | Platform | عند تغيير الحدث |
| جاهزية الإصدار (RC) | [`RELEASE_READINESS_MATRIX_AR.md`](RELEASE_READINESS_MATRIX_AR.md) | — | Release | كل RC |
| مسار ذهبي Tier-1 (Partner → Exec) | [`golden-path-partner-intake-runbook.md`](golden-path-partner-intake-runbook.md) | تفاصيل إضافية في `salesflow-saas/docs/governance/*` عند الحاجة | Program | مع كل تغيير في مسار Class B |
| دمج [PR #16](https://github.com/VoXc2/system-prompts-and-models-of-ai-tools/pull/16) (فرع `claude/dealix-tier1-completion-*`) | [`PR16_MERGE_RECONCILE_CHECKLIST.md`](PR16_MERGE_RECONCILE_CHECKLIST.md) + بعد الدمج: **`MASTER_OPERATING_PROMPT` مصدر واحد** | الملفات المكررة داخل `salesflow-saas/` قبل الدمج = **Shadow** مؤقت | Release Captain | لمرة واحدة عند merge |

## ملحق: مراجع خارجية (تجمع هنا لتقليل rot)

انظر [`references/tier1-external-index.md`](references/tier1-external-index.md).
