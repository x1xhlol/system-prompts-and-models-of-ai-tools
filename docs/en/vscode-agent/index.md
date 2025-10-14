# VSCode Agent

- [chat-titles](./chat-titles.md)
- [claude-sonnet-4](./claude-sonnet-4.md)
- [gemini-2.5-pro](./gemini-2.5-pro.md)
- [gpt-4.1](./gpt-4.1.md)
- [gpt-4o](./gpt-4o.md)
- [gpt-5-mini](./gpt-5-mini.md)
- [gpt-5](./gpt-5.md)
- [nes-tab-completion](./nes-tab-completion.md)
- [Prompt](./Prompt.md)

## Summary of Product Tool Documents

This directory contains the core instructions and configuration files designed for the AI programming assistant "GitHub Copilot" integrated into VS Code. These files collectively define the multifaceted behavior of the assistant:

- **`Prompt.md`**: This is the main system prompt, defining the assistant's identity, high-level instructions, tool usage rules (such as `semantic_search`, `run_in_terminal`, `insert_edit_into_file`, etc.), and best practices for file editing and error handling.
- **Specific Model Prompts (e.g., `gpt-4o.md`, `gemini-2.5-pro.md`, `claude-sonnet-4.md`, etc.)**: These files provide customized instruction sets for different large language models. While they share many general instructions, they also include fine-tuning for specific model tools (e.g., `apply_patch`) or behaviors to optimize their performance in the Copilot environment.
- **Functional Prompts (e.g., `chat-titles.md`, `nes-tab-completion.md`)**: These are dedicated prompts for specific functionalities. `chat-titles.md` guides the AI on how to generate concise titles for chat conversations, while `nes-tab-completion.md` (empty content) might be used to define functionalities related to Tab key code completion.

In summary, this directory, through a general base prompt and multiple specialized prompts for different models and specific functionalities, constructs a complex, layered, and highly configurable AI agent system, enabling it to efficiently assist users with programming tasks in the VS Code environment.