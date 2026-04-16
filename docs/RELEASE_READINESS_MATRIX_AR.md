# مصفوفة جاهزية الإصدار (Tier-1) — Release Readiness Matrix

**الغرض:** صف واحد (أو صف أسبوعي) لكل **مرشح إصدار (RC)** يربط الأبعاد التشغيلية بالدليل والمالك.  
**مرجع:** [`enterprise-readiness.md`](enterprise-readiness.md)، [`TIER1_MASTER_CLOSURE_CHECKLIST_AR.md`](TIER1_MASTER_CLOSURE_CHECKLIST_AR.md)، [`governance/pdpl-nca-ai-control-matrices.md`](governance/pdpl-nca-ai-control-matrices.md) (بوابة enterprise).

## قالب الجدول (انسخ صفًا لكل RC)

| البُعد | الحالة | الدليل | المالك |
|--------|--------|--------|--------|
| **docs truth** (مصدر واحد) | | [`SOURCE_OF_TRUTH_INDEX.md`](SOURCE_OF_TRUTH_INDEX.md) + CI `docs-governance` | Tech Writer |
| **schema adherence** (Pydantic / عقود) | | `pytest` على `schemas` + مسارات Class B | Backend |
| **approval SLA** (Class B) | | طوابير / API موافقات + سجلات | Governance |
| **contradiction backlog** (ledger) | | [`trust/ledger-vs-tool-verification.md`](trust/ledger-vs-tool-verification.md) | Trust |
| **connector health** (واجهات) | | [`ws5-connector-events-metrics.md`](ws5-connector-events-metrics.md) | Integrations |
| **security checklist** | | `verify-launch` + [`LAUNCH_CHECKLIST.md`](../salesflow-saas/docs/LAUNCH_CHECKLIST.md) | Security |
| **Saudi controls** (PDPL/NCA/AI) | | [`governance/pdpl-nca-ai-control-matrices.md`](governance/pdpl-nca-ai-control-matrices.md) | Compliance |
| **provenance** (commit SHA / build) | | Git tag + artifact CI | Release |

**حالات مقترحة للعمود «الحالة»:** `OK` | `Risk` | `Blocked` — مع أعلى [`operational-severity-model.md`](governance/operational-severity-model.md) مفتوحة في الملاحظات.

## بوابة جودة البيانات (Great Expectations)

عند تفعيل GE: اربط **checkpoint** ناجحًا بصف «schema adherence» أو صف فرعي «data quality»؛ لا تعتبر GE مجرد ملحق Data plane — انظر [`ws5-connector-events-metrics.md`](ws5-connector-events-metrics.md).
