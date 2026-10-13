/*
These types are used in `connections.notion.updateAgent({ edits: [...] })` under:
- `path: ["integrations", <integrationUrl>, "permissions"]`

Please read this file before trying to set permissions for a Notion integration.
*/

/* LLM-friendly names for Notion access levels. */
export type NotionAiConfigurableAction =
	| "full_access" // Full access to edit content, structure, and permissions.
	| "edit" // Can edit content.
	| "comment" // Can comment.
	| "view" // Read-only.

export type NotionSearchPermissionAction = "allow" | "disallow"

export type NotionModulePermissionAiConfigurable =
	| {
		/*
		Identifier for Notion content access.

		The agent will see Notion identifiers in compressed form in its inputs/outputs, like:
		- "toolu_01AQZKcrNNLpZ45EjYACboAz"
		- "456"

		Accepted identifier forms:
		- A single compressed page/database identifier: "toolu_01AQZKcrNNLpZ45EjYACboAz" or "456"
		- An array of compressed identifiers: ["toolu_01AQZKcrNNLpZ45EjYACboAz", "999"]
		- "*" for workspace-wide access (must be the only identifier; cannot be combined in an array)

		Examples:
		- { identifier: "toolu_01AQZKcrNNLpZ45EjYACboAz", actions: ["view"] }
		- { identifier: "456", actions: ["full_access"] }
		- { identifier: "456", actions: ["edit"] }
		- { identifier: ["toolu_01AQZKcrNNLpZ45EjYACboAz", "999"], actions: ["comment"] }
		- { identifier: "*", actions: ["view"] }
		*/
		identifier: string | string[]
		actions: NotionAiConfigurableAction[]
	  }
	| {
		identifier: { type: "agent"; url: string }
		actions: Array<"interact" | "disallow">
	  }
	| {
		identifier: "webSearch"
		actions: NotionSearchPermissionAction[]
	  }
	| {
		identifier: "helpdocsSearch"
		actions: NotionSearchPermissionAction[]
	  }

/*
Examples (Notion content):
- { identifier: "toolu_01AQZKcrNNLpZ45EjYACboAz", actions: ["view"] }
- { identifier: "456", actions: ["full_access"] }
- { identifier: "456", actions: ["edit", "comment"] }
- { identifier: ["toolu_01AQZKcrNNLpZ45EjYACboAz", "999"], actions: ["comment"] }
- { identifier: "*", actions: ["view"] }
- { identifier: { type: "agent", url: "toolu_01AQZKcrNNLpZ45EjYACboAz" }, actions: ["interact"] }
- { identifier: { type: "agent", url: "toolu_01AQZKcrNNLpZ45EjYACboAz" }, actions: ["disallow"] }

Examples (search permissions):
- { identifier: "webSearch", actions: ["allow"] }
- { identifier: "webSearch", actions: ["disallow"] }
- { identifier: "helpdocsSearch", actions: ["allow"] }
- { identifier: "helpdocsSearch", actions: ["disallow"] }
*/

export type ModulePermissions = NotionModulePermissionAiConfigurable

export type NotionIntegration = {
	type: "notion"
	name: string
	permissions?: Array<ModulePermissions>
}
