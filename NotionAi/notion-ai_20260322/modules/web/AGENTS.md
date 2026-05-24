# Web module

- Use when you need public web search or to fetch a page's text.
- Inputs/outputs live in `index.ts`.
- Permissions live in `integration.ts`.
- Trigger payloads live in `triggers.ts`.

## Common usage

- Web search requires a `queries` array (even for a single query).

｀｀｀ts
await connections.web.search({
  queries: ["Notion AI"]
})
｀｀｀

## Loading pages

When loading a web page with `loadPage`, always try with the default fast mode first.
Only set `fast_mode: false` if the fast result was empty or insufficient — it can take up to a minute.
The returned `text` may be truncated and includes line counts. Use `line_start` to load the next portion by line number.
