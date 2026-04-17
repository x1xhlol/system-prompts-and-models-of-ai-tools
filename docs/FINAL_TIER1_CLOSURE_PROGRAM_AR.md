---
version: "1.0"
owner: "Program + Architect"
status: "canonical"
review_cadence: "عند تغيير معايير Tier-1 أو أدوات الموردين أو بوابات الإصدار"
last_updated: "2026-04-16"
---

# FINAL_TIER1_CLOSURE_PROGRAM_AR

---

## مقدمة

هذا المستند هو **برنامج الإغلاق النهائي لـ Tier-1** في Dealix.
الغرض منه ليس إضافة أفكار جديدة، بل تثبيت ما بُني، وفرضه تشغيليًا، وإغلاق الفجوة بين:

* المرجعية
* التنفيذ
* التشغيل
* الجاهزية المؤسسية

### القاعدة الحاكمة

**AI يستكشف ويحلل ويقترح. الأنظمة تنفذ. البشر يعتمدون القرارات الحرجة. الأدلة تثبت كل شيء.**

### الاعتماديات المرجعية المعتمدة

1. **OpenAI Responses API + remote MCP/tools** لطبقة القرار والاستدعاءات المهيكلة. ([platform.openai.com][1])
2. **Structured Outputs** بدل JSON mode للمخرجات الحرجة. ([OpenAI][2])
3. **LangGraph durable execution** للمسارات stateful وHITL. ([docs.langchain.com][3])
4. **GitHub OIDC** لتبادل short-lived credentials بدل الأسرار الثابتة. ([GitHub Docs][4])
5. **GitHub artifact attestations** لإثبات provenance وسلامة البناء. ([GitHub Docs][5])
6. **OpenFGA immutable model pinning** لتثبيت authorization model في الإنتاج. ([openfga.dev][6])
7. **NIST AI RMF + GenAI Profile** كمرجعية حوكمة ومخاطر للذكاء الاصطناعي. ([NIST][7])

**مرافق:** [`TIER1_CLOSURE_VERIFICATION_POSTCLOSURE_AR.md`](TIER1_CLOSURE_VERIFICATION_POSTCLOSURE_AR.md) (ستة اختبارات إغلاق) · [`TIER1_PRODUCTION_ACTIVATION_PROGRAM_AR.md`](TIER1_PRODUCTION_ACTIVATION_PROGRAM_AR.md) (تفعيل إنتاج) · [`TIER1_REAL_PRODUCTION_PLAYBOOK_AR.md`](TIER1_REAL_PRODUCTION_PLAYBOOK_AR.md) (Playbook مراحل الإطلاق) · [`TIER1_TRUST_EXPANSION_PLAN_AR.md`](TIER1_TRUST_EXPANSION_PLAN_AR.md) (توسع الثقة) · [`GO_LIVE_REVENUE_ACTIVATION_SYSTEM_AR.md`](GO_LIVE_REVENUE_ACTIVATION_SYSTEM_AR.md) (تفعيل إيراد Go-Live).

---

## 1) Must enforce now

هذا القسم ليس roadmap؛ هذا **قانون تشغيل**. أي بند هنا يجب أن يتحول إلى منع فعلي داخل runtime وCI.

| البند التنفيذي                                 | لماذا مهم                                                                         | Owner              | Evidence required                                                                          | Exit criteria                                        | What good looks like                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Structured Outputs إلزامية لكل المخرجات الحرجة | لأن `json_schema` يعطي التزامًا أقوى بالبنية من JSON mode                         | AI Platform Lead   | schemas + runtime validation + fixture tests                                               | لا يوجد output حرج free-text أو schema-less          | كل `memo_json` و`approval_packet_json` و`execution_intent_json` تمر validation تلقائيًا |
| Evidence Gate إلزامي لكل `external_*`          | لأن أي external commitment بدون approval/evidence/correlation يضرب الثقة والتدقيق | Trust Systems Lead | tests تفشل عند غياب `correlation_id` أو `trace_id` أو `approval_packet` أو `evidence_pack` | أي external flow يفشل hard إذا نقص شرط               | لا يمر term sheet أو signature request بلا bundle كامل                                  |
| Root-safe execution                            | لأن path assumptions تكسر hooks/CI وتخلق drift                                    | DevEx Lead         | preflight من جذر الريبو + hook/CI enforcement                                              | كل أمر يبدأ من repo root                             | لا يوجد `cd` hardcoded لمسار قديم                                                       |
| Severity V0–V3 policy                          | لتحويل severity من توصيف إلى سياسة قرار                                           | Governance Lead    | severity mapping في approvals / contradictions / incidents                                 | V2/V3 توقف promotion أو external commitment تلقائيًا | severity تؤثر فعليًا على السلوك                                                         |
| Source-of-Truth enforcement                    | لمنع تضارب docs والـ PRs والنسخ                                                   | Program Manager    | `SOURCE_OF_TRUTH_INDEX.md` مكتمل ومربوط                                                    | كل topic له canonical file واحد                      | لا يوجد ملفان يعرّفان الشيء نفسه بلا أولوية                                             |

### قرار Tier-1

يجب أن تصبح **Docs/Governance CI** جزءًا من P0، لأن الحقيقة المرجعية إذا بقيت خارج CI فستتباعد عن التنفيذ مهما كانت قوة attestations. كما يجب فصل **OIDC** عن **artifact attestations** داخل الضوابط: الأول خاص بالوصول الآمن إلى مزودات السحابة ([GitHub Docs][4])، والثاني خاص بإثبات provenance للـ artifacts ([GitHub Docs][5]).

---

## 2) One live path to close

لا تغلقوا Tier-1 عبر عشرات المسارات.
أغلقوه عبر **مسار حي واحد** يمثل المنصة كلها.

### المسار الذهبي المعتمد

**Partner intake → Partner dossier → Economics model → Approval packet → Approval Center → Workflow commitment → Evidence pack → Executive weekly summary**

### لماذا هذا هو المسار الأفضل؟

لأنه يختبر:

* Decision Plane
* Trust Plane
* Execution Plane
* Data Plane
* Executive Surface

دفعة واحدة، وهو أسرع مسار لإظهار قيمة تشغيلية وتجارية مبكرة.

| البند التنفيذي              | لماذا مهم                    | Owner                 | Evidence required                      | Exit criteria                           | What good looks like                       |
| --------------------------- | ---------------------------- | --------------------- | -------------------------------------- | --------------------------------------- | ------------------------------------------ |
| Partner dossier حي          | يثبت أن القرار ليس نصًا حرًا | Partnerships Lead     | dossier artifact + schema pass         | dossier يُولد من بيانات حقيقية          | dossier قابل للعرض والمراجعة               |
| Economics model حي          | يربط الشراكة بالمال          | Strategy/Finance Lead | economics output + assumptions         | contribution margin visible             | لا توجد شراكة بلا economics                |
| Approval path حي            | يثبت Trust Fabric عمليًا     | Governance Lead       | approval logs + SLA                    | approve/edit/reject working             | المسار لا يتجاوز approval                  |
| Workflow commitment حي      | يثبت execution beyond chat   | Platform Lead         | commitment record + status transitions | state moves correctly with pause/resume | المسار يستكمل بعد interruption             |
| Evidence pack حي            | يثبت reproducibility         | Trust Lead            | evidence pack + source links           | reproducible from same inputs           | القرار يأتي معه دليله                      |
| Executive weekly summary حي | يثبت board-usable surface    | Product Lead          | weekly contract rendered in UI         | exec can review one live case weekly    | التنفيذي يرى "ماذا تغير؟ ماذا يحتاج قرار؟" |

### قرار Tier-1

لا يبدأ مسار حي ثانٍ قبل نجاح هذا المسار في:

* schema validation
* SLA approval
* contradiction handling
* executive usage
* reproducible evidence

---

## 3) CI changes

افصلوا CI إلى ثلاث حارات واضحة.

### A. Docs & Governance CI

يشغّل:

* `python scripts/architecture_brief.py`
* `python scripts/check_docs_links.py`
* source-of-truth checks
* no-overclaim checks
* glossary consistency checks

### B. Schemas & Contracts CI

يشغّل:

* JSON schema validation
* structured output fixtures
* approval/evidence contract tests
* correlation propagation tests

### C. Runtime Trust & Release CI

يشغّل:

* approval flow tests
* contradiction flow tests
* workflow commitment tests
* release readiness completeness checks
* executive contract generation tests

| البند التنفيذي           | لماذا مهم                                             | Owner            | Evidence required                   | Exit criteria                          | What good looks like           |
| ------------------------ | ----------------------------------------------------- | ---------------- | ----------------------------------- | -------------------------------------- | ------------------------------ |
| Docs/Governance CI مستقل | لأن docs/scripts جزء من source of truth               | DevEx Lead       | workflow file + passing runs        | أي تغيير في docs/scripts يطلق checks   | لا drift بين المرجعية والتنفيذ |
| Contracts CI             | لأن Structured Outputs تحتاج fixture validation أيضًا | AI Platform Lead | fixture suite + CI pass             | كل contract حرج covered                | أي كسر في schema يظهر فورًا    |
| Release Readiness CI     | لربط الحوكمة بالإطلاق                                 | Release Manager  | release matrix generated on RC      | لا RC صالح بلا matrix مكتملة           | الإطلاق قرار موثق لا شفهي      |
| Provenance check         | لرفع supply-chain trust                               | Platform Lead    | attestation step أو documented gate | one artifact path at least provenanced | تعرف كيف بُني كل artifact      |

### قرار Tier-1

يجب أن تصبح `RELEASE_READINESS_MATRIX_AR.md` **gate فعلية** في PR/RC، لا مجرد وثيقة مرجعية. كما يجب أن تبقى حوكمة `docs/` و`scripts/` تحت CI دائمًا، لأنها جزء من الدستور التشغيلي لا من الشرح فقط. ([GitHub Docs][5])

---

## 4) Executive surface rollout

أفضل rollout الآن ليس كل الأسطح، بل أربع واجهات حية فقط.

### Executive Room

يعرض:

* what changed this week
* what needs decision now
* what is blocked
* what is at risk if delayed
* actual vs forecast

### Approval Center

يدعم:

* approve
* edit
* reject

### Evidence Pack Viewer

يعرض:

* sources
* assumptions
* freshness
* confidence
* approvals
* tool receipts
* contradictions

### Actual vs Forecast

موحد بين:

* revenue
* partnerships
* execution velocity
* trust incidents

| البند التنفيذي               | لماذا مهم                       | Owner           | Evidence required          | Exit criteria                          | What good looks like                           |
| ---------------------------- | ------------------------------- | --------------- | -------------------------- | -------------------------------------- | ---------------------------------------------- |
| Executive Room حي            | هذا هو surface الذي "يبيع نفسه" | Product Lead    | live screen + weekly usage | stakeholder تنفيذي يستخدمه أسبوعيًا    | الإدارة ترى control tower لا dashboards مبعثرة |
| Approval Center ثلاثي القرار | يرفع نضج الحوكمة                | Governance Lead | approve/edit/reject logs   | كل قرار حساس يمر عبره                  | لا approvals خارج النظام                       |
| Evidence Pack Viewer حي      | يثبت الثقة                      | Trust Lead      | one live viewer path       | evidence inspectable for one live flow | كل قرار له ملف أدلة واضح                       |
| Actual vs Forecast موحد      | يربط القرار بالأثر              | Finance/Product | live dashboard             | weekly review حي                       | التنفيذي يرى deviation مبكرًا                  |

### قرار Tier-1

يجب أن يكون **`ExecWeeklyGovernanceContract` هو المصدر الوحيد** الذي يغذي:

* Executive Room
* Weekly pack
* Board draft
* What changed
* Pending decisions
* Blockers
* At-risk items

ولا يسمح بأي منطق موازٍ لهذه الواجهات.

---

## 5) Saudi control activation

أفضل Tier-1 هنا هو **workflow-level control activation**.

ابدأوا بمسار سعودي حساس واحد فقط، مثل:

* partner data sharing
* external proposal containing personal/company data
* DD document ingestion

ثم اربطوه بـ:

* PDPL data classification
* NCA/ECC owner
* NIST GenAI overlay
* OWASP LLM threat mapping
* retention/export rules
* approval and audit path

| البند التنفيذي                   | لماذا مهم                        | Owner                | Evidence required           | Exit criteria               | What good looks like                         |
| -------------------------------- | -------------------------------- | -------------------- | --------------------------- | --------------------------- | -------------------------------------------- |
| Saudi Workflow Control Matrix حي | يحول الامتثال من doc إلى control | Compliance Lead      | matrix by workflow          | one workflow fully mapped   | لا غموض في data class / approval / retention |
| NIST GenAI overlay               | يرفع نضج AI governance           | AI Safety Lead       | control mapping on one flow | AI risk reviewed in release | المخاطر التوليدية مرئية لا ضمنية             |
| OWASP mapping by plane           | يحسن threat modeling             | Security Lead        | mapped surfaces             | one active checklist used   | لكل plane تهديداته وضوابطه                   |
| Retention/export policy حي       | مهم قانونيًا وتشغيليًا           | Compliance/Data Lead | retention rules + owner     | one sensitive path governed | تعرف ماذا يُحفظ وأين ولمدة كم                |

### قرار Tier-1

لا تعتبروا Saudi readiness "مكتملة" حتى يوجد **workflow واحد حي** مرتبط بـ:

* PDPL
* NCA/ECC
* NIST GenAI
* OWASP

بشكل عملي، لا وثائقي فقط. ([NIST][7])

---

## 6) Release gate

لا يوجد Release Candidate صالح إلا إذا تحققت الشروط التالية معًا:

* `architecture_brief.py` passes
* Docs/Governance CI passes
* Structured output contracts pass
* Approval flow حي لمسار واحد على الأقل
* Evidence pack reproducibility مثبتة
* No unresolved V3 contradiction
* One executive view محدث من بيانات حية
* One Saudi-sensitive workflow mapped and gated
* Provenance path موجود حيث تسمح الخطة والبنية

| البند التنفيذي                   | لماذا مهم                        | Owner           | Evidence required               | Exit criteria              | What good looks like             |
| -------------------------------- | -------------------------------- | --------------- | ------------------------------- | -------------------------- | -------------------------------- |
| Release Readiness Matrix إلزامية | تمنع إطلاقًا مبنيًا على الانطباع | Release Manager | completed matrix per RC         | no release without matrix  | الإطلاق قرار موثق لا شفهي        |
| Contradiction gate               | يمنع تجاهل تعارضات خطرة          | Trust Lead      | contradiction severity queue    | no open V3 on RC           | الخطر الواضح يوقف الإطلاق        |
| Provenance gate                  | يرفع ثقة supply chain            | Platform Lead   | attestation/provenance evidence | one verified artifact path | تعرف ماذا بُني وكيف              |
| Executive signoff path           | يربط المنتج بالإدارة             | Product/Founder | review log                      | one exec review per RC     | الإدارة جزء من gate وليس ما بعده |

### قرار Tier-1

يجب أن يكون **صف RC في `RELEASE_READINESS_MATRIX_AR.md` موجودًا ومفحوصًا آليًا**، وأي RC بلا matrix مكتملة أو بلا صف RC صالح يعتبر غير مؤهل للإطلاق.

---

## 7) Definition of Tier-1 complete

اعتبروا Dealix **Tier-1 complete** فقط إذا تحققت هذه الشروط معًا:

1. كل output حرج schema-bound ويجتاز validation.
2. يوجد live path واحد end-to-end عبر Decision + Trust + Execution + Executive.
3. يوجد approval flow حي مع SLA measurable.
4. يوجد contradiction-aware tool flow حي.
5. توجد Evidence Pack قابلة لإعادة البناء من نفس المصادر بنفس الهيكل.
6. CI يحرس docs/scripts/contracts، لا الكود فقط.
7. توجد Executive Room تُستخدم فعليًا في مراجعة أسبوعية.
8. يوجد Saudi control activation لمسار حي واحد على الأقل.
9. يوجد provenance/release control واضح where applicable.
10. لا يوجد overclaim بين docs والكود والحالة التشغيلية.

| البند التنفيذي                     | لماذا مهم                    | Owner            | Evidence required            | Exit criteria                            | What good looks like                 |
| ---------------------------------- | ---------------------------- | ---------------- | ---------------------------- | ---------------------------------------- | ------------------------------------ |
| Structured critical outputs        | أساس trustable decisioning   | AI Platform Lead | pass rate reports            | all critical outputs validated           | outputs قابلة للتشغيل لا للقراءة فقط |
| One live end-to-end path           | يثبت أن النظام ليس docs-only | Program Lead     | demo + logs + artifacts      | one path closed fully                    | المنصة تعمل كنسيج واحد               |
| Executive weekly usage             | يثبت product reality         | Product Lead     | usage analytics / review log | one executive role weekly active         | النظام جزء من cadence الإدارة        |
| Saudi-sensitive control activation | يثبت الجاهزية المحلية        | Compliance Lead  | mapped workflow evidence     | one live governed workflow               | الامتثال حاضر في التشغيل             |
| No-overclaim state                 | يحمي الثقة                   | Program Manager  | truth audit                  | zero misleading claims in canonical docs | الواقع والوثيقة متطابقان             |

---

## الحكم النهائي

**نعم، بهذه الصيغة هي Tier-1 فعلًا وبأفضل شكل منطقي الآن**، لكن بشرط واحد حاسم:

لا تعتبروا "اكتمال الوثائق" = "اكتمال Tier-1".
Tier-1 الحقيقي يبدأ عندما يصبح هذا البرنامج:

* enforced in runtime
* guarded by CI
* proven by one live path
* visible in executive surfaces
* reflected in release decisions

إذا طبقتم الأقسام السبعة أعلاه كما هي، فأنتم لا تعودون "قريبين من Tier-1"، بل **دخلتم Tier-1 تشغيلًا**.

---

## المراجع الرسمية

1. OpenAI Responses API + remote MCP / tools. ([platform.openai.com][1])
2. OpenAI Structured Outputs. ([OpenAI][2])
3. LangGraph durable execution. ([docs.langchain.com][3])
4. GitHub Actions OIDC. ([GitHub Docs][4])
5. GitHub artifact attestations. ([GitHub Docs][5])
6. OpenFGA immutable authorization models. ([openfga.dev][6])
7. NIST AI RMF + NIST GenAI Profile. ([NIST][7]) — ملحق GenAI: [NIST GenAI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)

[1]: https://platform.openai.com/docs/api-reference/responses/remote-mcp "API Overview | OpenAI API Reference"
[2]: https://openai.com/index/introducing-structured-outputs-in-the-api/ "Introducing Structured Outputs in the API | OpenAI"
[3]: https://docs.langchain.com/oss/javascript/langgraph/durable-execution "Durable execution - Docs by LangChain"
[4]: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect "OpenID Connect in GitHub Actions | GitHub Docs"
[5]: https://docs.github.com/en/enterprise-cloud@latest/actions/concepts/security/artifact-attestations "Artifact attestations | GitHub Docs"
[6]: https://openfga.dev/docs/getting-started/immutable-models "Immutable Authorization Models | OpenFGA"
[7]: https://www.nist.gov/itl/ai-risk-management-framework "AI Risk Management Framework | NIST"
