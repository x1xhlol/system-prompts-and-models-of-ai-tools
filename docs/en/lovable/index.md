# Lovable

- [Agent Prompt](./Agent%20Prompt.md)
- [Agent Tools](./Agent%20Tools.md)

## Summary of Product Tool Documents

This directory contains the core system prompts and toolset designed for the AI editor "Lovable". Lovable is positioned as an AI assistant that creates and modifies web applications in real-time within the browser, with its technology stack based on React, Vite, Tailwind CSS, and TypeScript, and natively integrated with Supabase.

- **`Agent Prompt.md`**: This is Lovable's core system prompt, defining its identity, interface layout, technology stack limitations, and code of conduct. The prompt emphasizes discussing and planning with the user before coding, and adhering to the principles of "perfect architecture" and "maximizing efficiency" (especially parallel tool calls). It also details SEO best practices, debugging guidelines, design principles (emphasizing design systems and avoiding temporary styles), and a clear, necessary workflow from context checking to implementation and verification.

- **`Agent Tools.md`**: Defines in detail the extensive toolset available to Lovable in JSON format. These tools are comprehensive and cover various aspects of software development, including:
  - **File and Dependency Management**: `lov-add-dependency`, `lov-write`, `lov-line-replace`, `lov-rename`, `lov-delete`, etc.
  - **Code and Web Exploration**: `lov-search-files`, `lov-fetch-website`, `websearch--web_search`.
  - **Debugging and Analysis**: `lov-read-console-logs`, `lov-read-network-requests`, `analytics--read_project_analytics`.
  - **Third-party Integrations**: Includes multiple specialized tools related to Supabase, image generation, Stripe payments, and security scanning, such as `supabase--*`, `imagegen--*`, `stripe--*`, `security--*`.

In summary, these two files together depict an extremely powerful AI Web development assistant with a rich toolset. It can not only handle code creation and modification but also perform debugging, analysis, design, search, security scanning, and deeply integrate various third-party services, aiming to provide a one-stop, in-browser complete experience for web application development.