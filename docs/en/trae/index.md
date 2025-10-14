# Trae

- [Builder Prompt](./Builder%20Prompt.md)
- [Builder Tools](./Builder%20Tools.md)
- [Chat Prompt](./Chat%20Prompt.md)

## Summary of Product Tool Documents

This directory contains the core system prompts and toolset designed for the Trae AI programming assistant, which is engineered as a powerful agent operating within the Trae AI IDE. Its functionalities are manifested through two distinct modes:

- **Builder Mode**:
  - **`Builder Prompt.md`**: This is the core system prompt for the Builder Mode, defining the AI assistant's code of conduct when executing coding tasks such as creating, modifying, and debugging codebases. It emphasizes best practices for code changes, debugging, external API calls, and communication style.
  - **`Builder Tools.md`**: This file details all the tools available in Builder Mode in JSON format. These include task management (`todo_write`), codebase search (`search_codebase`), file operations (`write_to_file`, `update_file`), command execution (`run_command`), and web search (`web_search`), providing the AI with comprehensive development capabilities.

- **Chat Mode**:
  - **`Chat Prompt.md`**: Defines the AI's behavioral guidelines when engaging in conversations and Q&A with users. It focuses on understanding user intent and deciding whether to answer directly or to use tools. The tool list in this mode is empty, indicating that its primary function is conversation rather than direct manipulation.

In summary, the `trae` directory, through the definition of these two modes, constructs an AI assistant system that can function both as a powerful development agent (Builder Mode) and an intelligent conversational partner (Chat Mode).