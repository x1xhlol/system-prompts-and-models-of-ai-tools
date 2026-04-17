---
version: "1.1"
owner: "Program + Architect"
status: "canonical"
review_cadence: "مع تحديث بوابات الإصدار أو اختبارات الإغلاق الستة أو مرحلة ما بعد الإغلاق"
last_updated: "2026-04-16"
related:
  - "FINAL_TIER1_CLOSURE_PROGRAM_AR.md"
  - "SOURCE_OF_TRUTH_INDEX.md"
  - "RELEASE_READINESS_MATRIX_AR.md"
---

# التحقق من إغلاق Tier-1 وما بعد الإغلاق

أفضل طريقة تتأكد فيها أن **الإغلاق صار صحيح فعلًا** ليست بكثرة الملفات ولا بعدد الاختبارات فقط، بل بأن تجعل الإغلاق يمر عبر **بوابات إلزامية** واضحة: مخرجات مهيكلة، تنفيذ durable، موافقات قابلة للتدقيق، وrelease gate حقيقي. هذا هو الاتجاه الصحيح اليوم لأن OpenAI توصي باستخدام **Structured Outputs** بدل JSON mode عندما تحتاج التزامًا فعليًا بالـ schema، ولأن LangGraph يوفّر durable execution مع pause/resume وcheckpointer للمسارات الطويلة وHITL، ولأن GitHub يوفّر OIDC وartifact attestations لرفع ثقة التسليم وسلامة الـ provenance. ([OpenAI][1])

**مرافق إلزامي:** [`FINAL_TIER1_CLOSURE_PROGRAM_AR.md`](FINAL_TIER1_CLOSURE_PROGRAM_AR.md) · [`TIER1_PRODUCTION_ACTIVATION_PROGRAM_AR.md`](TIER1_PRODUCTION_ACTIVATION_PROGRAM_AR.md) · [`TIER1_REAL_PRODUCTION_PLAYBOOK_AR.md`](TIER1_REAL_PRODUCTION_PLAYBOOK_AR.md) · [`TIER1_TRUST_EXPANSION_PLAN_AR.md`](TIER1_TRUST_EXPANSION_PLAN_AR.md) · [`GO_LIVE_REVENUE_ACTIVATION_SYSTEM_AR.md`](GO_LIVE_REVENUE_ACTIVATION_SYSTEM_AR.md) · [`SOURCE_OF_TRUTH_INDEX.md`](SOURCE_OF_TRUTH_INDEX.md) · [`RELEASE_READINESS_MATRIX_AR.md`](RELEASE_READINESS_MATRIX_AR.md) · [`references/tier1-external-index.md`](references/tier1-external-index.md)

---

## كيف تتأكد أن الإغلاق صحيح؟

ابدأ من قاعدة واحدة: **أي شيء غير مثبت بالأدلة ما يعتبر مقفلًا**.

هذا يعني أن كل بند Tier-1 يجب أن يملك 5 أشياء معًا: owner واضح، evidence واضح، gate واضح، exit criteria واضح، وحالة واحدة فقط من: current أو partial أو pilot أو production.

التأكد الحقيقي يكون عبر **6 اختبارات إغلاق**:

### 1) Truth test

هل عندك ملف واحد فقط يحدد الحقيقة الحالية لكل subsystem؟

إذا ما عندك ملف موحد مثل current-vs-target register أو source-of-truth index، فالإغلاق ناقص حتى لو كل شيء "موجود".

**في الريبو:** [`SOURCE_OF_TRUTH_INDEX.md`](SOURCE_OF_TRUTH_INDEX.md) و[`architecture-register.md`](architecture-register.md)؛ CI: `architecture_brief.py`، `check_docs_links.py`، `check_source_of_truth_index.py`.

### 2) Schema test

هل كل المخرجات الحرجة تمر بـ schema validation فعلية؟

إذا كان جوابك لا، فالإغلاق ناقص. Structured Outputs اليوم ليست تحسينًا تجميليًا؛ هي الطريقة الصحيحة لجعل `memo_json` و`approval_packet_json` و`execution_intent_json` قابلة للتشغيل آليًا بدل أن تبقى نصوصًا جميلة. ([OpenAI][1])

**في الريبو:** عقود [`structured_outputs.py`](../salesflow-saas/backend/app/schemas/structured_outputs.py) و`POST /api/v1/approval-center/validate-class-b-bundle` و`pytest` على المسارات الحرجة.

### 3) Workflow test

هل عندك مسار حي واحد على الأقل end-to-end يمر عبر القرار والموافقة والتنفيذ والأدلة والواجهة التنفيذية؟

إذا لا، فالمشروع ما زال في مرحلة "مرجعية قوية" وليس "Tier-1 تشغيلًا". LangGraph يوضح أن durable execution الحقيقي يحتاج checkpointer وthread identifiers وأن تكون الـ side effects داخل tasks لضمان الاستئناف الصحيح وعدم التكرار. ([docs.langchain.com][2])

**في الريبو:** [`golden-path-partner-intake-runbook.md`](golden-path-partner-intake-runbook.md) و`tests/test_tier1_golden_path_partner.py`.

### 4) Trust test

هل كل external commitment يرفض تلقائيًا إذا غاب `approval_packet` أو `evidence_pack` أو `correlation_id`؟

إذا لا، فطبقة الثقة لم تُغلق بعد.

**في الريبو:** [`decision_plane_contracts.py`](../salesflow-saas/backend/app/services/core_os/decision_plane_contracts.py) ومسارات `approval_center`؛ سياسة التعارضات: `POST /api/v1/contradictions/` مع evidence عند V3/critical.

### 5) Release test

هل يوجد Release Readiness Matrix فعلي يوقف الإصدار إذا فشل docs truth أو schema pass أو contradiction gate أو provenance؟

إذا لا، فالإغلاق ناقص. GitHub OIDC مناسب للوصول الآمن المؤقت إلى السحابة بدل الأسرار الثابتة، وartifact attestations مناسبة لإثبات provenance، لكن يجب أن يكونا جزءًا من gate الفعلي لا مجرد توصية. ([GitHub Docs][3]) — تفاصيل الروابط في [`references/tier1-external-index.md`](references/tier1-external-index.md).

**في الريبو:** [`scripts/check_release_readiness_matrix.py`](../scripts/check_release_readiness_matrix.py) و[`.github/workflows/release-readiness-rc-gate.yml`](../.github/workflows/release-readiness-rc-gate.yml) و[`docs/governance/github-and-release.md`](governance/github-and-release.md).

### 6) Executive test

هل يوجد Executive Room حي يُستخدم فعلًا في مراجعة أسبوعية؟

إذا لا، فالإغلاق ما زال داخليًا تقنيًا، لا مؤسسيًا.

**في الريبو:** [`executive_room.py`](../salesflow-saas/backend/app/api/v1/executive_room.py) يغذّي `tier1_exec_surface` من `ExecWeeklyGovernanceContract.model_dump` المبني من مسار الـ demo إلى حين خدمة أسبوعية كاملة.

---

## كيف تبدأ "من جد" وبأفضل طريقة؟

ابدأ بهذا الترتيب فقط، ولا تكسره.

### المرحلة 1: ثبّت الحقيقة

أول أسبوع يجب أن يكون كله لإغلاق الحقيقة التشغيلية:

* ثبّت [`FINAL_TIER1_CLOSURE_PROGRAM_AR.md`](FINAL_TIER1_CLOSURE_PROGRAM_AR.md) كمرجع نهائي.
* ثبّت [`SOURCE_OF_TRUTH_INDEX.md`](SOURCE_OF_TRUTH_INDEX.md).
* ثبّت current/target register (مثل [`architecture-register.md`](architecture-register.md) حيث ينطبق).
* اجعل `architecture_brief.py` و`check_docs_links.py` وفحوص glossary/source-of-truth ضمن CI الإلزامي (انظر [`.github/workflows/docs-governance.yml`](../.github/workflows/docs-governance.yml)).

هذه الخطوة هي الأساس، لأن أي توسع قبلها سيعيد الفوضى.

### المرحلة 2: أغلق مسارًا حيًا واحدًا

أفضل مسار الآن هو:

**Partner intake → Partner dossier → Economics model → Approval packet → Approval Center → Workflow commitment → Evidence pack → Executive weekly summary**

هذا المسار هو أفضل مسار Tier-1 لأنه يثبت:

* Structured Outputs
* HITL
* durable state
* evidence pack
* executive visibility

ويظهر قيمة سريعة بدون تعقيد M&A الكامل. ([OpenAI][1])

### المرحلة 3: اربط الحوكمة بالإطلاق

بعد المسار الحي، فعّل Release Gate:

* لا RC صالح بلا Release Readiness Matrix
* لا RC صالح مع contradiction V3 مفتوح
* لا RC صالح بلا executive signoff لمسار حي
* لا RC صالح بلا provenance path حيث تسمح الخطة والمنصة

هذا هو الفارق بين "النظام يعمل" و"النظام صالح للإطلاق المؤسسي". ([GitHub Docs][3])

### المرحلة 4: فعّل مسار سعودي حساس واحد

اختر workflow واحد فقط:

* مشاركة بيانات شريك
* عرض خارجي يحوي بيانات شركة/أشخاص
* ingestion لوثائق DD

ثم اربطه بـ:

* PDPL classification
* NCA/ECC owner
* NIST GenAI overlay
* OWASP mapping
* retention/export rules

هنا تتحول الجاهزية السعودية من وثيقة قوية إلى control حي.

**مرجع مصفوفة:** [`governance/pdpl-nca-ai-control-matrices.md`](governance/pdpl-nca-ai-control-matrices.md).

---

## كيف ترسم ما بعد الإغلاق؟

بعد ما تتأكد أن الإغلاق تم، لا تبني roadmap على شكل features.
ابنه على شكل **4 طبقات**:

**1) Assurance**  
truth، CI، evidence، release gates

**2) Live operating surfaces**  
Executive Room، Approval Center، Evidence Viewer، Actual vs Forecast

**3) Durable commitments**  
partner approvals، signatures، DD orchestration، launches، PMI

**4) Market dominance**  
packaging، pricing، Saudi/GCC compliance narrative، enterprise rollout

هذا أفضل رسم لأن السوق اليوم يكافئ المنصات التي تدمج الذكاء داخل العمل الحقيقي وتضبط المخاطر والحوكمة، لا المنصات التي "تبدو ذكية" فقط. ([OpenAI][1])

---

## تعريف "كل شيء مقفل"

لا تعتبر النظام مقفلًا بالكامل إلا إذا تحقق هذا معًا:

* كل output حرج schema-bound
* كل external commitment يمر عبر approval + evidence + correlation
* عندك live path واحد كامل end-to-end
* CI يحرس docs/scripts/contracts
* Executive Room حي ويُستخدم أسبوعيًا
* Release Matrix توقف الإطلاق فعلًا
* مسار سعودي حساس واحد mapped ومفعل
* لا يوجد overclaim بين docs والكود والحالة التشغيلية

إذا تحققت هذه الثمانية، فأنت لم تعد "قريبًا من Tier-1" — أنت **دخلت Tier-1 تشغيلًا**.

---

## القرار العملي الآن

إذا تبي **أفضل بداية حقيقية** من هذه اللحظة، فابدأ بهذا الترتيب اليوم:

1. شغّل truth pass على كل docs/gates.
2. فعّل CI على docs/scripts/contracts.
3. أغلق المسار الذهبي للشراكات end-to-end.
4. فعّل Executive Room من `ExecWeeklyGovernanceContract` كمصدر وحيد.
5. اربط Release Readiness Matrix بالـ PR/RC فعليًا.
6. فعّل workflow سعودي حساس واحد بالكامل.

هذا هو أقصر طريق واقعي للإغلاق الصحيح، وليس مجرد "إكمال ملفات".

---

## المراجع

[1]: https://openai.com/index/introducing-structured-outputs-in-the-api/ "Introducing Structured Outputs in the API | OpenAI"  
[2]: https://docs.langchain.com/oss/javascript/langgraph/durable-execution "Durable execution - Docs by LangChain"  
[3]: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect "OpenID Connect in GitHub Actions | GitHub Docs"
