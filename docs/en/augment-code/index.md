# Augment Code

- [claude-4-sonnet-agent-prompts](./claude-4-sonnet-agent-prompts.md)
- [claude-4-sonnet-tools](./claude-4-sonnet-tools.md)
- [gpt-5-agent-prompts](./gpt-5-agent-prompts.md)
- [gpt-5-tools](./gpt-5-tools.md)

## Summary of Product Tool Documents

This directory contains system prompts and tool definitions designed for the AI coding assistant "Augment Agent," developed by Augment Code. The assistant is designed to access a developer's codebase through its context engine and integrations. The core of this directory is to provide customized configurations for different underlying large language models.

- **Claude 4 Sonnet Version**:
  - **`claude-4-sonnet-agent-prompts.md`**: This is the core system prompt for the Claude 4 Sonnet model. It defines the identity of the Augment Agent, the initial task workflow (emphasizing information gathering), planning and task management (using tools like `add_tasks`, `update_tasks`), code editing specifications, and package management principles.
  - **`claude-4-sonnet-tools.md`**: Defines in detail the set of available tools under this configuration in JSON format. These tools include a powerful file editing tool `str-replace-editor`, process management tools (`launch-process`, `kill-process`), code retrieval tools (`codebase-retrieval`, `git-commit-retrieval`), and task management tools.

- **GPT-5 Version**:
  - **`gpt-5-agent-prompts.md`**: This is the system prompt for the GPT-5 model. Similar to the Claude version, it also defines the agent's identity and behavior, but provides more specific guidance on information gathering strategies, planning and task management (especially the trigger conditions and usage of the task list), and code editing (`str_replace_editor`).
  - **`gpt-5-tools.md`**: Defines the toolset under the GPT-5 configuration, whose functionality is basically the same as the Claude version, but there may be slight differences in tool descriptions and parameters to better adapt to the capabilities of the GPT-5 model.

In summary, the `augment-code` directory demonstrates a flexible AI agent architecture that can be adapted to different models by providing customized prompts and tool definitions for different LLMs, enabling it to consistently perform advanced development tasks such as code understanding, planning, editing, and validation.