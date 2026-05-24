export type TeamspaceUrl = string
export type Cursor = string

export type TeamspaceAccessLevel = "default" | "open" | "closed" | "private"

export type TeamspaceResult = {
	url: TeamspaceUrl
	name: string
	description?: string
	icon?: string
	accessLevel: TeamspaceAccessLevel
	archived: boolean
}

export type ListTeamspaces = (args?: {
	limit?: number
	cursor?: Cursor
	query?: string
	includeArchived?: boolean
}) => Promise<{ results: TeamspaceResult[]; nextCursor?: Cursor }>

export type TeamspaceTopLevelItem =
	| { type: "page"; url: string; title?: string; icon?: string }
	| { type: "database"; url: string; title?: string; icon?: string }

export type GetTeamspaceTopLevelPagesAndDatabases = (args: {
	teamspaceUrl: TeamspaceUrl
	limit?: number
	cursor?: Cursor
}) => Promise<{ results: TeamspaceTopLevelItem[]; nextCursor?: Cursor }>
