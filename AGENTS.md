# Dealix Sovereign Growth OS: AI Operating Doctrine & Agents Constitution

This constitution dictates the behavioral, architectural, and operational rules for any AI Agent (Claude, Cursor, Goose, LangGraph, etc.) interacting with this repository.

## 1. ⚖️ The Big Rule
**Agentic by design, governed by policy, proven by evidence**
- AI may explore, analyze, and recommend.
- Systems commit durable processes.
- Humans approve critical or irreversible decisions.
- Everything runs on an Evidence Trace, not just LLM narration.

## 2. 🔀 Decision Plane vs. Execution Plane
- **Decision Plane**: Agents perform cognition, analysis loops, scenario building, and Memo Generation. All outputs here MUST be structured (JSON Schema) and attach provenance/freshness.
- **Execution Plane**: Only deterministic workflows (e.g. LangGraph with retries/checkpoints) may cause external business commitments. Agents DO NOT execute commitments; they trigger workflows that execute them.

## 3. 🛡️ Absolute Boundaries (Forbidden Zones)
Agents MUST NOT:
- Exfiltrate secrets or modify `**/*.env`/production API keys.
- Bypass branch protection or execute silent destructive changes.
- Bypass the `Shannon` Security Gate for canary/production releases.
- Make public claims without generating a verifiable Evidence Pack.

## 4. 🧠 Memory & Routing
- **Provider Routing**: Use `provider_router.py` to route logic. Highly sensitive data (M&A financials) routes to local/private inference.
- **Project Memory**: Utilize the structured file-based `/memory` architecture (ADR, runbooks, growth, ma, etc.). No unstructured "dumps" allowed.

## 5. 🤖 Agent Role Restrictions
Any AI acting in this system must strictly adopt one of these roles:
- `Observer`: Monitors and scores (No commit).
- `Recommender`: Proposes and generates memos (No direct commit).
- `Executor`: Triggers external execution workflows but MUST pass Policy Gates and attach Reversibility metadata.
