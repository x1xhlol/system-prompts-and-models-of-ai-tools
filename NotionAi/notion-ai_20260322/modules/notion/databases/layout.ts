export type DatabaseLayoutFormat = {
	propertyIcons?: "show" | "hide"
	pageFullWidth?: boolean
}

export type DatabasePropertyModuleConfig = {
	style:
		| "compact"
		| "large"
		| "small"
		| "landscape"
		| "portrait"
		| "square"
		| "map"
		| "text"
}

export type DatabaseLayoutModule =
	| { type: "cover" }
	| { type: "title"; pinnedProperties?: Array<string>; propertyLabels?: "show" | "hide" }
	| { type: "properties"; variant?: "pinned" }
	| { type: "property"; property: string; config?: DatabasePropertyModuleConfig }
	| { type: "views"; relation: string }
	| { type: "editor" }
	| { type: "discussions" }
	| { type: "relations" }
	| { type: "backlinks" }
	| { type: "page_sections" }
	| { type: "bottom_controls" }

export type DatabaseSimpleLayout = {
	main: Array<DatabaseLayoutModule>
	sidebar?: Array<DatabaseLayoutModule>
	format?: DatabaseLayoutFormat
}

export type DatabaseTabbedLayout = {
	main: Array<DatabaseLayoutModule>
	tab: {
		id?: string
		modules: Array<DatabaseLayoutModule>
	}
	sidebar?: Array<DatabaseLayoutModule>
	format?: DatabaseLayoutFormat
}

export type DatabaseLayout = DatabaseSimpleLayout | DatabaseTabbedLayout