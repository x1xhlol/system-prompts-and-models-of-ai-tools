# Decision plane JSON contracts

**Source of truth (runtime):** [`salesflow-saas/backend/app/services/core_os/decision_plane_contracts.py`](../../../salesflow-saas/backend/app/services/core_os/decision_plane_contracts.py) and [`decision_memo.py`](../../../salesflow-saas/backend/app/services/core_os/decision_memo.py).

JSON Schema files may be generated from Pydantic in a follow-up PR (`model_json_schema()`). Until then, use the Python models for validation in APIs and workers.

Bundle keys for governed responses:

- `memo_json` — `DecisionMemo.model_dump()`  
- `evidence_pack_json` — `EvidencePack`  
- `risk_register_json` — list from memo  
- `approval_packet_json` — `ApprovalPacket`  
- `execution_intent_json` — `ExecutionIntent`

See [`completion-program-workstreams.md`](../../completion-program-workstreams.md) WS2.
