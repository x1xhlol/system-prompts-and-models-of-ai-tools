# Gemini CLI

- [google-gemini-cli-system-prompt](./google-gemini-cli-system-prompt.md)

## Summary of Product Tool Documents

The `google-gemini-cli-system-prompt.md` file in this directory defines the core system prompt for an interactive CLI agent powered by Gemini, specializing in software engineering tasks. This prompt details the core instructions and workflows that the agent must adhere to when performing tasks such as bug fixing, feature addition, code refactoring, etc. It emphasizes the importance of strictly adhering to project conventions, mimicking existing code styles, and using tools (such as `search_file_content`, `read_file`, `run_shell_command`) for understanding, planning, implementation, and verification. Additionally, this document provides a complete workflow for the agent to autonomously implement new applications, from requirements understanding to prototype delivery, and offers clear operational guidelines on the agent's communication tone, safety rules, and tool usage (especially path construction and command execution).