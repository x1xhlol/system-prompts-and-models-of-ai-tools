export type SearchInput = {
	question: string
	keywords?: string
}

export type SearchResultItem = {
	id: string
	title: string
	path: string
	text: string
	lastEdited: string
	pageId: string
}

export type SearchResult = {
	results: Array<SearchResultItem>
}

/*
Search Notion Help Center.
*/
export type Search = (args: SearchInput) => Promise<SearchResult>

export type Module = {
	search: Search
}

// Permissions
export type {
	HelpdocsIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"