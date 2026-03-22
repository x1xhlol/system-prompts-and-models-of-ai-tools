export type JiraSearchInput = {
	question: string
	keywords: string
	lookback?: string
}

export type JiraSearchResultItem = {
	id: string
	type: "jira"
	title: string
	path: string
	text: string
	lastEdited: string
	isPrivate: boolean
	pageId: string
}

export type JiraSearchResult = {
	results: Array<JiraSearchResultItem>
}

export type JiraLoadIssueInput =
	| {
			issueKey: string
			issueId?: never
	  }
	| {
			issueKey?: never
			issueId: string
	  }

export type JiraLoadIssueResult = Record<string, unknown>
/*
Search Jira tickets via the connected Jira search connector.
*/
export type JiraSearch = (args: JiraSearchInput) => Promise<JiraSearchResult>

/*
Load a Jira issue by key or ID.
*/
export type JiraLoadIssue = (
	args: JiraLoadIssueInput,
) => Promise<JiraLoadIssueResult>

export type Module = {
	search: JiraSearch
	loadIssue: LinearLoadIssue
}

export type {
	JiraIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"