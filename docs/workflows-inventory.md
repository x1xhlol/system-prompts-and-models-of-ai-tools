# Workflow inventory — Completion Program WS3

**Purpose:** Classify automation into **short-lived**, **medium-lived (queued)**, and **long-lived durable** to drive Temporal pilot scope per [`adr/0001-tier1-execution-policy-spikes.md`](adr/0001-tier1-execution-policy-spikes.md).

## LangGraph flows (`salesflow-saas/backend/app/flows/`)

| Module | Role | Durability notes | Idempotency (pilot) | Compensation (pilot) |
|--------|------|------------------|---------------------|-------------------------|
| `prospecting_durable_flow.py` | Prospecting pipeline | Checkpoint-friendly; validate persistence + idempotency keys on external steps | Idempotency key on CRM write steps (TBD in code) | Retry failed step; manual cancel path documented in flow |
| `self_improvement_flow.py` | Self-improvement loop | Async API integration; ensure no silent side effects without ledger | Hash of last successful eval as key | Roll back prompt patch queue on fatal error (TBD) |

## Celery task families (`salesflow-saas/backend/app/workers/`)

| Area | Files (examples) | Typical duration | Idempotency | Compensation |
|------|------------------|------------------|--------------|----------------|
| Sequences | `sequence_tasks.py` | Minutes | Message dedupe by `(tenant, template, recipient, day)` | Disable sequence + alert |
| Agents | `agent_tasks.py` | Minutes | Task id + tenant in broker | Dead-letter + replay from checkpoint |
| Notifications | `notification_tasks.py` | Minutes | External id from provider when available | Skip duplicate send on conflict |
| Affiliates | `affiliate_tasks.py` | Minutes–hours | Payout batch id | Reverse ledger entry (runbook) |
| Follow-up | `follow_up_tasks.py` | Variable | Step cursor in DB | Reset step + notify owner |

## Migration rule (draft)

- **Short:** keep Celery / inline async.  
- **Medium:** Celery with explicit idempotency + DLQ.  
- **Long / multi-system / compensation:** candidate for **Temporal** after ADR-0001 pilot exit criteria.

See [`temporal-pilot-scope.md`](temporal-pilot-scope.md).
