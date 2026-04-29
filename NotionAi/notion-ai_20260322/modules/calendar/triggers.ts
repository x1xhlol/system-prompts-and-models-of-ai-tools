
import type { CalendarEvent, CalendarReference } from "./tools/events"

export type BooleanCondition = {
	operator: "eq"
	value: boolean
}

export type EmptyCondition = {
	operator: "empty" | "notEmpty"
}

export type CalendarEventCategoryCondition = {
	operator: "in" | "nin"
	values: Array<
		| "default"
		| "outOfOffice"
		| "focusTime"
		| "availability"
		| "fromGmail"
		| "birthday"
	>
}

export type ResponseStatusCondition = {
	operator: "every" | "some" | "none"
	values: Array<"needsAction" | "declined" | "tentative" | "accepted">
}

export type StringContainsCondition = {
	operator: "contains" | "notContains"
	combinator: "and" | "or"
	values: string[]
}

export type StringInCondition = {
	operator: "in" | "nin"
	values: string[]
}

export type NullishStringCondition =
	| StringContainsCondition
	| StringInCondition
	| EmptyCondition

export type AttendeeEmailCondition =
	| {
			operator: "every" | "some" | "none" | "notEvery"
			values: string[]
	  }
	| EmptyCondition

export type LeafFilter =
	| { type: "calendarEvent.summary"; condition: NullishStringCondition }
	| { type: "calendarEvent.description"; condition: NullishStringCondition }
	| { type: "calendarEvent.location"; condition: NullishStringCondition }
	| { type: "calendarEvent.organizer"; condition: NullishStringCondition }
	| { type: "calendarEvent.attendees.email"; condition: AttendeeEmailCondition }
	| { type: "calendarEvent.attendees.responseStatus"; condition: ResponseStatusCondition }
	| { type: "calendarEvent.resources.responseStatus"; condition: ResponseStatusCondition }
	| { type: "calendarEvent.isTransparent"; condition: BooleanCondition }
	| { type: "calendarEvent.isAllDay"; condition: BooleanCondition }
	| { type: "calendarEvent.category"; condition: CalendarEventCategoryCondition }
	| { type: "calendarEvent.conferencing"; condition: EmptyCondition }

export type RecursiveFilter =
	| LeafFilter
	| { type: "group"; combinator: "and" | "or"; filters: RecursiveFilter[] }

export type SubscriptionFilter = {
	type: "group"
	combinator: "and" | "or"
	filters: RecursiveFilter[]
}

export type CalendarEventCreatedTriggerConfig = {
	type: "calendar.event.created"
	calendars: Array<CalendarReference>
	filter?: SubscriptionFilter
}

export type CalendarEventUpdatedTriggerConfig = {
	type: "calendar.event.updated"
	calendars: Array<CalendarReference>
	filter?: SubscriptionFilter
}

export type CalendarEventCanceledTriggerConfig = {
	type: "calendar.event.canceled"
	calendars: Array<CalendarReference>
	filter?: SubscriptionFilter
}

export type CalendarEventUpdate =
	| { field: "summary" }
	| { field: "description" }
	| { field: "location" }
	| { field: "attachments" }
	| { field: "conferencing" }
	| { field: "periodStart"; previousValue: string }
	| { field: "periodEnd"; previousValue: string }
	| { field: "recurrence"; previousValue: string | null }
	| { field: "category"; previousValue: "fromGmail" | "default" | "focusTime" | "outOfOffice" | "birthday" | "availability" }
	| { field: "status"; previousValue: "confirmed" | "tentative" | "cancelled" }
	| { field: "responseStatus"; previousValue?: "needsAction" | "declined" | "tentative" | "accepted" | null }
	| { field: "resources" }
	| { field: "attendees"; update: "added"; attendeeEmail: string }
	| { field: "attendees"; update: "removed" }
	| { field: "attendees"; update: "responseStatus"; attendeeEmail: string; previousResponseStatus?: "needsAction" | "declined" | "tentative" | "accepted" | null }

export type CalendarEventCreatedTriggerVariables = { calendarEvent: CalendarEvent }
export type CalendarEventUpdatedTriggerVariables = { calendarEvent: CalendarEvent; updates: CalendarEventUpdate[] }
export type CalendarEventCanceledTriggerVariables = { calendarEvent: CalendarEvent }

export type CalendarEventCreatedTrigger = CalendarEventCreatedTriggerVariables
export type CalendarEventUpdatedTrigger = CalendarEventUpdatedTriggerVariables
export type CalendarEventCanceledTrigger = CalendarEventCanceledTriggerVariables

export type TriggerConfig = CalendarEventCreatedTriggerConfig | CalendarEventUpdatedTriggerConfig | CalendarEventCanceledTriggerConfig
export type TriggerVariables = CalendarEventCreatedTriggerVariables | CalendarEventUpdatedTriggerVariables | CalendarEventCanceledTriggerVariables
export type Trigger = CalendarEventCreatedTrigger | CalendarEventUpdatedTrigger | CalendarEventCanceledTrigger
