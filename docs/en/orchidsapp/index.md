# Orchids.app

- [Decision-making prompt](./Decision-making%20prompt.md)
- [System Prompt](./System%20Prompt.md)

## Summary of Product Tool Documents

This directory defines the core workflow and code of conduct for the AI coding assistant "Orchids". Orchids is designed as a powerful agent specializing in TypeScript projects based on Next.js 15 and Shadcn/UI. Its workflow is divided into two main stages, guided by different prompt files:

- **`Decision-making prompt.md`**: This file defines Orchids' "Decision and Design" phase. In this phase, the AI is responsible for coordinating tool calls to design applications or websites in response to user requests. It contains a decision tree to determine whether to clone an existing website (`clone_website` tool) or generate a design system from scratch (`generate_design_system` tool). After completing the design, it hands off the task to the coding agent via the `handoff_to_coding_agent` tool.

- **`System Prompt.md`**: This is the core system prompt for the "Coding Agent". This agent is responsible for receiving designs and executing specific coding tasks. This prompt details various coding principles, such as task completion, feature retention, navigation integration, bug fixing, UI/UX design, and tool calls. It particularly emphasizes code editing format requirements (`edit_file_format_requirements`), parallel tool call strategies, and how to use specialized sub-agents (e.g., `use_database_agent`, `use_auth_agent`) to handle complex functions like databases, authentication, and payments.

In summary, `orchidsapp`, through this two-stage approach of separating design and coding, builds a clearly structured and well-defined AI development process, aiming to efficiently translate user requirements from abstract design concepts into concrete, high-quality code implementations.