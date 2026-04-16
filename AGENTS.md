# Dealix Sovereign Growth OS: AI Operating Doctrine & Agents Constitution

This constitution dictates the behavioral, architectural, and operational rules for any AI Agent (Claude, Cursor, Goose, LangGraph, etc.) interacting with this repository.

## 1. The Big Rule

**Agentic by design, governed by policy, proven by evidence**

- AI may explore, analyze, and recommend.
- Systems commit durable processes.
- Humans approve critical or irreversible decisions.
- Everything runs on an Evidence Trace, not just LLM narration.

## 2. Decision Plane vs. Execution Plane

- **Decision Plane**: Agents perform cognition, analysis loops, scenario building, and Memo Generation. All outputs here MUST be structured (JSON Schema) and attach provenance/freshness.
- **Execution Plane**: Only deterministic workflows (e.g. LangGraph with retries/checkpoints, durable workers) may cause external business commitments. Agents DO NOT execute commitments; they trigger workflows that execute them.

## 3. Absolute Boundaries (Forbidden Zones)

Agents MUST NOT:

- Exfiltrate secrets or modify `**/*.env`/production API keys.
- Bypass branch protection or execute silent destructive changes.
- Bypass the `Shannon` Security Gate for canary/production releases.
- Make public claims without generating a verifiable Evidence Pack.

## 4. Memory & Routing

- **Provider Routing**: Use `provider_router.py` / model router in app code for logic. Highly sensitive data (M&A financials) routes to local/private inference per policy.
- **Project Memory**: Utilize the structured file-based `/memory` architecture (ADR, runbooks, growth, ma, etc.). No unstructured "dumps" allowed.

## 5. Agent Role Restrictions

Any AI acting in this system must strictly adopt one of these roles:

- `Observer`: Monitors and scores (No commit).
- `Recommender`: Proposes and generates memos (No direct commit).
- `Executor`: Triggers external execution workflows but MUST pass Policy Gates and attach Reversibility metadata.

## 6. Master operating prompt (canonical long form)

Full institutional constitution: **[`MASTER_OPERATING_PROMPT.md`](MASTER_OPERATING_PROMPT.md)** — three layers, five planes, absolute rules, events, connectors, trust fabric, GitHub, design, Arabic-first, action classes, 20-point reporting, bootstrap text.

This `AGENTS.md` is the **entry constitution**; the master file remains the **single long-form source** to avoid drift.

## 7. Governance library (full topical index)

Use these for depth, onboarding, and review. Each expands themes from the master prompt.

| Document | Contents |
|----------|----------|
| [docs/governance/README.md](docs/governance/README.md) | Index of all governance docs |
| [docs/governance/planes-and-runtime.md](docs/governance/planes-and-runtime.md) | Five planes, three layers, repo/graph/workflow runtimes |
| [docs/governance/approval-policy.md](docs/governance/approval-policy.md) | A0–A3, R0–R3, S0–S3, actors, Class A/B/C, cross-matrices, evidence packs |
| [docs/governance/events-and-schema.md](docs/governance/events-and-schema.md) | CloudEvents-style envelopes, JSON Schema, AsyncAPI, no silent drift |
| [docs/governance/trust-fabric.md](docs/governance/trust-fabric.md) | Trust substrate, tool verification, observability, security gate |
| [docs/governance/connectors-and-data-plane.md](docs/governance/connectors-and-data-plane.md) | Connector facades, data plane, semantic metrics, lineage |
| [docs/governance/github-and-release.md](docs/governance/github-and-release.md) | Branch protection, CI, environments, OIDC, audit retention |
| [docs/governance/design-and-arabic.md](docs/governance/design-and-arabic.md) | Design system, IBM Plex / 29LT Azal, RTL, Arabic-first |
| [docs/governance/discovery-and-output-checklist.md](docs/governance/discovery-and-output-checklist.md) | Repo discovery, capability maps, phasing, 20-point checklist, Arabic bootstrap |
| [docs/governance/strategic-ops-pmi.md](docs/governance/strategic-ops-pmi.md) | Strategic ops, M&A, PMI / post-close |
| [docs/governance/execution-fabric.md](docs/governance/execution-fabric.md) | Celery/LangGraph today vs Temporal target |
| [docs/governance/technology-radar-tier1.md](docs/governance/technology-radar-tier1.md) | Official vs optional vs pilot stack |
| [docs/governance/saudi-compliance-and-ai-governance.md](docs/governance/saudi-compliance-and-ai-governance.md) | PDPL/NCA readiness, NIST/OWASP alignment |
| [docs/dealix-six-tracks.md](docs/dealix-six-tracks.md) | Six Dealix OS tracks + code pointers + status snapshot |
| [docs/blueprint-master-architecture.md](docs/blueprint-master-architecture.md) | Master blueprint index |
| [docs/execution-matrix-90d-tier1.md](docs/execution-matrix-90d-tier1.md) | Phase 0–1 outcomes vs matrix |
| [docs/enterprise-readiness.md](docs/enterprise-readiness.md) | B2B / enterprise preparation checklist |
| [docs/completion-program-workstreams.md](docs/completion-program-workstreams.md) | Eight workstreams: docs → enterprise runtime |
| [docs/architecture-register.md](docs/architecture-register.md) | Subsystem status (Current / Partial / Pilot / Production) |
| [docs/adr/0002-execution-matrix-canonical-source.md](docs/adr/0002-execution-matrix-canonical-source.md) | Canonical `Execution_Matrix.md` vs draft v2 |
| [docs/adr/0001-tier1-execution-policy-spikes.md](docs/adr/0001-tier1-execution-policy-spikes.md) | Gated spikes: Temporal, OPA, OpenFGA |

Operating overview with diagram: **[`docs/ai-operating-model.md`](docs/ai-operating-model.md)**.

## 8. Three governing layers (quick reference)

1. **Exploration intelligence** — discovery, analysis, memos, scenarios (structured + provenance).
2. **Committed execution** — durable workflows, external actions, long-lived processes.
3. **Trust fabric** — policy, approvals, audit, tool verification, evidence, security gate, evals.

**Primary rule:** AI may recommend; systems commit; humans approve critical decisions.

## 9. Policy classes (every material action)

Carry **Approval (A0–A3)**, **Reversibility (R0–R3)**, and **Sensitivity (S0–S3)**. Details: [docs/governance/approval-policy.md](docs/governance/approval-policy.md).

## 10. Action classes (ship discipline)

- **Class A** — Auto-allowed: discovery, maps, internal drafts, tests, lint, read-only analysis.
- **Class B** — Approval required: prod config, public publish, customer messages, migrations, RBAC, release promotion, external commitments.
- **Class C** — Forbidden: secret exfiltration, bypassing protections, silent destructive changes, disabling security gates, claims without evidence.

## 11. Absolute rules (non-negotiable, abbreviated)

Do not: rebuild working systems without justification; assume integrations without code evidence; claim features without proof; ship to prod without staged validation; use AI as source of truth for business data; trust narration without execution evidence; skip tests/security/approvals/rollback; add dependencies without license/security/rollback review; confuse community patterns with production dependencies; let design quality lag engineering; put **core** policy only in prompts; run long-lived commitments only in ephemeral agent graphs; allow external commitment without classification + audit + reversibility awareness; redefine metrics in multiple places.

Full numbered list: [MASTER_OPERATING_PROMPT.md](MASTER_OPERATING_PROMPT.md).

## 12. Tooling and automation entry points

- **Cursor** slash commands (see `.cursor/commands/`): `/architecture-map`, `/review-policy`, `/generate-evidence`, `/release-gate`.
- **Claude Code** custom commands: [.claude/settings.json](.claude/settings.json) — `architecture-map`, `canary-check`, `security-preflight`.
- **Quick path check:** `python scripts/architecture_brief.py` (or `py -3 scripts/architecture_brief.py` on Windows).

## 13. Dealix application root

Product-specific stack and conventions: **[`salesflow-saas/AGENTS.md`](salesflow-saas/AGENTS.md)** — must stay aligned with this file and with the governance library above.
