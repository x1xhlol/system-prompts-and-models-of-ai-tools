# WS5 — Connector facade, events, semantic metrics (completion)

## Connector facade standard (required for new integrations)

Each connector MUST document: **contract**, **version**, **retry**, **timeout**, **idempotency key**, **approval policy hook**, **audit field mapping**, **observability hooks**, **rollback notes**.  
Pattern reference: [`governance/connectors-and-data-plane.md`](governance/connectors-and-data-plane.md).

**Rule:** No new agent path may call a vendor SDK directly for a production integration; add a facade module under `salesflow-saas/backend/app/services/integrations/` (or agreed package) with tests.

## Event envelope and schema registry

- Envelope fields: see [`governance/events-and-schema.md`](governance/events-and-schema.md).  
- Registry: start with versioned JSON Schema under `docs/schemas/events/` (create per event family) before adopting a hosted registry.

## Semantic metrics dictionary

Authoritative definitions: [`semantic-metrics-dictionary.md`](semantic-metrics-dictionary.md). Application code must import metric keys from a single module once introduced (WS5 follow-up PR).

## Lineage / catalog

Single choice documented in [`lineage-catalog-choice.md`](lineage-catalog-choice.md) until an ADR changes it.

---

## Dual connector strategy (runtime tools vs data movement)

| Layer | Purpose | Examples | Governance |
|-------|---------|-----------|------------|
| **Runtime tool connectors** | LLM/agent tool calls during a session (read/write bounded) | MCP tools, built-in HTTP tools behind facade | Decision plane + tool verification + allowlists |
| **Data movement connectors** | Scheduled/batch replication or sync between systems | ELT/CDC-style pipelines (Airbyte-class) | Execution plane ownership, SLAs, backfill runbooks |

**Rule:** never confuse the two in architecture diagrams — they share “connector” language but have different failure domains, retention, and approval classes.

### MCP Tasks / async operations (watchlist)

Long-running MCP operations (tasks that outlive a single HTTP interaction) MUST have: visible **status polling** or webhook, **timeout**, **idempotency key**, and an owner in [`semantic-metrics-dictionary.md`](semantic-metrics-dictionary.md) or the connector runbook. Track vendor-specific “MCP Tasks” behavior as **V1–V2** severity candidates when SLAs slip — see [`governance/operational-severity-model.md`](governance/operational-severity-model.md). External overview: [`references/tier1-external-index.md`](references/tier1-external-index.md) (Airbyte MCP).

---

## Great Expectations (GE) as a release gate

When GE is in-path:

- Tie **checkpoint success** explicitly to [`RELEASE_READINESS_MATRIX_AR.md`](RELEASE_READINESS_MATRIX_AR.md) (row: schema adherence / data quality) and to promotion of workflows that consume the underlying datasets.  
- Failed checkpoints are **V2** by default if customer reports or downstream models consume the data; **V3** if PII/regulated fields are involved.

Reference: GE checkpoints — [`references/tier1-external-index.md`](references/tier1-external-index.md).
