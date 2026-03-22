export type UserUrl = string
export type TeamspaceUrl = string
export type PageUrl = string
export type Cursor = string

export type WorkspaceAnalyticsDaysFilter =
	| "last_7_days"
	| "last_28_days"
	| "last_90_days"
	| "last_365_days"
	| "all_time"

export type WorkspaceActiveWindow = "last_7_days" | "last_28_days" | "last_90_days"

export type PageAudience =
	| "private"
	| "shared_internally"
	| "shared_externally"
	| "shared_to_web"

export type SortDirection = "asc" | "desc"

export type WorkspaceTopTeamspace = { teamspaceUrl: TeamspaceUrl; pageViews: number }
export type WorkspaceTopViewer = { userUrl: UserUrl; pageViews: number }
export type WorkspaceTopEditor = { userUrl: UserUrl; pageEdits: number }

export type UserEngagementAnalytics = {
	daysFilter: WorkspaceAnalyticsDaysFilter
	activeMembersCount: number
	previousActiveMembersCount?: number
	activeGuestsCount: number
	previousActiveGuestsCount?: number
	topTeamspaces: WorkspaceTopTeamspace[]
	topViewers: WorkspaceTopViewer[]
	topEditors: WorkspaceTopEditor[]
}

export type GetUserEngagementAnalytics = (args: {
	daysFilter: WorkspaceAnalyticsDaysFilter
}) => Promise<UserEngagementAnalytics>

export type WorkspaceTopPage = { pageUrl: PageUrl; pageViews: number }

export type ContentEngagementAnalytics = {
	daysFilter: WorkspaceAnalyticsDaysFilter
	pageViews: number
	uniquePageViews: number
	pagesCreated: number
	pageEdits: number
	topPages: WorkspaceTopPage[]
}

export type GetContentEngagementAnalytics = (args: {
	daysFilter: WorkspaceAnalyticsDaysFilter
}) => Promise<ContentEngagementAnalytics>

export type DailyActiveMembersPoint = { ds: string; activeMembers: number }

export type GetDailyUsersAnalytics = (args: {
	activeWindow: WorkspaceActiveWindow
	days?: number
}) => Promise<{ points: DailyActiveMembersPoint[] }>

export type WorkspaceUsersSortField = "last_active" | "page_views" | "page_edits"
export type WorkspaceUsersSort = { field: WorkspaceUsersSortField; direction: SortDirection }
export type MemberPermissionRole = "editor" | "read_and_write" | "membership_admin"

export type UsersAnalyticsRow = {
	userUrl: UserUrl
	userSpaceRole: MemberPermissionRole
	lastActiveMs?: number
	pageViews?: number
	pageEdits: number
}

export type ListUsersAnalytics = (args: {
	timeRange: WorkspaceAnalyticsDaysFilter
	sort?: WorkspaceUsersSort
}) => Promise<{ users: UsersAnalyticsRow[] }>

export type WorkspaceContentSortField = "pageViews" | "uniquePageViews"
export type WorkspaceContentSort = { field: WorkspaceContentSortField; direction: SortDirection }
export type DateRange = { starting?: string; ending?: string }

export type ContentAnalyticsFilters = {
	titleQuery?: string
	createdBy?: UserUrl[]
	createdTime?: DateRange
	lastEditedTime?: DateRange
	inTeamspaces?: TeamspaceUrl[]
}

export type ContentAnalyticsRow = {
	pageUrl: PageUrl
	pageViews: number
	uniquePageViews: number
	audience: PageAudience
}

export type ListContentAnalytics = (args: {
	timeRange: WorkspaceAnalyticsDaysFilter
	sort: WorkspaceContentSort
	filters?: ContentAnalyticsFilters
	cursor?: Cursor
}) => Promise<{ results: ContentAnalyticsRow[]; nextCursor?: Cursor }>

export type PageViewsTimeSeriesPoint = { ds: string; totalViews: number; uniqueViews: number }

export type GetPageAnalyticsTimeSeries = (args: {
	pageUrl: PageUrl
	days?: number
}) => Promise<{ points: PageViewsTimeSeriesPoint[] }>

export type PageVisitor = { userUrl: UserUrl; visitedAtMs: number; onTrustedDomain?: boolean }

export type GetPageVisitors = (args: {
	pageUrl: PageUrl
	sinceTimestampMs?: number
	limit: number
	includeTotalCount?: boolean
}) => Promise<{ visitors: PageVisitor[]; totalCount?: number; hasMore?: boolean }>
