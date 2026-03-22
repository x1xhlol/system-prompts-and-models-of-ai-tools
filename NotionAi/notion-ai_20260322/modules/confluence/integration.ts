export type ConfluenceIntegration = {
	type: "confluence"
	name: string
	enabled: boolean
}

export type ModulePermissions = {
	search: boolean
	cqlQuery: boolean
	loadPage: boolean
}

export type ModuleState = {
	integration: ConfluenceIntegration
	permissions: ModulePermissions
}