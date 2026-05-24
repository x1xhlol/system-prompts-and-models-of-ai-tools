export type ModulePermission = {
	/**
	 * User URL to run Asana searches as (URL).
	 * Required for custom agents; omit for personal agent modules.
	 */
	identifier: string
	/**
	 * Must be ["search"].
	 */
	actions: ["search"]
}

export type ModulePermissions = ModulePermission
export type ModuleState = never

export type AsanaIntegration = {
	type: "asana"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}