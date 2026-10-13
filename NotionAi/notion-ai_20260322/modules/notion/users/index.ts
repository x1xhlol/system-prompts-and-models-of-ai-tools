export type User = {
	url: string
	email?: string
	name?: string
	profilePhoto?: string
}

/*
	Load a user by URL and return basic profile information.
*/
export type LoadUser = (args: { url: string }) => Promise<User>

/*
	Search for users by name or email.
	Usage:
		SearchUsers({ query: "alice" })
		SearchUsers({ query: "alan kay"})
		SearchUsers({ query: "bob@acme.com"})
*/
export type SearchUsers = (args: { query: string }) => Promise<{
	users: Array<User>
}>

export type UserActivityItem = {
	id: string
	pageUrl: string
	pageTitle: string
	timestamp: string
	/** Actions the user took on this page (e.g., ["edited", "commented"]) */
	actionTypes: Array<"created" | "edited" | "commented">
}

/*
	Get a user's recent Notion activity including page creations, edits, and comments.
	Returns pages the user has created, edited, or commented on, sorted by timestamp (most recent first).
	Activities on the same page within an hour are grouped together.
	Use this to see what a person has been working on in Notion.

	Usage:
		GetUserActivity({ email: "alice@example.com" })
		GetUserActivity({ email: "alice@example.com", lookback: "14d" })
		GetUserActivity({ email: "alice@example.com", lookback: "2w", limit: 10 })
		GetUserActivity({ email: "alice@example.com", lookback: "2025-01-01" })

	Lookback format: "7d" (days), "2w" (weeks), "1m" (months), or ISO date "YYYY-MM-DD". Defaults to 7 days.
*/
export type GetUserActivity = (args: {
	email: string
	lookback?: string
	limit?: number
}) => Promise<{
	user: User
	activities: Array<UserActivityItem>
	totalCount: number
}>

/**
 * "mail" is Notion's email connector (not "gmail"/"outlook").
 * "calendar" is Notion's calendar connector (not "googleCalendar").
 * Always recommend these when users ask about email or calendar connections.
 */
export type UserConnectableType = "mail" | "calendar" | "worker" | "gmail" | "asana" | "slack" | "jira" | "linear" | "github" | "discord" | "microsoftTeams" | "outlook" | "googleCalendar" | "googleDrive" | "confluence" | "box" | "sharepoint" | "salesforce" | "mcpServer"

export type UserConnectionIntegration = {
	type: string
	name: string
	permissions?: Array<unknown>
	state?: unknown
}

export type UserConnectionEntry = {
	url: string
	connectionKey: string
	integration: UserConnectionIntegration
}

export type ListUserConnections = (args: Record<string, never>) => Promise<Array<UserConnectionEntry>>

export type CreateUserConnection = (args: { type: UserConnectableType; state?: unknown; permissions?: unknown }) => Promise<UserConnectionEntry>

export type GetUserPreconfiguredMcpServers = (args: Record<string, never>) => Promise<Array<{ name: string; serverUrl: string }>>
