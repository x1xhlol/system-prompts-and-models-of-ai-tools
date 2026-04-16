# Data plane and connector facades

**Canonical:** [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md).

## Data and knowledge layer

- **Operational store:** relational DB as system of record for business entities; strict tenant boundaries (`tenant_id` and access checks).
- **Embeddings:** colocate or pipeline near operational data when semantic search or routing benefits; do not let embeddings become an ungoverned shadow DB of PII.
- **Graph stores:** add only when relationship-heavy reasoning is a proven requirement (cost and ops complexity are real).
- **Document ingestion:** contracts, DD materials, board packs, PDFs — through controlled pipelines with retention and sensitivity classes.
- **Lineage / metadata catalog:** choose **one** primary cataloging path; a second overlapping system needs explicit justification.

## Semantic metrics

Do **not** let multiple systems independently define “revenue”, “pipeline velocity”, “contribution margin”, “synergy realization”, or other executive metrics.

Prefer:

- Central semantic definitions (single module or analytics layer).  
- Data quality checks and documented downstream impact.  
- Visible lineage from metric definition to dashboards and agent outputs.

## Connector facade rule

Agents and ad-hoc scripts must **not** sprawl direct calls to many vendor APIs.

Each connector facade should specify:

- Contract (inputs/outputs, error model)  
- Version  
- Retry policy  
- Timeout policy  
- Idempotency key handling  
- Approval policy linkage (Class B where needed)  
- Audit field mapping  
- Observability hooks (logs, metrics, traces)  
- Rollback or compensation notes when side effects are possible  

Treat every external API as a **changing contract**, not a fixed truth.

## Dealix pointers

- Model / provider routing: `salesflow-saas/backend/app/services/model_router.py`.
- LLM provider abstraction: `salesflow-saas/backend/app/ai/llm_provider.py`, `salesflow-saas/backend/app/services/local_inference.py`.
- Integrations and CRM direction: search `integrations` and `services` for connector-style modules; extend via facades rather than new raw SDK calls from agent nodes.

See also: [events-and-schema.md](events-and-schema.md), [approval-policy.md](approval-policy.md), [trust-fabric.md](trust-fabric.md).
