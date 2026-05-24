export type WebModulePermissionAiConfigurable = never

export type ModulePermissions = WebModulePermissionAiConfigurable
export type ModuleState = never

export type WebIntegration = {
	type: "web"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}
