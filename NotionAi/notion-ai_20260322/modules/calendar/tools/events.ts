
export type InputTimeZone = string
export type AccountCategory = "work" | "personal"

export type Account = {
	accountId: string
	providerName: string
	email?: string
	category?: AccountCategory
	capabilities: {
		readCalendars: boolean
		readEvents: boolean
		writeEvents: boolean
		searchEvents: boolean
		readContacts: boolean
	}
	coworkersEmailDomains?: string[]
}

export type CalendarReference = {
	accountId: string
	calendarId: string
}

export type CalendarColors = { foreground?: string; background?: string }

export type Calendar = CalendarReference & {
	name: string
	description?: string
	colors?: CalendarColors
	isPrimary: boolean
	isReadOnly: boolean
	isSelected: boolean
	isHidden: boolean
}

export type CalendarEventDate = { date: string }
export type CalendarEventPeriodDate = { type: "DATE"; start: CalendarEventDate; end: CalendarEventDate }
export type CalendarEventDateTime = { dateTime: string; timeZone?: string }
export type CalendarEventPeriodDateTime = { type: "DATE_TIME"; start: CalendarEventDateTime; end: CalendarEventDateTime }
export type CalendarEventPeriod = (CalendarEventPeriodDate & { type: "DATE" }) | (CalendarEventPeriodDateTime & { type: "DATE_TIME" })

export type CalendarEventType = "fromGmail" | "default" | "focusTime" | "outOfOffice" | "birthday" | "availability"
export type AttendeeResponseStatus = "needsAction" | "accepted" | "declined" | "tentative"
export type CalendarEventPerson = { isSelf: boolean; displayName?: string; email?: string }
export type CalendarEventAttendee = CalendarEventPerson & { isOptional: boolean; isOrganizer?: boolean; responseStatus?: AttendeeResponseStatus }
export type CalendarEventResource = { displayName?: string; email?: string; isOptional: boolean; responseStatus?: AttendeeResponseStatus }
export type CalendarEventAttachment = { url: string; mimeType?: string; title?: string; notionWorkspaceId?: string }
export type CalendarEventEventStatus = "confirmed" | "tentative" | "cancelled"

export type CalendarEvent = {
	calendar: CalendarReference
	eventId: string
	summary: string
	description?: string
	location?: string
	recurrenceRules?: string[]
	webUrl: string
	period: CalendarEventPeriod
	isRecurring: boolean
	isTransparent: boolean
	isAutoBlock: boolean
	eventType?: CalendarEventType
	eventStatus?: CalendarEventEventStatus
	isMeeting: boolean
	conferencingUrl?: string
	responseStatus?: AttendeeResponseStatus
	creator?: CalendarEventPerson
	organizer?: CalendarEventPerson
	attendees?: CalendarEventAttendee[]
	resources?: CalendarEventResource[]
	colors?: CalendarColors
	attachments?: CalendarEventAttachment[]
}

export type UserPreferencesTimeFormat = "12_HOUR" | "24_HOUR"
export type UserPreferences = { timeFormat?: UserPreferencesTimeFormat }
export type TimeSlotInput = { startAt: string; endAt: string }
export type TimeSlot = { startAt: string; endAt: string }
export type Resource = { resourceEmail: string; resourceName: string; building?: { buildingId: string; buildingName?: string }; capacity?: number; floor?: string; description?: string }
export type CoworkerReference = { accountId: string; coworkerEmail: string }
export type Coworker = CoworkerReference & { profile?: { displayName?: string; email?: string } }
export type CoworkerSchedule = Coworker & { events: CalendarEvent[] }

export type CalendarEventDateTimeInput = { dateTime: string; timeZone?: string }
export type CalendarEventPeriodDateTimeInput = { type: "DATE_TIME"; start: CalendarEventDateTimeInput; end: CalendarEventDateTimeInput }
export type CalendarEventPeriodInput = (CalendarEventPeriodDate & { type: "DATE" }) | (CalendarEventPeriodDateTimeInput & { type: "DATE_TIME" })
export type CalendarEventAttendeeInput = { email: string; displayName?: string; isOptional?: boolean }
export type CalendarEventResourceInput = { email?: string; displayName?: string; isOptional: boolean }
export type ToolError = { identifier: string; errorMessage: string }
export type CalendarEventReference = { calendar: CalendarReference; eventId: string }

export type ParticipantCalendarEventEventStatus = "confirmed" | "tentative" | "cancelled"
export type ParticipantCalendarEvent = {
	eventId: string
	eventType?: CalendarEventType
	eventStatus?: ParticipantCalendarEventEventStatus
	summary: string
	period: CalendarEventPeriod
	responseStatus?: AttendeeResponseStatus
	colors?: CalendarColors
	isTransparent: boolean
	isMeeting: boolean
}

export type ListEventsInput = { timeMin: string; timeMax: string; timeZone: InputTimeZone; includeDeclinedInvites?: boolean | null }
export type CalendarEventCitation = { title: string; path: string; lastEdited: string; searchSourceType: "notion-calendar"; id: string }
export type CalendarCitationContext = { [key: string]: CalendarEventCitation }
export type ListEventsResult = { accounts: (Account & { calendars: (Calendar & { events: CalendarEvent[] })[] })[]; userPreferences: UserPreferences; citationContext?: CalendarCitationContext }

export type ListCalendarsInput = { onlyAccountEmails?: string[] }
export type ListCalendarsResult = { accounts: (Account & { calendars: Calendar[] })[]; citationContext?: CalendarCitationContext }

export type ListCalendarResourcesInput = { timeMin: string; timeMax: string; timeSlots: TimeSlotInput[]; minCapacity: number; maxCount?: number; timeZone: InputTimeZone }
export type ListCalendarResourcesResult = { resultsBySlot: { timeSlot: TimeSlot; availableResources: Resource[] }[]; citationContext?: CalendarCitationContext }

export type ListCoworkersEventsInput = { coworkerEmails: string[]; timeMin: string; timeMax: string; timeZone: InputTimeZone }
export type ListCoworkersEventsResult = { coworkers: CoworkerSchedule[]; citationContext?: CalendarCitationContext }

export type CreateEventsInput = { timeZone: InputTimeZone; events: { summary: string; description?: string; location?: string; recurrenceRules?: string[]; period: CalendarEventPeriodInput; attendees?: CalendarEventAttendeeInput[]; resources?: CalendarEventResourceInput[]; calendar?: CalendarReference; disableConferencing?: boolean }[] }
export type CreateEventsResult = { accounts: (Account & { calendars: (Calendar & { createdEvents: CalendarEvent[] })[] })[]; errors?: ToolError[]; citationContext?: CalendarCitationContext }

export type UpdateEventsInput = { timeZone: InputTimeZone; updates: ({ updateType: "RSVP"; event: CalendarEventReference; rsvp: { responseStatus: AttendeeResponseStatus; comment?: string } } | { updateType: "UPDATE"; event: CalendarEventReference; update: { summary?: string; description?: string; location?: string; recurrenceRules?: string[]; period?: CalendarEventPeriodInput; attendees?: CalendarEventAttendeeInput[]; resources?: CalendarEventResourceInput[]; addConferencing?: boolean } })[] }
export type UpdateEventsResult = { updatedEvents: CalendarEvent[]; errors?: ToolError[]; citationContext?: CalendarCitationContext }

export type CancelEventsInput = { events: CalendarEventReference[] }
export type CancelEventsResult = { canceledEvents: CalendarEventReference[]; errors?: ToolError[]; citationContext?: CalendarCitationContext }

export type SuggestMeetingTimesInput = { participantEmails: string[]; durationMinutes: number; timeMin: string; timeMax: string; maxCount?: number; timeZone: InputTimeZone; includeParticipantSchedules?: boolean }
export type SuggestMeetingTimesResult = { suggestions: { startAt: string; endAt: string; unavailableParticipants: string[]; availableParticipants: string[]; unknownStatus: string[] }[]; participantSchedules?: (Coworker & { events: ParticipantCalendarEvent[] })[]; citationContext?: CalendarCitationContext }

export type ListEvents = (args: ListEventsInput) => Promise<ListEventsResult>
export type ListCalendars = (args: ListCalendarsInput) => Promise<ListCalendarsResult>
export type ListCalendarResources = (args: ListCalendarResourcesInput) => Promise<ListCalendarResourcesResult>
export type ListCoworkersEvents = (args: ListCoworkersEventsInput) => Promise<ListCoworkersEventsResult>
export type CreateEvents = (args: CreateEventsInput) => Promise<CreateEventsResult>
export type UpdateEvents = (args: UpdateEventsInput) => Promise<UpdateEventsResult>
export type CancelEvents = (args: CancelEventsInput) => Promise<CancelEventsResult>
export type SuggestMeetingTimes = (args: SuggestMeetingTimesInput) => Promise<SuggestMeetingTimesResult>

export type Module = {
	listEvents: ListEvents
	listCalendars: ListCalendars
	listCalendarResources: ListCalendarResources
	listCoworkersEvents: ListCoworkersEvents
	createEvents: CreateEvents
	updateEvents: UpdateEvents
	cancelEvents: CancelEvents
	suggestMeetingTimes: SuggestMeetingTimes
}
