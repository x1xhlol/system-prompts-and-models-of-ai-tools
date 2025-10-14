# Qoder

- [prompt](./prompt.md)
- [Quest Action](./Quest%20Action.md)
- [Quest Design](./Quest%20Design.md)

## Summary of Product Tool Documents

This directory defines the core specifications for the AI programming assistant "Qoder", designed for pair programming with users in a specialized agent IDE. Qoder operates in two distinct modes, each with its unique purpose and set of instructions:

- **`Quest Design.md`**: This file defines Qoder's "Design Mode". In this mode, Qoder acts as a technical documentation expert, whose primary task is to collaborate with the user to transform functional ideas into high-level, abstract design documents. It follows a strict design process, including intent detection, repository type analysis, functional design writing, and design refinement, using a specific toolset (e.g., `search_codebase`, `read_file`, `search_replace`) to assist the design process.

- **`Quest Action.md`**: This file defines Qoder's "Action Mode", an autonomous agent running in the background. Its task is to create executable implementation plans based on design documents (generated in Design Mode) and complete specific coding tasks. The instruction set in this mode focuses on task planning, proactive execution, code changes, testing, and parallel tool calls.

- **`prompt.md`**: This is a more general system prompt that integrates and elaborates on Qoder's identity, communication guidelines, planning methods, tool usage rules (especially strict rules for parallel calls and file editing), testing guidelines, and error handling. It appears to be the foundational code of conduct shared by both modes.

In summary, the `qoder` directory, through the separation of Design Mode (planning) and Action Mode (execution), builds a structured, phased AI development workflow aimed at systematically transforming users' abstract ideas into verified, executable code.