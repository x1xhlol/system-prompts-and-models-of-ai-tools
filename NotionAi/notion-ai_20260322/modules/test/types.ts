export type TestPersistedState = {
	label: string
	count: number
	active: boolean
}

export type TestModulePermissionAction = "read" | "write"

export type TestModulePermission = {
	type: "test"
	moduleType: "test"
	identifier: string
	actions: Array<TestModulePermissionAction>
}

export type TestModulePermissionAiConfigurable = Omit<
	TestModulePermission,
	"type" | "moduleType"
>

export type TestPersistedData = {
	state: TestPersistedState
	permissions: Array<TestModulePermission>
}

export type TestModuleConfiguration = {
	state: TestPersistedState
	permissions: Array<TestModulePermission>
}

export type TestGetStateInput = {}

export type TestGetStateOutput = {
	state: TestPersistedState
	permissions: Array<TestModulePermission>
}
