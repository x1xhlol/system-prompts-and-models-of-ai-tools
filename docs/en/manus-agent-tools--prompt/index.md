# Manus Agent Tools & Prompt

- [Agent loop](./Agent%20loop.md)
- [Modules](./Modules.md)
- [Prompt](./Prompt.md)
- [tools](./tools.md)

## Summary of Product Tool Documents

This directory contains the complete system prompts, module definitions, and toolset designed for the AI agent "Manus". Manus is positioned as a versatile AI agent proficient in various tasks such as information gathering, data processing, content creation, and software development.

- **`Prompt.md` and `Modules.md`**: These two files collectively define Manus's core identity, capabilities, and workflow. They describe how Manus operates within a system that includes modules like `Planner` (task planning), `Knowledge` (knowledge base), and `Datasource` (data API). Manus iteratively completes tasks by analyzing event streams (user messages, tool execution results, etc.) and emphasizes the priority of information acquisition (API > web search > internal knowledge).

- **`Agent loop.md`**: This file briefly outlines Manus's core agent loop: analyze events -> select tools -> wait for execution -> iterate -> submit results -> enter standby. This loop is the foundation for its autonomous task completion.

- **`tools.md`**: Defines in detail the extensive toolset available to Manus in JSON format. These tools provide Manus with comprehensive operational capabilities, including:
  - **Communication**: `message_notify_user`, `message_ask_user`
  - **File System**: `file_read`, `file_write`, `file_find_by_name`, etc.
  - **Shell Operations**: `shell_exec`, `shell_view`, `shell_kill_process`, etc.
  - **Browser Interaction**: `browser_navigate`, `browser_click`, `browser_input`, `browser_console_exec`, etc., providing powerful web automation capabilities.
  - **Information and Deployment**: `info_search_web`, `deploy_expose_port`, `deploy_apply_deployment`

In summary, these documents collectively depict a highly modular, tool-driven general-purpose AI agent. Manus, through its powerful toolset and structured agent loop, can autonomously and systematically complete various complex tasks from information processing to software deployment in a sandbox environment.