# Box module

- Search Box files via `search`.
- Load a Box file by ID via `loadFile`. Use the `fileId` from search results.
- Resolve a Box shared link to a file ID via `findSharedItem`. Use when the user provides a link like `https://app.box.com/s/...`.
- Inputs/outputs live in `index.ts`.
- Permissions live in `integration.ts`.
- No triggers.