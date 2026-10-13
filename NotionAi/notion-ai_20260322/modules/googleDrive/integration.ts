export type ModulePermission = {
	identifier: string
	actions: ["search"]
}

export type ModulePermissions = ModulePermission
export type ModuleState = never

export type GoogleDriveIntegration = {
	type: "googleDrive"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}