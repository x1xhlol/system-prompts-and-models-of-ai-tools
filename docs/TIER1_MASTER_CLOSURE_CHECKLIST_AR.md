# قائمة إغلاق Tier-1 الرئيسية (مرجع عربي مربوط بالريبو)

**الغرض:** ترجمة منطق الإغلاق إلى **أقسام قابلة للتتبع** مع أعمدة **الحالة / الدليل / المالك / معيار الخروج**.  
**قائمة إنجليزية تفصيلية (50 بندًا):** [`salesflow-saas/docs/tier1-master-closure-checklist.md`](../salesflow-saas/docs/tier1-master-closure-checklist.md)  
**سجل الأنظمة الفرعية:** [`architecture-register.md`](architecture-register.md)  
**برنامج الإكمال (WS1–WS8):** [`completion-program-workstreams.md`](completion-program-workstreams.md)

**حالات الحقل:** `NotStarted` | `DocOnly` | `Pilot` | `Production` — لا تُرفَع إلى Production بدون اختبار + PR/دليل.

---

## §0 قاعدة الحكم

| # | البند | الحالة | الدليل في الريبو | المالك (تعيين عند التشغيل) | معيار الخروج |
|---|--------|--------|-------------------|----------------------------|---------------|
| 0.1 | كل بند له مالك ومعيار خروج وقياس | DocOnly | هذا الملف + السجل | Program | صف مكتمل في السجل |
| 0.2 | مكان واحد لحالة كل subsystem | Pilot | [`architecture-register.md`](architecture-register.md) | Platform | لا تضارب مع `tier1-master-closure-checklist` |

---

## §1 الدستور التشغيلي و Truth Lock

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 1.1 | دستور تشغيلي واحد | Production | [`MASTER_OPERATING_PROMPT.md`](../MASTER_OPERATING_PROMPT.md) | Architect | لا وثيقة متعارضة فوقه |
| 1.2 | سجل Current vs Target | Production | [`salesflow-saas/docs/current-vs-target-register.md`](../salesflow-saas/docs/current-vs-target-register.md) + السجل | Platform | جداول صريحة |
| 1.3 | تدقيق عدم المبالغة | DocOnly | [`salesflow-saas/docs/governance/document-consistency-audit.md`](../salesflow-saas/docs/governance/document-consistency-audit.md) | PMO | لا ادّعاء Prod بلا كود |
| 1.4 | قاموس مصطلحات | DocOnly | [`glossary-dealix-planes-tracks.md`](glossary-dealix-planes-tracks.md) | Product Ops | Planes/Tracks موحّدة |

---

## §2 سلامة الريبو والأوامر (Root-safe)

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 2.0 | **أول خطوة:** `cwd` = جذر الريبو (مسار المستودع الذي يحتوي `scripts/` و`docs/`) قبل أي أمر أو سكربت | Pilot | هذا القسم + [`scripts/architecture_brief.py`](../scripts/architecture_brief.py) | DevEx | لا تشغيل من مجلدات فرعية بلا `PYTHONPATH`/مسارات صريحة |
| 2.1 | أوامر من جذر الريبو | Pilot | [`scripts/architecture_brief.py`](../scripts/architecture_brief.py) + CI | DevEx | `architecture_brief` في CI (`docs-governance`) |
| 2.2 | توافق أوامر Cursor/Claude | DocOnly | [`.cursor/commands/`](../.cursor/commands/) + [`CLAUDE.md`](../CLAUDE.md) | AI Platform | جدول تطابق في [`governance/discovery-and-output-checklist.md`](governance/discovery-and-output-checklist.md) |
| 2.3 | Hook اختياري pre-push للفرع الحساس | DocOnly | [`.githooks/README.md`](../.githooks/README.md) | DevEx | **مصدر الحقيقة = CI**؛ الـ hook تكميلي فقط |

---

## §3 إغلاق التوثيق

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 3.1 | فهرس الحوكمة | Production | [`governance/README.md`](governance/README.md) | Tech Writer | كل مدخل له مسار |
| 3.2 | مخطط رئيسي | Production | [`blueprint-master-architecture.md`](blueprint-master-architecture.md) | Architect | يشير للقائمة هنا |
| 3.3 | مراجعة روابط | DocOnly | audit في `document-consistency-audit` | PMO | 100% روابط أساسية |

---

## §4 طائرة القرار

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 4.1 | مخططات منظمة (17 نوعًا) | Production | [`salesflow-saas/backend/app/schemas/structured_outputs.py`](../salesflow-saas/backend/app/schemas/structured_outputs.py) | AI Lead | Pydantic يمر |
| 4.2 | حزمة قرار موحّدة | Production | [`decision_plane_contracts.py`](../salesflow-saas/backend/app/services/core_os/decision_plane_contracts.py) | Backend | مفاتيح bundle كاملة |
| 4.3 | فرض مسار Class B + **correlation لـ external** | Pilot | `GET /api/v1/approval-center/class-b-decision-bundle` + `validate_class_b_bundle` | AI Lead | `external_*` بدون `correlation_id` = رفض؛ راجع [`approval-policy.md`](governance/approval-policy.md) |

---

## §5 طائرة التنفيذ

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 5.1 | جرد workflows | Pilot | [`workflows-inventory.md`](workflows-inventory.md) + [`salesflow-saas/docs/governance/workflow-inventory.md`](../salesflow-saas/docs/governance/workflow-inventory.md) | Workflow | أعمدة idempotency/compensation |
| 5.2 | pilot دائم | DocOnly | [`temporal-pilot-scope.md`](temporal-pilot-scope.md) + [`adr/0001-tier1-execution-policy-spikes.md`](adr/0001-tier1-execution-policy-spikes.md) | Platform | ADR بوابة |

---

## §6 طائرة الثقة

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 6.1 | سجل تحقق أدوات | Partial | [`verification_ledger.py`](../salesflow-saas/backend/app/services/core_os/verification_ledger.py) | Trust | اختبار contradiction |
| 6.2 | تلميحات تناقض أخرى | Partial | [`tool_verification.py`](../salesflow-saas/backend/app/services/tool_verification.py) | Trust | خريطة في [`trust/ledger-vs-tool-verification.md`](trust/ledger-vs-tool-verification.md) |
| 6.3 | مركز موافقات API | Pilot | [`approval_center.py`](../salesflow-saas/backend/app/api/v1/approval_center.py) | Governance | قائمة + bundle |
| 6.4 | سياسة خارج الـ prompt | Partial | [`policy_engine.py`](../salesflow-saas/backend/app/services/dealix_os/policy_engine.py) | Security | + [`trust-fabric.md`](governance/trust-fabric.md) |

---

## §7 البيانات والموصلات

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 7.1 | قاموس مقاييس | Pilot | [`semantic-metrics-dictionary.md`](semantic-metrics-dictionary.md) | Data | Owner لكل مفتاح |
| 7.2 | واجهة موصل | DocOnly | [`ws5-connector-events-metrics.md`](ws5-connector-events-metrics.md) | Integrations | عقد موحّد |
| 7.3 | حوكمة موصلات API | Pilot | [`connector_governance.py`](../salesflow-saas/backend/app/api/v1/connector_governance.py) | Integrations | `GET` يعمل |

---

## §8 طائرة التشغيل والتسليم

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 8.1 | قائمة تسليم GitHub/OIDC | DocOnly | [`github-enterprise-delivery-completion.md`](github-enterprise-delivery-completion.md) | DevOps | rulesets موثّقة |
| 8.2 | CI يغطي التطبيق | Production | [`.github/workflows/dealix-ci.yml`](../.github/workflows/dealix-ci.yml) | Platform | pytest + frontend |
| 8.3 | CI حوكمة الوثائق (P0) | Pilot | [`.github/workflows/docs-governance.yml`](../.github/workflows/docs-governance.yml) | DevEx | `architecture_brief` + `check_docs_links` |

---

## §9 Revenue OS

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 9.1 | مخطط مخرجات تسويق/عروض | Production | `structured_outputs` (LeadScoreCard، ProposalPack، …) | Revenue | ربط API واحد حي |
| 9.2 | تدفق leads | Partial | [`agents/`](../salesflow-saas/backend/app/services/agents/) | Revenue | مسار في [`tracks-tier1-artifact-paths.md`](tracks-tier1-artifact-paths.md) |

---

## §10 Partnership OS

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 10.1 | دورة حياة شراكة | DocOnly | [`salesflow-saas/docs/governance/partnership-os.md`](../salesflow-saas/docs/governance/partnership-os.md) | Partnerships | + [`partnership_scout.py`](../salesflow-saas/backend/app/services/strategic_deals/partnership_scout.py) |

---

## §11 CorpDev / M&A

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 11.1 | مسار استراتيجي | Partial | [`strategic_deals/`](../salesflow-saas/backend/app/services/strategic_deals/) + [`ma-os.md`](../salesflow-saas/docs/governance/ma-os.md) | CorpDev | مسار artifact في tracks doc |

---

## §12 التوسّع و PMI

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 12.1 | PMI / توسّع | DocOnly | [`pmi-os.md`](../salesflow-saas/docs/governance/pmi-os.md) + [`expansion-os.md`](../salesflow-saas/docs/governance/expansion-os.md) | PMO | + [`strategic_pmo.py`](../salesflow-saas/backend/app/services/strategic_deals/strategic_pmo.py) |

---

## §13 التنفيذي والسوق

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 13.1 | غرفة تنفيذية | Pilot | [`executive_room.py`](../salesflow-saas/backend/app/api/v1/executive_room.py) + مكوّنات `dealix/*` | Product | لقطة API |
| 13.2 | مواصفات الإكمال | DocOnly | [`executive-room-completion-spec.md`](executive-room-completion-spec.md) | Product | مراحل واضحة |

---

## §14 السعودية / الخليج

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 14.1 | مصفوفات تحكم | Pilot | [`pdpl-nca-ai-control-matrices.md`](governance/pdpl-nca-ai-control-matrices.md) | Compliance | مربوطة بإصدار |
| 14.2 | جاهزية مؤسسية | DocOnly | [`saudi-enterprise-readiness.md`](../salesflow-saas/docs/governance/saudi-enterprise-readiness.md) | Legal/Eng | checklist إصدار |

---

## §15 بوابات الهيمنة (Dominance)

| # | البند | الحالة | الدليل في الريبو | المالك | معيار الخروج |
|---|--------|--------|-------------------|--------|---------------|
| 15.1 | التزام مخطط على مسار حرج | Pilot | اختبار `test_approval_center_class_b_bundle.py` | AI Lead | 200 + bundle keys |
| 15.2 | مقاييس تغليف / سوق | DocOnly | [`market-dominance-plan.md`](../salesflow-saas/docs/governance/market-dominance-plan.md) | GTM | مراجعة ربع سنوية |

---

*آخر تحديث: يُحدَّث مع كل إصدار يغيّر الحوكمة أو مسارات Class B.*
