export type AsanaSearchInput = {
	question: string
	keywords: string
	lookback?: string
}

export type AsanaSearchResultItem = {
	id: string
	type: "asana"
	title: string
	path: string
	text: string
	lastEdited: string
	isPrivate: boolean
	pageId: string
	entity: string
	taskId: string
	project: string
	assignee: string
	workspace: string
	team: string
	url: string
	href: string
}

export type AsanaSearchResult = {
	results: Array<AsanaSearchResultItem>
}

export type AsanaLoadTaskInput =
	| {
			taskId: string
			taskGid?: never
	  }
	| {
			taskId?: never
			taskGid: string
	  }

export type AsanaLoadTaskResult = Record<string, unknown>
/*
Search Asana tasks and projects via the connected Asana search connector.
*/
export type AsanaSearch = (args: AsanaSearchInput) => Promise<AsanaSearchResult>

/*
Load an Asana task by ID.
*/
export type AsanaLoadTask = (
	args: AsanaLoadTaskInput,
) => Promise<AsanaLoadTaskResult>

export type Module = {
	search: AsanaSearch
	loadTask: AsanaLoadTask
}

export type {
	AsanaIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"