import type { MailEmailMessage, MailThread, MailStatusProperty } from "./index"

export type MailFilterField = "from" | "to" | "subject" | "body" | "domain"

export type MailTextFilterOperator =
	| "string_contains"
	| "string_does_not_contain"
	| "string_is"
	| "string_is_not"
	| "string_starts_with"
	| "string_ends_with"
	| "is_empty"
	| "is_not_empty"

export type MailTextFilterValue = {
	type: "exact"
	value: string | undefined
}

export type MailEmailFilter = {
	field: MailFilterField
	operator: MailTextFilterOperator
	value: MailTextFilterValue
}

export type MailEmailReceivedTriggerConfig = {
	type: "mail.email.received"
	emailAccountIds?: Array<string>
	emailAccountDisplayInfo?: Record<string, string>
	filters?: Array<MailEmailFilter>
	inboxOnly?: boolean
}

export type MailEmailReceivedTriggerVariables = {
	email: MailEmailMessage
	thread: MailThread
	userEmail: string
	statusProperties?: Array<MailStatusProperty>
	statusPropertiesTruncated?: boolean
}

export type MailEmailSentTriggerConfig = {
	type: "mail.email.sent"
	emailAccountIds?: Array<string>
	emailAccountDisplayInfo?: Record<string, string>
	filters?: Array<MailEmailFilter>
}

export type MailEmailSentTriggerVariables = {
	email: MailEmailMessage
	thread: MailThread
	userEmail: string
	statusProperties?: Array<MailStatusProperty>
	statusPropertiesTruncated?: boolean
}

export type MailEmailReceivedAndSentTriggerConfig = {
	type: "mail.email.receivedorsent"
	emailAccountIds?: Array<string>
	emailAccountDisplayInfo?: Record<string, string>
	filters?: Array<MailEmailFilter>
	inboxOnly?: boolean
}

export type MailEmailReceivedAndSentTriggerVariables = {
	email: MailEmailMessage
	thread: MailThread
	userEmail: string
	statusProperties?: Array<MailStatusProperty>
	statusPropertiesTruncated?: boolean
}

export type MailLabelAppliedTriggerConfig = {
	type: "mail.label.applied"
	emailAccountIds?: Array<string>
	emailAccountDisplayInfo?: Record<string, string>
	labelNames?: Array<string>
}

export type MailLabelAppliedTriggerVariables = {
	email: MailEmailMessage
	thread: MailThread
	appliedLabel: string
	userEmail: string
	statusProperties?: Array<MailStatusProperty>
	statusPropertiesTruncated?: boolean
}

export type MailEmailReceivedTrigger = MailEmailReceivedTriggerVariables
export type MailEmailSentTrigger = MailEmailSentTriggerVariables
export type MailEmailReceivedAndSentTrigger = MailEmailReceivedAndSentTriggerVariables
export type MailLabelAppliedTrigger = MailLabelAppliedTriggerVariables

export type TriggerConfig =
	| MailEmailReceivedTriggerConfig
	| MailEmailSentTriggerConfig
	| MailEmailReceivedAndSentTriggerConfig
	| MailLabelAppliedTriggerConfig

export type TriggerVariables =
	| MailEmailReceivedTriggerVariables
	| MailEmailSentTriggerVariables
	| MailEmailReceivedAndSentTriggerVariables
	| MailLabelAppliedTriggerVariables

export type Trigger =
	| MailEmailReceivedTrigger
	| MailEmailSentTrigger
	| MailEmailReceivedAndSentTrigger
	| MailLabelAppliedTrigger
