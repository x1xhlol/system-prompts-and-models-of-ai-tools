# Temporal pilot scope — WS3

**Status:** Planned — gated by [`adr/0001-tier1-execution-policy-spikes.md`](adr/0001-tier1-execution-policy-spikes.md).

## Recommended first pilot (pick one)

1. **Partner approval** — human waits, multi-day SLA, idempotent notifications.  
2. **DD room state machine** — long-running, audit-heavy, compensating actions on red-flag.

## Non-goals for pilot v0

- Replacing all Celery workloads.  
- Running Temporal without CI integration tests and local `docker compose` recipe.

## Exit criteria (from ADR 0001)

Worker versioning documented; crash resume verified; secrets boundary reviewed; rollback runbook; product sign-off for second workflow migration.
