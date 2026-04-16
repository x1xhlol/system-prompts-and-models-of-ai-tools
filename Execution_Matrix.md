# Execution Matrix (مصفوفة التنفيذ) — Dealix Autonomous OS

هذا الدليل يمثّل المرجعية التشغيلية النهائية لقيادة النظام بشكل فعلي. يربط بين الوكيل، المدخلات، الأدوات، الأحداث، المخرجات، مؤشرات الأداء (KPIs)، المسؤول (Owner)، واتفاقية مستوى الخدمة (SLA).

## 1. 🔹 مجموعة نمو المبيعات (Sales Growth Core)

| الوكيل (Agent) | المدخلات (Inputs) | الجوانب التقنية / الأدوات (Tools) | الحدث (Event) | المخرجات (Outputs) | مؤشرات الأداء (KPIs) | المسؤول التنفيذي (Owner) | SLA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Outreach Writer** | بيانات CRM، نية الشراء، قطاع العميل | API واتساب / إيميل / لينكدإن | `lead.created` | رسائل تواصل مخصصة عالية التحويل | Open Rate (>35%)، Reply Rate (>15%) | Head of Sales | فورًا |
| **Closer/Negotiator** | تاريخ المحادثات، العرض، الميزانية المتوقعة | CRM، محرك صياغة العقود | `negotiation.started` | سيناريوهات الإغلاق، شروط مقبولة (ZOPA) | Time-to-Close، Deal Win Rate (>25%) | Sales VP | ساعتان |
| **Customer Success** | صحة الحساب، استخدام المنتج، تذاكر الدعم | CRM، نظام الدعم، أدوات القياس (Mixpanel/Amplitude) | `customer.health_drop` | توصيات لمنع التسرب، خطة Upsell دورية | Net Revenue Retention (>110%)، Churn Rate (<2%) | CS Director | يوم واحد |

## 2. 🔹 مجموعة الشراكات والتحالفات (Partnerships Core)

| الوكيل (Agent) | المدخلات (Inputs) | الجوانب التقنية / الأدوات (Tools) | الحدث (Event) | المخرجات (Outputs) | مؤشرات الأداء (KPIs) | المسؤول التنفيذي (Owner) | SLA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Partnership Scout** | اتجاهات القطاع، شركات مكملة، قواعد البيانات | Web Scraper، قاعدة شركاء Dealix | `growth.market_expansion` | قائمة الشركاء المرشحين، التقييم الأولي | Partnerships Pipeline Value | VP of Partnerships | 3 أيام |
| **Alliance Structuring** | التقييم الأولي، ملف الشريك، الاستراتيجية | قوالب قانونية، محرك نمذجة مالية | `partnership.model_recommended` | Term Sheet، النموذج المالي، تقييم المخاطر | Partner ROI، Time-to-Term-Sheet | VP of Partnerships | 5 أيام |

## 3. 🔹 مجموعة الاستحواذات والنمو الاستراتيجي (M&A and Strategic Growth)

| الوكيل (Agent) | المدخلات (Inputs) | الجوانب التقنية / الأدوات (Tools) | الحدث (Event) | المخرجات (Outputs) | مؤشرات الأداء (KPIs) | المسؤول التنفيذي (Owner) | SLA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **M&A Target Screener** | استراتيجية التوسع، بيانات مالية عامة عن الأسواق | أدوات ذكاء الأعمال المالي | `ma.target_detected` | تصنيف الأهداف، Go/No-Go الأولي | Time-to-Evaluate، Target Fit Score | M&A Director / CEO | أسبوع |
| **DD Analyst** | القوائم المالية الأولية، معلومات الفريق، التراخيص | VDR (غرفة البيانات الافتراضية)， أدوات الامتثال | `ma.screening_completed` | تقرير العناية الواجبة (Risk Matrix) المالي والتشغيلي | DD Accuracy، DD Cycle Time | CFO / Legal Advisor | أسبوعان |
| **Valuation & Synergy** | تقارير DD، التدفقات النقدية التاريخية، الافتراضات | محرك نمذجة متقدم (DCF الخ) | `ma.valuation_ready` | القيمة العادلة (Blended Valuation)， سيناريوهات العرض | Valuation Accuracy vs Market، ROI | CFO / Board | 3 أيام |
| **Executive Negotiator** | القيمة العادلة المقترحة، تحليل الطرف الآخر (Motivations) | محرك التفاوض وبناء السيناريوهات | `ma.offer_strategy_ready` | خطة التفاوض التنفيذية (BATNA, ZOPA) | Deal Win Rate، Terms Favorability | CEO / Board | يومان |
| **PMI (Integration)** | خطط الصفقة الأصلية، هيكل الشركة، الأنظمة التشغيلية | أدوات إدارة المشاريع (Asana/Jira API) | `ma.integration_kickoff` | خطة 30/60/90 يوم، تتبع التآزر | Synergy Realization Rate، Integration Speed | Integration Ops | مستمر |

## 4. 🔹 مجموعة الحوكمة والذكاء السيادي (Governance & Apex Core)

| الوكيل (Agent) | المدخلات (Inputs) | الجوانب التقنية / الأدوات (Tools) | الحدث (Event) | المخرجات (Outputs) | مؤشرات الأداء (KPIs) | المسؤول التنفيذي (Owner) | SLA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Strategic PMO** | القرارات الإدارية العليا، خطط التوسع | API PM Tools | `growth.milestone_achieved` | تحويل الاستراتيجية لمهام فردية ومتابعة المنجزات | Initiative on-time delivery | Chief of Staff | يومي |
| **Sovereign Intelligence** | **كل مخرجات الوكلاء الـ 36 المتبقين** | Dashboard، BI Data Warehouse | `board_briefing_requested` | مذكرة رفع للمجلس، التقييم السيادي الشامل (Top Risks/Opps) | Company Growth Target، Decision Latency | **Board of Directors** | أسبوعي/شهري |

---

### 🛡️ خطة الحوكمة والتحكم (HITL - Human In The Loop)

**كل العمليات أدناه مشفرة لكي تتوقف وتطلب موافقة بشرية (HITL):**

*   توقيع **Term Sheet** مع شريك.
*   إصدار أي **Go/No-go** لعملية استحواذ (DD).
*   الموافقة على **تقييم مالي أعلى من 1,000,000 ريال**.
*   إطلاق **PMI (التكامل بعد الاستحواذ)**.
*   أي حالة تُسند لـ **Sovereign Intelligence Agent** مع علامة قنطرة (Critical/Break-glass).
