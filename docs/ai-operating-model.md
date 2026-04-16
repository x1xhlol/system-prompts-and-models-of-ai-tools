# AI operating model — decision, execution, control, data, trust

This repository follows the **Master Operating Prompt** ([`MASTER_OPERATING_PROMPT.md`](../MASTER_OPERATING_PROMPT.md)): a governed hybrid stack, not “agents only.”

## Planes (summary)

| Plane | Owns | Must not |
|-------|------|-----------|
| **Decision** | Analysis, memos, structured recommendations, scenarios | Durable external commitments |
| **Execution** | Workflows, retries, idempotency, compensation, side effects | Unstructured “trust me” narration |
| **Control** | Policy, approvals, RBAC, secrets, promotion, audit | Ad-hoc rules in prompts |
| **Data** | Operational truth, contracts, metrics definitions, lineage | Duplicate conflicting metric meanings |
| **Trust** | Evidence packs, tool verification, security gate, evals | Claims without proof |

## Dealix implementation pointers

- **Agents / routing / pipeline:** [`salesflow-saas/backend/app/services/agents/`](../salesflow-saas/backend/app/services/agents/) — `router.py`, `executor.py`, `autonomous_pipeline.py`.
- **Prompts (runtime path):** [`salesflow-saas/ai-agents/prompts/`](../salesflow-saas/ai-agents/prompts/) — loaded by `AgentExecutor` (`PROMPTS_DIR`); policy stays in code/services, not inside markdown prompts.
- **Core OS (memos / governance direction):** [`salesflow-saas/backend/app/services/core_os/`](../salesflow-saas/backend/app/services/core_os/) — e.g. decision memo and related structures where present.
- **Launch & evidence discipline:** [`salesflow-saas/docs/LAUNCH_CHECKLIST.md`](../salesflow-saas/docs/LAUNCH_CHECKLIST.md), [`salesflow-saas/verify-launch.ps1`](../salesflow-saas/verify-launch.ps1).

## Operating sequence for any major change

1. Repository discovery (architecture + capability + gap + risk + trust).  
2. Smallest phase that proves value with tests and rollback.  
3. Evidence: tests, logs, or contract checks — as defined in the phase.  
4. Only then expand scope.

See also: [`approval-policy.md`](governance/approval-policy.md).
