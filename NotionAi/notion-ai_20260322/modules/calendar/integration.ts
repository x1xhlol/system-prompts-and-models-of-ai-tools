
import type { CalendarReference } from "./tools/events"

export type CalendarModulePermissionAction = "read" | "write" | "readCoworker"

export type CalendarModulePermissionConstraints = {
	skipConfirmation: boolean
}

export type CalendarModulePermission = {
	accountId: string
	calendarId?: string
	actions?: Array<CalendarModulePermissionAction>
	constraints?: CalendarModulePermissionConstraints
}

export type CalendarModuleCalendarAccount = {
	accountId: string
	email: string | undefined
	provider: string
	displayName: string
	supportsTriggers: boolean
	calendars: Array<{
		calendarId: string
		name: string
		primary: boolean
		accessRole: string
	}>
}

export type CalendarModuleState = {
	defaultCalendar?: CalendarReference | null
	availableAccounts?: CalendarModuleCalendarAccount[] | null
}

export type ModulePermissions = CalendarModulePermission
export type ModuleState = CalendarModuleState

export type CalendarIntegration = {
	type: "calendar"
	name: string
	permissions?: Array<ModulePermissions>
	state?: ModuleState
}