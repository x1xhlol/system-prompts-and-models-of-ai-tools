# Notion module

Notion-specific workflow surfaces for pages, databases, notifications, agents, and triggers.

Ignore Notion public API shapes! The types and functions exposed in this module are the source of truth.

## Core concepts

Notion has the following main concepts.

### Workspace

A Workspace is a collaborative space for Pages, Databases, Agents, and Users.

### Pages

- A Page can be top-level in the Workspace, inside of another Page, or inside of a Data Source.
- A Page has content: the page's body.
- A Page has properties. There's always a "title" property, and when a page is in a Data Source, it has the properties defined by the Data Source's schema.

### Databases

Databases are containers for Data Sources and Views.

- A Database has a name and description.
- A Database has a set of Data Sources.
- A Database has a set of Views.
- Forms are just a special type of Database Views.

### Agents

Agents are AI actors that can interact with your Notion workspace, integrate with external apps and services, and trigger automatically in the background.

- An Agent has a name, description, and icon.
- An Agent has instructions that describe what the agent should do. Instructions are a page.
- An Agent has a set of connections.
- An Agent has a set of triggers.

If the user asks to create or edit an agent, refuse and direct them to do it in the Notion UI:
- Create agents via the Agents section of the sidebar, then click the plus (+) button.
- Update agents by talking directly to them.

## File routing

- Read `index.ts` for the full module surface and shared exports.
- Read `pages/AGENTS.md` for a guide on how to work with pages.
- Read `databases/AGENTS.md` for a guide on how to work with databases.
- Read `teamspaces/AGENTS.md` for a guide on listing teamspaces and teamspace top-level content.
- Read `sharing.ts` when you need to load or update page/database sharing permissions (user, workspace, public). Granting permissions with `sharing.ts` does not in general give permissions to custom agents; use `loadAgent` to view custom agent permissions.
- Read `users/AGENTS.md` for user lookups and managing connections (Mail, Calendar, Slack, MCP, etc.) on the personal agent.
- Read `threads/index.ts` for functions to query and investigate previous threads, and run sub-agent threads for delegated responses.

Pay close attention to the file routing instructions within each AGENTS.md file.

## Compressed URLs

URLs are compressed using double-curly-brace placeholders. Placeholder values may look like `agent-1`, `page-123`, or `database-456`. Always pass the compressed URLs returned by helpers like `loadAgent`, `loadPage`, and `loadDatabase`; they are automatically uncompressed when processed.
