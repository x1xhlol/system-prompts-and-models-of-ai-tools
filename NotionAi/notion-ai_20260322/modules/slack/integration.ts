export type SlackAction = "write" | "read" | "react" | "replyInThread"

export type SlackModulePermissionAiConfigurable = {
	identifier: string | string[]
	actions?: SlackAction[]
}

export type ModulePermissions = SlackModulePermissionAiConfigurable
export type ModuleState = never

export type SlackIntegration = {
	type: "slack"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}
