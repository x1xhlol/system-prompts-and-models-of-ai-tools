export type ModulePermission = {
	identifier: string
	actions: ["search"]
}

export type ModulePermissions = ModulePermission
export type ModuleState = never

export type GoogleCalendarIntegration = {
	type: "googleCalendar"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}