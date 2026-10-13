export type ModulePermission = {
	identifier: string
	actions: ["search"]
}

export type ModulePermissions = ModulePermission
export type ModuleState = never

export type JiraIntegration = {
	type: "jira"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}