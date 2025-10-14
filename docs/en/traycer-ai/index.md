# Traycer AI

- [phase_mode_prompts](./phase_mode_prompts.md)
- [phase_mode_tools](./phase_mode_tools.md)
- [plan_mode_tools](./plan_mode_tools.md)

## Summary of Product Tool Documents

This directory defines the core operational logic of the Traycer.AI assistant, which is designed as a technical lead operating within an IDE, capable of breaking down complex coding tasks into high-level phases. Its functionalities are implemented through two distinct modes, each with its dedicated system prompts and toolsets.

- **Phase Mode**:
  - **`phase_mode_prompts.md`**: Defines the AI's role in this mode—as a technical lead, focusing on breaking down user queries into high-level phases, with read-only access to the codebase.
  - **`phase_mode_tools.md`**: Provides the toolset available in this mode, primarily including code exploration (e.g., `read_file`, `grep_search`), code navigation (e.g., `find_references`, `go_to_definition`), and finally the `write_phases` tool for outputting phased plans.

- **Plan Mode**:
  - **`plan_mode_tools.md`**: Defines the tools available in Plan Mode. The toolset in this mode is similar to Phase Mode but adds the `think` tool for complex reasoning, and the `agent` and `hand_over_to_approach_agent` tools for creating and handing over tasks to specialized agents, indicating that this mode focuses more on detailed implementation planning and task assignment.

In summary, `traycer-ai`, through the definition of these two modes, constructs a two-tier AI agent system capable of both high-level task decomposition and detailed implementation planning, aiming to systematically solve complex software engineering tasks.