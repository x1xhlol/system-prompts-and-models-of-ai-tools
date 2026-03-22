
import type { Module as ContactsModule } from "./tools/contacts"
import type { Module as EventsModule } from "./tools/events"

export type Module = EventsModule & ContactsModule

export type {
	CalendarIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"
export type {
	Trigger,
	TriggerConfig,
	TriggerVariables,
	CalendarEventCreatedTrigger,
	CalendarEventCreatedTriggerConfig,
	CalendarEventCreatedTriggerVariables,
	CalendarEventUpdatedTrigger,
	CalendarEventUpdatedTriggerConfig,
	CalendarEventUpdatedTriggerVariables,
	CalendarEventCanceledTrigger,
	CalendarEventCanceledTriggerConfig,
	CalendarEventCanceledTriggerVariables,
} from "./triggers"