# ADR 0002 — Canonical source for the Master Execution Matrix

- **Status:** Accepted  
- **Date:** 2026-04-16  
- **Context:** Two documents describe the 16-agent operational backbone: [`Execution_Matrix.md`](../../Execution_Matrix.md) (root) and [`Execution_Matrix_v2.md`](../../Execution_Matrix_v2.md). They differ in columns (v2 adds evidence requirements, alternate tool names), event naming, and some SLAs/agent naming.

## Decision

1. **[`Execution_Matrix.md`](../../Execution_Matrix.md)** is the **canonical** matrix for **agent numbering (1–16)**, Arabic operational tables aligned with historical repo references, and cross-links from [`docs/dealix-six-tracks.md`](../dealix-six-tracks.md) and [`docs/execution-matrix-90d-tier1.md`](../execution-matrix-90d-tier1.md).

2. **[`Execution_Matrix_v2.md`](../../Execution_Matrix_v2.md)** is a **draft enhancement** (v2.0). It must be treated as **non-authoritative** until merged into v1 via a deliberate PR that:
   - reconciles event names with code and [`docs/governance/events-and-schema.md`](../governance/events-and-schema.md),
   - ports the **Evidence Required** column into v1 without breaking agent IDs,
   - removes or verifies speculative tool references (e.g. product names that are not integrated).

3. Until merge completes, any new automation, router mapping, or KPI row **must** cite `Execution_Matrix.md` first; v2 may inform design only.

## Consequences

- Prevents split-brain between “matrix used in docs” and “matrix used in code comments.”
- Forces one PR to merge v2 deltas instead of silent drift.

## Related

- [`../completion-program-workstreams.md`](../completion-program-workstreams.md) WS1  
- [`0001-tier1-execution-policy-spikes.md`](0001-tier1-execution-policy-spikes.md)
