# Golden path — Partner intake → Executive surface (Tier-1)

**Canonical runbook** for the first **end-to-end** governed path. APIs are under `/api/v1/` in `salesflow-saas/backend`.

## Preconditions

- `cwd` = repo root for scripts; backend tests from `salesflow-saas/backend`.
- CI: `Dealix CI` + `Docs governance` green (see [`enterprise-readiness.md`](enterprise-readiness.md) §8).

## Sequence (v1 — demo-backed where DB is empty)

1. **Class B bundle (Decision plane)**  
   `GET /api/v1/approval-center/class-b-decision-bundle`  
   → Full bundle (`memo_json`, `evidence_pack_json`, `approval_packet_json`, `execution_intent_json`, `risk_register_json`).

2. **Runtime validation gate**  
   `POST /api/v1/approval-center/validate-class-b-bundle` with JSON body = response from step 1.  
   → `200` + `{"status":"valid","correlation_id":"..."}`.  
   Mutate `execution_intent_json.correlation_id` to empty while `requested_side_effect_class` stays `external_*` → expect **`422`**.

3. **HITL (approve with bundle)**  
   `POST /api/v1/approval-center/{approval_id}/approve` with body:
   ```json
   { "hitl": "approve", "decision_bundle": { ... same bundle ... } }
   ```  
   Invalid bundle → **`422`**.

4. **Executive snapshot (Operating / Executive plane)**  
   `GET /api/v1/executive-room/snapshot`  
   → Includes `tier1_exec_surface` keyed off the same demo bundle (`correlation_id`, `pending_decisions`, etc.).

5. **Evidence viewer (Trust)**  
   `GET /api/v1/evidence-packs/tier1-demo`  
   → Structured fields: `verification_status`, sources, assumptions.

6. **Connector governance**  
   `GET /api/v1/connectors/governance`  
   → Includes `tier1_connector_surface` policy hooks.

7. **Saudi-sensitive proposal send (Data / compliance)**  
   `POST /api/v1/proposals/{id}/send` with `external_company_contacts: true` **requires** `pdpl_processing_class` and `owasp_surface_ref` or **`422`** (FastAPI validation).

## Automated proof

- Pytest: `tests/test_tier1_golden_path_partner.py` (name may vary) exercises steps 1–4 (and optionally 5–7 where auth/DB fixtures exist).

## Ownership

| Step | Owner |
|------|--------|
| Bundle + validation | Backend / Governance |
| Executive + evidence UI | Product + Frontend |
| Saudi fields on send | Compliance + Backend |
