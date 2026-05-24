# FS module

Read-only access to the script sandbox virtual filesystem. Defined in `index.ts`.

**Paths under `modules/`:** Directory names are **module types** (e.g. `notion`, `slack`, `mcpServer`), not connection names. For MCP servers, use `modules/mcpServer/` for all of them (e.g. `modules/mcpServer/index.ts`, `modules/mcpServer/AGENTS.md`); connection names like `mcpServer_ramp` are only for calling `connections.mcpServer_ramp.runTool`, not for paths.

### Browse directories

`readDir({ dir })` returns a flat list of entries in the target folder.

｀｀｀ts
const { entries } = connections.fs.readDir({ dir: "modules/notion" })
// entries => ["index.ts", "agents", "databases"]
｀｀｀

### Read files

`readFiles({ files })` returns the raw content of each file (including the file `path`).

｀｀｀ts
const { files } = connections.fs.readFiles({
	files: ["modules/notion/index.ts"],
})
// files => [{ path: "modules/notion/index.ts", content: "..." }]
｀｀｀