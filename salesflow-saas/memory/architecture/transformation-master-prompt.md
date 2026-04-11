# Dealix Transformation Master Prompt

**Date**: 2026-04-11 | **Status**: active | **Type**: master-prompt

## Summary

This is the definitive master prompt for transforming Dealix from a CRM into a
Revenue + Partnership + Strategic Deal Operating System.

## The 3 Master Layers

### Layer 1: Intelligence / Memory / Source of Truth
- Company Twin (capabilities graph + needs graph + authority matrix)
- Business memory (operational, account, market, negotiation, campaign)
- PostgreSQL = source of truth, memory = assistive layer
- Tenant-scoped, traceable, auditable

### Layer 2: Execution / Orchestration / Autonomy
- Lead & partner discovery engine
- Strategic deals engine (15 deal types)
- Channel execution (email-first, WhatsApp warm, LinkedIn assist)
- Negotiation preparation & copilot
- Browser operations (structured, observable)
- Planning discipline (read → plan → resolve → execute → verify)

### Layer 3: Trust / QA / Safety / Release / Self-Improvement
- Claim vs execution verification
- Approval classes (read-only → draft → send → negotiate → commit)
- 5 operating modes (manual → strategic execution)
- Channel compliance (platform rules enforced)
- Cost control & observability
- Launch simulation & daily QA
- Evidence-based self-improvement

## Key Design Decisions

1. **From Lead Engine → Opportunity Engine**: Understand, match, propose deal structures
2. **From CRM → Commercial Memory System**: Every objection, deal, pattern stored & linked
3. **From Automation → Verified Automation**: Claims need evidence
4. **From Multi-channel → Policy-governed outreach**: Approvals & consent enforced
5. **From Agent chaos → Planning discipline**: Read, plan, review, then execute
6. **From Features → Strategic Surface Area**: Every screen serves a business decision

## Tool Integration Decisions

| Tool | Decision | Role |
|------|----------|------|
| claude-mem | ✅ Installed | Development session memory |
| MemPalace | ⚠️ Evaluate | Business memory after internal benchmark |
| OpenClaw | ✅ Pattern | Orchestration patterns, not source of truth |
| Goose | ✅ Pattern | Local ops execution |
| Shannon | ✅ Active | Staging-only security gate |
| ToolProof | ✅ Built internally | tool_receipts.py + tool_verification.py |
| n8n-MCP | ⚠️ Future | Staging first, then promote |
| Career-Ops | ✅ Pattern | Pipeline/batch/escalation architecture reference |

## Success Criteria

- Product understands each client's business model
- Can discover and score strategic counterparties
- Can generate serious opportunities, not just raw leads
- Can draft and manage outreach across channels
- Preserves long-term commercial memory
- Shows real evidence of what agents actually did
- Runs safely with approvals and policies
- Survives realistic launch simulation
- UI feels premium and operational
- Architecture is coherent and maintainable
