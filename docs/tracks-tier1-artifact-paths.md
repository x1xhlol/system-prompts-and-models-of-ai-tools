# مسارات artifact حيّة — Revenue / Partnership / M&A / Expansion (Tier-1)

**قاعدة:** لكل track مسار **واحد** يُوسَّع تدريجيًا (schema → API/worker → اختبار). لا تفتح عشرات المسارات دون أدلة.

| Track | Artifact الأول | Schema / memo | كود أساسي | اختبار / دليل |
|-------|-----------------|---------------|-----------|-----------------|
| **Revenue OS** | Lead score / qualification | [`structured_outputs.py`](../salesflow-saas/backend/app/schemas/structured_outputs.py) (`LeadScoreCard`, `QualificationMemo`) | [`services/agents/`](../salesflow-saas/backend/app/services/agents/) | pytest واجهات ذات صلة |
| **Partnership OS** | Partner dossier | نفس الملف (`PartnerDossier`) | [`partnership_scout.py`](../salesflow-saas/backend/app/services/strategic_deals/partnership_scout.py) | تكامل عند توفر بيانات |
| **M&A / CorpDev** | Target profile / DD plan | `TargetProfile`, `DDPlan` | [`strategic_deals/`](../salesflow-saas/backend/app/services/strategic_deals/) | HITL من [`Execution_Matrix.md`](../Execution_Matrix.md) |
| **Expansion** | Expansion plan | `ExpansionPlan` | [`strategic_simulator.py`](../salesflow-saas/backend/app/services/strategic_deals/strategic_simulator.py) (إن وُجد) أو وثائق GTM | وثيقة + API لاحقًا |
| **PMI** | PMI program plan | `PMIProgramPlan` | [`strategic_pmo.py`](../salesflow-saas/backend/app/services/strategic_deals/strategic_pmo.py) | قالب ثم توليد |

**بوابات الهيمنة:** التزام schema على مسار Class B (`approval-center` bundle)؛ مقاييس الأعمال من [`semantic-metrics-dictionary.md`](semantic-metrics-dictionary.md) فقط في لوحات جديدة.

**إيراد وتشغيل (بعد Tier-1):** [`GO_LIVE_REVENUE_ACTIVATION_SYSTEM_AR.md`](GO_LIVE_REVENUE_ACTIVATION_SYSTEM_AR.md) + [`FIRST_THREE_CLIENTS_PLAN_AR.md`](FIRST_THREE_CLIENTS_PLAN_AR.md) + [`LIVE_DEPLOYMENT_GUIDE_AR.md`](LIVE_DEPLOYMENT_GUIDE_AR.md) + [`AUTOMATED_REVENUE_ENGINE_AR.md`](AUTOMATED_REVENUE_ENGINE_AR.md).

**تنفيذ 30 يوم (GTM):** [`GTM_W1_PIPELINE_OUTREACH_EXECUTION_AR.md`](GTM_W1_PIPELINE_OUTREACH_EXECUTION_AR.md) + [`GTM_W2_DEMO_PROPOSAL_ENGINE_AR.md`](GTM_W2_DEMO_PROPOSAL_ENGINE_AR.md) + [`GTM_W3_FIRST_PAID_CLOSE_AR.md`](GTM_W3_FIRST_PAID_CLOSE_AR.md) + [`GTM_W4_PILOT_EVIDENCE_LOOP_AR.md`](GTM_W4_PILOT_EVIDENCE_LOOP_AR.md) + [`GTM_GOVERNANCE_KPI_RHYTHM_AR.md`](GTM_GOVERNANCE_KPI_RHYTHM_AR.md).
