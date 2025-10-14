# Claude Code

- [claude-code-system-prompt](./claude-code-system-prompt.md)
- [claude-code-tools](./claude-code-tools.md)

## Summary of Product Tool Documents

This directory contains the core system prompts and toolset definitions designed for the AI programming assistant "Claude Code". Claude Code is positioned as an interactive command-line interface (CLI) tool designed to help users with various software engineering tasks.

- **`claude-code-system-prompt.md`**: This is the core system prompt for Claude Code, defining its identity, communication style (concise, direct), and code of conduct. The prompt emphasizes understanding the codebase through search tools before executing tasks and using the `TodoWrite` tool for task planning and tracking. It also stipulates that after making code changes, validation steps such as lint and typecheck must be run to ensure code quality.

- **`claude-code-tools.md`**: Defines in detail the set of tools available to Claude Code in JSON format. These tools are comprehensive, covering everything from code exploration (`Glob`, `Grep`, `LS`), file operations (`Read`, `Edit`, `Write`) to task execution and management (`Task`, `Bash`, `TodoWrite`). Particularly noteworthy is the `Task` tool, which can launch a dedicated sub-agent to handle complex tasks, as well as the `WebFetch` and `WebSearch` tools for retrieving information from the web.

In summary, these two files together depict a powerful and rigorously workflow-oriented CLI code assistant. Through a rich toolset and mandatory requirements for task planning and code validation, it aims to systematically and with high quality fulfill users' development requests.