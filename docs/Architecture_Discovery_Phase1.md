# Dealix Sovereign Growth OS: Discovery & Phase 1 Execution Plan

بناءً على الفحص المعماري لبيئة العمل وتطبيق "Master Operating Prompt"، هذه هي الخريطة المعمارية الموثقة للكود (Code-backed Discovery):

## 1. Code-backed Architecture Map
* **Frontend/Routing Layer**: `Next.js` and `FastAPI` (serving at ports 8001/8002).
* **Backend Agent Services**: `/salesflow-saas/backend/app/services/agents/` containing the execution routers (`router.py`, `executor.py`) routing standard sales tools.
* **Core Operating System (New)**: `/salesflow-saas/backend/app/services/core_os/`
  * `provider_router.py`: Handles abstract routing based on PDPL sensitivity (Local vs Cloud).
  * `project_memory_store.py`: Abstraction backing the `/memory` infrastructure.
  * `verification_ledger.py`: The `ToolProof` verification layer handling execution claims.
  * `decision_memo.py`: Pydantic V2 engine validating the Universal Output Contract.
* **Executive Strategic Core (New)**: `/salesflow-saas/backend/app/services/strategic_deals/`
  * `partnership_scout.py`
  * `strategic_pmo.py`
* **Governance Scripts**: `.claude/settings.json`, `AGENTS.md`, and `/docs/governance/`.

## 2. Verified Capability Map (What works today)
* ✅ **Agent Command Routing**: The Execution framework robustly routes intents through LLMs loading `.md` prompts.
* ✅ **Structured Prompting**: Health checks and 37 prompt definitions (including the new 16 executive agents).
* ✅ **Central Output Standardization**: The Decision Memo schema now governs outputs, requiring risk and financial parameters.
* ✅ **Infrastructure Foundations**: Local execution and cloud execution logics are physically defined in the router.
* ✅ **Tool Claims Logging**: Verification ledger records Intents and Side-effects.

## 3. Gap Map (Missing Critical Capabilities)
* ❌ **Agent Long-Running Durability**: Current Python implementations (like PMO and Scout) emulate state but lack physical `LangGraph` Checkpoint integration to survive server restarts.
* ❌ **IdP / RBAC Limits**: Approval rules (A, B, C) are defined in `.md` but not yet hard-coded physically into a middleware blocking FastAPI endpoints.
* ❌ **Connector Facades**: The current system might contact external systems directly. True internal `Connector Facade` wrappers (with timeouts/idempotency keys) are not yet fully abstracted.
* ❌ **White-box Security Logic**: `security_gate.py` must be upgraded to actually perform AST (Abstract Syntax Tree) exploit tests like Shannon.

## 4. Safest Integration Points
1. **Decision Output**: Integrate `DecisionMemo` into every final `return` statement of `executor.py`.
2. **LangGraph Runtime**: Migrate the `execute_flow` method inside `partnership_scout.py` to inherit entirely from `StateGraph` (combining node functions).
3. **Internal Tools Hooks**: Add decorators over tools in `salesflow-saas/backend/app/api/` that automatically log to `verification_ledger.py`.

## 5. Target Operating Architecture
* **Decision Plane (Stateless)**: Agents run fast iterations, generate Memos, and immediately stop. 
* **Execution Plane (Stateful/LangGraph)**: The only entity allowed to commit APIs (e.g., Stripe, CRM, Jira). It reads the `DecisionMemo`, pauses for `CEO Approval` if `Class B/C`, then executes.
* **Memory Fabric**: Everything feeds immediately back into the `.json` schemas inside `/memory/`.

## 6. Policy & Approval Model Summary
* **Class A (Auto)**: Repo code updates, test generation. Requires only Verification Ledger proof.
* **Class B (Approval / R2 Reversibility)**: Public marketing, CRM adjustments. Triggers LangGraph HITL interrupt for VP Operations.
* **Class C (Board / R3 Irreversible)**: M&A proposals, Partnership sign-offs. Requires C-level signatures via Execution Plane.

## 7. Phased Implementation Plan (Phase 1 ONLY)

**Phase 1: Wiring the Fabric (Strict execution of Repo Governance)**
1. **Apply Hooks**: Ensure `.claude/hooks` actually trigger Python test harnesses locally for developers.
2. **Execute LangGraph Checkpointing**: Physically wrap the existing `partnership_scout.py` inside a LangChain/LangGraph `MemorySaver` to provide resumption.
3. **Connector Facade V1**: Build ONE facade (e.g. `CRM Connector`) proving idempotency and rollback logging, redirecting agents away from direct API endpoints.

*Restriction: We will NOT move to Phase 2 (Advanced M&A, Deep PMO) until the Connector Facade and LangGraph durable worker integrations are proven operational and verified.*
