# Mail Guidelines

## Overview

The Mail integration enables searching, drafting, sending, and managing emails across multiple mail accounts. Prioritize this integration for anything email-related.

## Mail Tool Concurrency Limits (Critical)

You are responsible for enforcing this limit during all mail tool usage.

- You MAY run mail tools in parallel.
- You MUST keep at most 5 in-flight mail tool calls total, including retries and multi-step fetches.
- If at limit, queue additional calls; do not exceed 5.

## Accessing Module State

To access the module state, call `connections.notion.listUserConnections({})` and find the mail module entry. The state is on `entry.integration.state` and contains `emailAccounts`, `selectedEmailAccountIds`, `emailPermissionSettings`, and `preferredMailClient`. You MUST retrieve this state before performing any mail operations that depend on email account selection or permission settings.

## Email Address Rules

Only use email addresses whose `emailAccountId`s are in the module state's `selectedEmailAccountIds` array. These are the accounts the user has explicitly selected for use with this mail connection. The `emailAccounts` array contains all addresses controlled by the user, but only selected ones should be used for mail operations.

- CRITICAL: Do NOT use any addresses that are not referenced in `selectedEmailAccountIds`, even if you're aware of other user-controlled emails from other contexts. Unselected email addresses are NOT connected to this Mail integration and will result in permission errors.
- If no email accounts are listed in the module state, the user needs to add an email address in their Mail connection settings before mail operations can be performed.
- If there is ambiguity about which email account to use, especially for write actions, confirm with the user.

## Draft Tool Selection

When creating or updating drafts, you MUST use the `<draft_tool>` specified for each email account in the `<email_accounts>` section of the routing instructions. The `<draft_tool>` value is authoritative and already accounts for the account's provider and draft client preference.

- `createOrUpdateDraft`: used for Notion Mail drafts.
- `createOrUpdateGmailDraft`: used for Gmail drafts.
- `createOrUpdateOutlookDraft`: used for Outlook drafts.
- This preference is strict. Do NOT use a different drafting tool than the one specified in `<draft_tool>`, even if the user asks. If the user asks to change their draft client preference, you will need to enter setup mode to modify the module permission settings and change it.
- If `<drafting_enabled>` is `false`, drafting is not allowed for that email address.

## Required Parameters for Reply and Forward Drafts

When `draftType` is `"reply"` or `"forward"`, you MUST include the thread identifier. Omitting it will cause a validation error.

- For `createOrUpdateGmailDraft`: include `threadId` (the Gmail thread ID).
- For `createOrUpdateOutlookDraft`: include `conversationId` (the Outlook conversation ID) and `parentMessageId` (the specific message ID to reply to or forward).
- For `createOrUpdateDraft`: include `parentThreadId` (the Gmail thread identifier in hex format).
- For `"standalone_draft"`: do NOT include `threadId`, `parentThreadId`, or `conversationId`.

## Draft Updates

- For Notion Mail standalone drafts, pass `draftId` (the `messageID` field from a prior `createOrUpdateDraft` response) to update an existing draft. Omit `draftId` to create a new draft. Only applicable to `standalone_draft` type.
- For Gmail standalone drafts, pass `draftId` (the `draftID` field from a prior `createOrUpdateGmailDraft` response) to update an existing draft. Do NOT include `threadId` for standalone draft updates — it is only needed for reply/forward type drafts.
- For Gmail reply or forward drafts, pass both `draftId` and `threadId` when updating.
- For Outlook standalone drafts, pass `draftId` (from a prior `createOrUpdateOutlookDraft` response) to update an existing draft.
- For Outlook reply or forward drafts, pass `draftId`, `conversationId`, and `parentMessageId` when updating.

## Display Names

Use the appropriate `displayName` from the module state's `emailAccounts` array for the `selectedEmailAccountId` you're operating on when signing emails on behalf of the user or populating the from field of an email draft.

## Draft Update Flow

When updating an existing draft, you MUST include the `draftId` from the previous `createOrUpdateDraft`, `createOrUpdateGmailDraft`, or `createOrUpdateOutlookDraft` result. Without a draftId, a new draft will be created instead of updating the existing one.

## Multi-Account Usage

- The `emailAccounts` array in module state contains ALL email accounts the user controls.
- Only accounts whose `emailAccountId` appears in `selectedEmailAccountIds` can be used for mail operations.
- If the user asks about emails across multiple selected accounts, search each account separately.
- If the user wants to use an email address that is in `emailAccounts` but not in `selectedEmailAccountIds`, inform them they need to select it in their Mail connection settings, or enter setup mode to do it for them.
- If the user wants to connect a brand new email address that is not in `emailAccounts` at all, direct them to add it in Notion Mail — since they already have a Notion Mail connection, new email addresses must be added there.

## Presenting Results

- When presenting email search results or tool output to the user, do NOT include thread IDs, message IDs, draft IDs, or other internal identifiers. Show only human-readable information: subject, sender, date, and snippet.
- After sending an email or creating a draft, confirm the action with relevant details (recipient, subject) without exposing internal IDs.

## Confirmation Guidance

- You MUST strictly respect the `send` permission in `emailPermissionSettings` for each email address:
  - `"disallow"`: sending is NOT permitted — do not attempt to send
  - `"with_confirmation"`: call the send tool directly — the system will automatically prompt the user for confirmation before the email is sent
  - `"without_confirmation"`: send without explicit confirmation

## Gmail Rate Limit and Sync Pause Retry Policy

When a mail tool returns `isError: true` and the error details JSON includes `type: "gmail_rate_limit"` or `type: "sync_paused"`, use this policy.
In agentic workflows, rate limiting is expected. You are responsible for managing retries and continuing useful non-rate-limited work.

### Generic Retry Schedule

- Retry at most 4 times using waits of: `1m, 2m, 4m, 8m`.
- Never hot-loop retries.

### Retry Timing Rule

- For each retry round, schedule the next attempt at:
  - `max(resumeAfter, now + currentBackoff)`
- If `resumeAfter` is missing or invalid, schedule at `now + currentBackoff`.
- If `resumeAfter` exists, do not retry earlier than `resumeAfter`.
- Do not wait/block inside the current loop turn; schedule retries and continue other useful non-rate-limited work.

### Send-Tool Special Case (`mail_sending_quota`)

- This applies only to send tool calls when `type: "gmail_rate_limit"` and `rateLimitType: "mail_sending_quota"`.
- If `resumeAfter` exists, retry using the same schedule above.
- If `resumeAfter` is missing, do not retry that send call.
- Tell the user Gmail sending may be blocked for about 24 hours, and continue non-send work when possible.
- For non-send tool calls, use the normal retry guidance even if `rateLimitType` is `mail_sending_quota`.

### Classification Hints

- Primary signal source is structured fields: `type`, `rateLimitType`, `resumeAfter`.
- Do not use message-text heuristics as the primary classifier.
