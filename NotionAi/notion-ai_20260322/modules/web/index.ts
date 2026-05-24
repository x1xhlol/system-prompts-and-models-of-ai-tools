export type WebSearchCategory =
	| "company"
	| "research paper"
	| "news"
	| "pdf"
	| "github"
	| "tweet"
	| "personal site"
	| "linkedin profile"
	| "financial report"

export type WebSearchInput = {
	queries: string[]
	category?: WebSearchCategory
	includeDomains?: string[]
	excludeDomains?: string[]
	includeText?: string[]
	excludeText?: string[]
}

export type WebSearchResult = {
	url: string
	title: string
	text: string
	lastEdited?: string
	score?: number
	favicon?: string
}

export type WebSearchOutput = {
	results: Array<Array<WebSearchResult>>
}

export type WebLoadPageInput = {
	url: string
	fast_mode?: boolean
	include_full_content?: boolean
	queries?: string[]
	line_start?: number
}

export type WebPage = {
	url: string
	title: string | null
	text?: string
	summary?: string
	publishedDate?: string
	score: number
	highlights?: string[]
	includedLineCount: number
	totalLineCount: number
	isTruncated: boolean
	startLine: number
	endLine: number
}

export type Search = (args: WebSearchInput) => Promise<WebSearchOutput>

export type LoadPage = (args: WebLoadPageInput) => Promise<WebPage>

export type Module = {
	search: Search
	loadPage: LoadPage
}

// Permissions
export type {
	ModulePermissions,
	ModuleState,
	WebIntegration,
	WebModulePermissionAiConfigurable,
} from "./integration"
