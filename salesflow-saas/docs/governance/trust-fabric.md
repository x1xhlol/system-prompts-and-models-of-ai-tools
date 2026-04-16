# Trust Fabric — Dealix Trust Plane Deep Dive

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md)  
> **Plane**: Trust | **Tracks**: Trust, Compliance  
> **Version**: 1.0 | **Status**: Canonical

---

## Overview

The Trust Fabric ensures that every action in Dealix is authorized, auditable, and compliant. No sensitive action bypasses this layer. The Trust Plane sits between the Decision Plane and the Execution Plane, intercepting every Class B and C action.

---

## Architecture

```
┌─────────────────────────────────────┐
│           TRUST PLANE               │
│                                     │
│  ┌─────────┐  ┌──────────────────┐  │
│  │ Policy  │  │ Approval Bridge  │  │
│  │ Engine  │──│ (approval_bridge)│  │
│  │(policy) │  └────────┬─────────┘  │
│  └─────────┘           │            │
│                        ▼            │
│  ┌──────────────────────────────┐   │
│  │     Trust Score Service      │   │
│  │   (trust_score_service.py)   │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌─────────┐  ┌──────────────────┐  │
│  │Security │  │  SLA Escalation  │  │
│  │  Gate   │  │     Alerts       │  │
│  └─────────┘  └──────────────────┘  │
│                                     │
│  ┌─────────┐  ┌──────────────────┐  │
│  │  Audit  │  │  Contradiction   │  │
│  │ Service │  │     Engine       │  │
│  └─────────┘  └──────────────────┘  │
│                                     │
│  ┌─────────┐  ┌──────────────────┐  │
│  │  PDPL   │  │    Evidence      │  │
│  │ Engine  │  │  Pack Service    │  │
│  └─────────┘  └──────────────────┘  │
└─────────────────────────────────────┘
```

---

## Policy Enforcement

### Approval Bridge Flow
```python
# OpenClawApprovalBridge.evaluate()
1. Check tenant_id exists         → Block if missing
2. Classify action (A/B/C)        → Block if C (forbidden)
3. Check cross_tenant_context     → Block if true
4. Check canary enforcement       → Block if outside canary without token
5. Check approval_token           → Block if B and no token
6. Allow execution                → Return allowed=True
```

### Approval Request Model
| Field | Type | Purpose |
|-------|------|---------|
| `channel` | String | whatsapp, email, sms |
| `resource_type` | String | Entity requiring approval |
| `resource_id` | UUID | Entity ID |
| `payload` | JSONB | Action details |
| `status` | String | pending → approved / rejected |
| `requested_by_id` | FK(users) | Who requested |
| `reviewed_by_id` | FK(users) | Who approved/rejected |
| `reviewed_at` | DateTime | When reviewed |
| `sla_deadline_at` | DateTime | SLA expiry (new) |
| `escalation_level` | Integer | Current escalation level (new) |
| `priority` | String | critical/high/normal/low (new) |

---

## Trust Scoring

Entities receive trust scores based on behavior:

| Entity | Factors | Range |
|--------|---------|-------|
| Lead | Engagement, data quality, consent status | 0-100 |
| Affiliate | Performance, fraud flags, tenure | 0-100 |
| Company | CR verification, payment history | 0-100 |
| Connector | Uptime, error rate, auth health | 0-100 |

Implementation: `services/trust_score_service.py`, `models/advanced.py (TrustScore)`

---

## Audit Trail

Every state change is recorded:

```python
class AuditLog(TenantModel):
    user_id     # Who performed the action
    action      # What action (create, update, delete, approve, reject)
    entity_type # What entity (lead, deal, consent, approval)
    entity_id   # Which entity
    changes     # JSONB diff (old_value → new_value)
    ip_address  # Client IP
```

Additional audit layers:
- `PDPLConsentAudit` — Immutable consent change log
- `DomainEvent` — Event-sourced business events
- `ai_conversations` — All AI agent inputs/outputs/tokens

---

## Contradiction Engine (New)

Detects and tracks conflicts between documents, policies, and system behavior.

### Contradiction Record
| Field | Purpose |
|-------|---------|
| `source_a` / `source_b` | Which documents/systems conflict |
| `claim_a` / `claim_b` | The conflicting claims |
| `contradiction_type` | factual, temporal, scope, policy |
| `severity` | critical, high, medium, low |
| `status` | detected → reviewing → resolved / accepted |
| `resolution` | How it was resolved |
| `evidence` | Supporting data (JSONB) |

### Detection Methods
1. **Manual**: Human reports contradiction
2. **AI Scan**: LLM compares governance docs for conflicts
3. **Runtime**: System detects behavior inconsistent with policy

---

## Evidence Pack System (New)

Assembles auditable proof from system data:

### Pack Types
| Type | Contents |
|------|----------|
| `deal_closure` | Deal data, lead history, activities, messages, proposals, approvals, consent records |
| `compliance_audit` | Consent stats, PDPL checks, audit logs, complaint resolutions |
| `board_report` | KPIs, pipeline, revenue, risks, strategic deals |
| `incident_response` | Event timeline, actions taken, impact assessment |

### Pack Properties
- **Immutable**: Once assembled, contents are SHA256-hashed
- **Tamper-evident**: Hash signature stored for verification
- **Exportable**: JSON + PDF formats
- **Traceable**: Every item links to source record

---

## SLA Enforcement

| Level | Threshold | Action |
|-------|-----------|--------|
| Warning | 75% of SLA elapsed | Notify assignee |
| Breach | 100% of SLA elapsed | Escalate to manager |
| L3 Escalation | 150% of SLA elapsed | Escalate to executive |

Implementation: `services/sla_escalation_alerts.py`

---

## Security Layers

| Layer | Component | Purpose |
|-------|-----------|---------|
| Pre-release | `security_gate.py` | Validate before deployment |
| Runtime | `shannon_security.py` | Deep security scanning |
| Outbound | `outbound_governance.py` | Govern external communications |
| Tool | `tool_verification.py` | Verify tool integrity |
| Skill | `skill_governance.py` | Govern agent skill usage |

---

## Current vs Target

| Capability | Current | Target |
|-----------|---------|--------|
| Policy classes (A/B/C) | Live | Live |
| Approval bridge | Live | Enhanced with SLA |
| Trust scoring | Live | Live |
| Audit trail | Live | Live |
| PDPL consent enforcement | Live | Live |
| Security gate | Live | Live |
| Contradiction Engine | Not implemented | Building |
| Evidence Pack System | Not implemented | Building |
| Saudi Compliance Matrix | Not implemented | Building |
| OPA policy engine | Not evaluated | Watch |
| OpenFGA authorization | Not evaluated | Watch |
| Vault secrets management | Not evaluated | Watch |
| Keycloak identity | Not evaluated | Watch |
