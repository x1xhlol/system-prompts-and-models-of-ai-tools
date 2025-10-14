# Anthropic

- [Claude Code 2.0](./Claude%20Code%202.0.md)
- [Sonnet 4.5 Prompt](./Sonnet%204.5%20Prompt.md)

## Summary of Product Tool Documents

This directory contains two core system prompts designed for Claude, the AI assistant developed by Anthropic, corresponding to its specific applications in different products or versions.

- **`Claude Code 2.0.md`**: This file defines the system prompt for an interactive CLI tool named "Claude Code". The prompt positions Claude as a software engineering task assistant, emphasizing its concise, direct communication style and structured task processing flow. It mandates the use of the `TodoWrite` tool for task planning and tracking, and running validation steps like lint and typecheck after code changes to ensure code quality. Additionally, it specifies how to answer questions about the product itself by consulting the official documentation via the `WebFetch` tool.

- **`Sonnet 4.5 Prompt.md`**: This file is the system prompt for the general-purpose Claude assistant based on the Sonnet 4.5 model. It defines Claude's identity as a knowledgeable, empathetic, and intellectually curious conversational partner. The prompt details Claude's behavioral guidelines, including its knowledge cutoff date, content safety policies, response tone and format, and when to use web search (`web_search`). Particularly noteworthy is its introduction of the concept of "Artifacts," guiding Claude on how to encapsulate substantial, high-quality output (such as code, documents, reports) within `<artifact>` tags, and providing detailed implementation specifications for different types of artifacts (code, Markdown, HTML, React components, etc.).

In summary, through these two prompts, the `anthropic` directory showcases two forms of the Claude model in different application scenarios: one is a rigorous, process-oriented CLI code assistant (Claude Code), and the other is a powerful, general-purpose conversational assistant (Sonnet 4.5) that focuses on high-quality content generation and user experience.