# Dealix AI Operating Model — Five-Plane Architecture

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../MASTER_OPERATING_PROMPT.md)  
> **Version**: 1.0 | **Status**: Canonical  
> **Tracks**: All six tracks

---

## Overview

Dealix separates concerns into five architectural planes. Each plane has a distinct responsibility, clear boundaries, and explicit contracts with adjacent planes.

```
┌─────────────────────────────────────────────────┐
│              DECISION PLANE                      │
│   Strategy · Forecasting · Memos · Evidence      │
├─────────────────────────────────────────────────┤
│              EXECUTION PLANE                     │
│   OpenClaw · Durable Flows · Agents · Celery     │
├─────────────────────────────────────────────────┤
│              TRUST PLANE                         │
│   Policy Gates · Approvals · Audit · Compliance  │
├─────────────────────────────────────────────────┤
│              DATA PLANE                          │
│   PostgreSQL · pgvector · Redis · Events · RAG   │
├─────────────────────────────────────────────────┤
│              OPERATING PLANE                     │
│   CI/CD · Monitoring · Self-Improvement · Flags  │
└─────────────────────────────────────────────────┘
```

---

## 1. Decision Plane

**Purpose**: Where strategic decisions are made, forecasts generated, and executive memos assembled.

### Current State
| Component | File | Status |
|-----------|------|--------|
| Executive ROI Service | `services/executive_roi_service.py` | Live (basic) |
| Analytics Service | `services/analytics_service.py` | Live |
| Management Summary Agent | `ai-agents/prompts/management-summary-agent.md` | Live |
| Revenue Attribution Agent | `ai-agents/prompts/revenue-attribution-agent.md` | Live |
| Predictive Revenue | `services/predictive_revenue_service.py` | Live |
| Strategic Simulator | `services/strategic_deals/strategic_simulator.py` | Live |
| ROI Engine | `services/strategic_deals/roi_engine.py` | Live |

### Target State
| Component | Status |
|-----------|--------|
| Executive Room (full aggregation) | Building |
| Evidence Pack Assembly | Building |
| Actual vs Forecast Control Center | Building |
| Contradiction-aware decisioning | Building |
| Board Pack Generator | Planned |

### Structured Outputs
All Decision Plane outputs must be structured:
- `LeadScoreCard` — qualification score + signals + recommendation
- `QualificationMemo` — deal qualification with evidence
- `ProposalPack` — pricing + terms + value proposition
- `ExecutiveSnapshot` — KPIs + risks + pending decisions
- `EvidencePack` — assembled proof for audit/board review
- `ForecastVariance` — actual vs forecast with root causes

---

## 2. Execution Plane

**Purpose**: Where work gets done. Durable, checkpointed, retriable workflows.

### Current State
| Component | File | Status |
|-----------|------|--------|
| OpenClaw Gateway | `openclaw/gateway.py` | Live |
| Durable Task Flow | `openclaw/durable_flow.py` | Live |
| Task Router | `openclaw/task_router.py` | Live |
| Policy Engine | `openclaw/policy.py` | Live |
| Approval Bridge | `openclaw/approval_bridge.py` | Live |
| Observability Bridge | `openclaw/observability_bridge.py` | Live |
| Hooks | `openclaw/hooks.py` | Live |
| Canary Context | `openclaw/canary_context.py` | Live |
| Plugins (5) | `openclaw/plugins/` | Live |
| Agent Executor | `services/agents/` | Live |
| Celery Workers | `workers/` | Live |
| Sequence Engine | `services/sequence_engine.py` | Live |

### Execution Flow
```
Request → OpenClaw Gateway
  → Policy Gate (policy.py: A/B/C classification)
  → Observability (start run, trace)
  → Approval Bridge (if Class B: check approval_token)
  → Canary Context (if canary enforcement: tenant check)
  → Task Router (dispatch to registered handler)
  → Durable Flow (checkpoint state)
  → Agent Executor / Celery Task
  → Action Handler (DB write, message send, etc.)
  → Observability (finish run)
```

### Target State
| Component | Status |
|-----------|--------|
| Temporal for long-running workflows | Watch |
| Compensation policies (rollback) | Planned |
| Idempotency keys for all writes | Planned |
| Dead letter queue with alerting | Planned |

---

## 3. Trust Plane

**Purpose**: Where governance is enforced. No sensitive action bypasses this plane.

### Current State
| Component | File | Status |
|-----------|------|--------|
| Policy Classes (A/B/C) | `openclaw/policy.py` | Live |
| Approval Bridge | `openclaw/approval_bridge.py` | Live |
| Trust Score Service | `services/trust_score_service.py` | Live |
| Security Gate | `services/security_gate.py` | Live |
| Shannon Security | `services/shannon_security.py` | Live |
| PDPL Consent Manager | `services/pdpl/consent_manager.py` | Live |
| PDPL Data Rights | `services/pdpl/data_rights.py` | Live |
| Audit Service | `services/audit_service.py` | Live |
| Audit Log Model | `models/audit_log.py` | Live |
| Outbound Governance | `services/outbound_governance.py` | Live |
| Tool Verification | `services/tool_verification.py` | Live |
| Tool Receipts | `services/tool_receipts.py` | Live |
| SLA Escalation Alerts | `services/sla_escalation_alerts.py` | Live |
| Skill Governance | `services/skill_governance.py` | Live |

### Target State
| Component | Status |
|-----------|--------|
| Contradiction Engine | Building |
| Saudi Compliance Matrix (live controls) | Building |
| OPA policy engine | Watch |
| OpenFGA authorization graph | Watch |
| Vault secrets governance | Watch |

---

## 4. Data Plane

**Purpose**: Where data lives, moves, and is enriched.

### Current State
| Component | Status |
|-----------|------|
| PostgreSQL 16 + asyncpg | Live |
| pgvector embeddings | Live |
| Redis 7 (cache + broker) | Live |
| Multi-tenant data isolation | Live |
| Alembic migrations | Live |
| Knowledge Service (RAG) | Live |
| Domain Events | Live |
| Integration Sync State | Live |
| 30+ SQLAlchemy models | Live |
| Mem0 memory engine | Live |

### Data Governance Rules
1. All tables include `tenant_id` (via `TenantModel` base)
2. Money fields use `Numeric(12,2)`, never Float
3. Timezone is `Asia/Riyadh` (UTC+3)
4. Currency defaults to SAR
5. Soft deletes via `deleted_at` field
6. PII never stored in logs
7. pgvector kept updated (security patches)
8. No external RAG SaaS — PostgreSQL + pgvector + KnowledgeService only

### Target State
| Component | Status |
|-----------|--------|
| CloudEvents for event schema | Planned |
| AsyncAPI for event documentation | Planned |
| Data quality automated checks | Planned |
| Lineage/catalog layer | Watch |

---

## 5. Operating Plane

**Purpose**: Where the system monitors, improves, and governs itself.

### Current State
| Component | File | Status |
|-----------|------|--------|
| Observability | `services/observability.py` | Live |
| Self-Improvement Loop | `services/self_improvement.py` | Live |
| Feature Flags | `services/feature_flags.py` | Live |
| Go-Live Matrix | `services/go_live_matrix.py` | Live |
| Operations Hub | `services/operations_hub.py` | Live |
| GitHub Actions CI | `.github/workflows/dealix-ci.yml` | Live |
| Claude Commands | `.claude/commands/` | Live |
| Claude Hooks | `.claude/hooks/` | Live |

### Target State
| Component | Status |
|-----------|--------|
| Architecture Brief preflight | Building |
| Connector Governance Board | Building |
| Model Routing Dashboard | Building |
| OIDC authentication | Planned |
| Artifact attestations | Planned |
| Audit log external streaming | Planned |
| Protected branch rulesets | Planned |

---

## Plane Interaction Rules

1. **Decision → Execution**: Decision Plane emits structured directives; Execution Plane processes them as tasks.
2. **Execution → Trust**: Every execution step checks Trust Plane before performing sensitive actions.
3. **Trust → Data**: Trust Plane reads audit logs and compliance state from Data Plane.
4. **Data → Operating**: Operating Plane monitors Data Plane health and triggers alerts.
5. **Operating → All**: Operating Plane can pause, resume, or rollback any plane component.

No plane bypasses Trust for Class B or C actions. This is enforced at the OpenClaw Gateway level.
