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

---

## Target Tier-1 components (policy, IAM, secrets) — vs current

The following are **architecture targets** for enterprise-grade trust. They are **not** all implemented as named products in this repo today. Track status in [`../dealix-six-tracks.md`](../dealix-six-tracks.md) and [`technology-radar-tier1.md`](technology-radar-tier1.md).

| Component | Role | Target use in Dealix | Current (typical) |
|-----------|------|----------------------|-------------------|
| **OPA / Rego** | Policy decision point over JSON inputs (deploy, tenancy, risk) | Central PDP for “may this workflow step run?” | Application policy in Python (`dealix_os/policy_engine.py`, services) — evolve toward policy-as-data |
| **OpenFGA** or **Cedar** | Fine-grained **authorization** (ReBAC / analyzable policies) | DD room, term sheet, board memo, agent-on-behalf-of-user | RBAC in app + tenant checks — evolve toward explicit relationship model |
| **HashiCorp Vault** (or cloud equivalent) | **Secrets**, dynamic credentials, audit | Short-lived DB/API credentials, connector secrets | Env + platform secrets — tighten rotation and audit story |
| **Keycloak** (or enterprise IdP) | **Identity**, SSO, brokering | B2B tenants, executive users | JWT / tenant auth in app — map to IdP roadmap |

**Integration pattern:** policy engines and PDPs should consume the same **A/R/S** and **actor_type** fields as events (see [events-and-schema.md](events-and-schema.md)) — avoid duplicating conflicting rules in prompts.

**Spike gate:** no production dependency on OPA/OpenFGA/Vault/Keycloak until ADR + security review + tests; see [`../adr/0001-tier1-execution-policy-spikes.md`](../adr/0001-tier1-execution-policy-spikes.md).

---

## Runtime policies (Tier-1 operational — beyond the radar)

These are **enforcement expectations** once a component is in-path in production (pair with [`github-and-release.md`](github-and-release.md) and [`operational-severity-model.md`](operational-severity-model.md)).

### OpenFGA — pinned authorization models

- **No production call path** without a recorded **`authorization_model_id`** (or equivalent immutable model version) in configuration and deploy manifests. Models are **immutable** in OpenFGA; pin IDs per environment and rotate via controlled rollout — see [`../references/tier1-external-index.md`](../references/tier1-external-index.md) (OpenFGA links).
- Agent-on-behalf-of-user flows MUST be modeled explicitly (no implicit super-user tuples).

### Vault (or equivalent) — dual audit devices

- Production clusters MUST enable **at least two** independent audit devices (e.g. file + SIEM socket) so tampering or loss of one sink does not erase the audit trail — see Vault audit documentation in [`../references/tier1-external-index.md`](../references/tier1-external-index.md).

### OpenTelemetry — log correlation

- Critical paths (approvals, external commitments, connector facade calls) MUST emit **`trace_id`**, **`span_id`**, and a stable **`correlation_id`** (or equivalent) in structured logs and audit receipts so SIEM queries can join API ↔ worker ↔ workflow — see OTel logging spec in [`../references/tier1-external-index.md`](../references/tier1-external-index.md).
