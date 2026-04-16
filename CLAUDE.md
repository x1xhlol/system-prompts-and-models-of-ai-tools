# Dealix AI Coding Guidelines

This document provides specialized guidelines for Anthropic Claude (via Claude Code, Cursor, or direct API) working in the Dealix Sovereign Growth OS repository.

## 1. 🌍 Architecting for Arabic First
- All UI strings, generated proposals, and communications MUST be strictly Arabic unless otherwise specified.
- Use `IBM Plex Sans Arabic` for standard text and tables.
- Use `29LT Azal` for hero headlines and important numerical displays.
- RTL layout assumptions are default. Ensure `dir="rtl"` is respected in web assets.

## 2. 📝 Decision Memo Mandate
Whenever you formulate a strategic script or Python orchestration logic, you MUST build the agent response formatting around the Universal Output Contract (`Decision Memo JSON`). Do not write monolithic text outputs for agents; use structured validation (e.g., Pydantic models).

## 3. ⚙️ Slash Commands
Use the following slash commands within your chats to trigger specific pre-built workflows:
- `/repo-map`: Maps the current structure and memory dependencies (via Repomix).
- `/arch-review`: Executes an architectural ADR compliance check against the `Policy Engine`.
- `/safe-refactor`: Refactors while explicitly running tests and checking policy layers.
- `/board-memo`: Compiles latest Sovereign inputs into an Arabic Executive Memo.
- `/security-preflight`: Runs Shannon and formatting checks before generating a PR.
- `/ma-brief`: Aggregates the contents of `/memory/ma/` to generate a DD summary.

## 4. 🔗 Code Constraints & Quality
- Focus on robust typing (Python `typing`, Typescript `strict: true`).
- Prefer state machines (`LangGraph` patterns) over standard while-loops for long-running workflows.
- Always implement exhaustive try-except blocks for External API actions (CRM/ERP), appending `{status: 'unverified/failed'}` to the tool proof logger on failure.

## 5. 🚪 Approvals & Hooks
Do not write code that blindly patches `main`. Comply with `.claude/settings.json` hook definitions, ensuring you log pre/post execution evidence.
