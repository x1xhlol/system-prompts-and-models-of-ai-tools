export type SalesforceSearchInput = {
	question: string
	keywords: string
	lookback?: string
}

export type SalesforceSearchResultItem = {
	id: string
	type: "salesforce"
	title: string
	path: string
	text: string
	lastEdited: string
	isPrivate: boolean
	pageId: string
	objectType: string
}

export type SalesforceSearchResult = {
	results: Array<SalesforceSearchResultItem>
}

export type SalesforceSoqlQueryInput = {
	query: string
}

export type SalesforceSoqlQueryResult = {
	results: string[]
	content: string
	query: string
	domain: string
}

export type SalesforceGetSampleInput = {
	targetObject?: string
}

export type SalesforceSampleRecord = {
	Id?: string
	name?: string
	attributes?: Record<string, unknown>
}

export type SalesforceGetSampleResult = {
	objects: Array<string>
	sample?: {
		object: string
		sampleRecords?: Array<SalesforceSampleRecord>
	}
}

export type SalesforceFindUserIdsInput = {
	nameOrEmail: string
}

export type SalesforceFindUserIdsResult = {
	users?: Array<{
		id: string
		name: string
		email: string
	}>
}

export type SalesforceLoadRecordInput = {
	recordId: string
	objectType: string
}

export type SalesforceLoadRecordResult = {
	type: "salesforce-record"
	title: string
	blocks: string[]
	recordId: string
	objectType: string
}

export type SalesforceSearch = (
	args: SalesforceSearchInput,
) => Promise<SalesforceSearchResult>

export type SalesforceSoqlQuery = (
	args: SalesforceSoqlQueryInput,
) => Promise<SalesforceSoqlQueryResult>

export type SalesforceGetSample = (
	args: SalesforceGetSampleInput,
) => Promise<SalesforceGetSampleResult>

export type SalesforceFindUserIds = (
	args: SalesforceFindUserIdsInput,
) => Promise<SalesforceFindUserIdsResult>

export type SalesforceLoadRecord = (
	args: SalesforceLoadRecordInput,
) => Promise<SalesforceLoadRecordResult>

export type Module = {
	search: SalesforceSearch
	soqlQuery: SalesforceSoqlQuery
	getSample: SalesforceGetSample
	findUserIds: SalesforceFindUserIds
	loadRecord: SalesforceLoadRecord
}

export type {
	ModulePermissions,
	ModuleState,
	SalesforceIntegration,
} from "./integration"
