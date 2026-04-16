# Workflow Inventory — Execution Plane Classification

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md)  
> **Plane**: Execution | **Version**: 1.0

---

## Classification Rules

| Class | Criteria | Runtime | Engine |
|-------|----------|---------|--------|
| **Short-lived local** | <30s, single service, no external I/O | Sync/Celery | FastAPI / Celery task |
| **Medium-lived orchestrated** | Minutes to hours, multi-step, internal services | Celery chain | OpenClaw + Celery |
| **Long-lived durable** | Hours to days, external systems, pause/resume, compensation | Durable | Temporal (target) / OpenClaw durable_flow (current) |

### Temporal Candidate Rule
A workflow MUST be classified as "Long-lived durable" and is a Temporal candidate if ANY of:
- Duration spans **days**
- Crosses **2+ external systems**
- Requires **compensation** (rollback on failure)
- Requires **pause/resume** after human approval
- Represents an **external commitment** (contract, payment, message)

---

## Short-Lived Local Workflows

| Workflow | Engine | Duration | Steps |
|----------|--------|----------|-------|
| Lead scoring | Celery task | <5s | LLM call → score → DB write |
| Message classification | Sync | <2s | NLP → intent → tag |
| Dialect detection | Sync | <1s | Arabic NLP → dialect label |
| Knowledge retrieval | Sync | <3s | pgvector search → rank → return |
| Dashboard aggregation | Sync | <5s | Multi-query → aggregate → return |
| Health check | Sync | <1s | Service probes → status |
| Trust score calculation | Celery task | <5s | Factor aggregation → score → DB |
| Audit log write | Sync | <1s | Event → AuditLog insert |

---

## Medium-Lived Orchestrated Workflows

| Workflow | Engine | Duration | Steps | External I/O |
|----------|--------|----------|-------|-------------|
| Lead qualification pipeline | OpenClaw + Celery | 1-5 min | Capture → enrich → score → route → notify | Company research APIs |
| Multi-channel outreach sequence | Sequence Engine | Hours-days | Template → personalize → send → wait → follow-up | WhatsApp, Email, SMS |
| Meeting booking flow | Celery chain | 2-10 min | Propose times → negotiate → confirm → calendar | Cal.com API |
| Proposal generation | OpenClaw + Celery | 5-15 min | Deal data → LLM draft → CPQ pricing → PDF → notify | LLM provider |
| Affiliate onboarding | Celery chain | 10-30 min | Application → evaluate → approve/reject → provision | Email notifications |
| Compliance scan | OpenClaw | 2-5 min | Iterate controls → check each → aggregate → report | Internal services only |
| Evidence pack assembly | Celery task | 1-5 min | Query 6+ tables → aggregate → hash → store | Internal only |
| Contradiction scan | Celery task | 5-30 min | Load docs → LLM comparison → flag conflicts | LLM provider |

---

## Long-Lived Durable Workflows (Temporal Candidates)

### 1. Partner Approval Flow ★ PRIORITY
| Attribute | Value |
|-----------|-------|
| **Duration** | 1-14 days |
| **External Systems** | Email, WhatsApp, CRM, eSign |
| **Pause Points** | Term review, legal review, executive approval |
| **Compensation** | Retract term sheet, notify partner of rejection |
| **Why Temporal** | Multi-day approval chain, external commitments, need resume after crash |

**Steps**:
```
Partner identified → Fit score generated → Manager approval (pause)
  → Term sheet drafted → Legal review (pause) → Partner sent terms
  → Partner negotiation → Executive approval (pause) → Activation
  → If rejected at any stage: compensation (retract, notify)
```

**Current**: Manual / partial OpenClaw  
**Target**: Temporal workflow with checkpointing

---

### 2. DD Room Orchestration ★ PRIORITY
| Attribute | Value |
|-----------|-------|
| **Duration** | 2-8 weeks |
| **External Systems** | Document storage, financial APIs, legal review tools |
| **Pause Points** | Each workstream completion, findings review, IC decision |
| **Compensation** | Terminate DD, notify target, archive room |
| **Why Temporal** | Weeks-long process, multiple workstreams, must survive outages |

**Steps**:
```
DD initiated → Workstreams assigned (financial, legal, technical, product, security)
  → Each workstream: collect → analyze → findings (parallel, durable)
  → Findings consolidation → Risk register → Valuation impact
  → IC Memo generation → IC review (pause) → Decision
  → If proceed: close preparation
  → If reject: compensation (archive, notify, lessons learned)
```

**Current**: No durable workflow  
**Target**: Temporal workflow with parallel workstream activities

---

### 3. Signature / Term Sheet Commitment Flow ★ PRIORITY
| Attribute | Value |
|-----------|-------|
| **Duration** | 1-7 days |
| **External Systems** | DocuSign/Adobe Sign, Email, CRM |
| **Pause Points** | Signature request sent, awaiting signature |
| **Compensation** | Void signature request, notify parties |
| **Why Temporal** | External commitment, legally binding, must track to completion |

**Steps**:
```
Terms finalized → Approval token obtained → Signature request sent (external)
  → Wait for signature (pause, poll/webhook) → Signed → Record in CRM
  → Notify parties → Update deal status → Evidence pack assembly
  → If expired: compensation (void request, notify, re-negotiate option)
```

**Current**: Manual / partial plugin  
**Target**: Temporal workflow with webhook-based resume

---

### 4. M&A Offer & Negotiation Flow
| Attribute | Value |
|-----------|-------|
| **Duration** | 2-12 weeks |
| **External Systems** | Legal counsel, financial advisors, regulatory |
| **Pause Points** | Board approval, regulatory filing, target response |
| **Compensation** | Withdraw offer, regulatory withdrawal, archive |

**Current**: No workflow  
**Target**: Temporal workflow (Phase 2)

---

### 5. Geographic Expansion Launch
| Attribute | Value |
|-----------|-------|
| **Duration** | 4-12 weeks |
| **External Systems** | Regulatory bodies, local partners, infrastructure |
| **Pause Points** | Regulatory approval, canary evaluation, scale decision |
| **Compensation** | Roll back canary, disable market, notify users |

**Current**: Manual / feature flags  
**Target**: Temporal workflow (Phase 3)

---

### 6. PMI Program Execution
| Attribute | Value |
|-----------|-------|
| **Duration** | 3-6 months |
| **External Systems** | HR, finance, IT, legal, CRM |
| **Pause Points** | Each phase gate (Day-1, 30, 60, 90) |
| **Compensation** | Rollback integration steps, separate entities |

**Current**: No workflow  
**Target**: Temporal workflow (Phase 3)

---

## Temporal Adoption Roadmap

| Phase | Timeline | Scope |
|-------|----------|-------|
| **Spike** | Sprint 2 | ADR + prototype with partner approval flow |
| **Pilot** | Sprint 3-4 | Partner approval + DD orchestration on Temporal |
| **Production** | Sprint 5-6 | Signature flow + evidence for remaining workflows |
| **Expansion** | Post-90d | M&A offer, expansion launch, PMI |

### Prerequisites (from ADR-0001)
- [ ] Temporal server deployed (self-hosted or cloud)
- [ ] Worker infrastructure provisioned
- [ ] Existing OpenClaw flows mapped to Temporal activities
- [ ] Monitoring/observability wired to Temporal dashboard
- [ ] Compensation logic documented for each workflow
- [ ] ADR approved with evidence from spike

---

## Idempotency Requirements

Every durable workflow step must be idempotent:

| Step Type | Idempotency Method |
|-----------|-------------------|
| DB write | Upsert with idempotency key |
| External API call | Idempotency header / dedup key |
| Message send | Message ID dedup in outbound governance |
| Approval request | Request ID dedup in approval bridge |
| File/document creation | Hash-based dedup |

---

## Compensation Logic Template

```
for each completed_step in reverse(workflow_steps):
    if completed_step.has_side_effects:
        execute(completed_step.compensation_action)
        log_compensation(completed_step, reason)
    mark_step_compensated(completed_step)
mark_workflow_compensated(workflow)
```

Required for all Long-lived durable workflows before Temporal adoption.
