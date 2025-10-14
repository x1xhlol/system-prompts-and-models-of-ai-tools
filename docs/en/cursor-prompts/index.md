# Cursor Prompts

- [Agent CLI Prompt 2025-08-07](./Agent%20CLI%20Prompt%202025-08-07.md)
- [Agent Prompt 2025-09-03](./Agent%20Prompt%202025-09-03.md)
- [Agent Prompt v1.0](./Agent%20Prompt%20v1.0.md)
- [Agent Prompt v1.2](./Agent%20Prompt%20v1.2.md)
- [Agent Prompt](./Agent%20Prompt.md)
- [Agent Tools v1.0](./Agent%20Tools%20v1.0.md)
- [Chat Prompt](./Chat%20Prompt.md)
- [Memory Prompt](./Memory%20Prompt.md)
- [Memory Rating Prompt](./Memory%20Rating%20Prompt.md)

## Summary of Product Tool Documents

This directory contains a series of core system prompts and functional prompts designed for the AI programming assistant "Cursor". These files collectively define the identity, behavior, tool usage, and various capabilities of the Cursor assistant as it has evolved over time.

- **`Agent Prompt` (Multiple Versions)**: There are multiple versions of the agent prompt files (e.g., `Agent Prompt.md`, `Agent Prompt v1.0.md`, `Agent Prompt v1.2.md`, `Agent CLI Prompt 2025-08-07.md`, `Agent Prompt 2025-09-03.md`), all of which position the assistant as an AI programming partner driven by advanced models (such as GPT-4.1, GPT-5, Claude Sonnet 4). These prompts detail the assistant's core workflow: understanding the codebase through tools (especially code search and file editing tools), creating a plan, executing changes, and verifying them. Different versions vary in detail, for example:
  - **Early versions** (`v1.0`, `v1.2`) emphasize the importance of parallel tool calls and context understanding.
  - **Newer versions** (`2025-09-03`) introduce a more structured workflow, such as mandating the use of a to-do list (`todo_write`) to plan and track tasks, and imposing stricter requirements on status updates and summary formats.
  - The **CLI version** (`2025-08-07`) focuses on command-line interaction and defines in detail how to reference code and format output.

- **`Agent Tools v1.0.md`**: Defines in detail the set of tools available to the agent in JSON format, including codebase search, file read/write, terminal command execution, Mermaid chart generation, and more.

- **`Chat Prompt.md`**: Defines the assistant's behavior in pure chat or Q&A scenarios, where it may not perform code editing but instead provide explanations and guidance.

- **`Memory Prompt.md` and `Memory Rating Prompt.md`**: These two files define a "memory" system. `Memory Prompt` guides the AI on how to determine whether "memories" captured from conversations (such as user preferences, workflows) are worth remembering long-term and how to rate them. `Memory Rating Prompt` provides more detailed rating criteria and positive/negative examples, aiming to enable the AI to more accurately learn and adapt to the user's habits.

In summary, the `cursor-prompts` directory, through a series of continuously iterating and feature-rich prompt documents, builds a highly complex, learning-capable, and rigorously workflow-oriented AI programming assistant. This assistant can not only perform specific coding tasks but also continuously optimize its collaboration with users through its memory system.