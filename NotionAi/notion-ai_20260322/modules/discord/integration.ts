export type DiscordIntegration = {
	type: "discord"
	name: string
	enabled: boolean
}

export type ModulePermissions = {
	search: boolean
}

export type ModuleState = {
	integration: DiscordIntegration
	permissions: ModulePermissions
}