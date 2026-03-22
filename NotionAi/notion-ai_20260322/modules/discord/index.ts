export type DiscordSearchInput = {
	question: string
	keywords: string
	lookback?: string
}

export type DiscordSearchResultItem = {
	id: string
	type: "discord"
	title: string
	path: string
	text: string
	lastEdited: string
	isPrivate: boolean
}

export type DiscordSearchResult = {
	results: Array<DiscordSearchResultItem>
}

export type DiscordSearch = (args: DiscordSearchInput) => Promise<DiscordSearchResult>

export type Module = {
	search: DiscordSearch
}

export type {
	DiscordIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"