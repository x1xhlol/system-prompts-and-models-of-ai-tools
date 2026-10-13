import type { TestModulePermissionAiConfigurable } from "./types"

export type {
	TestModulePermissionAction,
	TestModulePermission,
	TestModulePermissionAiConfigurable,
} from "./types"

export type ModulePermissions = TestModulePermissionAiConfigurable
export type ModuleState = never

export type TestIntegration = {
	type: "test"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}
