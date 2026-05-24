export type ModulePermission = {
	identifier: string
	actions: ["search"]
}

export type ModulePermissions = ModulePermission
export type ModuleState = never

export type SharepointIntegration = {
	type: "sharepoint"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}