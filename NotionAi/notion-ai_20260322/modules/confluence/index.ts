export type ConfluenceSearchInput = {
	question: string
	keywords: string
	lookback?: string
}

export type ConfluenceSearchResultItem = {
	id: string
	type: "confluence"
	title: string
	path: string
	text: string
	lastEdited: string
	isPrivate: boolean
	pageId: string
}

export type ConfluenceSearchResult = {
	results: Array<ConfluenceSearchResultItem>
}

export type ConfluenceCqlQueryInput = {
	query: string
	maxResults?: number
}

export type ConfluenceCqlQueryResultItem = {
	id: string
	title: string
	blocks: string[]
}

export type ConfluenceCqlQueryResult = {
	results: Array<ConfluenceCqlQueryResultItem>
	query: string
	baseUrl: string
}

export type ConfluenceLoadPageInput = {
	pageId: string
}

export type ConfluenceLoadPageResult = {
	type: "confluence-page"
	title: string
	blocks: string[]
	pageId: string
}

/*
Search Confluence pages via the connected Confluence search connector.
*/
export type ConfluenceSearch = (args: ConfluenceSearchInput) => Promise<ConfluenceSearchResult>

/*
Run a read-only CQL (Confluence Query Language) query.
*/
export type ConfluenceCqlQuery = (args: ConfluenceCqlQueryInput) => Promise<ConfluenceCqlQueryResult>

/*
Load a Confluence page by its page ID.
*/
export type ConfluenceLoadPage = (args: ConfluenceLoadPageInput) => Promise<ConfluenceLoadPageResult>

export type Module = {
	search: ConfluenceSearch
	cqlQuery: ConfluenceCqlQuery
	loadPage: ConfluenceLoadPage
}

export type {
	ConfluenceIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"
