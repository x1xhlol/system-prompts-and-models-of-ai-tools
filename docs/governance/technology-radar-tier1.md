# Technology radar — Tier-1 Dealix (official vs optional vs pilot)

**Purpose:** Separate **what we ship today**, **what we commit to architecturally**, and **what stays a pilot/pattern** until benchmarked. Do not treat pilot items as production dependencies without an ADR and evidence.

**Execution criteria:** [execution-fabric.md](execution-fabric.md). **Spike policy:** [`../adr/0001-tier1-execution-policy-spikes.md`](../adr/0001-tier1-execution-policy-spikes.md).

---

## Tier definitions

| Tier | Meaning |
|------|---------|
| **Official (now)** | In repo, used in dev/staging/prod paths as implemented today |
| **Official (target)** | ADR-approved direction; may not be wired yet — document status honestly |
| **Strong optional** | Adopt when scale/integration needs justify ops cost |
| **Pilot / pattern** | Try behind flags; benchmark; no core coupling |

---

## Radar table

| Technology | Tier | Role | Notes |
|------------|------|------|--------|
| **FastAPI + PostgreSQL** | Official (now) | API + operational store | Tenant isolation remains mandatory |
| **Celery + Redis** | Official (now) | Async tasks, schedules | See execution fabric for graduation criteria |
| **LangGraph** (where used) | Official (now) / partial | Stateful agents, HITL | Not a substitute for all long-running business workflows |
| **Temporal** | Official (target) | Crash-proof workflows, worker versioning | **Planned** — spike only until ADR passes |
| **CloudEvents + JSON Schema + AsyncAPI** | Official (target) | Event contracts | Discipline in [events-and-schema.md](events-and-schema.md) |
| **OpenTelemetry** | Official (target) | Unified traces/metrics/logs | Incremental adoption |
| **OPA / Rego** | Strong optional / target | Policy PDP over JSON | See [trust-fabric.md](trust-fabric.md) target table |
| **OpenFGA or Cedar** | Strong optional / target | Fine-grained authorization | Same |
| **Vault** (or cloud secret manager) | Strong optional / target | Secrets, dynamic creds | Rotation + audit |
| **Keycloak** (or enterprise IdP) | Strong optional / target | SSO / B2B identity | Map to customer IAM |
| **Airbyte** | Strong optional | Connector / ingestion plane | Reduces agent→vendor sprawl |
| **Unstructured** | Strong optional | Document extraction (PDFs, CIMs) | Pair with retention + S-class |
| **dbt-style semantic layer** | Strong optional | Single KPI source of truth | Avoid five definitions of “revenue” |
| **Great Expectations** | Strong optional | Data quality checkpoints | |
| **OpenLineage** *or* **OpenMetadata** | Strong optional (pick **one** first) | Lineage / catalog | Do not run two overlapping catalogs without cause |
| **Neo4j** | Pilot | Graph intelligence | Only when relationship reasoning is proven required |
| **LangSmith** | Strong optional | LangGraph/LangChain observability + evals | Commercial; evaluate vs OSS |
| **Phoenix (Arize)** | Strong optional | OTel-native tracing/evals | |
| **Promptfoo** | Strong optional | CI red-team / eval harness | |
| **Guardrails AI** | Strong optional | I/O validators | |
| **ToolProof (concept)** | Pilot / pattern | Verification ledger pattern | Not a hard dependency by default |
| **MemPalace / similar** | Pilot | Memory product | Benchmark before core |
| **Flowise** | Pilot | Internal sandbox only | Not core runtime |
| **Local inference** (generic) | Official (pattern) | Via **adapter** + health checks | No hardcoded vendor lock-in in agents |

---

## External references (documentation)

Use upstream docs for detailed semantics (versions change). Prefer pinning versions in ADRs when adopting.

- OpenAI: Responses API, Agents SDK, structured outputs, MCP — [OpenAI Platform documentation](https://platform.openai.com/docs)
- LangGraph: [LangChain / LangGraph documentation](https://docs.langchain.com/)
- Temporal: [Temporal documentation](https://docs.temporal.io/)
- CloudEvents: [CloudEvents spec (CNCF)](https://github.com/cloudevents/spec)
- JSON Schema: [json-schema.org](https://json-schema.org/)
- AsyncAPI: [asyncapi.com](https://www.asyncapi.com/)
- OpenTelemetry: [opentelemetry.io/docs](https://opentelemetry.io/docs/)
- OPA: [Open Policy Agent](https://www.openpolicyagent.org/)
- OpenFGA: [openfga.dev](https://openfga.dev/)
- Cedar (AWS): [Cedar policy language](https://www.cedar-policy.com/)
- GitHub: rulesets, environments, OIDC — [GitHub Docs](https://docs.github.com/)
- NIST AI RMF, OWASP LLM Top 10 — see [saudi-compliance-and-ai-governance.md](saudi-compliance-and-ai-governance.md)

---

## Review

Revisit this radar **quarterly** or when adding a new external system. Update [`../dealix-six-tracks.md`](../dealix-six-tracks.md) status table when a pilot graduates to official.
