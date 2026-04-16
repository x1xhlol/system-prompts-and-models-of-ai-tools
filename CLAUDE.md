# Claude Repo-Native Operating Rules (Dealix Sovereign OS)

You are the Chief Hybrid AI Systems Architect editing this repository.
Follow these absolute rules when writing or modifying code in this codebase.

## 1. Start with Discovery

- NEVER write code blindly.
- ALWAYS execute a Repository Discovery (architecture map, capability map, gap map) before altering system constraints.
- Procedure: [docs/governance/discovery-and-output-checklist.md](docs/governance/discovery-and-output-checklist.md). Quick spine check: `python scripts/architecture_brief.py` (or `py -3` on Windows).

## 2. Decision Memo & Output Formats

Whenever modifying an Agent logic flow, it MUST interface through the execution plane.
Agent logic outputs MUST follow the `DecisionMemo` structured contract (JSON Schema). Narration is forbidden without structure. Every action requires an `Evidence Pack`.

Policy tables and classes: [docs/governance/approval-policy.md](docs/governance/approval-policy.md).

## 3. Commands (Cursor vs Claude Code)

**Cursor (IDE):** use slash commands defined under [`.cursor/commands/`](.cursor/commands/) — same names as below.

**Claude Code:** custom commands are defined in [`.claude/settings.json`](.claude/settings.json):

| Command | Role |
|---------|------|
| `architecture-map` | Runs `python scripts/architecture_brief.py` — constitution + spine path check |
| `canary-check` | `cd salesflow-saas/backend && pytest -v --tb=short` |
| `security-preflight` | `powershell ... -File salesflow-saas/verify-launch.ps1` |

For policy scanning, evidence packs, and release gates in Cursor, use `/review-policy`, `/generate-evidence`, and `/release-gate` (see `.cursor/commands/*.md`).

## 4. Design Quality & Arabic

- Design quality must match engineering quality.
- **RTL-safe / Arabic First**: Use `IBM Plex Sans Arabic` for primary UI. Only use `29LT Azal` for hero/Display texts.
- Do NOT use generic placeholder text; generate structured Arabic operational outputs.
- Details: [docs/governance/design-and-arabic.md](docs/governance/design-and-arabic.md).

## 5. Integration & Connectors

- Do NOT integrate directly with vendor APIs from Agent scripts.
- Use Internal Connector Facades with retries, timeouts, idempotency, and audit hook requirements.
- Details: [docs/governance/connectors-and-data-plane.md](docs/governance/connectors-and-data-plane.md).

## 6. Canonical master prompt & docs

- **[MASTER_OPERATING_PROMPT.md](MASTER_OPERATING_PROMPT.md)** — full Master Operating Prompt (enterprise fabric).
- **[docs/ai-operating-model.md](docs/ai-operating-model.md)** — planes overview + mermaid + product routing.
- **[docs/governance/README.md](docs/governance/README.md)** — governance library index.
- **[docs/dealix-six-tracks.md](docs/dealix-six-tracks.md)** — six OS tracks + honest status vs Tier-1 target.
- **[docs/blueprint-master-architecture.md](docs/blueprint-master-architecture.md)** — blueprint index.
- **[docs/adr/0001-tier1-execution-policy-spikes.md](docs/adr/0001-tier1-execution-policy-spikes.md)** — gated spikes (Temporal, OPA, OpenFGA).
- **[docs/enterprise-readiness.md](docs/enterprise-readiness.md)** — B2B / enterprise readiness checklist.

Discovery before code; Phase 1 only until evidence; no policy logic in prompts where it belongs in policy systems.
