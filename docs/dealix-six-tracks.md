# Dealix — six operational tracks (Sovereign Growth & Execution OS)

**Canonical constitution:** [`MASTER_OPERATING_PROMPT.md`](../MASTER_OPERATING_PROMPT.md).  
**Planes and runtimes:** [`docs/governance/planes-and-runtime.md`](governance/planes-and-runtime.md), [`docs/ai-operating-model.md`](ai-operating-model.md).

Dealix is positioned as **Sovereign Growth & Execution OS**, not a single-purpose “AI sales bot.” The six tracks below are **product and governance lanes** that share the same decision / execution / trust / data / operating fabric.

**Operating rule:** AI explores and recommends; **deterministic workflows** commit durable actions; **humans** approve critical moves (A/R/S classification). See [`docs/governance/approval-policy.md`](governance/approval-policy.md).

---

## Track map

| Track | Purpose (summary) | Primary code / docs (starting points) |
|-------|-------------------|----------------------------------------|
| **Revenue OS** | Pipeline, leads, proposals, commercial execution | [`salesflow-saas/backend/app/services/agents/`](../salesflow-saas/backend/app/services/agents/), CRM APIs, [`salesflow-saas/docs/ARCHITECTURE.md`](../salesflow-saas/docs/ARCHITECTURE.md), [`salesflow-saas/docs/API-MAP.md`](../salesflow-saas/docs/API-MAP.md) |
| **Partnership OS** | Scout, fit, structure, partner lifecycle | [`salesflow-saas/backend/app/services/strategic_deals/partnership_scout.py`](../salesflow-saas/backend/app/services/strategic_deals/partnership_scout.py), [`deal_negotiator.py`](../salesflow-saas/backend/app/services/strategic_deals/deal_negotiator.py), [`Execution_Matrix.md`](../Execution_Matrix.md) (Alliance / Scout rows) |
| **Corporate Development / M&A OS** | Screening, DD, valuation, deal room | [`salesflow-saas/backend/app/services/strategic_deals/`](../salesflow-saas/backend/app/services/strategic_deals/) (`acquisition_scouting.py`, `deal_room.py`, `company_profiler.py`, …), [`docs/governance/strategic-ops-pmi.md`](governance/strategic-ops-pmi.md) |
| **Expansion OS** | Markets, playbooks, launch readiness | [`salesflow-saas/backend/app/services/strategic_deals/strategic_simulator.py`](../salesflow-saas/backend/app/services/strategic_deals/strategic_simulator.py), GTM docs under [`salesflow-saas/docs/`](../salesflow-saas/docs/) |
| **PMI / Strategic PMO OS** | Post-close, synergies, milestones | [`strategic_pmo.py`](../salesflow-saas/backend/app/services/strategic_deals/strategic_pmo.py), [`Execution_Matrix.md`](../Execution_Matrix.md) (PMI / PMO rows), [`governance/strategic-ops-pmi.md`](governance/strategic-ops-pmi.md) |
| **Trust, Policy & Executive Governance OS** | Policy, audit, security gate, exec intelligence | [`salesflow-saas/backend/app/services/dealix_os/policy_engine.py`](../salesflow-saas/backend/app/services/dealix_os/policy_engine.py), [`docs/governance/trust-fabric.md`](governance/trust-fabric.md), [`docs/governance/approval-policy.md`](governance/approval-policy.md), legal pack [`salesflow-saas/docs/legal/`](../salesflow-saas/docs/legal/) |

Agent families (16 agents) in [`Execution_Matrix.md`](../Execution_Matrix.md) roll up into these six tracks; when adding agents, tag the owning track and HITL gate in the matrix.

---

## Implementation status vs Tier-1 target (honest snapshot)

Use this to avoid claiming components that are not yet wired in production. Refresh when shipping milestones.

| Area | Status | Notes |
|------|--------|--------|
| Decision plane (memos, structured outputs, routing) | **Partial** | LangGraph / agents / `AgentExecutor`; tighten schema + evidence on all governed paths |
| Execution plane (durable, crash-proof, versioned workers) | **Partial** | Celery + flows today; **Temporal** is a documented Tier-1 target only — see [`docs/governance/execution-fabric.md`](governance/execution-fabric.md) |
| Trust plane (tool verification, evals, red-team) | **Partial** | Audit, `security_gate`, policy engine; expand verification ledger consistently |
| Data plane (semantic metrics, single lineage catalog) | **Partial** | Postgres + patterns; semantic layer / lineage tool TBD per [`technology-radar-tier1.md`](governance/technology-radar-tier1.md) |
| Operating plane (GitHub rulesets, env promotion, OIDC) | **Partial** | Documented in [`github-and-release.md`](governance/github-and-release.md); enforce per org tier |
| OPA / OpenFGA / Vault / Keycloak as policy & IAM | **Planned** | Target architecture only until ADR + spike + evidence |

---

## Related assets

- Master execution matrix (agents × events × HITL): [`Execution_Matrix.md`](../Execution_Matrix.md)  
- Architecture pack (layers): [`Architecture_Pack.md`](../Architecture_Pack.md)  
- Tier-1 blueprint (index): [`docs/blueprint-master-architecture.md`](blueprint-master-architecture.md)  
- 90-day Tier-1 matrix: [`docs/execution-matrix-90d-tier1.md`](execution-matrix-90d-tier1.md)  
- Enterprise readiness checklist: [`docs/enterprise-readiness.md`](enterprise-readiness.md)  
- Completion Program (WS1–WS8): [`docs/completion-program-workstreams.md`](completion-program-workstreams.md)  
- Architecture register (subsystem status): [`docs/architecture-register.md`](architecture-register.md)  
- Execution matrix canonical source: [`docs/adr/0002-execution-matrix-canonical-source.md`](adr/0002-execution-matrix-canonical-source.md)
