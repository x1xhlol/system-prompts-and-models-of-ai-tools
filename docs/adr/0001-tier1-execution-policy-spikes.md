# ADR 0001 — Tier-1 spikes: Temporal, OPA, OpenFGA (gated)

- **Status:** Proposed  
- **Date:** 2026-04-16  
- **Context:** Dealix Tier-1 roadmap targets **Temporal** for crash-proof long workflows and **OPA / OpenFGA** (or Cedar) for separable policy and fine-grained authorization. The repo today uses **FastAPI, Celery, LangGraph**, and in-app policy patterns.

## Decision (interim)

**Do not** merge production dependencies on Temporal, OPA, or OpenFGA until **all** spike exit criteria below are met for each technology independently.

Until then, document them only as **targets** in:

- [`../governance/execution-fabric.md`](../governance/execution-fabric.md)
- [`../governance/trust-fabric.md`](../governance/trust-fabric.md)
- [`../governance/technology-radar-tier1.md`](../governance/technology-radar-tier1.md)

## Spike — Temporal

**Goal:** One non-customer-critical workflow (or shadow mode) proving resume after worker kill and **worker versioning** story.

**Exit criteria:**

1. Workflow code and tests in CI (docker-compose or Temporal test server).
2. Idempotency keys on external side effects; compensation path documented.
3. Security review for secrets and network boundaries.
4. Runbook: deploy, rollback, and “what happens on double start.”
5. Product owner sign-off to move additional flows.

## Spike — OPA (or equivalent PDP)

**Goal:** One policy (e.g. environment promotion or “may send message”) evaluated from **structured input** (JSON) with decision logged.

**Exit criteria:**

1. Policy bundle versioned in repo; CI runs `opa test` (or equivalent) on policies.
2. No duplication of the same rule in prompts and OPA without explicit ownership.
3. Latency and failure mode documented (fail closed vs open).

## Spike — OpenFGA (or Cedar)

**Goal:** One authorization model (e.g. “user U may read DD room R for tenant T”) with tuple writes on lifecycle events.

**Exit criteria:**

1. Model file + migration plan for existing RBAC.
2. Performance test for hot paths.
3. Audit: who changed tuples; backup/restore considered.

## Evidence pack (per spike)

Each spike produces: design note, threat assumptions, test commands and results, rollback plan, and explicit **Approved / Rejected / Extend pilot** outcome recorded in this ADR or a superseding ADR.

## Consequences

- Engineering avoids **split brain** between agent narration and system-of-record workflows.
- Compliance and security can review **one** policy and auth surface per decision type.

## Related

- [`../execution-matrix-90d-tier1.md`](../execution-matrix-90d-tier1.md) Phase 0–1  
- [`../blueprint-master-architecture.md`](../blueprint-master-architecture.md)
