import type { TestGetStateInput, TestGetStateOutput } from "./types"

export type ModuleConfiguration = {
	label: string
	count: number
	active: boolean
}

// Connection interface
export type GetState = (args: TestGetStateInput) => Promise<TestGetStateOutput>

export type Module = {
	getState: GetState
}

// Helper types
export type {
	TestPersistedState,
	TestModulePermissionAction,
	TestModulePermission,
	TestModulePermissionAiConfigurable,
	TestPersistedData,
	TestModuleConfiguration,
	TestGetStateInput,
	TestGetStateOutput,
} from "./types"

// Permissions
export type {
	ModulePermissions,
	ModuleState,
	TestIntegration,
	TestModulePermissionAiConfigurable as TestModulePermissionAiConfigurableForAgentIntegration,
} from "./integration"
