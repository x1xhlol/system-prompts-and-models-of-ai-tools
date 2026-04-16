# ADR 0001: Tier-1 Execution Policy Spikes

> **Status**: Accepted  
> **Date**: 2026-04-16  
> **Deciders**: Engineering, Product, Governance  
> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md)

---

## Context

Dealix is transitioning from a strong CRM/Revenue OS to a full Sovereign Enterprise Growth OS (Tier-1). This transition requires architectural decisions about how new governance, trust, and compliance components are built.

The codebase already has:
- OpenClaw execution framework with policy classes (A/B/C)
- Approval bridge with canary enforcement
- Durable task flows with checkpointing
- PDPL compliance engine
- 30+ SQLAlchemy models following TenantModel pattern
- 50+ API routes following FastAPI + Pydantic pattern
- 38+ frontend components following Next.js + Tailwind RTL pattern

---

## Decisions

### Decision 1: Docs-First for Tier-1

**Decision**: Governance documentation is written before code implementation.

**Rationale**: The governance layer defines contracts that code must fulfill. Writing docs first prevents overclaim (docs describing code that doesn't exist) and ensures alignment between strategy and implementation.

**Consequence**: Every new code component references its governance doc. Every governance doc has a "Current vs Target" section.

---

### Decision 2: Contradiction Engine Uses Event-Sourced Model

**Decision**: Contradictions are recorded as immutable events, not CRUD records.

**Rationale**: Contradictions represent facts about system state at a point in time. Modifying them would destroy evidence. Resolution is a new event, not an update.

**Consequence**: `Contradiction` model uses status transitions (detected → reviewing → resolved/accepted). Resolution creates a new record, not an update to the original detection.

---

### Decision 3: Evidence Packs Aggregate Existing Data

**Decision**: Evidence packs are assembled from existing models, not from new data collection.

**Rationale**: The system already captures audit logs, consent records, AI conversations, approval decisions, and domain events. Evidence packs simply aggregate and hash this data for tamper-evident presentation.

**Consequence**: `EvidencePackService` queries existing tables. No new data capture mechanisms needed.

---

### Decision 4: Saudi Compliance Matrix Is Live

**Decision**: The compliance matrix is a live, queryable control system that executes checks against the running system.

**Rationale**: Static checklists become stale. Live controls provide continuous compliance assurance and can generate evidence on demand.

**Consequence**: `ComplianceControl` model includes `evidence_source` (which service provides the check) and `last_checked_at`. Controls are runnable, not just documentable.

---

### Decision 5: New Services Follow Existing Async Pattern

**Decision**: All new backend services follow the established pattern: `AsyncSession` injection, `tenant_id` scoping, Pydantic schemas for input/output.

**Rationale**: Consistency reduces cognitive load and ensures all code works within the existing testing and deployment infrastructure.

**Consequence**: No new frameworks or patterns introduced for Tier-1 services.

---

### Decision 6: New Frontend Components Follow Existing Pattern

**Decision**: All new frontend components use `"use client"`, functional components, Tailwind CSS, RTL-first layout, `text-right` alignment, and `fetch` for API calls.

**Rationale**: Consistency with the 38 existing Dealix components.

**Consequence**: No new UI frameworks or state management libraries for Tier-1 components.

---

### Decision 7: No Overclaim on Watch/Hold Technologies

**Decision**: Technologies in Watch or Hold tiers (Temporal, OPA, OpenFGA, Vault, Keycloak) are never referenced as "in production" or "deployed" in any document.

**Rationale**: Enterprise buyers and auditors will verify claims. Overclaim destroys trust.

**Consequence**: All docs use explicit "Current vs Target" tables. Watch technologies are listed as "Not evaluated" or "Watch" with clear criteria for adoption.

---

### Decision 8: Root-Anchored Execution

**Decision**: All scripts and commands execute from the repository root (`salesflow-saas/`). No path assumptions within scripts.

**Rationale**: Previous hooks and scripts had path bugs when run from different directories. The architecture brief script (`scripts/architecture_brief.py`) serves as the official preflight check.

**Consequence**: All new scripts use `Path(__file__).resolve().parent.parent` for root detection.
