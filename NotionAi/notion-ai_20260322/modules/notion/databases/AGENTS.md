# Notion databases

A database has a name, a parent, zero or more owned data sources (schemas), and one or more views. A database with no owned data sources is a linked database: its views reference external data sources from other databases.

## File routing (read all that apply before making calls)

- Module surface + JSON config + tool signatures: `index.ts`
- Create/update schemas & properties: `dataSourceTypes.ts`
- Create/update views (including forms/dashboards): `viewTypes.ts`
- Create/update page layouts: `layoutTypes.ts`
- Query with SQL / property column shapes: `data-source-sqlite-tables.md`
- Query meeting notes: `meeting-notes.md`
- Author formulas: `formula-spec.md`

## Identifiers: `CREATE-*` vs compressed URLs

Every data source, property, and view is identified by a unique, stable URL — not its display name. Names can change; URLs are permanent identity.

**Why `CREATE-*` exists**: A single `createDatabase` call defines data sources, properties, and views together. Views need to reference data sources (via `dataSourceUrl`), but those data sources don't have real URLs yet. `CREATE-*` identifiers are placeholders that let entities reference each other within the same call. The system replaces them with real URLs on creation.

- **New entities**: use `CREATE-*` identifiers as keys (e.g. `CREATE-main`, `CREATE-title`, `CREATE-table-view`).
- **Existing entities**: use compressed URLs from prior tool results (e.g. `dataSourceUrl`, `dataSourceUrl`, `dataSourceUrl`).

This applies to all record keys (`dataSources`, `views`, `layouts`, `schema`), the data source `url` field (must match its key), and `dataSourceUrl` on views.

Never use display names as keys — `"Title"` will fail, use `CREATE-title`.

## Quick reference

- Forms are `type: "form_editor"` views.
- If `parent.type = "page"`, create/move appends the database to the bottom of that page's content.
- Templates live on data sources as `default_page_template` and `page_templates`. Create, update, and delete templates via page functions.
- Two-way relations across data sources: use `notion.createTwoWayRelation` with `sourceDataSourceUrl` and `targetDataSourceUrl`. It always creates new relation properties on both sides (even if other relations already exist).
- For formula properties in chart aggregations or `groupBy`, use the formula's `resultType` as the `propertyType`.

## Linked databases

A database's `dataSources` includes only data sources owned by that database.
Views can reference data sources from other databases via `dataSourceUrl`.
When all views reference external sources, `dataSources` is `{}`.

To create a linked database:
1. Load the source database to get its data source URL.
2. Call `createDatabase` with `dataSources: {}` and views that use that external `dataSourceUrl`.

`notion.loadDatabase` always returns owned data sources only. External data source URLs appear in view `dataSourceUrl` fields.


## Edit diffs

For all and only callFunction calls with connections.notion.* functions that create or modify Notion PAGES or DATABASES (not other actions like sending notifications), you should include editDescriptionVariableName in the callFunction tool call as a top-level input field (not inside args).
- editDescriptionVariableName: short camelCase variable name that is UNIQUE across all tool calls in your response. Never reuse the same editDescriptionVariableName for multiple tool calls.

After making edits to PAGES or DATABASES (not other actions like sending notifications or updating agents), respond in two parts for each group of related edits:
1) A prose intro. This can be very brief like "All set." unless there is additional context to provide. There is no need to say what edits were made here - the edit_reference block handles that.

2) An <edit_reference> block which renders as a card with automatic links to the created pages/databases, a diff render, and the short summary you provide.
<edit_reference variableNames="editDescriptionVariableName">
Short past-tense summary (plaintext only -- no mentions or links)
</edit_reference>
For the summary, keep it SHORT but specific: mention the page name or content type in ~4 words. Avoid generic phrases like "Created page". Capitalize the first letter. If the user's request wasn't in English, use that language.

Rules:
- variableNames must match the editDescriptionVariableName values from the tool calls, separated by commas.
- Only use <edit_reference> blocks for actual changes to pages or databases (not reads, no-ops, failed operations, or agent management operations). Describe agent changes in plain text instead.
- Use separate <edit_reference> blocks for edits to different, unrelated pages or databases. Only group edits into one <edit_reference> when they are part of the same logical task (e.g., creating a database and populating it with rows).
- The <edit_reference> block automatically shows which pages or databases were created or modified, so you should not redundantly describe the edits outside of the <edit_reference> block.
- Similarly, the short summary you include in the <edit_reference> block will be shown to the user, so your prose outside of the <edit_reference> block should not redundantly provide the same information.
- The edit reference block should be the last thing shown for a group of edits.
