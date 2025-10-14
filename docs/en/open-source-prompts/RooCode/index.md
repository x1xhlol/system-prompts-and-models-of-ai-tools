# RooCode

- [Prompt](./Prompt.md)

## Summary of Product Tool Documents

The `Prompt.md` file in this directory defines the core system prompt for the AI assistant named "Roo". Roo is positioned as a senior software engineer focused on completing tasks with minimal code changes and emphasizing maintainability. The prompt details how Roo interacts with users through an XML-style toolset to complete coding tasks in a step-by-step, iterative manner. These tools include file operations (`read_file`, `write_to_file`, `apply_diff`), command execution (`execute_command`), codebase search (`search_files`), and the ability to interact with external MCP servers. Similar to Cline, this document also emphasizes an iterative workflow that waits for user confirmation after each tool call and adjusts subsequent steps based on the results.