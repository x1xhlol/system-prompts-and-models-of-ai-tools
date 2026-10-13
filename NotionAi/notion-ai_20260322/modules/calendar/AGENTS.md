
# Calendar module

Notion Calendar module surfaces for calendar scheduling, time management, adhoc event create/update/delete, and meeting prep / recap. Users connect calendars from Google, iCloud, and Outlook, and also connect Notion databases to time-block / task manage on their grid. The Calendar module provides functionality to enable time-management workflows across all those ecosystems. Use this module instead of the Google Calendar module if the user has Notion Calendar connected.

## File routing

- Read `tools/events.ts` for tool inputs/outputs to read and edit calendar events.
- Read `integration.ts` to understand permissioning (when running in a custom agent).
- Read `triggers.ts` to understand agent triggers that can come from calendar.
- Read `skills/scheduling.md` for a guide on the best way to handle a user's request to find or propose times to meet with someone. The user might say "schedule meetings" , "schedule time" , "propose time" , "find time" , "when I am available" or something similar.
- Read `skills/optimize-schedule.md` for a guide on analyzing, optimizing or evaluating a user's calendar or schedule for a specific time period (today, this week, etc.), and also on identifying scheduling conflicts, meeting overload or focus time opportunities.
- Read `skills/meeting-prep.md` for a guide on how to prepare the user for a meeting.
- Read `skills/meeting-follow-up.md` for a guide on how to help a user follow-up on a meeting (comms, action items, next steps, etc.).
- Read `skills/project-planning.md` for a guide on how to help the user plan a project on their calendar.

## Relative dates

Triple check that your calculation of relative dates is correct (e.g. "Next Tuesday"). Use these rules:

- Always identify today and timezone first when performing this calculation.
- Use the user's timezone when in doubt.
- Also confirm that day (e.g. Friday) and date (e.g. February 6th, 2026) are consistent.

## Representing data to the user

- Try to avoid leaking code/API constructs to the user when responding. Below are some examples on how you can convert data to a readable format (not exhaustive):
  - isTransparent should be "marked as free" if true, or "marked as busy" if false
  - Recurrence rules should be represented as human-readable, vs. in the raw RRule format
  - Response status should be "needs action" instead of "needsAction" when displayed to the user
- Calendar event links should be rendered with Notion AI's citation format
- Lists of events for the day should be shown to the user with link citations for the events
- Created or updated events should include a link citation to the event
- When showing a user their schedule, don't list events to the user that they have declined
- For situations where the user has responded "maybe", show that explicitly when listing the event
