# Dealix Sovereign Growth OS: Master Execution Blueprint

هذا المستند هو الوثيقة التأسيسية الدستورية (Master Blueprint) لمنصة **Dealix Sovereign Growth OS**. يجمع بين الرؤية الاستراتيجية للنمو والانضباط الهندسي كـ "نظام تشغيل" مؤسسي مبني على وكلاء الذكاء الاصطناعي (Agentic AI).

---

## 1. 🏗️ الطبقات المعمارية (Architecture Layers)

| الطبقة (Layer) | الوظيفة الأساسية | التقنيات والأدوات المعتمدة |
| :--- | :--- | :--- |
| **1. Product & Code Operating** | الوعي ببيئة العمل، كتابة وتشغيل الكود داخل الريبو | `Claude Code`, `AGENTS.md`, `CLAUDE.md`, `.claude/hooks` |
| **2. Runtime & Orchestration** | تنظيم الوكلاء ذات التنفيذ الطويل (Stateful/HITL) | `LangGraph`, `Event Bus` |
| **3. Model Routing** | توجيه المهام بذكاء لأفضل النماذج وتقليل التكاليف | Custom `ProviderRouter`, Benchmark Scorecards |
| **4. Local/Private Inference** | معالجة البيانات الحساسة ودعم العربية المتقدم | `Atomic Chat` (أو بديل محلي), `Llama-3` |
| **5. Memory & Second Brain** | الذاكرة الدائمة الموثقة للمشروع والقرارات | File-based `/memory` , `Decision Memos` |
| **6. Tool Verification** | منع هلوسة الوكلاء والتحقق من المطالبات | `Verification Ledger` (ToolProof Concept) |
| **7. Security & Release Gate** | اختبار الاختراق الموجه وحماية الإصدارات | `Shannon` (White-box Gate), `Secretlint` |
| **8. Executive Growth Core** | طبقة الإدارة العُليا (CorpDev, Revenue, PMO) | الـ 16 وكيل استراتيجي، لوحات التحكم |

---

## 2. 🤖 محرك الوكلاء (The 16 Core Agents)

### 📈 عائلة الإيرادات العملياتية (Revenue Operations)
1. **Lead Intelligence Agent**: إثراء الحسابات، تصنيف Fit/Intent.
2. **Executive Outreach Orchestrator**: إدارة الـ Cadence للـ C-Level.
3. **Proposal & Commercial Design Agent**: هندسة التسعير وإصدار عروض الـ Enterprise.
4. **Customer Expansion Agent**: حماية الـ NRR ومنع التسرب (Churn).

### 🤝 عائلة ذكاء الشراكات (Partnerships)
5. **Market Signal Agent**: رصد تحولات السوق وتوجهات المنافسين.
6. **Partnership Scout Agent**: تقييم الشركاء وبناء الـ Scorecards.
7. **Alliance Structuring Agent**: نمذجة P&L للتحالفات وإنتاج Term Sheets.
8. **Expansion Playbook Agent**: تخطيط التوسع وتسعير الدخول الجغرافي.

### 🏢 عائلة التطوير المؤسسي والاستحواذ (CorpDev & M&A)
9. **M&A Target Screener Agent**: تصفية الأهداف بناءً على مؤشرات الديون والـ Fit.
10. **Due Diligence Analyst Agent**: فحص الـ Data Room (مالي/قانوني/تقني).
11. **Valuation & Synergy Agent**: التقييم المالي (DCF) ورصد התآزر.
12. **Deal Structuring & Negotiation Agent**: وضع استراتيجية الـ BATNA وهيكل הـ LOI.
13. **Post-Merger Integration Agent**: ربط فرق العمل ومتابعة أهداف ما بعد الدمج (PMI).

### ⚖️ عائلة التنفيذ والحوكمة (Governance & Execution)
14. **Strategic PMO Agent**: ترجمة الخطط إلى مهام قابلة للتتبع (Jira/Linear).
15. **Policy & Compliance Agent**: فرض حوكمة الـ PDPL وأدلة الامتثال.
16. **Executive Intelligence Agent (Board Memo)**: إنتاج تقارير رأس المال ولوحات القيادة السيادية (Sovereign Dashboard).

---

## 3. 🧠 هيكلة الذاكرة والتحقق (Memory & Verification Schema)

### هيكلة `/memory`
لا تُحفظ الملفات عشوائياً. يجب إدراج أي حدث ذو قيمة في أحد المسارات التالية:
- `/memory/architecture`, `/memory/adr`, `/memory/runbooks`, `/memory/releases`, `/memory/postmortems`
- `/memory/growth`, `/memory/partners`, `/memory/ma`, `/memory/customers`, `/memory/security`, `/memory/benchmarks`

### سجل التحقق (Tool Verification Ledger)
أي Action يقوم به وكيل يُسجل في الـ Ledger بموجب:
- `intended_action`: نية الوكيل.
- `claimed_action`: إدعاء الوكيل بالنجاح.
- `side_effects`: التغييرات الفعلية (قراءة ملف، API Request).
- `verification_status`: `verified` | `partially_verified` | `unverified` | `contradicted`.

---

## 4. 🔏 مصفوفة الحوكمة والموافقات (Policy & Approval Matrix)

| فئة القرار (Decision Class) | وصف الإجراء | البوابة المانعة (Release Gate) | إثبات الحقيقة (Evidence Required) |
| :--- | :--- | :--- | :--- |
| **Class A (Auto Allowed)** | صيانة الكود، مسودات التوثيق، Memory Update | ❌ لا يوجد | Validation Hooks in `.claude` |
| **Class B (Approval Required)** | تسويق جماعي، Database Migrations ، تغيير تسعير | `VP Sales` / `Tech Lead` | اختبار آلي، موافقة خطية |
| **Class C (Board Level)** | M&A Term Sheets، توسع استراتيجي، ميزانيات ضخمة | `CEO` & `Board of Directors` | تفصيل Valuation، Risk Matrix |

---

## 5. 🛠️ النظام الهندسي للريبو (Repo Operating Structure)

لضمان عمل الـ Agents بثبات وعدم المساس بالبنية الأساسية:
```text
.
├── .claude/
│   ├── settings.json         # (Hooks, Slash Commands)
│   └── settings.local.json   
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
├── docs/
│   └── adr/                  # قرارات البنية التحتية
├── memory/                   # הذاكرة المؤرشفة
├── salesflow-saas/backend/app/services/
│   ├── agents/               # الـ 16 وكيل
│   └── core_os/              # (Memory, Router, Verification)
├── AGENTS.md                 # دستور تشغيل الوكلاء للمستودع
└── CLAUDE.md                 # الإرشادات الخاصة بتعديل الكود (Claude Code)
```

---

## 6. 🛣️ خارطة التنفيذ الاستراتيجي (12-Month Roadmap)

- **Q1 (Control the Repo)**: انضباط الكود (AGENTS.md, CLAUDE.md, Memory Base, Tool Verification MVP). *(نحن هنا)*
- **Q2 (Verified Hybrid Stack)**: تشغيل الـ Provider Router، البدء بـ Partner Scouting + PMO، التفعيل الآمن للـ Local/Cloud.
- **Q3 (CorpDev Automation)**: إطلاق M&A Screener، Due Diligence، غرفة القيادة لـ CEO.
- **Q4 (Scaling Safely)**: التوسع على مستوى شركات متعددة (Multi-entity Group)، دمج Portfolio Intelligence، Security Gates (Shannon) متقدم.

---

## 7. 📅 الـ Backlog التنفيذي (أول 60 يوم)

### الأيام 1 إلى 30 (تأسيس الدستور والمعمارية)
- [x] بناء `Execution_Matrix_v2.md`
- [x] صياغة الـ Repo OS (`AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`).
- [x] إنشاء Control Plane (`project_memory_store.py`, `provider_router.py`, `verification_ledger.py`).
- [ ] توثيق مخطط الـ Capabilities و الـ Gap map المتبقي.
- [ ] صياغة وهيكلة أول `Decision Memo` لكتابة الذاكرة.

### الأيام 30 إلى 60 (تشغيل ذكاء الشراكات)
- [ ] إتمام إطلاق `Partnership Scout Agent` و `PMO Agent`.
- [ ] تطبيق Benchmark Schema لقياس أداء الوكلاء الفعلي مقابل الوهمي.
- [ ] ربط نظام Escalation Alerts الخاص بالـ PMO.
- [ ] تحزيم الكود بـ `Repomix` دورياً لمراجعات הـ Architecture.
