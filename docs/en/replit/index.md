# Replit

- [Prompt](./Prompt.md)
- [Tools](./Tools.md)

## Summary of Product Tool Documents

This directory defines the core specifications for the AI programming assistant named "Replit Assistant", which operates within the Replit online IDE environment and aims to assist users with various coding tasks.

- **`Prompt.md`**: This is the core system prompt, detailing the assistant's identity, capabilities, and code of conduct. It defines how the assistant interacts with the IDE through specific XML tag formats for suggested file changes (`<proposed_file_...>`), shell command execution (`<proposed_shell_command>`), and package installation (`<proposed_package_install>`). The prompt emphasizes precision and adherence to existing code patterns, and guides the assistant on how to handle workflow configuration and deployment.

- **`Tools.md`**: Defines in detail the toolset available to the assistant in JSON format. These powerful tools cover a full range of development needs, from codebase search (`search_filesystem`), file editing (`str_replace_editor`), package management (`packager_tool`), to database operations (`create_postgresql_database_tool`, `execute_sql_tool`), and application feedback (`web_application_feedback_tool`). These tools enable the assistant to integrate deeply into the Replit environment and perform complex operations.

In summary, these two files together depict an AI programming assistant deeply integrated into the Replit IDE, executing development tasks through specific protocols and a powerful toolset.