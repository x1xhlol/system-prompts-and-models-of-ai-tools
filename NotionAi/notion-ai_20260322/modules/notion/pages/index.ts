export type PageProperties = Record<
	string,
	string | number | boolean | string[] | null | undefined
>

export type PageParent =
	| { type: "user"; url: string }
	| { type: "page"; url: string }
	| { type: "dataSource"; url: string }
	| { type: "teamspace"; url: string }
	| { type: "agent"; url: string }

export type PageResult = {
	url: string
	parent: PageParent
	properties: PageProperties
	content: string
	icon?: string
}

export type MeetingNoteTranscriptResult = {
	meetingNoteUrl: string
	pageUrl: string
	content: string
}

/**
 * Loads a Notion page.
 *
 * @param args.url - The URL of the page to load.
 * @returns A promise resolving with the loaded PageResult.
 */
export type LoadPage = (args: { url: string }) => Promise<PageResult>

/**
 * Loads the full transcript for a meeting note.
 *
 * @param args.meetingNoteUrl - The URL of the meeting note to load.
 * @returns A promise resolving with the meeting note transcript content.
 */
export type LoadMeetingNoteTranscript = (args: {
	meetingNoteUrl: string
}) => Promise<MeetingNoteTranscriptResult>

/**
 * Creates a new Notion page.
 *
 * @param args.parent - The parent for the new page.
 *   - Supports user, page, data source, and teamspace parents.
 *   - Agent parents may appear in loaded page results, but cannot be used when creating a page.
 * @param args.icon - Optional page icon (emoji or URL). Pass `null` to unset.
 * @param args.properties - Optional properties for the new page.
 * @param args.content - Optional initial content for the new page.
 * @param args.pageTemplate - Optional template URL to duplicate into the new page (data source parent only). Cannot be combined with content.
 * @param args.asTemplate - If true, create a template page in the parent data source instead of a regular page.
 * @returns A promise resolving with the created PageResult.
 */
export type CreatePage = (args: {
	parent: PageParent
	icon?: string | null
	properties?: PageProperties
	content?: string
	pageTemplate?: string
	asTemplate?: boolean
}) => Promise<PageResult>


/**
 * Update a Notion page's properties and/or content.
 *
 * @param args.url - The URL of the page to update.
 * @param args.propertyUpdates - Optional page property upserts.
 *   - For pages in a data source, read modules/notion/databases/data-source-sqlite-tables.md first to understand property value shapes and special column naming (e.g. userDefined: and date:<Property>:start).
 *   - To clear a value, set it to `null`.
 * @param args.contentUpdates - Optional content edits.
 *   - To replace the full page content, pass exactly one content update with no `oldStr`.
 *   - For pages with existing content, use full replacement only as a last resort.
 *   - To edit a subset of the page, specify an `oldStr` to replace with your `newStr`. `oldStr` must be unique in the page unless `replaceAllMatches: true`. In general, make `oldStr` as large as needed but no larger.
 *   - Set `replaceAllMatches: true` when performing find-and-replace across the page (e.g. renaming a term, reformatting repeated patterns). Leave it false or omit it when inserting or deleting content at a specific location, where matching multiple locations would be incorrect. When false or not provided, the tool will error if multiple matches are found.
 *   - Do not pass `content`; `content` is only valid on `createPage`. For full replacement, use a single content update with only `newStr`.
 * @param args.parent - Optional new parent to move this page under.
 *   - Supports page, data source, and teamspace parents.
 *   - Agent parents may appear in loaded page results, but cannot be used as move targets.
 * @param args.icon - Optional page icon (emoji or URL). Pass `null` to unset.
 * @returns A promise resolving with the updated PageResult.
 *
 * Example of updating content (preferred):
 * ｀｀｀json
 * {
 *   "url": "notion-123",
 *   "contentUpdates": \[
 *     {
 *       "oldStr": "This is the original content.",
 *       "newStr": "This is the updated content."
 *     }
 *   \]
 * }
 * ｀｀｀
 *
 * Example of replacing full content (last resort):
 * ｀｀｀json
 * {
 *   "url": "notion-123",
 *   "contentUpdates": \[
 *     {
 *       "newStr": "# New content\\n\\nCompletely rewritten."
 *     }
 *   \]
 * }
 * ｀｀｀
 *
 * Example of updating properties:
 * ｀｀｀json
 * {
 *   "url": "notion-123",
 *   "propertyUpdates": {
 *     "title": "New Page Title"
 *     "status": "In Progress"
 *   }
 * }
 * ｀｀｀
 *
 * Example of moving a page to a new parent:
 * ｀｀｀json
 * {
 *   "url": "notion-123",
 *   "parent": { "type": "page", "url": "notion-456" }
 * }
 * ｀｀｀
 */
export type UpdatePage = (args: {
	url: string
	propertyUpdates?: PageProperties
	contentUpdates?: Array<{
		oldStr?: string
		newStr: string
		replaceAllMatches?: boolean
	}>
	parent?: PageParent
	icon?: string | null
}) => Promise<PageResult>

/**
 * Deletes Notion pages by moving them to trash.
 *
 * @param args.pageUrls - The URLs of the pages to delete.
 * @returns A promise resolving with the deleted page URLs.
 */
export type DeletePages = (args: {
	pageUrls: Array<string>
}) => Promise<{ deletedPageUrls: Array<string> }>

/**
 * Get the computed value of a formula property for a specific page in a database.
 * Returns the formula result as it would be displayed to the user.
 */
export type GetFormulaValue = (args: {
	pageUrl: string
	propertyName: string
}) => Promise<string | number | boolean | null>
