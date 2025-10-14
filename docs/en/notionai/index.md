# Notion AI

- [Prompt](./Prompt.md)
- [tools](./tools.md)

## Summary of Product Tool Documents

This directory contains the core system prompts and toolset definitions designed for "Notion AI". Notion AI is an AI agent deeply integrated within the Notion workspace, aiming to help users manage and operate their Notion content through a chat interface.

- **`Prompt.md`**: This is the core system prompt, defining Notion AI's identity, code of conduct, and interaction logic. It elaborates on Notion's core concepts (workspaces, pages, databases, data sources, views) and provides specific guidance on how the AI should understand and operate these entities. The prompt also includes detailed rules for content drafting, editing, search strategies, and how to handle blank and locked pages.

- **`tools.md`**: Defines in detail all the tools available to Notion AI in JSON format. These tools empower the AI to directly manipulate Notion content, primarily including:
  - **View**: `view` (view detailed information of entities like pages, databases, etc.)
  - **Search**: `search` (perform searches across workspaces, third-party connectors, or the web)
  - **Page Operations**: `create-pages`, `update-page`, `delete-pages`
  - **Database Operations**: `query-data-sources`, `create-database`, `update-database`

In summary, these two files together depict a powerful, domain-specific (Notion) AI assistant. Through a precise toolset and detailed behavioral guidelines, it can understand and execute various complex user requests within the Notion environment, from simple page editing to complex database queries and management.