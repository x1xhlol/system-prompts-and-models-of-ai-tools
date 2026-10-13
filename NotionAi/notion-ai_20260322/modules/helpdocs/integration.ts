export type ModulePermissions = never
export type ModuleState = never

export type HelpdocsIntegration = {
	type: "helpdocs"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}