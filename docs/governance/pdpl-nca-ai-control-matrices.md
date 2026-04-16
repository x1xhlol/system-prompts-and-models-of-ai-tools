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

## Region / residency flags

Define configuration keys for **data region** and **LLM routing** per tenant; document in ADR when enforced in `policy_engine` or external PDP.
