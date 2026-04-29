// Helper types
export type SlackAppMentionUserGroupMetadata = {
	teamId: string
	userGroupId: string
	userGroupName: string
	channelIds: string[]
}

export type SlackFrom =
	| { type: "user"; id: string }
	| { type: "bot"; id: string }
	| { type: "external_app"; id: string }
	| { type: "webhook"; id: string }
	| { type: "system" }
	| { type: "unknown" }
	| { type: "file_comment" }
	| { type: "workflow_builder" }
	| { type: "unknown_message" }
	| { type: "usergroup"; id: string }
	| { type: "integration"; id: string }
	| { type: "internal" }
	| { type: "ai_connector"; id: string }
	| { type: "messages_api"; id: string }
	| { type: "channel" }

export type SlackMessage = {
	id: string
	message: string
	timestamp: string
	threadTimestamp: string
	uri: string
	from: SlackFrom
	to: SlackTo
	reactions?: Record<string, number>
	files?: Array<string>
	fileIds?: Array<string>
	isFromSlackAiConnector?: boolean
	threadId?: string
	parentTimestamp?: string
	messageId: string
}

export type SlackTo =
	| { type: "channel"; name: string; id: string }
	| { type: "direct"; userIds: Array<string> }

export type SlackChannel = {
	id: string
	name: string
	nameNormalized?: string
	created: number
	isChannel?: boolean
	isGeneral?: boolean
	isIm?: boolean
	isPrivate?: boolean
	isMpim?: boolean
	isShared?: boolean
	isOrgShared?: boolean
	botIsMember?: boolean
}

export type SlackUser = {
	id: string
	teamId: string
	name: string
	type: "user" | "bot"
	scopes?: string[]
	userTeamIds?: string[]
	teamIdsForUserTeams?: string[]
}

export type RecordPointer = Record<string, unknown>
export type ExternalScopedConnectionTable = Record<string, unknown>
export type ExternalConnectionTable = Record<string, unknown>
export type ParsedAgentUrl = Record<string, unknown>

// Permissions
export type {
	SlackAction,
	SlackModulePermissionAiConfigurable,
	SlackIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"

export type ModuleConfiguration = {
	name?: string
	connectionPointer?: RecordPointer
	scopes?: Array<string>
	appMentionUserGroup?: SlackAppMentionUserGroupMetadata
	error?:
		| { type: "no_slack_ai_connector" }
		| { type: "grid_ai_connector" }
		| {
				type: "slack_workspace_mismatch"
				workflowsTeamId: string
				workflowsTeamName: string
				aiConnectorTeamId: string
				aiConnectorTeamName: string
		  }
}

export type CreateThreadInChannel = (
	args:
		| {
				attachedFileIds?: Array<string>
				channelName: string
				message: string
		  }
		| {
				attachedFileIds?: Array<string>
				channelId: string
				message: string
		  },
) => Promise<SlackMessage>

export type CreateThreadInDirectMessage = (args: {
	userIds: Array<string>
	message: string
	attachedFileIds?: Array<string>
}) => Promise<SlackMessage>

export type ReplyInThread = (args: {
	prefixedThreadUri: string
	message: string
	attachedFileIds?: Array<string>
}) => Promise<SlackMessage>

export type UpdateMessage = (args: {
	prefixedMessageUri: string
	message: string
}) => Promise<SlackMessage>

export type SlackReactionResult = {
	status: "added" | "already_present" | "removed" | "already_absent"
	reaction: string
	channelName: string
	prefixedMessageUri: string
	message?: string
}

export type AddReactionToMessage = (args: {
	prefixedMessageUri: string
	reaction: string
}) => Promise<SlackReactionResult>

export type RemoveReactionFromMessage = (args: {
	prefixedMessageUri: string
	reaction: string
}) => Promise<SlackReactionResult>

export type GetThreadsInChannelSince = (args: {
	channelName: string
	timestamp: string
}) => Promise<Array<Array<SlackMessage>>>

export type QueryChannels = (args: {
	id?: string
	name?: string
	createdStart?: string
	createdEnd?: string
	isGeneral?: boolean
	isIm?: boolean
	isPrivate?: boolean
	isMpim?: boolean
	isShared?: boolean
	isOrgShared?: boolean
	botIsMember?: boolean
}) => Promise<Array<SlackChannel>>

export type GetUser = (args: { userId: string }) => Promise<SlackUser>

export type FindUserByEmail = (args: {
	email: string
}) => Promise<SlackUser | undefined>

export type ParseSlackUriOrUrl = (args: {
	uriOrUrl: string
}) => Extract<
	ParsedAgentUrl,
	{ type: "slackMessage" | "slackUser" | "slackChannel" }
>

export type ViewFileUrl = (args: { url: string }) => Promise<{
	url: string
	fileUrl?: string
	fileName?: string
}>

export type SlackSearchInput = {
	question: string
	keywords: string
	lookback?: string
	options?: {
		channel?: string
	}
}

export type SlackSearchResult = {
	results: Array<{
		id: string
		lastEdited: string
		channel?: string
		messages: Array<{
			messageId: string
			lastEdited: string
			text: string
			user: string
		}>
	}>
}

export type Search = (args: SlackSearchInput) => Promise<SlackSearchResult>

export type SlackLoadMessageInput = {
	channelId: string
	messageTs: string
	threadTs?: string
}

export type SlackLoadMessageResult = Record<string, unknown>

export type LoadMessage = (
	args: SlackLoadMessageInput,
) => Promise<SlackLoadMessageResult>

export type SlackUserMessagesContextMessage = {
	userId: string
	text: string
	timestamp: string
}

export type SlackUserMessagesResultItem = {
	id: string
	channel?: string
	channelId: string
	text: string
	timestamp: string
	contextMessages?: {
		before?: SlackUserMessagesContextMessage[]
		after?: SlackUserMessagesContextMessage[]
	}
	url?: string
}

export type SlackUserMessagesResult = {
	user: SlackUser
	messages: Array<SlackUserMessagesResultItem>
	totalCount: number
}

export type GetUserMessages = (args: {
	name?: string
	email?: string
	since?: string
}) => Promise<SlackUserMessagesResult>

export type Module = {
	createThreadInChannel: CreateThreadInChannel
	createThreadInDirectMessage: CreateThreadInDirectMessage
	replyInThread: ReplyInThread
	updateMessage: UpdateMessage
	addReactionToMessage: AddReactionToMessage
	removeReactionFromMessage: RemoveReactionFromMessage
	getThreadsInChannelSince: GetThreadsInChannelSince
	queryChannels: QueryChannels
	getUser: GetUser
	findUserByEmail: FindUserByEmail
	parseSlackUriOrUrl: ParseSlackUriOrUrl
	viewFileUrl: ViewFileUrl
	search: Search
	loadMessage: LoadMessage
	getUserMessages: GetUserMessages
}

// Triggers
export type {
	SlackReactionAddedTriggerConfig,
	SlackMessageTriggerConfig,
	SlackThreadCreatedTriggerConfig,
	SlackAppMentionTriggerConfig,
	SlackReactionAddedTriggerVariables,
	SlackMessageTriggerVariables,
	SlackThreadCreatedTriggerVariables,
	SlackAppMentionTriggerVariables,
} from "./triggers"
