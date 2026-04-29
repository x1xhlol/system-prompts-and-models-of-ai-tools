/* <description>Search Notion content by keywords and optional filters, returning the most relevant results with metadata.</description> */

/*
	Search Notion content.
	Usage:
		Search({ keywords: "project kickoff" })
		Search({ created_by_urls: ["user://abc", "user://def"] })
		Search({ keywords: "meeting notes", created_by_urls: ["user://abc"] })
		Search({ keywords: "design docs", sort: "created" })

	Guidelines:
		- Retrieval quality is better when using a small number of keywords.
		- This function uses hybrid search (bm25 + semantic), so it handles variants (e.g. "agent" matches "agents") and semantic similarity automatically. Do NOT make separate calls for singular/plural or minor keyword variations of the same concept.
		- Only split into multiple parallel calls when searching for genuinely distinct topics (e.g. "Q1 roadmap" and "engineering hiring").
		- You can filter results by creator using created_by_urls with an array of user URLs.
		- You can use filters with or without keywords.
		- Sort options: "relevance" (default), "lastEdited", or "created".
*/
export type Search = (args: {
	keywords?: string;
	created_by_urls?: Array<string>;
	sort?: "relevance" | "lastEdited" | "created" }) =>
Promise<{
	results: Array<{
		id: string
		title?: string
		url?: string
		icon?: string
		type?: string
		createdTime?: string
		lastEditedTime?: string
		path?: Array<{
			title: string
			url?: string
		}>
		highlight?: {
			text?: string
			pathText?: string
			title?: string
			collectionText?: string
			uniqueId?: string
		}
	}>
}>
