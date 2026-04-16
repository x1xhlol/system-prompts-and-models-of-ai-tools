# Execution Fabric — Dealix Execution Plane Deep Dive

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md)  
> **Plane**: Execution | **Tracks**: All  
> **Version**: 1.0 | **Status**: Canonical

---

## Overview

The Execution Fabric defines how Dealix performs work: how tasks are classified, routed, checkpointed, retried, and completed. The backbone is the **OpenClaw Framework** — a durable execution engine with policy-aware gating.

---

## Architecture

```
Inbound Request/Event
        │
        ▼
┌──────────────────┐
│  OpenClaw Gateway │  ← Single ingress for all tasks
│   (gateway.py)    │
└───────┬──────────┘
        │
        ▼
┌──────────────────┐
│   Policy Gate     │  ← Classify action (A/B/C)
│   (policy.py)     │
└───────┬──────────┘
        │
   ┌────┴────┐
   │ Class C │──→ BLOCKED (forbidden)
   └─────────┘
        │
   ┌────┴────┐
   │ Class B │──→ Check approval_token
   └─────────┘     │
        │     ┌────┴─────┐
        │     │ No token │──→ BLOCKED (requires_approval)
        │     └──────────┘
        │
        ▼
┌──────────────────┐
│  Canary Context   │  ← Tenant in canary group?
│ (canary_context)  │
└───────┬──────────┘
        │
        ▼
┌──────────────────┐
│  Observability    │  ← Start trace, record steps
│ (observability)   │
└───────┬──────────┘
        │
        ▼
┌──────────────────┐
│   Task Router     │  ← Dispatch to handler
│  (task_router)    │
└───────┬──────────┘
        │
        ▼
┌──────────────────┐
│  Durable Flow     │  ← Checkpoint state
│ (durable_flow)    │
└───────┬──────────┘
        │
        ▼
┌──────────────────┐
│  Handler / Agent  │  ← Execute business logic
│  (Celery / Sync)  │
└──────────────────┘
```

---

## Task Classification

### Class A — Safe Auto Actions
```python
SAFE_AUTO_ACTIONS = {
    "read_status", "collect_signals", "summarize", "classify",
    "tag", "internal_status_update", "research", "generate_draft",
    "plan", "predictive_analysis"
}
```
These execute immediately without human approval.

### Class B — Approval-Gated Actions
```python
APPROVAL_GATED_ACTIONS = {
    "send_whatsapp", "send_email", "send_linkedin",
    "trigger_voice_call", "sync_salesforce", "create_charge",
    "publish_content", "change_billing_state", "modify_lead_routing",
    "send_contract_for_signature", "video_generate", "music_generate"
}
```
These require an `approval_token` in the payload.

### Class C — Forbidden Actions
```python
FORBIDDEN_ACTIONS = {
    "exfiltrate_secrets", "delete_data_without_audit",
    "bypass_auth", "publish_without_approval", "destructive_unchecked"
}
```
These are unconditionally blocked.

**Default**: Unknown actions → Class B (approval required).

---

## Durable Flow Lifecycle

```
1. CREATE    → DurableTaskFlow(flow_name, tenant_id)
2. CHECKPOINT → flow.checkpoint(note, state_patch) → FlowRevision
3. RESUME    → Load from checkpoints, continue from last state
4. COMPLETE  → Final checkpoint, mark complete
5. ROLLBACK  → Compensate side effects (target state)
```

Each checkpoint stores:
- `revision_id` (UUID)
- `at` (ISO timestamp)
- `note` (human-readable)
- `checkpoint` (full state snapshot)

---

## Plugin System

Plugins extend the Execution Plane with external integrations:

| Plugin | File | Purpose |
|--------|------|---------|
| WhatsApp | `plugins/whatsapp_plugin.py` | WhatsApp Cloud API messaging |
| Salesforce | `plugins/salesforce_agentforce_plugin.py` | CRM sync, Account 360 |
| Stripe | `plugins/stripe_plugin.py` | Payment processing |
| Voice | `plugins/voice_plugin.py` | Voice call integration |
| Contract Intel | `plugins/contract_intelligence_plugin.py` | Contract analysis |

### Plugin Contract
Each plugin must:
1. Register its task types with `task_router.register()`
2. Accept `(tenant_id: str, payload: dict)` as input
3. Return `dict` with structured output
4. Handle its own retries and error reporting
5. Log to observability bridge

---

## Agent Execution Model

```
Event → Agent Router → Input Validation → Celery Task
  → LLM Call (model_router.py selects provider)
  → Output Parsing (Pydantic schema validation)
  → Escalation Check (rules in agent config)
  → Action Handler / Human Handoff
  → Log to ai_conversations
```

19 specialized agents, each with:
- System prompt (`ai-agents/prompts/`)
- Input/output schema
- Model + temperature config
- Escalation rules

---

## Error Handling

| Error Type | Behavior |
|------------|----------|
| LLM timeout | Retry with exponential backoff (3 attempts) |
| Plugin failure | Log error, mark flow as failed, alert |
| Policy violation | Block immediately, log to audit |
| Tenant mismatch | Block, log security event |
| Unknown task type | Raise ValueError, log |

---

## Current vs Target

| Capability | Current | Target |
|-----------|---------|--------|
| Task classification (A/B/C) | Live | Live |
| Durable checkpointing | Live (in-memory) | Persistent storage |
| Plugin system | Live (5 plugins) | Expand to 10+ |
| Agent execution | Live (19 agents) | Add governance agents |
| Canary enforcement | Live | Live |
| Compensation/rollback | Not implemented | Planned |
| Idempotency keys | Not implemented | Planned |
| Dead letter queue | Not implemented | Planned |
| Temporal integration | Not evaluated | Watch |
