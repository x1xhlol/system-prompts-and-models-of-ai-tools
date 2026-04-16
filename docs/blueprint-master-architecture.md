# Master architecture blueprint — Dealix Sovereign OS (index)

This document **indexes** the architecture backbone. It does not replace detailed Arabic/English packs already in the repo; it **routes** readers to the right source of truth.

## North star

**Dealix Sovereign Growth & Execution OS** — six operational tracks, one fabric: decision, execution, control, data, trust, and **operating** (delivery governance). See [`dealix-six-tracks.md`](dealix-six-tracks.md).

**Rule:** AI explores; systems commit through workflows; humans approve critical moves (A/R/S).

## Layered service view (narrative)

For the classic “8 layers” service map (signal, memory, reasoning, orchestration, policy, actions, analytics, executive cockpit), see **[`Architecture_Pack.md`](../Architecture_Pack.md)** at repository root.

## Planes and runtimes

- Planes table + **Operating plane** definition: [`governance/planes-and-runtime.md`](governance/planes-and-runtime.md)
- Diagram + governance library index: [`ai-operating-model.md`](ai-operating-model.md)

## Agents, events, and HITL

- **16 agents × events × KPIs × gates:** [`Execution_Matrix.md`](../Execution_Matrix.md) (and `Execution_Matrix_v2.md` if maintained in parallel).

## Execution and trust (Tier-1)

- **Execution fabric (Celery/LangGraph → Temporal criteria):** [`governance/execution-fabric.md`](governance/execution-fabric.md)
- **Trust fabric (verification, security, evals):** [`governance/trust-fabric.md`](governance/trust-fabric.md)
- **Technology radar (official / optional / pilot):** [`governance/technology-radar-tier1.md`](governance/technology-radar-tier1.md)
- **Saudi compliance & AI governance register:** [`governance/saudi-compliance-and-ai-governance.md`](governance/saudi-compliance-and-ai-governance.md)

## Constitution and repo operating pack

- [`MASTER_OPERATING_PROMPT.md`](../MASTER_OPERATING_PROMPT.md)
- [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md)
- `.cursor/commands/`, `.claude/settings.json`, `scripts/architecture_brief.py`

## 90-day execution focus

- [`execution-matrix-90d-tier1.md`](execution-matrix-90d-tier1.md)

## Spikes and ADRs (gated)

- [`adr/0001-tier1-execution-policy-spikes.md`](adr/0001-tier1-execution-policy-spikes.md)

---

When updating architecture, change **one canonical place** for agent/event truth (`Execution_Matrix.md`) and link from here — avoid duplicating long tables in this file.
