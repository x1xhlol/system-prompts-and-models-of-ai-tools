# Cline

- [Prompt](./Prompt.md)

## Summary of Product Tool Documents

The `Prompt.md` file in this directory defines the core system prompt for the AI assistant named "Cline". Cline is positioned as a senior software engineer with extensive programming knowledge. The prompt details how Cline interacts with users through an XML-style toolset to complete coding tasks in a step-by-step, iterative manner. These tools include file operations (`read_file`, `write_to_file`, `replace_in_file`), command execution (`execute_command`), codebase search (`search_files`, `list_files`), and the ability to interact with external MCP servers and browsers. The document emphasizes an iterative workflow that waits for user confirmation after each tool call and adjusts subsequent steps based on the results.