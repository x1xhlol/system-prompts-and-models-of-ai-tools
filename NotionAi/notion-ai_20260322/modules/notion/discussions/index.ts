import type { NotionComment, NotionDiscussion } from "./triggers"

export type GetPageDiscussions = (args: {
	pageUrl: string
	includeResolved?: boolean
}) => Promise<Array<NotionDiscussion>>

export type AddCommentToDiscussion = (args: {
	discussionUrl: string
	text: string
	attachedFileIds?: Array<string>
}) => Promise<NotionComment>
