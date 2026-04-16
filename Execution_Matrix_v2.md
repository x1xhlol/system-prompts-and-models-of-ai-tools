# Dealix Sovereign Growth OS: Master Execution Matrix v2.0

> **DRAFT — non-canonical until merged.** The authoritative agent matrix for numbering, cross-repo links, and Phase 0–1 planning is **[`Execution_Matrix.md`](Execution_Matrix.md)**. This v2 document captures **proposed** enhancements (e.g. evidence columns, alternate tooling). Merge policy: [`docs/adr/0002-execution-matrix-canonical-source.md`](docs/adr/0002-execution-matrix-canonical-source.md).

تمثل هذه المصفوفة مسودة تطوير للمحرك التشغيلي (Operational Backbone) لـ **Dealix Sovereign Growth OS**. توضح تفاصيل مقترحة لتشغيل الوكلاء عبر العائلات الاستراتيجية، مع دمج أفكار أدوات وتشغيل (قد لا تكون كلها مدمجة في الكود بعد).

---

## 1️⃣ العائلة الأولى: ذكاء الفرص والنمو (Opportunity & Growth Intelligence)

| الوكيل (Agent) | الهدف (Objective) | המالك (Owner) | المدخلات (Inputs) | الذاكرة (Memory) | الأدوات (Tools/Runtimes) | أحداث الاستلام (Events In) | أحداث الإصدار (Events Out) | قواعد القرار (Decision Rules) | المخرجات (Outputs) | الـ KPIs | SLA | بوابات الـ HITL | متطلبات الأدلة (Evidence Required) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Market Signal** | رصد إشارات السوق والمنافسين وتوجهات الصناعة | VP Strategy | أخبار القطاع، سياسات حكومية، تقارير | `/memory/growth` | Web Scraper, Repomix (context) | `schedule.daily` | `signal.market_shift_detected` | تصنيف الإشارة فوق threshold الأهمية | Market Brief, Urgency Index | False-positive rate | 4h | ❌ Auto | روابط المصادر الموثقة |
| **Partnership Scout** | فرز وتصنيف الشركاء المحتملين | VP Partnerships | قواعد بيانات شركات، إشارات السوق | `/memory/partners` | LinkedIn API, CRM, Atomic Chat (local parsing) | `signal.partner_interest` | `partnership.scouted`<br>`partnership.scored` | استبعاد الشركاء خارج الأسواق المستهدفة | Partner Scorecard | Scout-to-sign time | 24h | ❌ Auto | دراسة الجدوى الأولية |
| **Alliance Structuring** | بناء النماذج المالية والتشغيلية للتحالفات | VP Partnerships | بيانات الشريك، استراتيجية التوسع | `/memory/partners`<br>`/memory/templates` | LangGraph (Stateful workflow) | `partnership.fit_confirmed` | `partnership.structure_simulated` | تحديد هيكل يحقق ROI > 150% بـ 12 شهر | P&L Simulation, Term Sheet | Target ROI | 48h | 🛑 إرسال Term Sheet للعميل | توقيع الشؤون القانونية |
| **Expansion Playbook** | تجهيز خطط دخول وتسعير لأسواق جديدة | GM Expansion | تقييم TAM/SOM، قيود PDPL/Local | `/memory/growth` | OpenSaaS (for scaffold spin-up), BI tools | `growth.market_candidate` | `growth.playbook_generated` | الإطلاق يتطلب استرداد رأس المال بـ < 18 شهر | Launch Playbook, Capex | Launch-to-breakeven | 1w | 🛑 اعتماد الميزانية | تقرير الامتثال القانوني للسوق |

---

## 2️⃣ العائلة الثانية: التطوير المؤسسي والاستحواذات (Corporate Development & M&A)

| الوكيل (Agent) | الهدف (Objective) | المالك (Owner) | المدخلات (Inputs) | الذاكرة (Memory) | الأدوات (Tools/Runtimes) | أحداث الاستلام (Events In) | أحداث الإصدار (Events Out) | قواعد القرار (Decision Rules) | المخرجات (Outputs) | الـ KPIs | SLA | بوابات الـ HITL | متطلبات الأدلة (Evidence Required) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **M&A Target Screener** | فرز أهداف الاستحواذ حسب التوافق الاستراتيجي | M&A Director | إيرادات الشركة المستهدفة، تراكب العملاء | `/memory/ma` | Financial DB APIs, goose (ops actions) | `ma.target_detected` | `ma.screening_completed` | رفض الأهداف ذات الديون > 3x EBITDA | Target Fit Score | Screened-to-shortlist % | 3d | ❌ Auto | مطابقة القوائم المالية الأولية |
| **DD Analyst** | إدارة وفحص الـ Data Room (مالي/تقني/قانوني) | CFO / Legal | VDR data, عقود، كود مصدري | `/memory/security`<br>`/memory/ma` | LangGraph, Repomix (code DD) | `ma.outreach_initiated` | `ma.dd_started`<br>`ma.red_flag_critical` | تصعيد فوري عند خروقات PDPL أو ثغرات أمنية | Risk Matrix, DD Report | DD Turnaround Time | 2w | 🛑 تخطي Red Flags | تقرير أمني (Shannon pre-check) |
| **Valuation & Synergy** | تقييم (DCF/Multiples) وعوائد التآزر | CFO | تقارير الـ DD، تدفقات نقدية | `/memory/ma` | محرك تقييم، Atomic Chat (private data) | `ma.dd_started` | `ma.valuation_ready` | تجهيز 3 نماذج حساسية (Bull/Base/Bear) | Valuation Range, Synergy NPV | Valuation Accuracy | 4d | 🛑 اعتماد التقييم | مستندات التدفقات النقدية |
| **Deal & Negotiation** | بناء هيكل التفاوض (LOI, BATNA) وتقييم العروض | CEO | التقييم النهائي، دوافع الخصم | `/memory/ma`<br>`/memory/adr` | LangGraph (negotiation flow) | `ma.valuation_ready` | `ma.offer_strategy_ready` | عدم تجاوز أقصى سعر معتمد بأي حال | LOI Draft, BATNA, Closing plan | Offer-to-close % | 2d | 🛑 تقديم عرض (LOI) | تسجيلات التفاوض ومحاضر الاجتماع |
| **Post-Merger Integration** | تنفيذ ومتابعة خطة 30/60/90 يوم دمج | Integration Ops | خطط التكامل، وثائق التشغيل، ثقافة الفريق | `/memory/postmortems` | goose (to trigger integrations), Asana | `ma.deal_signed` | `ma.integration_started` | تنبيه الإدارة حال تأخر اندماج الـ IT | PMI 30/60/90 Plan | Synergy realization % | Ongoing | 🛑 إقرار انتهاء الدمج | تقارير ربط الـ ERP / CRM |

---

## 3️⃣ العائلة الثالثة: عمليات الإيرادات التجارية (Revenue & Commercial Operations)

| الوكيل (Agent) | الهدف (Objective) | المالك (Owner) | المدخلات (Inputs) | الذاكرة (Memory) | الأدوات (Tools/Runtimes) | أحداث الاستلام (Events In) | أحداث الإصدار (Events Out) | قواعد القرار (Decision Rules) | المخرجات (Outputs) | الـ KPIs | SLA | بوابات الـ HITL | متطلبات الأدلة (Evidence Required) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Lead Intelligence** | إثراء جهات الاتصال وتحديد النوايا الشرائية | Head of Sales | بيانات CRM، النشاط بالموقع | `/memory/customers` | Clearbit/Lusha, CRM API | `lead.created` | `lead.enriched`<br>`lead.scored` | ربط الـ VIP Leads بمدراء المبيعات فوراً | Lead Fit Score, Intent Level | Qualified pipe growth | 1h | ❌ Auto | Log للإثراء |
| **Exec Outreach** | إدارة حملات التواصل للـ C-Level بشكل احترافي | Head of Sales | توقيت، Persona، رسائل سابقة | `/memory/prompts` | WhatsApp API, Email API | `lead.scored` | `outreach.initiated` | منع تجاوز تكرار الـ Frequency Cap | Personalized Email/WA | Reply Rate | 2h | 🛑 إطلاق حملة Board-Level | سجل الـ Opt-in (Consent Policy) |
| **Proposal & Commercial Design** | تسعير عروض متقدمة وحماية هوامش الربح | VP Sales | طلبات العميل، الـ Margin rules | `/memory/adr` | CPQ Engine, DocGen | `meeting.completed` | `proposal.drafted` | رفض الخصومات التي تكسر الـ Floor Margin | Enterprise Proposal, Pricing | Gross Margin on Won | 4h | 🛑 خصم يزيد عن 20% | تحليل الهامش الربحي |
| **Customer Expansion** | مراقبة صحة العملاء واقتناص فرص الـ Upsell | CS Director | التذاكر، فواتير، نظام الدعم | `/memory/customers` | CRM Workflow, Billing API | `customer.health_drop` | `expansion.opportunity_identified` | إطلاق Playbook احتواء فور خطر التسرب | Account Plan, Upsell triggers| NRR (>110%) | 24h | ❌ Auto | تقرير صحة الحساب (Usage Data) |

---

## 4️⃣ العائلة الرابعة: الحوكمة والتنفيذ والتعلم (Governance, Execution, and Learning)

| الوكيل (Agent) | الهدف (Objective) | المالك (Owner) | المدخلات (Inputs) | الذاكرة (Memory) | الأدوات (Tools/Runtimes) | أحداث الاستلام (Events In) | أحداث الإصدار (Events Out) | قواعد القرار (Decision Rules) | المخرجات (Outputs) | الـ KPIs | SLA | بوابات الـ HITL | متطلبات الأدلة (Evidence Required) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Strategic PMO** | تفكيك המبادرات وتعيين المهام وتتبع الإنجاز | Chief of Staff | خطط الـ M&A والنمو | `/memory/runbooks` | Jira/Linear API, goose | `execution.plan_created` | `execution.milestone_due` | تصعيد المهام الحمراء (Overdue) > 5 أيام | Workstreams, Owners assignments| Initiative on-time rate | Daily | 🛑 اعتماد صرف ميزانيات | تحديث حالة الـ Sprint |
| **Policy & Compliance** | حماية النظام عبر الـ Policy-as-Code Engine | Compliance | أي Event يحاول التنفيذ | `/memory/policies` | Policy Engine, Shannon (Security check) | `governance.hitl_required` | `governance.policy_check_passed` | لا تمرير لمنعكس مالي/بيانات إلا بعد مسح (Audit) | Compliance Check Report | Violation rate | Realtime | 🛑 تخطي الـ Policy | Audit Ledger Snapshot |
| **Executive Intelligence** | تجميع كل شيء، تلخيص القرارات لـ C-Suite / Board | BOD / CEO | مخرجات الـ 15 وكيل + Forecast | `/memory/architecture` | BI Dashboard, Repomix (context sync) | `board_briefing_requested` | `ma.board_decision_required` | تصعيد الفرص > X مليون ريال فوراً للـ Board | Board Memo, Capital at Risk | Approval latency | Weekly| 🛑 تخصيص وتوجيه رأس المال | Forecast vs Actual records |

---

## 🔍 The Universal Output Contract (متعاقد المخرجات الإلزامي)

يجب على كل وكيل كتابة المخرجات بصيغة `Decision Memo` الموحدة لضمان حفظ المعرفة في (Project Memory):

```json
{
  "objective": "الهدف",
  "decision_context": "السياق / المشكلة",
  "inputs_used": ["ملفات", "بيانات API", "ذاكرة"],
  "assumptions": ["نمو متوقع", "مخاطر سوقية"],
  "recommendation_ar": "التوصية بوضوح",
  "alternatives_considered": ["الخيار أ", "الخيار ب"],
  "expected_financial_impact": {"revenue_upside_sar": 0, "cost_downside_sar": 0},
  "risk_register": [{"risk": "...", "severity": "...", "mitigation": "..."}],
  "confidence_score": 95,
  "required_approvals": ["CEO", "Board"],
  "next_best_action": "ما التالي؟",
  "rollback_plan": "خطة التراجع (Reversibility)",
  "evidence_links": ["URL 1", "URL 2"],
  "audit_metadata": {"verified": true, "tool_proof_id": "tx_889"}
}
```
