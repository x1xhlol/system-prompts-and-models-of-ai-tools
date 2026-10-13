# Data source SQLite tables (Notion scripting)

Use this doc when you need to query structured data from Notion data sources (databases) using `connections.notion.querySql`, or when you need to update page properties inside a data source using `connections.notion.updatePage`.

## 1) One data source = one SQLite table

- For each Notion data source URL `dataSourceUrl`, there is a corresponding SQLite table named exactly `dataSourceUrl`.
- Always double-quote the table name in SQL:
  - `SELECT * FROM "dataSourceUrl" LIMIT 10`

## 2) System columns (always present)

Every data source table includes:

- `url` (`TEXT`, unique): the page URL for the row (this is the primary identifier you should select).
- `createdTime` (`TEXT`): ISO-8601 datetime string for when the page was created.

## 3) Property columns (how Notion properties map to SQL)

### Column naming

- Column names are derived from the Notion property name (as seen in the data source schema). SQLite identifiers are case-insensitive, but you should still use the exact column names shown in the data source's `<sqlite-table>` definition.
- SQLite identifiers can contain spaces/special characters; always double-quote column names unless they're simple identifiers.
  - Example: `"Task Name"`, `"Status"`, `"Due Date"`
- If a property name conflicts with a system column name (`id`, `url`, `createdTime`), it is prefixed with `userDefined:`:
  - Example: `"userDefined:url"`

### Which properties become columns?

Only a subset of property types are queryable via SQL. Properties not listed below may not appear as columns; use `connections.notion.queryView` (or load/view the page) to access them.

### Property type → SQL type + semantics

The table contains one or more columns per property:

- **Title / Text / URL / Email / Phone**: Column type: `TEXT`. Value: plain string (may be empty or `NULL`).

- **Number**: Column type: `FLOAT`. Value: numeric (or `NULL`).

- **Checkbox**: Column type: `TEXT`. Values: `"__YES__"` = true, `"__NO__"` = false, `NULL` defaults to false.

- **Select**: Column type: `TEXT`. Value: one of the configured option names (or `NULL`).

- **Status**: Column type: `TEXT`. Value: one of the configured status option names (or `NULL`).

- **Multi-select**: Column type: `TEXT`. Value: JSON string encoding `Array<string>` (option names). Use `json_each` to filter/join:
  - `... WHERE EXISTS (SELECT 1 FROM json_each(t."Tags") WHERE value = 'Important')`

- **Person**: Column type: `TEXT`. Value: If limit 1: often a JSON string encoding a single user ID. Otherwise: typically a JSON string encoding `Array<string>` of user IDs. User IDs use the standard Notion user URL format: `"URL"`.

- **Files**: Column type: `TEXT`. Value: JSON string encoding `Array<string>` of file IDs.

- **Relation**: Column type: `TEXT`. Value: JSON string encoding related page URLs. Limit 1: often a JSON string of a single page URL. Otherwise: typically a JSON string encoding `Array<string>` of page URLs. To join, prefer `json_each` over the relation column when it's an array.

- **Created time / Last edited time**: Column type: `TEXT` (required / `NOT NULL`). Value: ISO-8601 datetime string, automatically set.

- **Date**: Expands into 3 columns:
  - `"date:<Property Name>:start"` (`TEXT`): ISO-8601 date/datetime string
  - `"date:<Property Name>:end"` (`TEXT`): ISO-8601 date/datetime string (must be `NULL` for single-date values)
  - `"date:<Property Name>:is_datetime"` (`INTEGER`): `1` for datetime, `0` for date, `NULL` defaults to `0`

- **Auto-increment ID**: Column type: `INTEGER`. Value: number (or `NULL`).

- **Created by / Last edited by**: Column type: `TEXT`. Value: user URL string (read-only, automatically set).

- **Place / Location**: Expands into 5 columns:
  - `"place:<Property Name>:address"` (`TEXT`): address string
  - `"place:<Property Name>:name"` (`TEXT`): optional place name
  - `"place:<Property Name>:latitude"` (`FLOAT`): latitude
  - `"place:<Property Name>:longitude"` (`FLOAT`): longitude
  - `"place:<Property Name>:google_place_id"` (`TEXT`): optional Google Place ID
  - Do not set the base property key directly; use expanded `place:` keys.

## 4) Querying data sources

### SQL queries (`connections.notion.querySql`)

You can query one or more data sources (tables) and join them. Always:

- Include `url` in your `SELECT` when possible.
- Double-quote table names and any column names with spaces/special characters.

Example: basic filter

｀｀｀ts
const result = await connections.notion.querySql({
	dataSourceUrls: \["dataSourceUrl"\],
	query: `
    SELECT url, "Status", "Owner"
    FROM "dataSourceUrl"
    WHERE "Status" = ?
  `,
	params: \["In progress"\],
})
｀｀｀

Example: join via relation column (relation stores JSON array of URLs)

｀｀｀ts
const result = await connections.notion.querySql({
	dataSourceUrls: \["okrs", "teams"\],
	query: `
    SELECT o.url, o."Objective", t."Team Name"
    FROM "okrs" o
    JOIN "teams" t
      ON t.url IN (SELECT value FROM json_each(o."Team"))
  `,
})
｀｀｀

### View queries (`connections.notion.queryView`)

Use this when you want "whatever the view shows" and don't need custom SQL.

｀｀｀ts
const result = await connections.notion.queryView({ viewUrl: "dataSourceUrl" })
｀｀｀

## 5) Updating page properties in a data source

To update a page's properties, use `connections.notion.updatePage` with a `propertyUpdates` object.

Rules:

- Use property names that match the data source schema.
- To clear a value, set it to `null`.
- Do not try to set read-only fields like `url` / `createdTime` or computed properties.

Examples:

｀｀｀ts
await connections.notion.updatePage({
	url: "dataSourceUrl",
	propertyUpdates: {
		Title: "New title",
		Status: "In progress",
		"Is due": true,
		Points: 5,
		Tags: \["Important", "Customer"\],
	},
})
｀｀｀

｀｀｀ts
await connections.notion.updatePage({
	url: "okrs",
	propertyUpdates: {
		"date:Due Date:start": "2025-01-15",
		"date:Due Date:end": null,
		"date:Due Date:is_datetime": 0,
	},
})
｀｀｀
