export type MicrosoftTeamsSearchInput = {
	question: string
	keywords: string
	lookback?: string
	channel?: string
}

export type MicrosoftTeamsSearchMessage = {
	threadId: string
	messageId: string
	text: string
	user: string
	lastEdited: string
}

export type MicrosoftTeamsSearchResultItem = {
	id: string
	type: "microsoft-teams"
	title: string
	path: string
	text: string
	lastEdited: string
	isPrivate: boolean | undefined
	pageId: string
	channel: string | undefined
	messages: Array<MicrosoftTeamsSearchMessage>
}

export type MicrosoftTeamsSearchResult = {
	results: Array<MicrosoftTeamsSearchResultItem>
}

export type MicrosoftTeamsViewChannelInput =
	| {
			channelId: string
			channelName?: never
	  }
	| {
			channelId?: never
			channelName: string
	  }

export type MicrosoftTeamsLoadMessageInput = {
	channelId: string
	messageId: string
}

export type MicrosoftTeamsViewChatInput = {
	chatId: string
}

export type MicrosoftTeamsGetUserMessagesInput = (
	| { name: string; email?: string }
	| { email: string; name?: string }
) & {
	since?: string
}

export type MicrosoftTeamsUserMessagesUser = {
	id: string
	displayName?: string
	email?: string
	userPrincipalName?: string
	jobTitle?: string
}

export type MicrosoftTeamsUserMessagesResultItem = {
	id: string
	conversationType: "channel" | "chat"
	conversationId: string
	conversation?: string
	text: string
	timestamp: string
	url?: string
}

export type MicrosoftTeamsGetUserMessagesResult = {
	user: MicrosoftTeamsUserMessagesUser
	messages: Array<MicrosoftTeamsUserMessagesResultItem>
	totalCount: number
	alternativeUsers?: Array<{
		displayName?: string
		email?: string
	}>
}

export type MicrosoftTeamsViewChannelResult = Record<string, unknown>
export type MicrosoftTeamsLoadMessageResult = Record<string, unknown>
export type MicrosoftTeamsViewChatResult = Record<string, unknown>

export type MicrosoftTeamsSearch = (
	args: MicrosoftTeamsSearchInput,
) => Promise<MicrosoftTeamsSearchResult>

export type MicrosoftTeamsViewChannel = (
	args: MicrosoftTeamsViewChannelInput,
) => Promise<MicrosoftTeamsViewChannelResult>

export type MicrosoftTeamsLoadMessage = (
	args: MicrosoftTeamsLoadMessageInput,
) => Promise<MicrosoftTeamsLoadMessageResult>

export type MicrosoftTeamsViewChat = (
	args: MicrosoftTeamsViewChatInput,
) => Promise<MicrosoftTeamsViewChatResult>

export type MicrosoftTeamsGetUserMessages = (
	args: MicrosoftTeamsGetUserMessagesInput,
) => Promise<MicrosoftTeamsGetUserMessagesResult>

export type Module = {
	search: MicrosoftTeamsSearch
	viewChannel: MicrosoftTeamsViewChannel
	loadMessage: MicrosoftTeamsLoadMessage
	viewChat: MicrosoftTeamsViewChat
	getUserMessages: MicrosoftTeamsGetUserMessages
}

export type {
	MicrosoftTeamsIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"
