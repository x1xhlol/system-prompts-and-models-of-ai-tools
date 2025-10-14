# Devin AI

- [Prompt](./Prompt.md)

## Summary of Product Tool Documents

The `Prompt.md` file in this directory defines the core system prompt for the AI software engineer named "Devin". Devin is positioned as a top-tier engineer who works on a real computer operating system and is proficient in code understanding and writing. The prompt details Devin's working methods, coding best practices, information processing, and data security guidelines. Its core workflow is divided into two modes:

- **Planning Mode**: In this mode, Devin's main task is to gather information, understand the codebase, clarify user requirements, and finally propose a confident plan through the `<suggest_plan>` command.
- **Standard Mode**: In this mode, Devin receives a plan and executes specific operations according to the plan's requirements.

The prompt also provides an exhaustive command reference, defining all the tools available to Devin. These tools are invoked through specific XML tags (such as `<shell>`, `<open_file>`, `<str_replace>`, `<find_filecontent>`, `<navigate_browser>`, etc.), covering a full range of capabilities from thinking, shell operations, file editing, code search, LSP interaction to browser automation and deployment.