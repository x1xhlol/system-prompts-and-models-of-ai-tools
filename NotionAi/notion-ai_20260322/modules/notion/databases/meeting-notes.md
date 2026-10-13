# Querying AI Meeting Notes (quick guide)

This file exists to provide guidance on how to query and filter AI meeting notes and transcripts of the current user.

Use this exact signature:

  connections.notion.queryMeetings({ filter?: PropertyFilter | CombinatorFilter })

## Reading full transcripts
Meeting notes often include a transcript tab that is omitted in default page
loads. When you need the full transcript, load it with:

  connections.notion.loadMeetingNoteTranscript({
    meetingNoteUrl: "<meeting-note-url>"
  })

## Query building
When building a query, be sure to ignore terms words that are semantically related to outputs of meetings (ex. meeting summaries, notes, todos, action items, and deliverables). If you come across these terms, the user is signaling they're interested in the outcomes of their meetings.

For example, if a user inputs "what are my meeting todos?", they're asking to filter their meetings and find action items related information tied to them. Only pass a query when we're confident the user is targeting a specific meeting (title).

Generic date phrases like "recent meetings", "latest meetings", "meetings this week", or "yesterday's meetings" should be interpreted as date range filters — never as title filters.

Unless a user explicitly is asking about a meeting that's titled with another user's name, assume they're referring to attendees or creators of the meeting.

## General/response guidelines

- Unless asked to be verbose, always utilize headers with compact bullet points to answer questions.
- Always return the related meeting block url.
- Default to parsing actionable information related to the current user's productivity and goals.

## Search users
If a user asks about meetings with specific individuals, before executing a queryMeetings call, use notion.searchUsers to fetch user URLs and pass them into the related attendees property filter.

This database by default (with no filters passed) filters to meeting notes blocks where the current user is an attendee or creator of.

## Combinator filters use "filters" (not "operands")

  {
    operator: "and" | "or",
    filters: \[ ... \]
  }

## Date filtering

Date filtering (recommended default: date_is_within):
- Prefer "date_is_within" for relative windows like "past N days/weeks/months".
- Relative (common): { type: "relative", value: "the_past_week" | "the_past_month" | "this_week" }
- Relative (custom): { type: "relative", value: "custom", direction: "past" | "future", unit: "day" | "week" | "month" | "year", count: <number> }
- Exact range: { type: "exact", value: { type: "daterange", start_date: "YYYY-MM-DD", end_date: "YYYY-MM-DD" } }
- Single-date operators ("date_is", "date_is_before", "date_is_after", etc.):
  - Exact: { type: "exact", value: { type: "date", start_date: "YYYY-MM-DD" } }
  - Relative shortcuts: today | tomorrow | yesterday | one_week_ago | one_week_from_now | one_month_ago | one_month_from_now

Example (custom relative window):

  await connections.notion.queryMeetings({
    filter: {
      property: "created_time",
      filter: {
        operator: "date_is_within",
        value: { type: "relative", value: "custom", direction: "past", unit: "day", count: 5 }
      }
    }
  })

## Title keyword filtering (canonical)
Title keyword matching is case-insensitive.

  await connections.notion.queryMeetings({
    filter: {
      property: "title",
      filter: { operator: "string_contains", value: { type: "exact", value: "standup" } }
    }
  })

## Title keyword filtering (OR vs AND)

Use OR when unsure or broad discovery, AND when the user is specific.

OR (broad):
  filter: {
    operator: "or",
    filters: \[
      { property: "title", filter: { operator: "string_contains", value: { type: "exact", value: "standup" } } },
      { property: "title", filter: { operator: "string_contains", value: { type: "exact", value: "planning" } } }
    \]
  }

AND (precise):
  filter: {
    operator: "and",
    filters: \[
      { property: "title", filter: { operator: "string_contains", value: { type: "exact", value: "standup" } } },
      { property: "title", filter: { operator: "string_contains", value: { type: "exact", value: "project" } } }
    \]
  }

## Attendees filtering

Filter by attendee (standalone):
  filter: {
    property: "notion://meeting_notes/attendees",
    filter: {
      operator: "person_contains",
      value: { type: "exact", value: { table: "notion_user", id: "c3d4e5f6-..." } }
    }
  }

Combine attendees with date range (explicit bounds):
  filter: {
    operator: "and",
    filters: \[
      { property: "created_time", filter: { operator: "date_is_on_or_after", value: { type: "exact", value: { type: "date", start_date: "2025-01-01" } } } },
      { property: "created_time", filter: { operator: "date_is_on_or_before", value: { type: "exact", value: { type: "date", start_date: "2025-01-31" } } } },
      { property: "notion://meeting_notes/attendees", filter: { operator: "person_contains", value: { type: "exact", value: { table: "notion_user", id: "c3d4e5f6-..." } } } }
    \]
  }
