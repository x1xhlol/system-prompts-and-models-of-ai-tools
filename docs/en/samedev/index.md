# Same.dev

- [Prompt](./Prompt.md)
- [Tools](./Tools.md)

## Summary of Product Tool Documents

This directory contains the core system prompts and toolset designed for the AI programming assistant running in Same (a cloud IDE). This assistant is powered by `gpt-4.1` and aims to pair program with users to develop web applications.

- **`Prompt.md`**: This is the core system prompt, defining the AI assistant's identity, service strategy, communication methods, and detailed guidelines for code modification, web development, design, and debugging. It particularly emphasizes parallel tool calls for efficiency, task management via the `.same/todos.md` file, and best practices for project initialization using the `startup` tool and `bun` package manager. Additionally, it includes detailed instructions on website cloning and collaboration with task agents (`task_agent`).

- **`Tools.md`**: Defines in detail all the tools available to the AI assistant in JSON format. These tools cover the entire process from project startup (`startup`), code exploration (`ls`, `glob`, `grep`), file operations (`read_file`, `edit_file`, `string_replace`), to version control (`versioning`), deployment (`deploy`), and web scraping (`web_scrape`). Notably, it includes a powerful `task_agent` tool that can launch a fully functional sub-agent to execute complex tasks.

In summary, these two files collectively depict a comprehensive and workflow-standardized AI development agent that can efficiently and autonomously complete the entire web development lifecycle from project initialization to deployment within the Same IDE environment.