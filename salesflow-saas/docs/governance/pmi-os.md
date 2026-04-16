# PMI OS — Post-Merger Integration & Strategic PMO

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md)  
> **Plane**: Execution | **Tracks**: Expansion, Operations  
> **Version**: 1.0 | **Status**: Canonical

---

## Overview

The PMI OS provides the framework for integrating acquired companies and managing strategic programs. It ensures Day-1 readiness, tracks synergy realization, and produces executive weekly packs.

---

## PMI Lifecycle

```
DAY-1 READINESS → 30/60/90 PLANS → EXECUTION → SYNERGY TRACKING → CLOSE-OUT
```

### Day-1 Readiness
- [ ] Legal entity structure finalized
- [ ] Communication plan executed (employees, customers, partners)
- [ ] IT systems access provisioned
- [ ] Financial reporting consolidated
- [ ] Key personnel retention agreements signed
- [ ] Saudization compliance plan for combined entity
- [ ] PDPL data inventory of acquired entity
- [ ] CR (Commercial Registration) transfer initiated

### 30-Day Plan
- [ ] Organization structure announced
- [ ] Customer communication completed
- [ ] System integration assessment completed
- [ ] Quick wins identified and initiated
- [ ] Cultural integration program started
- [ ] Saudization gap analysis completed

### 60-Day Plan
- [ ] Data migration plan finalized
- [ ] Tenant merge/split strategy decided
- [ ] API consolidation roadmap agreed
- [ ] Revenue synergy pilot initiated
- [ ] Cost synergy tracking started
- [ ] Compliance audit of acquired entity completed

### 90-Day Plan
- [ ] Core system integration complete
- [ ] Unified reporting live
- [ ] Synergy run-rate validated
- [ ] Customer retention confirmed (target: >95%)
- [ ] Combined team operating as one unit
- [ ] Integration retrospective completed

---

## Dependency Tracking

### Critical Path Items
| Item | Owner | Dependency | Risk Level |
|------|-------|-----------|-----------|
| Data migration | Engineering | Schema compatibility assessment | High |
| Tenant merge | Platform | Data migration complete | High |
| API consolidation | Engineering | Tenant merge complete | Medium |
| Financial consolidation | Finance | Legal entity setup | Medium |
| Customer migration | Customer Success | Communication plan | High |

### Risk Register
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Key person departure | Medium | High | Retention bonuses, cultural integration |
| Data loss during migration | Low | Critical | Backup, staged migration, rollback plan |
| Customer churn post-merger | Medium | High | Proactive communication, service continuity |
| Regulatory non-compliance | Low | Critical | Pre-close compliance audit |
| Integration timeline overrun | High | Medium | Buffer in plan, weekly tracking |

---

## Escalation Engine

| Level | Trigger | Action |
|-------|---------|--------|
| L1 | Task >3 days overdue | Notify workstream lead |
| L2 | Milestone >1 week overdue | Escalate to PMI director |
| L3 | Critical path blocked | Escalate to CEO |
| L4 | Synergy at risk | Board notification |

---

## Executive Weekly Pack

Produced every Friday, contains:

1. **Integration Status** — overall RAG (Red/Amber/Green) status
2. **This Week** — completed milestones
3. **Next Week** — planned milestones
4. **Blockers** — active issues requiring escalation
5. **Synergy Tracker** — actual vs planned synergies (revenue + cost)
6. **People** — retention, Saudization, cultural integration
7. **Risk Summary** — top 5 risks with mitigation status

---

## Technical Integration Patterns

### Tenant Strategy
| Scenario | Approach |
|----------|---------|
| Acquiree has no SaaS | Create new tenant in Dealix |
| Acquiree has compatible SaaS | Data migration into Dealix tenant |
| Acquiree has incompatible SaaS | Parallel operation → gradual migration |
| Acquiree is Dealix customer | Tenant already exists, upgrade plan |

### Data Migration
1. Schema mapping (source → Dealix models)
2. Data quality assessment
3. Staging migration (non-production)
4. Validation suite (row counts, referential integrity, PII check)
5. Production migration (maintenance window)
6. Post-migration validation
7. Rollback ready for 72 hours

---

## Structured Outputs

- `Day1ReadinessChecklist` — all items with status
- `IntegrationPlan` — phases, milestones, dependencies, owners
- `SynergyTracker` — revenue synergies, cost synergies, run-rate, actual
- `WeeklyPack` — executive summary for board
- `IssueRegister` — active issues, owners, resolution timeline
- `IntegrationCloseout` — final report, lessons learned, metrics
