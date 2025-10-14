# v0 Prompts and Tools

- [Prompt](./Prompt.md)
- [Tools](./Tools.md)

## Summary of Product Tool Documents

This directory contains the core system prompts and toolset definitions designed for Vercel's AI assistant "v0". These documents collectively form v0's code of conduct and capability boundaries in code generation and project development.

- **`Prompt.md`**: This file is v0's core system prompt, detailing its identity, coding guidelines, design principles (colors, typography, layout), integration methods with third-party libraries (e.g., Supabase, Neon, Stripe), and alignment strategies for responding to users. It emphasizes v0's best practices in generating Next.js applications, handling files, using specific components (e.g., shadcn/ui), and interacting with the AI SDK.

- **`Tools.md`**: This file defines 13 core tools available to v0 in JSON format. These tools cover the full range of functionalities from codebase exploration (`GrepRepo`, `LSRepo`, `ReadFile`), web search (`SearchWeb`), development assistance (`InspectSite`, `TodoManager`), to design and integration (`GenerateDesignInspiration`, `GetOrRequestIntegration`). Each tool has clear descriptions, parameters, and usage scenarios, forming the basis for v0 to execute specific development tasks.

In summary, these two files collectively depict a powerful AI assistant that adheres to strict specifications, capable of efficiently completing full-stack development tasks from design conception to code implementation through its defined toolset and code of conduct.