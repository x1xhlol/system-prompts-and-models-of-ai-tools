export type BoxSearchInput = {
	question: string
	keywords: string
	lookback?: string
}

export type BoxSearchResultItem = {
	id: string
	type: "box"
	title: string
	path: string
	text: string
	lastEdited: string
	isPrivate: boolean
	pageId: string
	fileType: string
	fileId: string
}

export type BoxSearchResult = {
	results: Array<BoxSearchResultItem>
}

/*
Search Box files via the connected Box search connector.
*/
export type BoxSearch = (args: BoxSearchInput) => Promise<BoxSearchResult>

export type BoxLoadFileInput = {
	fileId: string
}

export type BoxLoadFileResult = {
	type: "box-file"
	title: string
	blocks: string[]
	fileId: string
}

/*
Load a Box file by its file ID. Use fileId from search results.
*/
export type BoxLoadFile = (args: BoxLoadFileInput) => Promise<BoxLoadFileResult>

export type BoxFindSharedItemInput = {
	sharedLink: string
}

export type BoxFindSharedItemResult = {
	itemId: string
	itemType: "file" | "folder"
	name: string
	size: number
	modifiedAt: string
	owner: string
}

/*
Resolve a Box shared link URL (e.g. https://app.box.com/s/...) to an item ID, type, and name.
*/
export type BoxFindSharedItem = (args: BoxFindSharedItemInput) => Promise<BoxFindSharedItemResult>

export type Module = {
	search: BoxSearch
	loadFile: BoxLoadFile
	findSharedItem: BoxFindSharedItem
}

export type {
	BoxIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"