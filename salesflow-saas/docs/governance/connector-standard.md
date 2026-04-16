# Connector Governance Standard — Track 6

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md)  
> **Plane**: Data | **Version**: 1.0

---

## Objective

Every integration connector in Dealix follows a standard interface. No direct vendor bindings from agents. All connectors are governed, monitored, and auditable.

---

## Connector Contract

Every connector MUST implement:

```python
class ConnectorContract:
    """Standard interface for all Dealix connectors."""
    
    # Identity
    connector_key: str          # e.g. "whatsapp", "salesforce"
    display_name: str           # English
    display_name_ar: str        # Arabic
    version: str                # Semantic version
    
    # Governance
    approval_policy: str        # "auto" | "approval_required"
    audit_mapping: str          # Which audit event types
    data_classification: str    # "public" | "internal" | "confidential" | "restricted"
    
    # Reliability
    retry_policy: RetryPolicy   # max_retries, backoff, timeout
    timeout_ms: int             # Max wait per call
    idempotency: bool           # Supports idempotent calls
    
    # Observability
    health_check(): HealthResult
    metrics(): ConnectorMetrics
    
    # Lifecycle
    initialize(): void
    execute(payload): Result
    compensate(payload): void   # Rollback action
    shutdown(): void
```

---

## Required Metadata Per Connector

| Field | Description | Example |
|-------|-------------|---------|
| `connector_key` | Unique identifier | `whatsapp` |
| `display_name` | Human name (EN) | WhatsApp Business API |
| `display_name_ar` | Human name (AR) | واتساب بيزنس |
| `version` | Current version | `2026.4.1` |
| `contract_url` | API docs reference | Meta Developer docs URL |
| `retry_max` | Max retry attempts | 3 |
| `retry_backoff_ms` | Backoff between retries | 1000, 2000, 4000 |
| `timeout_ms` | Call timeout | 30000 |
| `idempotent` | Supports idempotency | true |
| `approval_policy` | Policy class | `B` (approval required) |
| `data_classification` | Sensitivity level | `confidential` |
| `audit_events` | Logged event types | `message_sent`, `message_failed` |

---

## Current Connectors

| Connector | Key | Standard? | Health Check? | Retry? | Audit? |
|-----------|-----|-----------|---------------|--------|--------|
| WhatsApp | `whatsapp` | Partial | No live probe | Partial | Yes (messages) |
| Salesforce | `salesforce` | Partial | No live probe | Partial | Partial |
| Stripe | `stripe` | Partial | No live probe | Yes (webhook) | Yes (payments) |
| Voice (Twilio) | `voice` | Pilot | No | Partial | Partial |
| Contract Intel | `contract_intel` | Pilot | No | No | No |
| Email (SMTP) | `email` | Partial | No live probe | Yes | Yes (messages) |
| Cal.com | `cal` | Pilot | No | No | No |

---

## Connector Health Board

The Connector Governance Board (`/api/v1/connectors/governance`) shows:

| Column | Source |
|--------|--------|
| Connector name (AR/EN) | `KNOWN_CONNECTORS` in `connector_governance.py` |
| Status (ok/degraded/error) | `IntegrationSyncState` model |
| Last success | `last_success_at` field |
| Last attempt | `last_attempt_at` field |
| Last error | `last_error` field |
| Registered | Whether tenant has configured it |

---

## Semantic Metrics Layer

### Purpose
Prevent multiple conflicting definitions of the same metric.

### Metric Dictionary (mandatory)

| Metric | Definition | Source | Owner |
|--------|-----------|--------|-------|
| `revenue_actual` | Sum of closed-won deal values in period | `deals` table WHERE status='won' | Revenue Track |
| `pipeline_value` | Sum of open deal values | `deals` table WHERE status IN ('open', 'negotiating') | Revenue Track |
| `win_rate` | Won deals / total closed deals | `deals` table | Revenue Track |
| `cac` | Total acquisition cost / new customers in period | `commissions` + marketing spend | Revenue Track |
| `consent_coverage` | Leads with active consent / total leads | `consents` + `leads` tables | Compliance Track |
| `approval_sla_compliance` | Approvals within SLA / total approvals | `approval_requests` table | Trust Track |
| `connector_health` | Connectors with status=ok / total connectors | `integration_sync_states` table | Operations Track |

### Rule
No two services may define the same metric differently. The metric dictionary above is canonical. Any service computing these metrics MUST use the definition above.

---

## Radar Additions

### Airbyte (Connector Orchestration)
**Status**: Watch  
**Why**: 600+ pre-built connectors, MCP server, agent engine  
**Adopt when**: 5+ external data sources need governed ingestion  
**Spike**: Prototype with one CRM source (HubSpot or Salesforce)

### Unstructured (Document Extraction)
**Status**: Watch  
**Why**: Extract contracts, CIMs, PDFs for DD workstreams  
**Adopt when**: M&A DD workflow goes live  
**Spike**: Prototype with sample contract extraction

### Great Expectations (Data Quality)
**Status**: Watch  
**Why**: Production-grade data quality checks  
**Adopt when**: Data pipeline exceeds 5 sources  
**Spike**: Quality suite for leads and deals tables

---

## Gate: Data & Connector Closure

- [ ] Metric dictionary published and enforced
- [ ] Connector facade standard documented
- [ ] Health board shows real status for all active connectors
- [ ] No direct vendor bindings from agents (all via facade)
- [ ] At least one connector has full contract metadata
