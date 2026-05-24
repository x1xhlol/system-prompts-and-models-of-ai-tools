export type GmailSearchInput = {
	query: string
}

export type GmailSearchResultItem = {
	id: string
	type: "gmail"
	title: string
	path: string
	text: string
	lastEdited: string
	isPrivate: boolean
	pageId: string
	emailAddress: string
}

export type GmailSearchResult = {
	results: Array<GmailSearchResultItem>
}

export type GmailLoadThreadInput =
	| {
			threadId: string
			url?: never
	  }
	| {
			threadId?: never
			url: string
	  }

export type GmailLoadThreadResult = Record<string, unknown>

export type GmailQueryInput = {
	q?: string
	maxResults?: number
}

export type GmailQueryMessage = {
	user: { name: string }
	text: string
	subject?: string
	timestamp: number
}

export type GmailQueryThread = {
	type: "gmail"
	threadId: string
	subject: string
	messages: Array<GmailQueryMessage>
	timestamp: number
}

export type GmailQueryResult = {
	threads: Array<GmailQueryThread>
}
/*
Search Gmail messages via the connected Gmail search connector.
*/
export type GmailSearch = (args: GmailSearchInput) => Promise<GmailSearchResult>

/*
Load a Gmail thread by URL or thread ID.
*/
export type GmailLoadThread = (
	args: GmailLoadThreadInput,
) => Promise<GmailLoadThreadResult>

/*
Query Gmail messages using Gmail search query syntax.
*/
export type GmailQuery = (args: GmailQueryInput) => Promise<GmailQueryResult>

export type Module = {
	search: GmailSearch
	loadThread: GmailLoadThread
	query: GmailQuery
}

export type {
	GmailIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"
