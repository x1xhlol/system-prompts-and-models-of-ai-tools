# Dealix Sovereign Growth OS: Agent Constitution

This file conforms to the public `AGENTS.md` specification. It defines the rules of engagement, architectural boundaries, and absolute laws for any AI Agent (Claude, Cursor, Goose, etc.) reading or executing within the `Dealix Sovereign Growth OS` repository.

## 1. 🛡️ Absolute Golden Rules

1. **Automation by default, approval by exception**: 
   - Operations are autonomous unless they trigger a HITL (Human-in-the-loop) gate.
2. **No strategic autonomy without evidence**: 
   - Agents must write the `Decision Memo` output contract for every action. No silent changes.
3. **AI assists decisions; business systems remain source of truth**: 
   - Never mock a database state write unless executing a targeted test.
4. **Every important action must be replayable, explainable, and reversible**:
   - Provide a `rollback_plan` in every M&A or expansion document generated. 
5. **Arabic-first is not a translation layer**: 
   - Treat Arabic as a primary product architecture choice (RTL natively, `IBM Plex Sans Arabic`).

## 2. 🚷 Prohibited Zones (Forbidden Paths)
Agents MUST NOT modify, read, or execute scripts related to the following without explicit `/canary-promote` or `-override` user commands:
- `**/*.env` and `**/secrets/*`
- `production/db_migrations/*` (without Shannon preflight scans)
- `salesflow-saas/backend/scripts/deploy_live.py` (Must invoke manually to enforce HITL)

## 3. 🧠 Memory & Verification Guidelines
Agents MUST write their outputs contextually to the `/memory/` structure:
- `/memory/ma/` -> Deal valuation, target screening
- `/memory/partners/` -> Partner scouting, Alliance term sheets
- `/memory/architecture/` -> System changes, ADRs
- `/memory/policies/` -> Compliance engines rules

**The Verification Toolproof Law:**
If you execute an event, you must log: Intent, Claimed Action, Side Effects, and Verification Status (verified, partially_verified, unverified).

## 4. 🔀 Preferred Toolchains & Adapters
- **Orchestration**: `LangGraph` for M&A/Strategy long-running processes.
- **Local/Private Inference**: `Atomic Chat` where PDPL limits cloud transmission.
- **Ops/Terminal Agent**: `goose` for system actions and multi-step OS workflows.
- **Repo Context**: `Repomix` for packing complex code architectures for reviews.
- **Security Check**: `Shannon` for white-box pre-release gates. 

## 5. 🤖 Available Agent Families
Agents must align with one of these namespaces:
1. `growth.*` (Market Signal, Partnership Scout, Alliance Structuring, Expansion)
2. `ma.*` (Screener, DD Analyst, Valuation, Negotiation, PMI)
3. `revenue.*` (Lead Intel, Exec Outreach, Proposal Design, Expansion)
4. `governance.*` (Strategic PMO, Compliance, Exec Sovereign Intelligence)

---
*Note: Any agent caught hallucinating a success claim without `audit_metadata` verification will have its access revoked by the Sovereign Orchestrator.*
