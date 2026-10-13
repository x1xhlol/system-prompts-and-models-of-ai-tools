export type GithubSearchInput = {
	question: string
	keywords: string
	lookback?: string
	options?: {
		repo?: string
		fileType?: "code" | "issue" | "pull-request"
	}
}

export type GithubSearchResultItem = {
	id: string
	type: "github"
	title: string
	path: string
	text: string
	lastEdited: string
	authorName?: string
	statusTag?: string
	githubRepoName?: string
	fileType?: string
	isPrivate: boolean
	pageId: string
}

export type GithubSearchResult = {
	results: Array<GithubSearchResultItem>
}

export type GithubLoadPRInput = {
	/** Repository in the form "org/repo" (for example, "notionhq/notion"). */
	repoName: string
	prNumber: string
}

export type GithubLoadIssueInput = {
	/** Repository in the form "org/repo" (for example, "notionhq/notion"). */
	repoName: string
	issueNumber: string
}

export type GithubLoadCommitInput = {
	/** Repository in the form "org/repo" (for example, "notionhq/notion"). */
	repoName: string
	commitSha: string
}

export type GithubLoadFileInput = {
	/** Repository in the form "org/repo" (for example, "notionhq/notion"). */
	repoName: string
	path: string
	ref?: string
	lineNumbers?: string
}

export type GithubGrepCodeInput = {
	query: string
}

export type GithubLsDirectoryInput = {
	directory: string
	/** Optional repository in the form "org/repo" (for example, "notionhq/notion"). */
	repoName?: string
}

export type GithubLoadResult = Record<string, unknown>
/*
Search Github issues, pull requests, and code via the connected Github search connector.
*/
export type GithubSearch = (
	args: GithubSearchInput,
) => Promise<GithubSearchResult>

/*
Grep in Github code via the connected Github connector.
*/
export type GithubGrepCode = (
	args: GithubGrepCodeInput,
) => Promise<GithubLoadResult>

/*
List files in a Github repository directory.
*/
export type GithubLsDirectory = (
	args: GithubLsDirectoryInput,
) => Promise<GithubLoadResult>

export type GithubLoadPR = (
	args: GithubLoadPRInput,
) => Promise<GithubLoadResult>

export type GithubLoadIssue = (
	args: GithubLoadIssueInput,
) => Promise<GithubLoadResult>

export type GithubLoadCommit = (
	args: GithubLoadCommitInput,
) => Promise<GithubLoadResult>

export type GithubLoadFile = (
	args: GithubLoadFileInput,
) => Promise<GithubLoadResult>

export type Module = {
	search: GithubSearch
	grepCode: GithubGrepCode
	lsDirectory: GithubLsDirectory
	loadPR: GithubLoadPR
	loadIssue: GithubLoadIssue
	loadCommit: GithubLoadCommit
	loadFile: GithubLoadFile
}

export type {
	GithubIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"
