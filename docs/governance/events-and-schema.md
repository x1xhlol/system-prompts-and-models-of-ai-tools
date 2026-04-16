# Events, contracts, and schema governance

**Canonical:** [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md).

## Principles

- Do not rely on ad hoc string event names alone without documentation and versioning.
- Prefer **CloudEvents**-style envelopes for cross-service and async boundaries.
- Validate payloads with **JSON Schema** at publish and/or consume boundaries where feasible.
- Document channels (queues, HTTP callbacks, WebSockets) with **AsyncAPI** or equivalent when multiple consumers exist.
- Maintain a **single source of truth** for schema versions (registry, repo folder, or generated artifacts — pick one path; avoid two overlapping catalogs without justification).

## Minimum envelope fields

Every published event should minimally support traceability and policy classification:

- `event_id`
- `event_type`
- `spec_version`
- `schema_version`
- `tenant_id`
- `entity_id`
- `correlation_id`
- `causation_id`
- `source`
- `actor_type` (see [approval-policy.md](approval-policy.md))
- `approval_class`, `reversibility_class`, `sensitivity_class` (where the event represents or precedes a governed action)
- `trace_id`
- `timestamp` (ISO-8601, explicit timezone)

## Drift and breaking changes

- **No silent schema drift** — version bumps must be visible in code, registry, or changelog.
- **No silent breaking changes** — consumers must be updated or compatibility shims documented.
- Deprecation windows and dual-read/dual-write phases belong in the execution plane plan, not in prompt text.

## Dealix alignment

When adding new integration or workflow events, align names and payloads with existing backend patterns and tenant isolation (`tenant_id`). Prefer explicit correlation IDs through agent and API paths for observability.

See also: [connectors-and-data-plane.md](connectors-and-data-plane.md), [trust-fabric.md](trust-fabric.md).
