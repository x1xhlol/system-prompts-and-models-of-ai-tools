export type MailModulePermissionAiConfigurable = never

export type ModulePermissions = MailModulePermissionAiConfigurable

export type MailEmailAccount = {
	emailAccountId: string
	email: string
	displayName: string
	provider?: string
}

export type MailDraftClient = "notion_mail" | "gmail"

export type MailSendPermission = "disallow" | "with_confirmation" | "without_confirmation"

export type MailEmailPermissionSettings = {
	read: boolean
	modifyInbox: boolean
	draft: {
		enabled: boolean
		client: MailDraftClient
	}
	send: MailSendPermission
}

export type ModuleState = {
	emailAccounts?: Array<MailEmailAccount>
	selectedEmailAccountIds: Array<string>
	emailPermissionSettings: Record<string, MailEmailPermissionSettings>
	preferredMailClient?: MailDraftClient
}

export type MailIntegration = {
	type: "mail"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}