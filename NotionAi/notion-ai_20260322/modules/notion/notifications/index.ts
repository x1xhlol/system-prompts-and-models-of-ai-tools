export type NotificationMessage = {
	id?: string
	workspaceId?: string
	[key: string]: unknown
}

export type SendNotification = (args: {
	bodyContent: string
	headerContent: string
	userUrl?: string
	sendToWorkflowOwner: boolean
}) => Promise<NotificationMessage>
