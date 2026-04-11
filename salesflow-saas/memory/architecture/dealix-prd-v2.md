# Dealix PRD — Product Requirements Document

**Version**: 2.0 | **Date**: 2026-04-11 | **Status**: Active

## Product Identity

**Name**: Dealix
**Type**: Commercial Intelligence & Deal Operating System
**Market**: Saudi B2B (primary), GCC (secondary)
**Position**: Not a CRM. A Revenue + Partnership + Strategic Deal OS.

## Architecture: 4 Layers

```
Layer 3: Strategic Growth OS (acquisition, ecosystem, ROI)
Layer 2: Deal Exchange OS (barter, co-sell, reseller, partnerships)
Layer 1: Sales OS (leads, outreach, proposals, pipeline)
Layer 0: Core Platform (Company Twin, Taxonomy, Channels, Approvals, Trust, Memory)
```

## Layer 0 — Core Platform

### 0.1 Company Twin
Every tenant gets a structured digital twin:
- Identity: name, industry, CR, geography, size
- Capabilities: services, products, white-label capacity, barter assets
- Needs: marketing, delivery, distribution, capital, partners
- Authority Matrix: what AI can commit vs what needs approval
- Red Lines: forbidden claims, blocked sectors, pricing floors
- Deal Preferences: allowed/blocked deal types, min/max values

### 0.2 Deal Taxonomy (15 types)
sales_lead, referral, co_selling, co_marketing, subcontracting,
white_label, reseller, strategic_alliance, channel_partnership,
joint_venture, acquisition_scouting, investment_intro,
vendor_replacement, capability_gap_fill, tender_consortium

### 0.3 Channel Engine
- Email: PRIMARY outbound (SPF/DKIM/DMARC, unsubscribe, consent)
- LinkedIn: ASSIST-MODE ONLY (draft, queue, operator review — no bots)
- WhatsApp: WARM ONLY (opt-in, 24h window, approved templates)

### 0.4 Approval Center
- Class A (auto): summarize, classify, score, internal drafts
- Class B (approval): send outreach, share pricing, propose terms
- Class C (executive): exclusivity, equity, legal, acquisition

### 0.5 Trust & Verification
Every agent run produces: claim → actual action → evidence → verdict
Verdicts: VERIFIED, PARTIAL, UNVERIFIED, CONTRADICTED, BLOCKED

### 0.6 Shared Memory
Operational + account + market + negotiation + campaign memory
DB = source of truth. Memory = assistive recall layer.

### 0.7 Observability
Cost tracking, performance metrics, channel health, anomaly detection

## Layer 1 — Sales OS

### Modules
- ICP Engine: customer segment definitions
- Lead Discovery: company sourcing + enrichment
- Lead Intelligence: pain inference, urgency, entry point
- Outreach Engine: email sequences, LinkedIn assist, WhatsApp warm
- Proposal Engine: scoped offers, pricing, pilot options
- Sales Memory: objections, patterns, what worked
- Pipeline: stage management, velocity tracking

### KPIs
lead→meeting, meeting→proposal, proposal→close, reply rate, cycle time

## Layer 2 — Deal Exchange OS

### Modules
- Offer Graph: what we can provide as partner
- Need Graph: what we lack
- Reciprocal Match Engine: mutual value scoring
- Partner Scoring: fit, reciprocity, credibility, risk
- Reciprocal Offer Generator: barter/co-sell/reseller structures
- Pilot Proposal Generator: bounded first-step deals
- Deal Room: workspace with BATNA, concessions, approvals

### KPIs
partner response rate, pilot acceptance, pilot→full conversion, reciprocal value

## Layer 3 — Strategic Growth OS

### Modules
- Acquisition Scouting: target sourcing + scoring + briefs
- Ecosystem Mapper: partner landscape visualization
- Strategic Simulator: scenario modeling (upside/downside/risk)
- ROI Engine: CAC reduction, distribution value, margin impact
- Partner Performance Graph: contribution tracking
- Portfolio Intelligence: vertical wins, pattern detection

### KPIs
partner-sourced revenue, acquisition candidates qualified, ecosystem coverage

## Non-Goals
- NOT a general-purpose chatbot
- NOT an uncontrolled automation bot
- NOT a financial trading system
- NOT a replacement for legal review on binding terms

## Success Criteria
1. Product understands each client's business model (Company Twin)
2. Discovers and scores strategic counterparties
3. Generates structured opportunities, not just raw leads
4. Manages multi-channel outreach under policy
5. Preserves commercial memory across sessions
6. Verifies what agents actually did
7. Runs safely with approval gates
8. Survives launch simulation
9. UI feels premium and operational
10. Architecture is coherent and maintainable

## Phased Rollout
- Sprint 1: Core Platform + Company Twin + Taxonomy + Approvals
- Sprint 2: Sales OS MVP (lead→outreach→pipeline)
- Sprint 3: Deal Exchange OS MVP (matching→deal room→pilot)
- Sprint 4: Strategic Growth MVP (scouting→simulator→ROI)
- Sprint 5: Hardening + QA + Launch
