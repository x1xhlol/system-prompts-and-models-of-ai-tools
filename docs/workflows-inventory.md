# Workflow inventory — Completion Program WS3

**Purpose:** Classify automation into **short-lived**, **medium-lived (queued)**, and **long-lived durable** to drive Temporal pilot scope per [`adr/0001-tier1-execution-policy-spikes.md`](adr/0001-tier1-execution-policy-spikes.md).

## LangGraph flows (`salesflow-saas/backend/app/flows/`)

| Module | Role | Durability notes |
|--------|------|------------------|
| `prospecting_durable_flow.py` | Prospecting pipeline | Checkpoint-friendly; validate persistence + idempotency keys on external steps |
| `self_improvement_flow.py` | Self-improvement loop | Async API integration; ensure no silent side effects without ledger |

## Celery task families (`salesflow-saas/backend/app/workers/`)

| Area | Files (examples) | Typical duration |
|------|------------------|------------------|
| Sequences | `sequence_tasks.py` | Minutes |
| Agents | `agent_tasks.py` | Minutes |
| Notifications | `notification_tasks.py` | Minutes |
| Affiliates | `affiliate_tasks.py` | Minutes–hours |
| Follow-up | `follow_up_tasks.py` | Variable |

## Migration rule (draft)

- **Short:** keep Celery / inline async.  
- **Medium:** Celery with explicit idempotency + DLQ.  
- **Long / multi-system / compensation:** candidate for **Temporal** after ADR-0001 pilot exit criteria.

See [`temporal-pilot-scope.md`](temporal-pilot-scope.md).
