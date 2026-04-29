export type DataSourceColor = "blue" | "brown" | "default" | "gray" | "green" | "orange" | "pink" | "purple" | "red" | "yellow"

export type DataSourceSelectOption = { url?: string; name: string; description?: string; color?: DataSourceColor }

export type DataSourceSelectableNumberFormat =
	| "number" | "number_with_commas" | "percent" | "dollar" | "australian_dollar" | "canadian_dollar"
	| "singapore_dollar" | "euro" | "pound" | "yen" | "ruble" | "rupee" | "won" | "yuan" | "real"
	| "lira" | "rupiah" | "franc" | "hong_kong_dollar" | "new_zealand_dollar" | "krona"
	| "norwegian_krone" | "mexican_peso" | "rand" | "new_taiwan_dollar" | "danish_krone" | "zloty"
	| "baht" | "forint" | "koruna" | "shekel" | "chilean_peso" | "philippine_peso" | "dirham"
	| "colombian_peso" | "riyal" | "ringgit" | "leu" | "argentine_peso" | "uruguayan_peso"
	| "peruvian_sol" | "bitcoin"

export type DataSourceNumberPrecision = "precision_uncapped" | "precision_0" | "precision_1" | "precision_2" | "precision_3" | "precision_4" | "precision_5"

export type DataSourceNumberShowAs = { type: "bar" | "ring"; maxValue: number; color: DataSourceColor; showValue: boolean }

export type DataSourceDateFormat = "relative" | "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY/MM/DD" | "ll" | "MMM d" | "MMM DD, YYYY"
export type DataSourceTimeFormat = "h:mm A" | "H:mm" | "LT" | "A h:mm" | " "

export type DataSourceDateReminder = { unit: "year" | "month" | "week" | "day"; value: number; time: string; defaultTimeZone?: string }

export type CoalescedFormulaResultPropertyType = "text" | "number" | "checkbox" | "date" | "person" | "select"

export type TitleProperty = { type: "title"; name: string; description?: string }
export type TextProperty = { type: "text"; name: string; description?: string }
export type UrlProperty = { type: "url"; name: string; description?: string }
export type EmailProperty = { type: "email"; name: string; description?: string }
export type PhoneNumberProperty = { type: "phone_number"; name: string; description?: string }
export type FileProperty = { type: "file"; name: string; description?: string }
export type NumberProperty = { type: "number"; name: string; description?: string; show_as?: DataSourceNumberShowAs; number_format?: DataSourceSelectableNumberFormat; number_precision?: DataSourceNumberPrecision }
export type DateProperty = { type: "date"; name: string; description?: string; default_reminder?: DataSourceDateReminder; date_format?: DataSourceDateFormat; time_format?: DataSourceTimeFormat }
export type SelectProperty = { type: "select"; name: string; description?: string; options: Array<DataSourceSelectOption> }
export type MultiSelectProperty = { type: "multi_select"; name: string; description?: string; options: Array<DataSourceSelectOption> }
export type StatusProperty = {
	type: "status"; name: string; description?: string
	groups: { to_do?: Array<DataSourceSelectOption>; in_progress?: Array<DataSourceSelectOption>; complete?: Array<DataSourceSelectOption>; current?: Array<DataSourceSelectOption>; future?: Array<DataSourceSelectOption> }
}
export type PersonProperty = { type: "person"; name: string; description?: string; limit?: 1 }
export type RelationProperty = { type: "relation"; dataSourceUrl: string; propertyUrl?: string; name: string; description?: string; limit?: 1 }
export type CheckboxProperty = { type: "checkbox"; name: string; description?: string }
export type CreatedTimeProperty = { type: "created_time"; name: string; description?: string }
export type LastEditedTimeProperty = { type: "last_edited_time"; name: string; description?: string }
export type PlaceProperty = { type: "place"; name: string; description?: string }
export type AutoIncrementIdProperty = { type: "auto_increment_id"; name: string; description?: string }
export type FormulaProperty = { type: "formula"; name: string; description?: string; formula?: string; resultType?: CoalescedFormulaResultPropertyType }
export type LocationProperty = { type: "location"; name: string; description?: string }
export type RollupProperty = { type: "rollup"; name: string; description?: string }
export type CreatedByProperty = { type: "created_by"; name: string; description?: string }
export type LastEditedByProperty = { type: "last_edited_by"; name: string; description?: string }
export type LastVisitedTimeProperty = { type: "last_visited_time"; name: string; description?: string }
export type ButtonProperty = { type: "button"; name: string; description?: string }
export type VerificationProperty = { type: "verification"; name: string; description?: string }

export type DataSourcePropertySchema =
	| TitleProperty | TextProperty | UrlProperty | EmailProperty | PhoneNumberProperty | FileProperty
	| NumberProperty | DateProperty | SelectProperty | MultiSelectProperty | StatusProperty
	| PersonProperty | RelationProperty | CheckboxProperty | CreatedTimeProperty | LastEditedTimeProperty
	| PlaceProperty | AutoIncrementIdProperty | FormulaProperty | LocationProperty | RollupProperty
	| CreatedByProperty | LastEditedByProperty | LastVisitedTimeProperty | ButtonProperty | VerificationProperty

export type DataSourceSchema = Record<string, DataSourcePropertySchema>

export type DataSourcePageTemplate = { name: string; url: string }

export type DataSource = {
	url: string
	name: string
	icon?: string
	default_page_template?: string
	page_templates?: Array<DataSourcePageTemplate>
	schema: DataSourceSchema
}
