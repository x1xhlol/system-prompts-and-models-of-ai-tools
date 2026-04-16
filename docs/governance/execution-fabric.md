# Execution fabric — durable commitments (current vs Tier-1 target)

**Canonical:** [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md).  
**Six tracks:** [`../dealix-six-tracks.md`](../dealix-six-tracks.md).

## Principle

Anything that:

- lasts **hours to weeks**,
- crosses **multiple systems**,
- needs **retries, idempotency, or compensation**,
- and **must not be lost** on crash, restart, or deploy

belongs in the **execution plane**, implemented as **deterministic workflows** — not as ephemeral agent narration alone.

## Current state (this repository — evidence-based)

| Mechanism | Role | Typical use in Dealix |
|-----------|------|------------------------|
| **FastAPI** | Synchronous / async request path | APIs, webhooks entrypoints |
| **Celery** | Async tasks, beat schedules | Notifications, SLA ticks, background jobs |
| **LangGraph** (where used) | Stateful agent graphs, HITL interrupts | Cognition + bounded flows with checkpoints |
| **`salesflow-saas/backend/app/flows/`** | Named durable-style flows | Prospecting, self-improvement, etc. (verify each flow’s persistence model in code) |

This stack is **valid** for many SaaS patterns. Tier-1 **does not** require ripping it out overnight; it requires **clear ownership** and **criteria** for when a flow must graduate to a stronger runtime.

## Tier-1 target: Temporal (or equivalent durable workflow engine)

**Temporal** (or another workflow engine with the same properties) is the **documented target** for:

- cross-system **business commitments** (signatures, partner activation, DD room state, PMI milestones),
- **worker versioning** and safe rollout of workflow code,
- **crash-proof** resume after process/network failure.

**Status:** *Planned* until an ADR-approved spike ships with tests. See [`../adr/0001-tier1-execution-policy-spikes.md`](../adr/0001-tier1-execution-policy-spikes.md).

## When to keep Celery vs graduate to Temporal

| Signal | Prefer Celery / short task | Prefer Temporal / workflow engine |
|--------|-----------------------------|-----------------------------------|
| Duration | Minutes, single service | Hours–days, multi-step state machine |
| State | Task idempotency sufficient | Long-lived state + human waits + versioning |
| Compensation | Rare, manual acceptable | Required, audited, replayable |
| Failure domain | Retry and DLQ enough | Must resume exact step after deploy |

## LangGraph vs Temporal (division of labor)

- **LangGraph:** decision-centric cognition, structured outputs, interrupts, **bounded** execution loops tied to agent sessions.
- **Temporal:** **system-of-record** for long-lived business processes, external side effects, and compensation — especially when multiple teams or services participate.

Do not duplicate the same external commitment path in both without an explicit boundary (one source of truth for “what step are we on?”).

## Evidence before production promotion

Any new execution path that sends customer messages, moves money, signs contracts, or opens external systems must:

1. Carry **approval_class**, **reversibility_class**, **sensitivity_class** (see [approval-policy.md](approval-policy.md)).
2. Emit **correlation/trace** IDs and persist audit-friendly records.
3. Pass **security gate** and release checklist for the environment.

See also: [events-and-schema.md](events-and-schema.md), [trust-fabric.md](trust-fabric.md), [github-and-release.md](github-and-release.md).

---

## LangGraph durability modes (policy sketch)

Classify each graph by **how state must survive** process restarts and deploys:

| Mode | When to use | Notes |
|------|-------------|--------|
| **`exit`** | Ephemeral assistance, no business state | Graph ends with the HTTP/session; no recovery requirement. |
| **`async`** | Bounded background continuation acceptable | Tasks may be lost on crash unless explicitly checkpointed — document the loss window. |
| **`sync` / durable checkpoint** | HITL waits, multi-step approvals, or any path that can cause **external_message** / **external_commitment** | Require checkpointing + idempotency keys aligned with `ExecutionIntent`; prefer graduating external effects to Temporal per division-of-labor above. |

External references: LangGraph durable execution — [`../references/tier1-external-index.md`](../references/tier1-external-index.md).

## HITL taxonomy (approve / edit / reject)

Human-in-the-loop steps on governed paths MUST record one of: **`approve`** (proceed as proposed), **`edit`** (proceed with amended structured payload), **`reject`** (terminate with reason). Map API fields and audit events to this taxonomy consistently (LangChain HITL vocabulary — same external index).

**Rule:** `reject` on Class B / R2+ MUST emit a policy-safe audit row and MUST NOT leave dangling `ExecutionIntent` rows marked runnable.
