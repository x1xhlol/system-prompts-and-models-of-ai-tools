# Planes and runtime guidance

**Canonical:** [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md) (same rules; this file is navigable detail).

## Three governing layers (stack posture)

1. **Exploration intelligence** — discovery, analysis, triage, scenarios, recommendations, decision memos, risk synthesis, forecasting. Outputs are structured (schema-first) with provenance and freshness.
2. **Committed execution** — the only layer that may create durable commitments, long-lived workflows, and external business actions (signatures, rollouts, partner flows, release promotion, PMI steps, etc.).
3. **Trust fabric** — policy, approvals, authorization, audit, security gates, tool verification, evidence packs, model/provider governance, traceability, evaluation.

**Primary rule:** AI may recommend; systems commit; humans approve critical decisions.

## Five planes (reference architecture)

| Plane | Owns | Must not |
|-------|------|----------|
| **Decision** | Cognition, memos, structured outputs, scenarios, review interrupts | Durable external side effects as “narration only” |
| **Execution** | Deterministic workflows, retries, compensation, idempotency, versioning, external commitments | Unstructured trust-me execution |
| **Control** | Policy, approvals, RBAC/ReBAC, secrets, environment promotion, audit, release gates | Ad-hoc rules living only in prompts |
| **Data** | Operational truth, semantic metrics, embeddings, contracts, lineage, quality, ingestion | Conflicting definitions of the same business metric |
| **Trust** | Verification, security evidence, model evaluation, provenance, freshness, reversibility | Claims without proof |

**Rule:** cognition loops belong in the decision layer; commitments belong in the execution layer.

## Operating plane (Tier-1 naming)

For **enterprise / Tier-1** discussions, it helps to name a sixth surface explicitly — the **Operating plane** — so repo and delivery governance are not folded only into “Control” in conversation.

| Surface | Owns (examples) | Relationship to existing table |
|---------|-----------------|--------------------------------|
| **Operating** | Git-native engineering, `AGENTS.md` / `CLAUDE.md`, Cursor/Claude commands, CI/CD, branch rulesets, environments (dev → prod), artifact provenance, merge queue, runbooks | **Control** policies (approvals, RBAC, secrets, promotion) **execute through** operating practices; treat **Control ⊂ Operating** for delivery: you cannot run a governed control plane without repo and pipeline discipline. |

**Trust** remains a **cross-cutting** concern (wraps decision, execution, control, data, and operating evidence), as in [`../ai-operating-model.md`](../ai-operating-model.md).

**Dealix product lanes** (Revenue, Partnership, CorpDev, Expansion, PMI, Trust exec) are mapped in [`../dealix-six-tracks.md`](../dealix-six-tracks.md).

## Technology mapping (when to use what)

- **Repo-native coding agents** — repository inspection, edits, refactors, tests, release prep, architecture discovery.
- **Agent runtimes** — analysis loops, memos, recommendations, structured outputs, tool-based exploration, review interrupts.
- **Stateful graph runtimes** — persisted cognition, checkpoints, interrupts, resumable reasoning, human-in-the-loop pauses.
- **Durable workflow runtimes** — flows lasting hours/days/weeks; retries, rollback, compensation; cross-system commitments; must survive crashes, restarts, and deployments.

Long-running **business** workflows must not live only inside ephemeral agent graphs without a durable execution owner.

## Dealix code pointers (illustrative)

- Agent routing / execution: `salesflow-saas/backend/app/services/agents/` (`router.py`, `executor.py`).
- Graph-style flows: `salesflow-saas/backend/app/agents/`, `salesflow-saas/backend/app/flows/`.
- Policy direction in code: `salesflow-saas/backend/app/services/dealix_os/` (e.g. policy engine) — keep policy out of markdown prompts.

See also: [approval-policy.md](approval-policy.md), [trust-fabric.md](trust-fabric.md), [discovery-and-output-checklist.md](discovery-and-output-checklist.md).
