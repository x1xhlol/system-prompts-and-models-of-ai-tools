import type { LoadAgent as LoadAgentType } from "./agents"
import type {
	CreateDatabase as CreateDatabaseType,
	CreateTwoWayRelation as CreateTwoWayRelationType,
	LoadDatabase as LoadDatabaseType,
	LoadDataSource as LoadDataSourceType,
	DeleteDatabases as DeleteDatabasesType,
	UpdateDatabase as UpdateDatabaseType,
	QuerySql as QuerySqlType,
	QueryView as QueryViewType,
	QueryMeetings as QueryMeetingsType,
} from "./databases"
import type { AddCommentToDiscussion, GetPageDiscussions } from "./discussions"
import type { SendNotification as SendNotificationType } from "./notifications"
import type {
	CreatePage as CreatePageType,
	LoadPage as LoadPageType,
	
	LoadMeetingNoteTranscript as LoadMeetingNoteTranscriptType,
	DeletePages as DeletePagesType,
	UpdatePage as UpdatePageType,
} from "./pages"
import type {
	LoadPermissions as LoadPermissionsType,
	UpdatePermission as UpdatePermissionType,
} from "./sharing"
import type {
	ListTeamspaces as ListTeamspacesType,
	GetTeamspaceTopLevelPagesAndDatabases as GetTeamspaceTopLevelPagesAndDatabasesType,
} from "./teamspaces"
import type {
	GetUserEngagementAnalytics as GetUserEngagementAnalyticsType,
	GetContentEngagementAnalytics as GetContentEngagementAnalyticsType,
	GetDailyUsersAnalytics as GetDailyUsersAnalyticsType,
	ListUsersAnalytics as ListUsersAnalyticsType,
	ListContentAnalytics as ListContentAnalyticsType,
	GetPageAnalyticsTimeSeries as GetPageAnalyticsTimeSeriesType,
	GetPageVisitors as GetPageVisitorsType,
} from "./analytics"
import type {
	InvestigateThread as InvestigateThreadType,
	QueryThreads as QueryThreadsType,
	CreateAndRunThread as CreateAndRunThreadType,
} from "./threads"
import type {
	ListUserConnections,
	CreateUserConnection,
	GetUserPreconfiguredMcpServers,
} from "./users"
import type { Search as SearchType } from "./search"
import type { LoadUser as LoadUserType, SearchUsers as SearchUsersType, GetUserActivity as GetUserActivityType } from "./users"

// Call via callFunction; the file is attached to the transcript automatically for viewing.
export type ViewFileUrl = (args: { url: string }) => Promise<{ url: string }>

export type ModuleConfiguration = {
	ownedByDatabasePropertyIds?: Array<string>
}

export type { GetPageDiscussions, AddCommentToDiscussion } from "./discussions"

export type Module = {
	sendNotification: SendNotificationType
	getPageDiscussions: GetPageDiscussions
	addCommentToDiscussion: AddCommentToDiscussion
	getUserEngagementAnalytics: GetUserEngagementAnalyticsType
	getContentEngagementAnalytics: GetContentEngagementAnalyticsType
	getDailyUsersAnalytics: GetDailyUsersAnalyticsType
	listUsersAnalytics: ListUsersAnalyticsType
	listContentAnalytics: ListContentAnalyticsType
	getPageAnalyticsTimeSeries: GetPageAnalyticsTimeSeriesType
	getPageVisitors: GetPageVisitorsType
	createDatabase: CreateDatabaseType
	createTwoWayRelation: CreateTwoWayRelationType
	loadDatabase: LoadDatabaseType
	loadDataSource: LoadDataSourceType
	updateDatabase: UpdateDatabaseType
	deleteDatabases: DeleteDatabasesType
	querySql: QuerySqlType
	queryView: QueryViewType
	queryMeetings: QueryMeetingsType
	loadAgent: LoadAgentType

	queryThreads: QueryThreadsType
	investigateThread: InvestigateThreadType
	createAndRunThread: CreateAndRunThreadType

	loadPage: LoadPageType
	loadPermissions: LoadPermissionsType
	updatePermission: UpdatePermissionType
	loadMeetingNoteTranscript: LoadMeetingNoteTranscriptType
	createPage: CreatePageType
	updatePage: UpdatePageType
	deletePages: DeletePagesType
	listTeamspaces: ListTeamspacesType
	getTeamspaceTopLevelPagesAndDatabases: GetTeamspaceTopLevelPagesAndDatabasesType
	loadUser: LoadUserType
	search: SearchType
	searchUsers: SearchUsersType
	getUserActivity: GetUserActivityType
	listUserConnections: ListUserConnections
	createUserConnection: CreateUserConnection
	getUserPreconfiguredMcpServers: GetUserPreconfiguredMcpServers
	viewFileUrl: ViewFileUrl
}

// Permissions
export type {
	ModulePermissions,
	NotionIntegration,
	NotionModulePermissionAiConfigurable,
} from "./integration"

// Triggers
export type {
	RecurrenceTrigger,
	RecurrenceTriggerConfig,
	RecurrenceTriggerVariables,
	PageDiscussionCommentAddedTriggerConfig,
	DatabasePageCreatedTriggerConfig,
	DatabasePageUpdatedTriggerConfig,
	DatabasePageDeletedTriggerConfig,
	DatabaseAgentUpdatedTriggerConfig,
	NotionButtonPressedAgentTriggerConfig,
	NotionAgentMentionedTriggerConfig,
	PageDiscussionCommentAddedTriggerVariables,
	DatabasePageCreatedTriggerVariables,
	DatabasePageUpdatedTriggerVariables,
	DatabasePageDeletedTriggerVariables,
	DatabaseAgentUpdatedTriggerVariables,
	NotionButtonPressedAgentTriggerVariables,
	NotionAgentMentionedTriggerVariables,
} from "./triggers"

// Primitives
export type CollectionTable = {
	type?: "collection"
	id?: string
}

export type NotificationMessage = {
	id?: string
	workspaceId?: string
	[key: string]: unknown
}

export type UserTable = {
	type?: "user"
	id?: string
}

export type AutomationTable = {
	type?: "automation"
	id?: string
}

// Helper types
export type {
	CommentFrom,
	CommentFileType,
	NotionReaction,
	DiscussionContext,
	RecurrenceTriggerBase,
	RecurrenceTriggerFrequencyConfig,
	ActorPointer,
	AutomationEventConfiguration,
	RecordId,
	DatabasePageEdit,
	NotionComment,
	NotionDiscussion,
} from "./triggers"
export { commentFileTypes } from "./triggers"
export type { PermissionItem, SharingAccessLevel } from "./sharing"
