export type LinearSearchInput = {
	question: string
	keywords: string
	lookback?: string
}

export type LinearSearchResultItem = {
	id: string
	type: "linear"
	title: string
	path: string
	text: string
	lastEdited: string
	isPrivate: boolean
	pageId: string
	name: string
}

export type LinearSearchResult = {
	results: Array<LinearSearchResultItem>
}

export type LinearLoadIssueInput =
	| {
			issueId: string
			issueNumber?: never
			teamId?: never
	  }
	| {
			issueId?: never
			issueNumber: string
			teamId: string
	  }

export type LinearLoadIssueResult = Record<string, unknown>
/*
Search Linear issues via the connected Linear search connector.
*/
export type LinearSearch = (
	args: LinearSearchInput,
) => Promise<LinearSearchResult>

/*
Load a Linear issue by key or team/number.
*/
export type LinearLoadIssue = (
	args: LinearLoadIssueInput,
) => Promise<LinearLoadIssueResult>

export type Module = {
	search: LinearSearch
	loadIssue: LinearLoadIssue
}

export type {
	LinearIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"