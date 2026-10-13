export type ExactFilterValue = {
	type: "exact"
	value: string | number | boolean | Record<string, unknown> | undefined
} & Record<string, unknown>

export type RelativeFilterValue = {
	type: "relative"
	value: string | Record<string, unknown>
} & Record<string, unknown>

export type FilterValue =
	| ExactFilterValue
	| RelativeFilterValue
	| Array<ExactFilterValue | RelativeFilterValue>

export type Filter = {
	operator: string
	value: FilterValue
}

export type PropertyFilter = {
	property: string
	filter: Filter
}

export type CombinatorFilter = {
	operator: "or" | "and"
	filters?: Array<PropertyFilter | CombinatorFilter>
}

export type QuerySql = (args: {
	dataSourceUrls: Array<string>
	query: string
	params?: Array<unknown>
}) => Promise<QueryResult>

export type QueryView = (args: { viewUrl: string }) => Promise<QueryResult>

export type QueryMeetings = (args: {
	filter?: CombinatorFilter | PropertyFilter
}) => Promise<QueryResult>

export type QueryResultRowValue =
	| string
	| number
	| boolean
	| Array<string>
	| null

export type QueryResultRow = Record<string, QueryResultRowValue>

export type QueryResult = {
	rows: Array<QueryResultRow>
	hasMore: boolean
}
