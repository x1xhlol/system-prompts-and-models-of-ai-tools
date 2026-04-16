# Approval, reversibility, sensitivity — policy model

Canonical context: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md). This file is the **operational reference** for classifying work before it ships. Expanded topics: [README.md](README.md).

## Approval class (A)

| Class | Who signs off | Typical examples |
|-------|----------------|------------------|
| **A0** | None | Read-only discovery, local drafts, internal notes |
| **A1** | Manager / lead | Staging config, non-prod feature flags, routine refactors behind flag |
| **A2** | Function head + legal/finance as needed | Billing, contracts, data retention, permission model changes |
| **A3** | Executive / board | Irreversible commitments, major market launch, regulated disclosures |

## Reversibility class (R)

| Class | Reverse | Typical examples |
|-------|---------|------------------|
| **R0** | Automatic | Feature flag off, revert commit, rollback migration (if designed) |
| **R1** | Limited ops effort | Revert deploy, disable integration, compensate with credits |
| **R2** | Costly / painful | Customer-visible data already acted on, partial external commitments |
| **R3** | Irreversible or binding externally | Signed terms, regulatory filing, money movement, public statement |

**Rule of thumb:** R2/R3 require explicit HITL (human-in-the-loop) or committee path before execution-plane runs.

### Reversibility vs approval (cross-check)

| Reversibility | Typical minimum approval | Notes |
|---------------|-------------------------|--------|
| **R0** | A0–A1 | Auto or lead sign-off per team policy |
| **R1** | A1 | Revert still needs accountable owner |
| **R2** | A2 | Legal/finance/functional head as appropriate |
| **R3** | A3 | Exec/board path for binding or public commitments |

Higher sensitivity (below) can **raise** the required approval even when reversibility is R0–R1 (e.g. S3 bulk export is never A0).

## Sensitivity class (S)

| Class | Data |
|-------|------|
| **S0** | Public / low sensitivity |
| **S1** | Internal operational |
| **S2** | Confidential / commercial |
| **S3** | Regulated / highly sensitive / personal / board |

**Rule:** No S2/S3 across tools, providers, or LLM endpoints without policy review and routing (e.g. local/private inference where required).

### Sensitivity vs action class

| Data / context | Default action class | Approval note |
|----------------|---------------------|----------------|
| **S0** | Class A possible | Still follow repo conventions |
| **S1** | Class A for read-only; Class B for writes affecting others | Team policy |
| **S2** | Class B minimum for export, integration, or model routing | No silent tool/provider hops |
| **S3** | Class B minimum; often A2–A3 | No LLM or third-party tool without explicit routing review |

## Actor type

`human` | `observer_agent` | `recommender_agent` | `executor_system` | `automated_workflow`

Observers and recommenders do **not** commit. Executors and workflows act only through **execution plane** paths with policy metadata.

## Action classes (ship discipline)

- **Class A** — Auto-allowed: maps, docs, tests generation, lint, read-only analysis.  
- **Class B** — Approval required: prod config, public publish, customer messages, migrations, RBAC, release promotion, external APIs.  
- **Class C** — Forbidden: exfiltration, bypass protections, silent destructive changes, disabling gates, claims without evidence.

### Mapping A / R / S to Class A / B / C

| Pattern | Class | Rationale |
|---------|-------|-----------|
| Read-only discovery, local drafts, unit tests, lint | **A** | No durable external commitment |
| R2/R3 or external side effect (message send, contract, money, public URL) | **B** or blocked until A met | Execution plane + HITL |
| R3 with inadequate A (e.g. board doc at S3 with A1 only) | **C** (do not ship) | Policy violation |
| Any claim of “done” without tests/logs/artifact | **C** | Evidence discipline |
| S2/S3 sent to new vendor, model, or MCP without review | **B** minimum | Data residency and tool governance |

**Executor systems and automated workflows** may only perform Class A actions autonomously where policy explicitly allows; otherwise they enqueue or pause for approval.

## Evidence pack (minimum)

For Class B and any R2/R3 decision: sources, assumptions, timestamps/freshness, compliance notes where relevant, alternatives, rollback/compensation, provenance score, pointers to tests or run artifacts.

A **decision memo without an evidence pack is incomplete.**

## Class B decision bundle gate (P0 — Tier-1 enterprise)

Any **Class B or higher** response that represents a governed decision MUST expose the unified bundle (see [`decision_plane_contracts.py`](../../salesflow-saas/backend/app/services/core_os/decision_plane_contracts.py)) with at minimum:

| Key | Role |
|-----|------|
| `memo_json` | `DecisionMemo` including non-empty `required_approvals` |
| `evidence_pack_json` | Structured evidence |
| `risk_register_json` | List (may be empty only if explicitly allowed by policy) |
| `approval_packet_json` | A/R/S + actor |
| `execution_intent_json` | Workflow key + idempotency + side-effect class |

**Correlation / trace (P0):** For `requested_side_effect_class` of `external_message` or `external_commitment`, `execution_intent_json.correlation_id` MUST be non-empty (enforced by `validate_class_b_bundle`). Prefer propagating the same value into `audit_metadata.trace_id` on the memo when OpenTelemetry is enabled. See [`trust-fabric.md`](trust-fabric.md) observability section.

## Operational severity (V0–V3)

Policy violations, contradictions, connector failures, and workflow failures SHOULD be classified with one scale for dashboards and release gates — see [`operational-severity-model.md`](operational-severity-model.md) and [`../RELEASE_READINESS_MATRIX_AR.md`](../RELEASE_READINESS_MATRIX_AR.md).

## GitHub governance (surface)

See [github-and-release.md](github-and-release.md) for the full model. Summary: protected `main`, required reviews and checks, CODEOWNERS as team scales, secret scanning and dependency review, OIDC for deploy keys where possible, environment promotion (dev → staging → canary → prod).
