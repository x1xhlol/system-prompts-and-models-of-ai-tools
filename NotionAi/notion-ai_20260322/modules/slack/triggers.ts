import type { SlackFrom, SlackMessage } from "./index"

export type TriggeringNotionUser = {
	id: string
	name?: string
	email?: string
}
export type SlackMessageFilterOperator = "any" | "all"

export type SlackMessageTriggerFiltersConfig = {
	operator: SlackMessageFilterOperator
	filters: Array<{
		type: "message.text.contains"
		operator: SlackMessageFilterOperator
		values: string[]
	}>
}

export type SlackReactionAddedTriggerConfig = {
	type: "slack.reaction.added"
	channelIds?: Array<string>
	channelIdentifiersToConvertToChannelIds?: Array<string>
	allChannels?: boolean
	reactions?: string[]
	shouldSubscribeToThread?: boolean
	allowMultipleReactions?: boolean
	from?: SlackFrom
}

export type SlackMessageTriggerConfig = {
	type: "slack.message"
	channelIds?: Array<string>
	channelIdentifiersToConvertToChannelIds?: Array<string>
	filters?: SlackMessageTriggerFiltersConfig
}

export type SlackThreadCreatedTriggerConfig = {
	type: "slack.thread.created"
	channelIds?: Array<string>
	channelIdentifiersToConvertToChannelIds?: Array<string>
	filters?: SlackMessageTriggerFiltersConfig
}

export type SlackAppMentionTriggerConfig = {
	type: "slack.app.mention"
	channelIds?: Array<string>
	channelIdentifiersToConvertToChannelIds?: Array<string>
	allChannels?: boolean
	shouldSubscribeToThread?: boolean
}

export type SlackReactionAddedTriggerVariables = {
	message: SlackMessage
	thread: Array<SlackMessage>
	reactor?: SlackFrom
	isFollowUpMessage?: boolean
	triggeringNotionUser?: TriggeringNotionUser
}

export type SlackMessageTriggerVariables = {
	message: SlackMessage
	thread: Array<SlackMessage>
	triggeringNotionUser?: TriggeringNotionUser
}

export type SlackThreadCreatedTriggerVariables = {
	thread: Array<SlackMessage>
	triggeringNotionUser?: TriggeringNotionUser
}

export type SlackAppMentionTriggerVariables = {
	message: SlackMessage
	thread: Array<SlackMessage>
	triggeringNotionUser?: TriggeringNotionUser
}

export type SlackReactionAddedTrigger = SlackReactionAddedTriggerVariables
export type SlackMessageTrigger = SlackMessageTriggerVariables
export type SlackThreadCreatedTrigger = SlackThreadCreatedTriggerVariables
export type SlackAppMentionTrigger = SlackAppMentionTriggerVariables

export type TriggerConfig =
	| SlackReactionAddedTriggerConfig
	| SlackMessageTriggerConfig
	| SlackThreadCreatedTriggerConfig
	| SlackAppMentionTriggerConfig

export type TriggerVariables =
	| SlackReactionAddedTriggerVariables
	| SlackMessageTriggerVariables
	| SlackThreadCreatedTriggerVariables
	| SlackAppMentionTriggerVariables

export type Trigger =
	| SlackReactionAddedTrigger
	| SlackMessageTrigger
	| SlackThreadCreatedTrigger
	| SlackAppMentionTrigger
