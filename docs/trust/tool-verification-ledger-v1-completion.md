# Tool verification ledger v1 — WS4 completion notes

**Implementation:** [`salesflow-saas/backend/app/services/core_os/verification_ledger.py`](../../salesflow-saas/backend/app/services/core_os/verification_ledger.py)

## Fields (v1)

| Field | Meaning |
|-------|---------|
| `intended_action` | What the agent meant to do |
| `claimed_action` | What the agent said it would call |
| `actual_tool_call` | Concrete tool/route name |
| `parameters_hash` | Hash of parameters for audit |
| `side_effects` | Filled on resolve |
| `evidence_paths` | Artifacts proving execution |
| `verification_status` | `verified` / `partially_verified` / `unverified` / `contradicted` |
| `contradiction_flag` | Boolean; when true, resolve forces `contradicted` |

## Next steps (ledger v2)

- Persist proofs in PostgreSQL for multi-instance deployments.  
- Expose read API for “contradiction dashboard” (WS4 / WS8).  
- Correlate with OpenTelemetry `trace_id` (WS4/WS6).

## OPA / OpenFGA / Vault / Keycloak

Follow ADR-0001 spikes; policies must consume the same A/R/S metadata as [`approval-policy.md`](../governance/approval-policy.md).
