export type ModulePermissions = never
export type ModuleState = never

export type FsIntegration = {
	type: "fs"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}