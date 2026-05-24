# Pages

Pages are single Notion pages.

- A page has a parent, as denoted by its parent union:
  - `{ type: "user", url: string }`, if the page is a top-level private page.
  - `{ type: "page", url: string }`, if the page is inside another page.
  - `{ type: "dataSource", url: string }`, if the page is inside a data source.
  - `{ type: "teamspace", url: string }`, if the page is inside a teamspace.
  - `{ type: "agent", url: string }`, if the page belongs to a custom agent (for example, an instructions page).
- A Page has content: the page's body.
- A Page has properties.

## Moving pages

- To move a page under a new parent, use `connections.notion.updatePage` with `parent` (page, data source, or teamspace).
- Agent parents can appear in `loadPage` results, but pages cannot be created under or moved under an agent with page tools.
- Do not add a sub-page link/alias when the user asks to "move" a page; update the parent instead.

## Template pages

- Templates are just pages that belong to a database.
- Use `createPage` with `asTemplate: true` to add a template to a data source.
- Use `deletePages` on the template page URL to remove a template.
- Template properties must use the owning data source's schema keys (case-sensitive).

## Properties

- If a page is NOT parented by a data source:
  - There is a single "title" property key, which is the page's title.

- If a page is parented by a data source:
  - The page's properties are defined by the data source's schema.
  - The keys in the "properties" map correspond to the column names of the data source's SQLite table.
  - There will still be a "title" property key, but it may be named (and keyed) something different!
  - Property keys are case-sensitive. Always use the exact key from `loadDatabase` or `loadDataSource`.
- To clear a property value, set it to `null`.
- When updating an existing page, pass values under `propertyUpdates` in `connections.notion.updatePage` (not `properties`). The `properties` key is only for `createPage`.

### Property value formats

(See full documentation in the file for all property types including Title, Text, URL, Email, Phone, Number, Checkbox, Select, Status, Multi-select, Person, Files, Relation, Date, Auto-increment ID, Created time, Last edited time, Created by, Last edited by, Place/Location)

### Property naming

- Property names match the data source schema exactly.
- Property names can contain spaces and special characters.
- If a property name conflicts with a system column name (`id`, `url`, `createdTime`), it is prefixed with `userDefined:`.
- Date properties use special column naming (`"date:<Property Name>:start"`, etc.).

## Tips for new pages

- You must specify a parent URL when creating a page.
- When creating a page in a data source, you can optionally duplicate a template by passing its URL as `pageTemplate`.
- If the data source has a default template, use it for new pages unless the user explicitly asks for a different template or no template.
- To create a new database template instead of a page, pass `asTemplate: true` (parent must be a data source).
- If the parent is unclear, then make a top-level private page by passing the user's URL as the parent URL.
- Set a title and an icon for new pages, unless instructed otherwise.
- Use `deletePages` to move pages to trash when cleaning up content.

## Avoid redundant page loads

- If you are updating the same page multiple times, do NOT call `connections.notion.loadPage` on this page again unless you are notified that the page is out of date.

## File routing

- Read `index.ts` for functions and types.
- Also read `page-content-spec.md` if you will be creating a page or editing a page's content.

## Edit diffs

(Same edit diff rules as databases/AGENTS.md — include editDescriptionVariableName, use <edit_reference> blocks for actual changes.)
