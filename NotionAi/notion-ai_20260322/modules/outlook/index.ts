export type OutlookSearchInput = {
	query: string
}

export type OutlookSearchResultItem = {
	id: string
	type: "outlook"
	title: string
	path: string
	text: string
	lastEdited: string
	isPrivate: boolean
	pageId: string
	emailAddress: string
}

export type OutlookSearchResult = {
	results: Array<OutlookSearchResultItem>
}

export type OutlookLoadMessageInput = {
	messageId: string
}

export type OutlookLoadMessageResult = Record<string, unknown>

export type OutlookLoadThreadInput = {
	threadId: string
	maxResults?: number
}

export type OutlookQueryInput = {
	q?: string
	maxResults?: number
}

export type OutlookQueryMessage = {
	user: { name: string }
	text: string
	subject?: string
	timestamp: number
}

export type OutlookQueryResultItem = {
	type: "outlook"
	threadId: string
	subject: string
	messages: Array<OutlookQueryMessage>
	timestamp: number
}

export type OutlookQueryResult = {
	messages: Array<OutlookQueryResultItem>
}

export type OutlookSearch = (
	args: OutlookSearchInput,
) => Promise<OutlookSearchResult>

export type OutlookLoadMessage = (
	args: OutlookLoadMessageInput,
) => Promise<OutlookLoadMessageResult>

export type OutlookLoadThread = (
	args: OutlookLoadThreadInput,
) => Promise<OutlookQueryResultItem>

export type OutlookQuery = (
	args: OutlookQueryInput,
) => Promise<OutlookQueryResult>

export type Module = {
	search: OutlookSearch
	loadMessage: OutlookLoadMessage
	loadThread: OutlookLoadThread
	query: OutlookQuery
}

export type {
	ModulePermissions,
	ModuleState,
	OutlookIntegration,
} from "./integration"
