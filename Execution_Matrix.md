# Dealix Sovereign Growth OS — Master Execution Matrix

تمثل هذه المصفوفة المحرك التشغيلي (Operational Backbone) للكيان، حيث توضح كل التفاصيل التنفيذية لتشغيل الـ 16 وكيلًا عبر 4 عائلات استراتيجية لضمان التنفيذ الدقيق وفق بنية النظام (Decision Rules, HITL, Memory, SLAs).

---

## 1️⃣ العائلة الأولى: ذكاء الفرص والنمو (Opportunity & Growth Intelligence)

| الوكيل (Agent) | الغرض (Purpose) | المدخلات (Inputs) | الذاكرة (Memory) | الأدوات (Tools) | أحداث الاستلام (Events In) | أحداث الإصدار (Events Out) | قواعد القرار (Decision Rules) | المخرجات (Outputs) | الـ KPIs | المالك (Owner) | SLA | بوابة التحكم (HITL Gate) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Market Signal Agent** | رصد إشارات السوق والقطاع والمنافسين | إشارات السوق، مصادر الأخبار، تقارير القطاع | Entity Memory (Competitors, Sectors) | Web Scraper, News APIs, Crunchbase | السحب المجدول يومياً | `signal.market_shift_detected`<br>`signal.competitor_move_detected` | تصنيف الإشارة كتهديد/فرصة بناءً على Threshold | Market Opportunity Brief, Urgency Index | False-positive rate, Signal relevance | VP Strategy | 4 ساعات | ❌ لا يوجد (Auto) |
| **2. Partnership Scout** | رصد وتصنيف الشركاء المحتملين | بيانات الشركات المكملة، إشارات الأسواق | Partner Memory | Web Scraper, LinkedIn API, CRM | `signal.partner_interest_detected` | `partnership.scouted`<br>`partnership.scored` | استبعاد الشركاء خارج القطاعات المستهدفة | Partner Scorecard, Fit Analysis | Partner sourced pipeline, Scout-to-sign time | VP Partnerships | 24 ساعة | ❌ لا يوجد |
| **3. Alliance Structuring** | بناء النماذج المالية والتشغيلية للتحالفات | ملف الشريك، استراتيجية النمو، قواعد التحالف | Deal Memory | النمذجة المالية، قوالب العقود | `partnership.fit_confirmed` | `partnership.structure_simulated`<br>`partnership.term_sheet_prepared` | تحديد هيكل يحقق ROI > 150% خلال 12 شهر | P&L Simulation, Term Sheet Draft, Risk Register | Parnter ROI, Time-to-Term-Sheet | VP Partnerships | 48 ساعة | 🛑 إرسال Term Sheet |
| **4. Expansion Playbook** | إدارة دخول أسواق جديدة وتجهيز خطة الإطلاق | تقييم الأسواق، المتطلبات القانونية، تكلفة العمالة | Market Memory | TAM/SAM/SOM Calculator, Compliance DB | `growth.market_candidate_identified` | `growth.entry_mode_recommended`<br>`growth.playbook_generated` | لا يتم الإطلاق إلا بتحقيق Positive Cashflow < 18 شهر | Launch Milestones, Localization Cost, Capex | Time to Launch, Launch-to-breakeven | GM Expansion |سبوع واحد | 🛑 اعتماد الميزانية |

---

## 2️⃣ العائلة الثانية: التطوير المؤسسي والاستحواذات (Corporate Development & M&A)

| الوكيل (Agent) | الغرض (Purpose) | المدخلات (Inputs) | الذاكرة (Memory) | الأدوات (Tools) | أحداث الاستلام (Events In) | أحداث الإصدار (Events Out) | قواعد القرار (Decision Rules) | المخرجات (Outputs) | الـ KPIs | المالك (Owner) | SLA | بوابة التحكم (HITL Gate) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **5. M&A Target Screener** | فرز وتقييم فرص الاستحواذ مبدئيًا | القوائم المالية الأولية، التآزر الجغرافي والمنتجات | Entity Memory (Targets) | Financial Data API | `signal.acquisition_candidate_detected` | `ma.screening_completed`<br>`ma.shortlisted` | رفض أي هدف لديه ديون تفوق 3x EBITDA | Target Fit Score, Go/No-Go الأولي | Screened-to-shortlist % | M&A Director | 3 أيام | ❌ لا يوجد |
| **6. DD Analyst** | تنسيق الفحص النافي للجهالة الشامل | الوثائق القانونية، الجداول المالية، عقود الموظفين | Deal Memory | VDR integration, Compliance checker | `ma.outreach_initiated` | `ma.dd_started`<br>`ma.dd_issue_logged`<br>`ma.red_flag_critical` | تصعيد فوري عند اكتشاف أي خرق للـ PDPL أو الاحتيال | Risk Matrix, DD Report | DD Turnaround Time, DD Accuracy | CFO | 10 أيام | 🛑 الموافقة على تخطي العلامات الحمراء |
| **7. Valuation & Synergy** | تقييم القيمة العادلة وعوائد التآزر (Rev/Cost) | تقارير الفحص (DD)، تدفقات نقدية | Deal Memory | محرك تقييم (DCF, Multiples) | `ma.dd_started` | `ma.valuation_ready`<br>`ma.synergy_variance_detected` | تقديم 3 سيناريوهات للتقييم على الأقل (Base/Bull/Bear) | Valuation Range, Synergy NPV, Payback | Valuation accuracy, Synergy realization % | CFO | 4 أيام | 🛑 الموافقة على التقييم الأولي |
| **8. Deal Structuring & Negotiation** | بناء هيكل الصفقة الجانب التفاوضي (BATNA) | التقييم المعاير، أهداف المالكين للمستهدف | Deal Memory | Negotiation Tree Builder | `ma.valuation_ready` | `ma.offer_strategy_ready`<br>`ma.offer_submitted`<br>`ma.deal_signed` | عدم تجاوز الحد الأعلى للسعر دون موافقة الإدارة | LOI Draft, BATNA, Walk-away thresholds | Offer-to-close %, Terms Favorability | CEO | يومان | 🛑 تقديم عرض الاستحواذ النهائي |
| **9. Post-Merger Integration (PMI)** | التكامل وتتبع نجاح الاستحواذ 30/60/90 يوم | خطط التكامل، هيكلة الفرق، الأنظمة | Deal Memory | Asana/Jira API, ERP API | `ma.close_completed` | `ma.integration_started`<br>`ma.synergy_variance_detected` | تنبيه الإدارة حال تأخر اندماج الـ IT أكثر من 15 يوم | PMI 30/60/90 Plan, Day 1 Readiness | Time-to-stability, Synergy realization % | Integration Ops| مستمر | 🛑 إعلان اكتمال الدمج |

---

## 3️⃣ العائلة الثالثة: العمليات التجارية والإيرادات (Revenue & Commercial Operations)

| الوكيل (Agent) | الغرض (Purpose) | المدخلات (Inputs) | الذاكرة (Memory) | الأدوات (Tools) | أحداث الاستلام (Events In) | أحداث الإصدار (Events Out) | قواعد القرار (Decision Rules) | المخرجات (Outputs) | الـ KPIs | المالك (Owner) | SLA | بوابة التحكم (HITL Gate) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **10. Lead Intelligence** | تأهيل وتصنيف العملاء ونيات الشراء | CRM data، زيارات الموقع، Intent data | Entity Memory (Accounts) | Clearbit, Lusha, CRM API | `lead.created` | `lead.enriched`<br>`lead.scored` | توجيه الحسابات الأعلى من مليون ريال للمبيعات التنفيذية مباشرة | Lead Fit Score, Intent Level | Qualified pipeline growth | Head of Sales | 10 دقائق| ❌ لا يوجد |
| **11. Executive Outreach** | تنسيق حملات التواصل التنفيذي المتعددة القنوات | سجل التواصل، ملف العميل، توقيت الاتصال | Contact Memory | WhatsApp API, Email API | `lead.scored` | `outreach.initiated`<br>`outreach.replied` | لا يتم إرسال رسالة تنفيذية دون توافر شخصية العميل (Persona) | Personalization Text, Cadence Plan | Reply Rate, Sales cycle compression | Head of Sales | 1 ساعة | 🛑 الحملات الجماعية للشركاء وكبار العملاء |
| **12. Proposal & Commercial Design** | تسعير العروض وهيكلة الحزم التجارية للشركات | متطلبات العميل، تسعير المنافسين، هوامش الربح | Deal Memory | CPQ, PDF Generator | `meeting.completed` | `proposal.drafted`<br>`proposal.sent` | الحفاظ على هامش ربح لا يقل عن 60% لكل عقد | Pricing Architecture, Enterprise Proposal | Win rate by segment, Gross margin | VP Sales | 4 ساعات | 🛑 خصم يزيد عن 20% |
| **13. Customer Expansion** | صيانة الحسابات المكتسبة وفرص زيادة المبيعات | استخدام النظام، صحة الحساب، التذاكر | Account Memory | Billing API, Mixpanel | `customer.health_drop`<br>`customer.renewal_approaching` | `expansion.opportunity_identified`<br>`expansion.churn_risk_flagged` | إطلاق حملة الاحتفاظ فور نزول الـ Health Score لـ Amber | Upsell Plan, Account Health Brief | Net Revenue Retention, Churn rate | CS Director | 24 ساعة | ❌ لا يوجد |

---

## 4️⃣ العائلة الرابعة: الحوكمة، التنفيذ والتعلم (Governance, Execution & Learning)

| الوكيل (Agent) | الغرض (Purpose) | المدخلات (Inputs) | الذاكرة (Memory) | الأدوات (Tools) | أحداث الاستلام (Events In) | أحداث الإصدار (Events Out) | قواعد القرار (Decision Rules) | المخرجات (Outputs) | الـ KPIs | المالك (Owner) | SLA | بوابة التحكم (HITL Gate) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **14. Strategic PMO** | تفتيت المبادرات إلى مهام، ومتابعة الجدول الزمني | المذكرة الاستراتيجية، الميزانيات، الفريق | Initiative Memory| Jira/Asana API | `growth.launch_authorized`<br>`execution.milestone_due` | `execution.plan_created`<br>`execution.escalation_triggered` | تصعيد المهام المتأخرة أكثر من أسبوعين فورًا للـ Executive | Workstreams, Owners assignments, RAG status | Initiative on-time rate, critical path slippage | Chief of Staff| يومي | 🛑 تعديل الميزانيات الرئيسية |
| **15. Policy & Compliance** | تطبيق السياسات، الحماية من المخاطر وضمان PDPL | أي حدث حساس يُولد عبر النظام (Term sheet, Email list) | Policy Memory | Policy Engine, Audit Ledger | `governance.hitl_required` | `governance.policy_check_passed`<br>`governance.policy_violation_detected` | الحظر الفوري لأي إجراء يخترق الـ PDPL (حماية البيانات) | Compliance Check Report, Audit Snapshot | Policy violation rate, Audit completeness | Compliance Officer | ثواني | 🛑 استثناء قواعد الامتثال أو التخطي (Override) |
| **16. Executive Intelligence (Sovereign)** | بناء النظرة الشمولية وتوجيه مجلس الإدارة والقيادة | مذكرات قرارات الوكلاء الـ 15، تنبيهات، ماليات | Sovereign Memory| BI Engine, Dashboard | `board_briefing_requested`<br>`ma.board_decision_required` | `strategic.action_recommended`<br>`strategic.capital_allocated` | إدراج الفرص التي تتجاوز الـ 5 ملايين ريال فقط في أجندة رفع التوصيات | Board Memo, Capital Allocation Heatmap | HitL decision latency, Strategy-to-execution compression | BOD / CEO | شهري/فوري للإنذار | 🛑 جميع قرارات تخصيص رأس المال |

---

## 🔍 The Universal Output Contract (متعاقد المخرجات الإلزامي لكل وكيل)

يجب على كل وكيل في أي مهمة يُخرج فيها قرارًا أو تقريرًا، أن يلتزم بهذا الهيكل الموحّد (Decision Memo JSON):

```json
{
  "objective": "الهدف الأساسي",
  "decision_context": "السياق والحدث الذي استدعى هذه المذكرة",
  "inputs_used": ["البيانات والمصادر التي تم تقييمها"],
  "assumptions": ["الافتراضات المالية أو التشغيلية المبني عليها التقييم"],
  "recommendation_ar": "التوصية المباشرة (ماذا يجب أن نفعل؟)",
  "alternatives_considered": ["الخيارات البديلة التي رُفضت ولماذا"],
  "expected_financial_impact": {
    "revenue_upside_sar": 0,
    "cost_downside_sar": 0,
    "capital_at_risk_sar": 0
  },
  "risk_register_json": [{"risk": "...", "severity": "...", "mitigation": "..."}],
  "confidence_score": 92.5,
  "required_approvals": ["CEO", "Compliance"],
  "next_best_action": "ما هي الخطوة الفورية القادمة؟",
  "rollback_plan": "كيف نتراجع لو أخطأنا؟",
  "audit_metadata": {
    "agent_id": "alliance_structuring",
    "timestamp": "2026-04-16T12:00:00Z",
    "policy_check_passed": true
  }
}
```
