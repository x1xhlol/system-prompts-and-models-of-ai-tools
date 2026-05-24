// Recurrence types
export type RecurrenceTriggerBase = {
	type: "recurrence"
	interval: number
	timezone: string
	hour?: number
	minute?: number
}

export type RecurrenceTriggerFrequencyConfig =
	| { frequency: "hour" }
	| { frequency: "day" }
	| {
			frequency: "week"
			weekdays?: Array<"MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU">
	  }
	| {
			frequency: "month"
			monthly_restriction?:
				| { type: "monthdays"; monthdays: Array<number> }
				| { type: "weekdays_in_month"; weekdays: Array<"MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU">; week_numbers: Array<number> }
	  }
	| { frequency: "year" }

// Discussion/comment types
export type CommentFrom =
	| { type: "user"; id: string }
	| { type: "bot" }
	| { type: "agent" }

export const commentFileTypes = [] as const
export type CommentFileType = (typeof commentFileTypes)[number]

export type NotionComment = {
	id: string
	from: CommentFrom
	text: string
	url: string
	timestamp: string
	typesToFile?: Partial<Record<CommentFileType, Array<string>>>
	fileIds?: Array<string>
}

export type NotionReaction = {
	id: string
	from: Array<CommentFrom>
	emoji: string
}

export type DiscussionContext = "inline" | "block" | "page" | "databaseProperty"

export type NotionDiscussion = {
	id: string
	pageId: string
	comments: Array<NotionComment>
	reactions?: Array<NotionReaction>
	resolved: boolean
	parentBlockId?: string
	context?: DiscussionContext
	originalTextContext?: string
	type?: "comment" | "reaction"
	propertyId?: string
	propertyName?: string
}

// Database/page edit helpers
export type DatabasePageEdit = {
	before?: Record<string, unknown> | null
	after?: Record<string, unknown>
	afterContent?: string
	contentChanged?: boolean
	timestamp: number
	editedBy?: ActorPointer | string
}

export type PagePropertiesEditedSome = { filter: PropertyChangedFilter; property: string }
export type PagePropertiesEditedAll = { filter: PropertyChangedFilter; property: string }

export type PropertyChangedFilter =
	| { type: "string_is" | "string_is_not"; value: string }
	| { type: "date_is" | "date_is_before" | "date_is_after" | "date_is_on_or_before" | "date_is_on_or_after"; value: string }
	| { type: "boolean_is"; value: boolean }
	| { type: "number_is" | "number_is_not" | "number_greater_than" | "number_less_than"; value: number }
	| { type: "multi_select_contains" | "multi_select_does_not_contain"; values: Array<string> }
	| { type: "select_is" | "select_is_not"; value: string }
	| { type: "relation_contains"; relatedDatabaseId: string; relatedPageId: string }
	| { type: "relation_contains_page"; relatedPageId: string }
	| { type: "relation_contains_any_page"; relatedPageIds: Array<string> }
	| { type: "rollup_is_empty" | "rollup_is_not_empty"; rollupProperty: string }

export type AutomationEventConfiguration = {
	views?: {
		all?: Array<{ viewId: string; filters?: Array<PropertyChangedFilter | AutomationViewFilter> }>
		active?: { viewId: string; filters?: Array<PropertyChangedFilter | AutomationViewFilter> }
		selected?: { viewId: string; filters?: Array<PropertyChangedFilter | AutomationViewFilter> }
	} & { filters?: { operator: "or"; filters: Array<PropertyChangedFilter | AutomationViewFilter> } }
	pagesAdded: boolean
	pagePropertiesEdited:
		| { type: "none" }
		| { type: "any" }
		| { type: "some"; some?: Array<PagePropertiesEditedSome> }
		| { type: "all"; all?: Array<PagePropertiesEditedAll> }
}

export type AutomationViewFilter = {
	type: "group"
	operator: "and" | "or"
	filters: Array<PropertyChangedFilter | AutomationViewFilter>
}

export type ActorPointer = { id?: string; table?: string; spaceId?: string; [key: string]: unknown }
export type RecordId = { type?: "record"; id?: string }

// Trigger configs
export type RecurrenceTriggerConfig = RecurrenceTriggerBase & RecurrenceTriggerFrequencyConfig

export type PageDiscussionCommentAddedTriggerConfig = { type: "notion.page.discussion.comment.added"; url: string }
export type DatabasePageCreatedTriggerConfig = { type: "notion.page.created"; url: string; debounceTimeoutSeconds?: number }
export type DatabasePageUpdatedTriggerConfig = {
	type: "notion.page.updated"
	url: string
	properties?: string[]
	shouldIgnorePageContentUpdates?: boolean
	debounceTimeoutSeconds?: number
	propertyFilters?: AutomationEventConfiguration["pagePropertiesEdited"]
}
export type DatabasePageDeletedTriggerConfig = { type: "notion.page.deleted"; url: string }
export type DatabaseAgentUpdatedTriggerConfig = { type: "notion.database.agent.updated"; collectionId?: string }
export type NotionButtonPressedAgentTriggerConfig = { type: "notion.button.pressed" }
export type NotionAgentMentionedTriggerConfig = { type: "notion.agent.mentioned" }

export type RecurrenceTriggerVariables = {}
export type PageDiscussionCommentAddedTriggerVariables = { discussion: NotionDiscussion; comment: NotionComment }
export type DatabasePageCreatedTriggerVariables = {
	page: Record<string, unknown>
	content: string
	createdBy?: ActorPointer | string
	edits?: DatabasePageEdit[]
	fillablePropertyNames?: Array<string>
}
export type DatabasePageUpdatedTriggerVariables = {
	edits: DatabasePageEdit[]
	update: DatabasePageEdit
	fillablePropertyNames?: Array<string>
}
export type DatabasePageDeletedTriggerVariables = { page: Record<string, unknown>; content: string }
export type DatabaseAgentUpdatedTriggerVariables = {
	agentId: RecordId
	runtimeInstructions: string
	shouldRunOverDatabase: boolean
	viewId?: string
}
export type NotionButtonPressedAgentTriggerVariables = {
	triggerType: "button_pressed"
	blockUrl: string
	propertyUrls?: Array<string>
	propertyNames?: Array<string>
}
export type NotionAgentMentionedTriggerVariables = {
	page: Record<string, unknown>
	content: string
	mentionedBy?: { userId: RecordId; userName: string }
} & (
	| { mentionLocation: "page_content"; mentionBlockContent: string }
	| { mentionLocation: "comment"; comment: NotionComment; discussion: NotionDiscussion }
	| { mentionLocation: "person_property"; propertyId?: string; propertyName?: string }
)

export type RecurrenceTrigger = RecurrenceTriggerVariables
export type PageDiscussionCommentAddedTrigger = PageDiscussionCommentAddedTriggerVariables
export type DatabasePageCreatedTrigger = DatabasePageCreatedTriggerVariables
export type DatabasePageUpdatedTrigger = DatabasePageUpdatedTriggerVariables
export type DatabasePageDeletedTrigger = DatabasePageDeletedTriggerVariables
export type DatabaseAgentUpdatedTrigger = DatabaseAgentUpdatedTriggerVariables
export type NotionButtonPressedAgentTrigger = NotionButtonPressedAgentTriggerVariables
export type NotionAgentMentionedTrigger = NotionAgentMentionedTriggerVariables

export type TriggerConfig =
	| RecurrenceTriggerConfig
	| PageDiscussionCommentAddedTriggerConfig
	| DatabasePageCreatedTriggerConfig
	| DatabasePageUpdatedTriggerConfig
	| DatabasePageDeletedTriggerConfig
	| DatabaseAgentUpdatedTriggerConfig
	| NotionButtonPressedAgentTriggerConfig
	| NotionAgentMentionedTriggerConfig

export type TriggerVariables =
	| RecurrenceTriggerVariables
	| PageDiscussionCommentAddedTriggerVariables
	| DatabasePageCreatedTriggerVariables
	| DatabasePageUpdatedTriggerVariables
	| DatabasePageDeletedTriggerVariables
	| DatabaseAgentUpdatedTriggerVariables
	| NotionButtonPressedAgentTriggerVariables
	| NotionAgentMentionedTriggerVariables

export type Trigger =
	| RecurrenceTrigger
	| PageDiscussionCommentAddedTrigger
	| DatabasePageCreatedTrigger
	| DatabasePageUpdatedTrigger
	| DatabasePageDeletedTrigger
	| DatabaseAgentUpdatedTrigger
	| NotionButtonPressedAgentTrigger
	| NotionAgentMentionedTrigger
