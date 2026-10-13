export type SearchModulePermissionAiConfigurable = never

export type ModulePermissions = SearchModulePermissionAiConfigurable
export type ModuleState = never

export type SearchIntegration = {
	type: "search"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}
