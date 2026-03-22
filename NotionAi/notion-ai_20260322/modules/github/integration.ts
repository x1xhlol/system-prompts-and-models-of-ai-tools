export type ModulePermission = {
	/**
	 * User URL to run Github searches as (URL).
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

export type GithubIntegration = {
	type: "github"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}