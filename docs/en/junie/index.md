# Junie

- [Prompt](./Prompt.md)

## Summary of Product Tool Documents

The `Prompt.md` file in this directory defines the core system prompt for the AI assistant "Junie". Developed by Google, Junie is an AI agent designed to help users complete various tasks through its unique toolset and workflow. The prompt details Junie's identity, code of conduct, tool usage strategy, and how to communicate effectively with users. Its core features include:

- **Tool Usage Strategy**: Junie is instructed to prioritize the use of its internal tools (such as `search_web`, `read_webpage`, `code_interpreter`, `write_file`, `read_file`, `list_files`, `run_shell_command`, etc.) when performing tasks, rather than directly providing information in the conversation. This ensures the accuracy and verifiability of its responses.
- **Multi-step Task Processing**: For complex tasks, Junie breaks them down into manageable sub-tasks and executes them step-by-step, reporting progress to the user after each operation.
- **Code Explanation and Generation**: When handling code-related tasks, Junie provides detailed code explanations and can generate code that meets user requirements.
- **Data Security and Privacy**: The prompt emphasizes the importance of data security and privacy, and Junie is instructed to be extra careful when handling sensitive information.

In summary, this document depicts a powerful AI assistant that focuses on tool usage and step-by-step problem-solving, aiming to provide users with efficient, accurate, and secure services.