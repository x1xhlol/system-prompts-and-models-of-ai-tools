# Slack module

- Use when you need Slack search, message reads, or message actions.
- When a Slack message includes file URLs (in `files`), call `connections.slack.viewFileUrl({ url })` for each file you need.
  - Use the returned `fileUrl` to embed the uploaded file in Notion (e.g. `!\[image.png\](file://...)`).
  - Do not embed raw Slack file URLs directly.
- Inputs/outputs live in `index.ts`.
- Permissions live in `integration.ts`.
- Trigger payloads live in `triggers.ts`.
