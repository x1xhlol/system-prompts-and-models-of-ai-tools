export type MailDraftClient = "notion_mail" | "gmail"

export type MailSendPermission =
	| "disallow"
	| "with_confirmation"
	| "without_confirmation"

export type MailEmailPermissionSettings = {
	read: boolean
	modifyInbox: boolean
	draft: {
		enabled: boolean
		client: MailDraftClient
	}
	send: MailSendPermission
}

export type LegacyMailScope = "read" | "write"

export type MailEmailMessage = {
	id: string
	threadId: string
	externalId?: string
	from: string
	fromName?: string
	to: Array<string>
	cc?: Array<string>
	bcc?: Array<string>
	subject: string
	body: string
	receivedAt: string
	emailAccountId: string
	isRead?: boolean
	hasAttachments?: boolean
	labels?: Array<string>
	url?: string
}

export type MailThread = {
	id: string
	externalThreadId?: string
	subject: string
	participants: Array<string>
	messageCount: number
	lastMessageAt: string
	emailAccountId: string
	hasUnread: boolean
}

export type MailMailbox = {
	id: string
	email: string
	name?: string
	provider?: string
	isPrimary?: boolean
}

export type MailStatusPropertyOption = {
	labelId: string
	labelName: string
}

export type MailStatusProperty = {
	columnId: string
	name: string
	options: Array<MailStatusPropertyOption>
	hasMoreOptions?: boolean
}

export type ModuleConfiguration = {
	enabledToolNames?: string[]
	emailPermissionSettings?: Record<string, MailEmailPermissionSettings>
	selectedEmailAccountIds?: Array<string>
}

export type McpToolResultContentItem =
	| { type: "text"; text: string }
	| { type: "image"; data: string; mimeType: string }
	| { type: "audio"; data: string; mimeType: string }
	| {
			type: "resource"
			resource: { uri: string; mimeType?: string; text?: string; blob?: string }
	  }
	| {
			type: "resource_link"
			uri: string
			mimeType?: string
			name?: string
			description?: string
	  }

export type MailToolCallResult = {
	content: McpToolResultContentItem[]
	structuredContent?: Record<string, unknown>
	name: string
	moduleName?: string
	statusCode?: number
}

// Generic tool function type - takes tool-specific args and returns result
export type MailToolFunction = (args: Record<string, unknown>) => Promise<MailToolCallResult>

export type Module = {
	searchEmails: MailToolFunction
	viewThreadContent: MailToolFunction
	readAttachment: MailToolFunction
	createMailBlock: MailToolFunction
	listMailboxViews: MailToolFunction
	getMailbox: MailToolFunction
	listStatusProperties: MailToolFunction
	healthCheck: MailToolFunction
	listGmailFilters: MailToolFunction
	setReadStatus: MailToolFunction
	createLabel: MailToolFunction
	listLabels: MailToolFunction
	updateLabel: MailToolFunction
	deleteLabel: MailToolFunction
	applyUserLabelsWithLazyCreate: MailToolFunction
	removeUserLabels: MailToolFunction
	archiveThreadsById: MailToolFunction
	archiveThreadsByQuery: MailToolFunction
	trashThread: MailToolFunction
	markThreadSpam: MailToolFunction
	moveThreadToInbox: MailToolFunction
	starThread: MailToolFunction
	createStatusColumn: MailToolFunction
	updateStatus: MailToolFunction
	setReminder: MailToolFunction
	unsetReminder: MailToolFunction
	blockSender: MailToolFunction
	unblockSender: MailToolFunction
	unsubscribeSender: MailToolFunction
	createGmailFilter: MailToolFunction
	deleteGmailFilter: MailToolFunction
	updateGmailFilter: MailToolFunction
	createOrUpdateDraft: MailToolFunction
	createOrUpdateGmailDraft: MailToolFunction
	createOrUpdateOutlookDraft: MailToolFunction
	sendNewEmail: MailToolFunction
	sendExistingDraft: MailToolFunction
}

// Permissions
export type {
	MailIntegration,
	MailModulePermissionAiConfigurable,
	ModulePermissions,
	ModuleState,
} from "./integration"
