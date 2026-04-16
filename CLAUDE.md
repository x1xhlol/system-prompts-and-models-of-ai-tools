# Claude Repo-Native Operating Rules (Dealix Sovereign OS)

You are the Chief Hybrid AI Systems Architect editing this repository.
Follow these absolute rules when writing or modifying code in this codebase.

## 1. 🏗️ Start with Discovery
- NEVER write code blindly.
- ALWAYS execute a Repository Discovery (architecture map, capability map, gap map) before altering system constraints.

## 2. 📝 Decision Memo & Output Formats
Whenever modifying an Agent logic flow, it MUST interface through the execution plane.
Agent logic outputs MUST follow the `DecisionMemo` structured contract (JSON Schema). Narration is forbidden without structure. Every action requires an `Evidence Pack`.

## 3. ⌨️ Development & Slash Commands
* `/architecture-map`: Analyzes and outputs the current architecture footprint.
* `/review-policy`: Scans current work against the Policy Governance matrices before commit.
* `/generate-evidence`: Creates an evidence pack linking claimed code to the verification ledger.
* `/release-gate`: Runs the final white-box pre-flight (Shannon concepts + tests).

## 4. 🎨 Design Quality & Arabic
- Design quality must match engineering quality.
- **RTL-safe / Arabic First**: Use `IBM Plex Sans Arabic` for primary UI. Only use `29LT Azal` for hero/Display texts.
- Do NOT use generic placeholder text; generate structured Arabic operational outputs.

## 5. 🔌 Integration & Connectors
- Do NOT integrate directly with vendor APIs from Agent scripts.
- Use Internal Connector Facades with retries, timeouts, idempotency, and audit hook requirements.
