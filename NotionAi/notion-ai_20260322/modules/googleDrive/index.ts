export type GoogleDriveSearchInput = {
	question: string
	keywords: string
	lookback?: string
	sharedDriveIds?: string[]
}

export type GoogleDriveSearchResultItem = {
	id: string
	type: "google-drive"
	title: string
	path: string
	text: string
	lastEdited: string
	isPrivate: boolean
	pageId: string
	fileType: string
}

export type GoogleDriveSearchResult = {
	results: Array<GoogleDriveSearchResultItem>
}

export type GoogleDriveLoadFileInput = {
	fileId: string
	sharedDriveIds?: string[]
	includeComments?: boolean
}

export type GoogleDriveLoadFileResult = Record<string, unknown>

export type GoogleDriveLsFolderInput = {
	folderId: string
	sharedDriveIds?: string[]
}

export type GoogleDriveLsFolderResult = Record<string, unknown>

export type GoogleDriveGrepFilesInput = {
	query: string
	maxResults?: number
	sharedDriveIds?: string[]
}

export type GoogleDriveGrepFilesResult = Record<string, unknown>

export type GoogleDriveGetFileCommentsInput = {
	fileId: string
	sharedDriveIds?: string[]
}

export type GoogleDriveGetFileCommentsResult = Array<{
	author: string
	bodyText: string
	lastEdited: string
}>
/*
Search Google Drive files via the connected Google Drive search connector.
*/
export type GoogleDriveSearch = (
	args: GoogleDriveSearchInput,
) => Promise<GoogleDriveSearchResult>

/*
Load a Google Drive file by ID.
*/
export type GoogleDriveLoadFile = (
	args: GoogleDriveLoadFileInput,
) => Promise<GoogleDriveLoadFileResult>

/*
List files in a Google Drive folder.
*/
export type GoogleDriveLsFolder = (
	args: GoogleDriveLsFolderInput,
) => Promise<GoogleDriveLsFolderResult>

/*
Search Google Drive files by matching against title and file content.
*/
export type GoogleDriveGrepFiles = (
	args: GoogleDriveGrepFilesInput,
) => Promise<GoogleDriveGrepFilesResult>

/*
Get comments for a Google Drive file by ID.
*/
export type GoogleDriveGetFileComments = (
	args: GoogleDriveGetFileCommentsInput,
) => Promise<GoogleDriveGetFileCommentsResult>

export type Module = {
	search: GoogleDriveSearch
	loadFile: GoogleDriveLoadFile
	lsFolder: GoogleDriveLsFolder
	grepFiles: GoogleDriveGrepFiles
	getFileComments: GoogleDriveGetFileComments
}

export type {
	GoogleDriveIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"
