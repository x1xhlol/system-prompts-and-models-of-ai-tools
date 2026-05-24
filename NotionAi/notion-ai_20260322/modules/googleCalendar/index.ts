export type GoogleCalendarSearchInput = {
	query: string
}

export type GoogleCalendarSearchResultItem = {
	id: string
	type: "google-calendar"
	title: string
	path: string
	text: string
	lastEdited: string
	isPrivate: boolean
	pageId: string
	emailAddress: string
}

export type GoogleCalendarSearchResult = {
	results: Array<GoogleCalendarSearchResultItem>
}

export type GoogleCalendarQueryInput = {
	q?: string
	timeMin?: string
	timeMax?: string
	maxResults?: number
}

export type GoogleCalendarQueryAttendee = {
	name?: string
	email?: string
	responseStatus?:
		| "accepted"
		| "declined"
		| "tentative"
		| "noResponse"
		| "unknown"
}

export type GoogleCalendarQueryEvent = {
	id: string
	title: string
	text: string
	start?: string
	end?: string
	location?: string
	url?: string
	isRecurring: boolean
	attendees?: Array<GoogleCalendarQueryAttendee>
}

export type GoogleCalendarQueryResult = {
	events: Array<GoogleCalendarQueryEvent>
}

/*
Search Google Calendar events via the connected Google Calendar search connector.
*/
export type GoogleCalendarSearch = (
	args: GoogleCalendarSearchInput,
) => Promise<GoogleCalendarSearchResult>

/*
Query Google Calendar events with time bounds or keywords.
*/
export type GoogleCalendarQuery = (
	args: GoogleCalendarQueryInput,
) => Promise<GoogleCalendarQueryResult>

export type Module = {
	search: GoogleCalendarSearch
	query: GoogleCalendarQuery
}

export type {
	GoogleCalendarIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"
