# Trust Fabric Closure Plan — Track 5

> **Parent**: [`trust-fabric.md`](trust-fabric.md)  
> **Plane**: Trust | **Version**: 1.0

---

## Objective

Transform Trust Plane from "policy engine + audit logs" to "no sensitive action without approval + verification + evidence + correlation."

---

## Live Trust Components Required

### 1. Approval Packet Flow (Priority 1)
**Goal**: At least one path where Class B action goes through structured ApprovalPacket → review → approve/reject → execute → evidence.

**Target Path**: WhatsApp outreach to new lead

```
Agent proposes send_whatsapp
  → ApprovalPacket schema generated (structured_outputs.py)
  → Policy gate classifies as B
  → ApprovalRequest created with SLA deadline
  → Reviewer gets notification
  → Approve → approval_token issued
  → OpenClaw gateway executes with token
  → Tool receipt generated
  → Evidence logged to ai_conversations + audit_log
```

**Required Wiring**:
- `ApprovalPacket` schema → `approval_bridge.py` integration
- SLA deadline field on `ApprovalRequest` model
- Notification to reviewer (email/WhatsApp)
- Evidence: approval_token + tool_receipt + audit_log linked by `trace_id`

### 2. Tool Verification Receipt Flow (Priority 1)
**Goal**: At least one tool call produces a verifiable receipt.

**Implementation**:
- `tool_verification.py` already exists
- `tool_receipts.py` already exists
- Need: receipts written for WhatsApp plugin calls
- Need: receipt includes `trace_id`, `tenant_id`, `action`, `result_hash`, `timestamp`

### 3. Contradiction Detection (Priority 2)
**Goal**: Real contradictions detected and flagged.

**Implementation Plan**:
- Wire `contradiction_engine.py` to CI pipeline
- On governance doc change: run LLM scan against other governance docs
- Store detected contradictions in `contradictions` table
- Show in Policy Violations Board frontend

### 4. Evidence Pack Viewer (Priority 2)
**Goal**: Unified evidence pack that links decision → tool → approval → output.

**Implementation**:
- `evidence_pack_service.py` exists
- Need: `assemble_deal_pack` that queries real data:
  - Deal from `deals` table
  - Lead from `leads` table
  - Activities from `activities` table
  - Messages from `messages` table
  - Approvals from `approval_requests` table
  - AI conversations from `ai_conversations` table
  - Consent from `consents` table

### 5. Trace Correlation (Priority 1)
**Goal**: `trace_id` / `correlation_id` links all related records.

**Implementation**:
- Add `correlation_id` to `DomainEvent` (already exists as field)
- Pass `correlation_id` through OpenClaw gateway → task router → agent → handler
- Store in `ai_conversations.correlation_id`, `audit_log.correlation_id`
- Query by `correlation_id` in evidence pack assembly

---

## Watch Technologies — Adoption Criteria

### OPA (Open Policy Agent)
**Adopt when**:
- Policy rules exceed 50 AND are complex (nested conditions, temporal logic)
- Current `policy.py` becomes maintenance burden
- ADR demonstrates value with prototype

**Spike criteria**:
- [ ] Prototype: 5 existing policy rules expressed in Rego
- [ ] Benchmark: latency comparison vs current Python implementation
- [ ] Integration: OPA sidecar evaluated for performance

### OpenFGA
**Adopt when**:
- Authorization logic exceeds role-based (needs relationship-based)
- Multi-tenant permission inheritance becomes complex
- ADR demonstrates value with prototype

**Spike criteria**:
- [ ] Prototype: tenant → user → resource permission graph
- [ ] Benchmark: query latency for "can user X do action Y on resource Z"
- [ ] Integration: OpenFGA as authorization service evaluated

### Vault
**Adopt when**:
- Secret rotation is needed for compliance
- 10+ distinct secret types managed
- Environment variables become unwieldy

### Keycloak
**Adopt when**:
- SSO requirement from enterprise customer
- Multi-IdP federation needed
- Current JWT auth insufficient

---

## Gate: Trust Closure

- [ ] One approval flow live end-to-end with SLA
- [ ] One tool verification receipt generated and stored
- [ ] One contradiction detected in real scan
- [ ] One evidence pack assembled from real deal data
- [ ] `trace_id` links decision → approval → execution → evidence
- [ ] Contradiction dashboard shows real data
- [ ] Approval SLA measured for at least one path
