# Dealix Sovereign Growth OS: GitHub Delivery Pack & Governance Playbook

هذا المستند وحزمة الملفات المرفقة التي تم إنشاؤها (`.github/` و `docs/adr/`) تضمن أن فريق الهندسة يعمل بمعايير (Enterprise Grade) تحمي النظام من الأخطاء التكتيكية وتحفظ استقرار الـ 8 طبقات تشغيلية.

---

## 1. 🛡️ سياسة الفروع والحماية (Branching & Protection Rules)

يجب ضبط هذه القواعد فوراً على خوادم GitHub الخاصة بـ Dealix لمنع حدوث "Silent Failures" في طبقة الـ Autonomous Agents.

### فروع المستودع (Repo Branches)
- `main`: (Production) محمي تماماً. يمنع الـ Push المباشر.
- `staging`: بيئة اختبار لـ QA ومحاكاة الوكلاء.
- `release/*`: للإصدارات المستقرة للمشروع.
- `feature/*`: لأي وكيل جديد، أو سياسة جديدة، أو أداة تفاعل.
- `hotfix/*`: لمعالجة الأعطال الحرجة في الإنتاج.

### قواعد حماية `main` الإلزامية (Required Rules)
1. **Require Pull Request reviews**: مراجعة واحدة (يفضل 2 للوكلاء الماليين).
2. **Require status checks to pass**: 
   - `lint / type check`
   - `unit tests` 
   - `policy validation tests` (لضمان أن التعديل لا يخترق الحوكمة).
3. **Require signed commits**: لضمان أمان ومصدر الشفرة.
4. **Do not allow bypassing the above settings**: لا يُسمح بتجاوز هذه القواعد أو إيقافها، حتى للإدمن.

---

## 2. 🗓️ خريطة الـ 90 يوم للتشغيل الفعلي (The 90-Day Execution Backlog)

### Sprint 1-2 (أسابيع 1 إلى 2): وضع حجر الأساس (Governance & Baseline)
- [ ] إقرار `GitHub governance` + `branch protection` رسمياً.
- [ ] بناء وتوحيد `Event Schema v2.0` لكافة النواحي (Sales, M&A, Growth).
- [ ] تجهيز قوالب المذكرات `Decision Memo Template` ومراجعتها قانونياً.
- [ ] تحديث `router.py` لاعتماد `State Machine Engine` للوكلاء.
- [ ] إنشاء `Entity Graph` الأولي لربط الشركات والفرص والصفقات في قاعدة البيانات.

### Sprint 3-4 (أسابيع 3 إلى 4): الذكاء الأولي (Early Intel & MVP)
- [ ] إطلاق **Partnership Scout Agent MVP** لقراءة إشارات السوق الحقيقية واستخراج 10 شركاء مستهدفين.
- [ ] إطلاق **Strategic PMO Agent MVP** لربط الفرص بمهام (Jira/Asana).
- [ ] تفعيل **Lead Intelligence Agent** وتقسيم الحسابات آلياً.
- [ ] بناء النسخة الأولى من `Sovereign Dashboard` للمدراء.

### Sprint 5-6 (أسابيع 5 إلى 6): التحالفات والتوسع (Alliances & Expansion)
- [ ] إطلاق **Alliance Structuring Agent** لبناء نماذج ROI فعلية.
- [ ] تفعيل **Expansion Playbook Agent** لدراسات الدخول للأسواق الجديدة.
- [ ] ربط نظام الحوكمة التلقائي لفرز عمليات `HITL` (إلزامية التدخل الإداري للترم شيتس).
- [ ] التشغيل الداخلي التجريبي (Dogfooding) للوكلاء على بيانات قديمة لـ Dealix.

### Sprint 7-8 (أسابيع 7 إلى 8): إطلاق منصة الـ M&A
- [ ] بناء وتشغيل **M&A Target Screener** وتوصيله بمصادر القطاع المالي.
- [ ] بناء وتدريب **DD Analyst Agent** لاستخراج وتحليل بيانات غرفة المعطيات الافتراضية (VDR).
- [ ] تطبيق أنظمة الـ Access Control الصارمة جداً على تقارير الـ Board.
- [ ] محاكاة دورة M&A استراتيجية من الصفر للنهاية كاختبار تكامل.

### Sprint 9-10 (أسابيع 9 إلى 10): التفاوض وبدء حلقة التعلم
- [ ] إطلاق **Valuation & Synergy Agent** و **Executive Negotiator Agent**.
- [ ] بناء محرك `Forecast Vs Actual` لبدء تعديل دقة التوقعات للوكلاء بناءً عن نتائجهم.
- [ ] الإطلاق التدريجي في بيئة الإنتاج (Production) بتفعيل ميزة `Shadow Mode` للـ M&A Agents.
- [ ] تخريج النظام رسمياً كـ Active Sovereign OS وتشغيله الحقيقي.

---
**📂 تمت إضافة الملفات التالية للمشروع آلياً:**
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/agent_feature_request.md`
- `.github/ISSUE_TEMPLATE/governance_policy_update.md`
- `docs/adr/0000-adr-template.md`
