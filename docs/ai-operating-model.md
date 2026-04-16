# Dealix Sovereign Growth OS: AI Operating Model

## 1. Core Operating Doctrine
The operating fabric distinguishes between **Decision** and **Execution** planes:

- **Decision Plane**: Agent cognition, analysis loops, scenario evaluation, structured output (`Decision Memo`). Handled by Agents like M&A Screener and Partnership Scout.
- **Execution Plane**: Deterministic workflows, retries, worker durability. LangGraph states acting to commit external business processes.

## 2. Infrastructure Routing (Provider Abstraction)
We do not hardwire to one vendor. Use `ProviderRouter` to intelligently select:
- **Cloud Models** (Claude 3.5, GPT-4o) for heavy reasoning and coding.
- **Local/Private Inference** (Atomic Chat adapters / Llama-3) for PDPL compliance, Arabic parsing of sensitive contracts, and internal drafting.

## 3. Tool Verification (ToolProof Pattern)
Every meaningful script interaction requires Verification:
1. `run_id` linked to the interaction.
2. `intended_action` vs `claimed_action`.
3. Evaluated status: `verified`, `partially_verified`, `unverified`, `contradicted`.
If the system claims an action but evidence lacks, it is automatically marked `contradicted`.

## 4. Connector Facade Rule
Agents do NOT talk directly to external APIs (like Stripe, Salesforce). They must route through an internal Connector Facade which enforces:
- Idempotency
- Timeouts/Retries
- Audit Logging
- Reversibility plans

## 5. Memory & Second Brain
Filesystem-based JSON indexed memory in `/memory`.
Includes: ADRs, Postmortems, Growth Experiments, Security Checks, and Escalation Memos.
