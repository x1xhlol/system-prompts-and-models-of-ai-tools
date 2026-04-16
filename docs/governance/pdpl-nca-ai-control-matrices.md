# PDPL, NCA ECC, and AI control matrices (operational templates) — WS7

**Not legal advice.** Engineering templates to operationalize [`saudi-compliance-and-ai-governance.md`](saudi-compliance-and-ai-governance.md).

## PDPL control matrix (template)

| Control ID | Topic | Implementation hint | Evidence |
|------------|-------|----------------------|----------|
| PDPL-01 | Lawful basis documented | Link to consent / contract in [`salesflow-saas/docs/legal/`](../../salesflow-saas/docs/legal/) | Policy version + UI copy hash |
| PDPL-02 | Data minimization | Field-level collection review per feature | Design review sign-off |
| PDPL-03 | Subject access / export | Runbook + API capability | Test + ticket |
| PDPL-04 | Retention & deletion | TTL jobs + soft-delete | Job logs |
| PDPL-05 | Processor / subprocessor register | Table of vendors + regions | Updated quarterly |

## NCA ECC readiness gap register (template)

| ECC theme | Gap | Mitigation owner | Target date | Status |
|-----------|-----|------------------|-------------|--------|
| Asset management | … | … | … | Open |

(Replace with organization-specific mapping against ECC 2-2024 controls.)

## AI governance mapping (NIST AI RMF + OWASP LLM)

| RMF function | Practical control | Release gate |
|--------------|-------------------|--------------|
| Govern | Model allowlist per environment | WS6 |
| Map | Data flow for prompts containing PII | WS7 |
| Measure | Offline eval + red-team subset | WS4 |
| Manage | Rollback + incident runbook | WS3/WS6 |

| OWASP LLM risk | Mitigation | Test |
|----------------|------------|------|
| Prompt injection | Tool allowlists + input guards | Automated + manual |
| Insecure output handling | Schema validation on outputs | pytest |
| Excessive agency | Executor vs recommender separation | Policy review |

### NIST AI RMF GenAI profile + OWASP LLM Top 10 (2025) → Dealix planes

Map each control or test case to **one primary plane** so WS owners stay accountable (see [`../SOURCE_OF_TRUTH_INDEX.md`](../SOURCE_OF_TRUTH_INDEX.md) for doc hierarchy).

| مصدر / مخاطرة | طائرة القرار (Decision) | طائرة الثقة (Trust) | الموصلات (Connector) | البيانات (Data) | التشغيل / التكلفة (Runtime) |
|----------------|-------------------------|----------------------|----------------------|-----------------|-------------------------------|
| GenAI profile — Govern | سياسات memos، تصنيف A/R/S | سياسات تدقيق وسجلات | — | سياسات الاحتفاظ | حدود ميزانية نماذج |
| GenAI profile — Map | تدفق prompt/PII في القرار | تدفق أدوات وMCP | حدود موصل الطرف الثالث | مصادر بيانات حساسة | تتبع تكلفة tokens |
| GenAI profile — Measure | تقييم structured outputs | red-team، contradictions | اختبارات فشل موصل | GE checkpoints | SLO زمن استجابة |
| GenAI profile — Manage | HITL، رفض مسار | حوادث، rollback | تعطيل موصل | إيقاف تزامن بيانات | إصدار نماذج |
| OWASP LLM — Prompt injection | وكلاء + prompts | tool verification | واجهات runtime tools | — | — |
| OWASP LLM — Insecure output handling | Pydantic / JSON schema | ledger على المطالبات | — | — | — |
| OWASP LLM — Excessive agency | Decision vs Execution فصل | ApprovalPacket | — | — | workflow gates |
| OWASP LLM — Sensitive disclosure | تصنيف S2/S3 | تدقيق تصدير | scopes موصل | PDPL minimization | تسجيل مراقبة |

**مراجع خارجية:** [`../references/tier1-external-index.md`](../references/tier1-external-index.md).

## Region / residency flags

Define configuration keys for **data region** and **LLM routing** per tenant; document in ADR when enforced in `policy_engine` or external PDP.

---

## Enterprise release gate (operational)

Before tagging an **enterprise** release candidate:

1. Reconcile this matrix with [`../enterprise-readiness.md`](../enterprise-readiness.md) and [`saudi-compliance-and-ai-governance.md`](saudi-compliance-and-ai-governance.md).  
2. Fill a row in [`../RELEASE_READINESS_MATRIX_AR.md`](../RELEASE_READINESS_MATRIX_AR.md) for the RC (docs truth, connectors, security, Saudi, provenance).  
3. Attach evidence: PDPL rows above filled (no `…` placeholders for production claims), NCA gap register owner + date, AI RMF row sign-off.  
4. Cross-check [`../TIER1_MASTER_CLOSURE_CHECKLIST_AR.md`](../TIER1_MASTER_CLOSURE_CHECKLIST_AR.md) §14 and [`../../salesflow-saas/docs/tier1-master-closure-checklist.md`](../../salesflow-saas/docs/tier1-master-closure-checklist.md) Gate 8.
