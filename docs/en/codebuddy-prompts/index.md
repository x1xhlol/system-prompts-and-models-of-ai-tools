# CodeBuddy Prompts

- [Chat Prompt](./Chat%20Prompt.md)
- [Craft Prompt](./Craft%20Prompt.md)

## Summary of Product Tool Documents

This directory contains system prompts designed for the AI programming assistant "CodeBuddy" for two different operating modes. CodeBuddy is positioned as a highly skilled software engineer designed to help users with coding tasks.

- **`Chat Prompt.md` (Chat Mode)**: This prompt defines CodeBuddy's behavior in "Chat Mode". In this mode, the assistant's core task is to engage in natural conversation with the user, answer questions, provide explanations, and discuss ideas. It uses the `chat_mode_respond` tool to communicate directly with the user, with a focus on information gathering and planning with the user, rather than immediate code execution.

- **`Craft Prompt.md` (Craft Mode)**: This prompt defines CodeBuddy's behavior in "Craft Mode". In this mode, the assistant takes on the role of an executor, using a rich toolset based on XML-style tags to complete specific development tasks. These tools include file operations (`read_file`, `write_to_file`, `replace_in_file`), command execution (`execute_command`), codebase search (`search_files`), and the ability to interact with external MCP servers. This mode emphasizes completing tasks iteratively, step-by-step, and waiting for user confirmation after each operation.

In summary, `codebuddy-prompts`, through the switching of these two modes (manually triggered by the user), builds a complete development workflow from "planning and discussion" to "hands-on implementation", enabling users to collaborate efficiently with the AI assistant.