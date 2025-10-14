# Codex CLI

- [openai-codex-cli-system-prompt-20250820](./openai-codex-cli-system-prompt-20250820.md)
- [Prompt](./Prompt.md)

## Summary of Product Tool Documents

This directory contains system prompts designed for "Codex CLI", an OpenAI-led, terminal-based open-source agent coding assistant. This assistant aims to help users complete local codebase development tasks through natural language interaction.

- **`Prompt.md` (Old Version)** and **`openai-codex-cli-system-prompt-20250820.md` (New Version)**: Both files are core system prompts for Codex CLI, defining its identity, personality, and code of conduct. The new version is more detailed, specifying the agent's requirements in terms of responsiveness (leading messages), task planning (`update_plan` tool), task execution, code testing, and approval processes (sandbox mechanism). Both versions emphasize applying code changes as patches via the `apply_patch` tool and adhering to strict coding and communication guidelines.

In summary, these documents collectively depict a precise, secure, and efficient command-line AI agent. It autonomously completes software engineering tasks in the user's local terminal environment through a structured workflow (planning, execution, testing) and a specific toolset (especially `apply_patch` and `update_plan`).