# Trust fabric — verification, observability, security

**Canonical:** [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md).

The trust fabric is **operating substrate**, not a product feature checklist item. It wraps decision and execution planes.

## Components (minimum conceptual set)

1. **Policy gate** — rules evaluated before promotion or external commitment.
2. **Approval routing** — human or committee paths per approval class (see [approval-policy.md](approval-policy.md)).
3. **Authorization** — RBAC/ReBAC for memos, rooms, launches, admin actions.
4. **Audit logging** — durable records of who/what/when for governed actions.
5. **Tool verification** — evidence between intent, claim, and actual tool execution (pattern over vendor lock-in).
6. **Evidence packs** — tied to decision memos for Class B / R2+ work.
7. **Security validation** — white-box review before higher environments; stored findings; release blockers for critical issues.
8. **Traces, logs, metrics** — correlation IDs across API, workers, and workflows.
9. **Continuous evaluation** — offline datasets, online trace review, regression reviews.
10. **Red-team workflows** — for agent, RAG, tool, and MCP surfaces.
11. **Rollback review** — explicit compensation/rollback notes for risky changes.
12. **Metadata** — provenance, freshness, reversibility on outputs and events where applicable.

## Tool verification layer (per interaction)

Capture where possible:

- Request ID, run ID, agent or workflow ID  
- Intended action vs claimed action vs actual tool call  
- Parameters, outputs, material side effects  
- Timestamps  
- **Verification status:** `verified` | `partially_verified` | `unverified` | `contradicted`

If the system claims something happened but evidence is insufficient, treat as **contradicted** until corrected.

## Evaluation and observability

Require:

- Distributed tracing or correlation IDs end-to-end  
- Workflow step telemetry (start, success, failure, retry)  
- Tool-call, approval, rollback, and provider-routing telemetry  
- Structured output validation and I/O guardrails where LLMs drive branches  
- Periodic regression reviews for prompt/model/router changes  

## Security gate scope

Before shipping or promoting: auth, permissions, API routes, admin flows, uploads, webhooks, customer-facing messaging, AI-triggered action surfaces, connectors, release surfaces, MCP/tool surfaces, RAG and document ingestion paths.

Expect: severity classification, stored findings, and **release-blocking** rules for critical classes of issues.

## Dealix pointers

- Security-related services: `salesflow-saas/backend/app/services/security_gate.py`, `salesflow-saas/backend/app/utils/security.py`.
- Audit models: e.g. `salesflow-saas/backend/app/models/audit_log.py`.
- Launch discipline: `salesflow-saas/docs/LAUNCH_CHECKLIST.md`, `salesflow-saas/verify-launch.ps1`.

See also: [planes-and-runtime.md](planes-and-runtime.md), [github-and-release.md](github-and-release.md).
