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
