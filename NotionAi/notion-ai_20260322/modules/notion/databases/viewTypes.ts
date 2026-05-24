// Views reference data sources by compressed URL or CREATE-* identifier.
// Views reference properties by name (e.g. groupBy.property, calendarBy, timelineBy, mapBy, displayProperties).
// For formula properties in chart aggregations or groupBy, use the formula's resultType as the propertyType.
// If the user asks for a "pie chart", use type "donut".

export type CoverFormat = { type: "page_cover" } | { type: "page_content" } | { type: "file_property"; fileProperty: string }
export type ViewSorts = Array<{ property: string; direction: "ascending" | "descending" }>

export type GroupByBase = { property: string; hideEmptyGroups?: boolean; disableBoardColorColumns?: boolean }
export type GroupByTextLike = GroupByBase & { propertyType: "title" | "text" | "url" | "email" | "phone_number"; groupBy: "exact" | "alphabet_prefix"; sort: { type: "manual" } | { type: "ascending" } | { type: "descending" } }
export type GroupByNumber = GroupByBase & { propertyType: "number"; groupBy?: { type: "unique"; start?: number; end?: number }; start: number; end: number; size: number; sort: { type: "ascending" } | { type: "descending" } }
export type GroupByDate = GroupByBase & { propertyType: "date" | "created_time" | "last_edited_time"; groupBy: "relative" | "day" | "week" | "month" | "year"; sort: { type: "ascending" } | { type: "descending" }; startDayOfWeek?: 0 | 1 }
export type GroupBySelect = GroupByBase & { propertyType: "select" | "multi_select"; sort: { type: "manual" } | { type: "ascending" } | { type: "descending" } }
export type GroupByStatus = GroupByBase & { propertyType: "status"; groupBy: "group" | "option"; sort: { type: "manual" } | { type: "ascending" } | { type: "descending" } }
export type GroupByPerson = GroupByBase & { propertyType: "person"; sort: { type: "manual" } }
export type GroupByRelation = GroupByBase & { propertyType: "relation"; sort: { type: "manual" } | { type: "ascending" } | { type: "descending" } }
export type GroupByCheckbox = GroupByBase & { propertyType: "checkbox"; sort: { type: "manual" } }
export type GroupBy = GroupByTextLike | GroupByNumber | GroupByDate | GroupBySelect | GroupByStatus | GroupByPerson | GroupByRelation | GroupByCheckbox

export type ViewFilter = { type: "group"; operator: "and" | "or"; filters: Array<PropertyFilter | ViewFilter> }
export type CardLayoutMode = "default" | "compact"
export type SeriesFormat = { displayType: "line" | "column" | "bar" }

export type ChartAggregation =
	| { aggregator: "count"; property?: string; enforceMaxAggregationLimit?: boolean }
	| { aggregator: "count_values" | "unique" | "empty" | "not_empty" | "percent_empty" | "percent_not_empty" | "show_unique" | "checked" | "unchecked" | "percent_checked" | "percent_unchecked" | "sum" | "average" | "median" | "min" | "max" | "range" | "earliest_date" | "latest_date" | "date_range"; property: string; enforceMaxAggregationLimit?: boolean }
	| { aggregator: { operator: "count_per_group" | "percent_per_group"; groupName: string }; property: string; enforceMaxAggregationLimit?: boolean }

export type AxisGroupedDataConfig = { type: "groups_reducer"; groupBy: GroupBy; aggregationConfig: { seriesFormat: SeriesFormat; aggregation: ChartAggregation; stackOptions?: { groupBy: GroupBy } } }
export type AxisResultsDataConfig = { type: "results_reducer"; nameProperty: string; valueProperty: string; valueSeriesFormat: SeriesFormat }
export type AxisDataConfig = AxisGroupedDataConfig | AxisResultsDataConfig
export type DonutGroupedDataConfig = { type: "groups_reducer"; groupBy: GroupBy; aggregationConfig: { aggregation: ChartAggregation } }
export type DonutResultsDataConfig = { type: "results_reducer"; nameProperty: string; valueProperty: string }
export type DonutDataConfig = DonutGroupedDataConfig | DonutResultsDataConfig
export type NumberDataConfig = { type: "number_reducer"; aggregationConfig: { aggregation: ChartAggregation } }

export type ChartFormatBase = { hideLegend?: boolean; showCaption?: boolean; caption?: string; colorTheme?: "gray" | "blue" | "yellow" | "green" | "purple" | "teal" | "orange" | "pink" | "red" | "auto" | "colorful"; height?: "small" | "medium" | "large" | "extra_large"; weightColorValue?: boolean; valueLabel?: string; mainSort?: "manual" | "results-advanced" | "y-ascending" | "y-descending" | "x-ascending" | "x-descending"; numberPrecisionOverride?: string; numberFormatOverride?: string; hideNegativeValues?: boolean }
export type AxisChartFormat = ChartFormatBase & { axisLabel?: "none" | "x_axis" | "y_axis" | "both"; axisGridLine?: "none" | "horizontal" | "vertical" | "both"; axisHideEmptyGroups?: boolean; axisCumulative?: boolean; axisShowDataLabels?: boolean; axisAvatar?: "avatar" | "avatar_name" | "name"; axisGroupStyle?: "normal" | "percent" | "side_by_side"; yAxisMin?: number; yAxisMax?: number; hideLineFillArea?: boolean; smoothLine?: boolean }
export type DonutChartFormat = ChartFormatBase & { donutHideValue?: boolean; donutDataLabels?: "none" | "value" | "name" | "name_and_value" }
export type AxisChartConfig = { type: "column" | "bar" | "line"; dataConfig: AxisDataConfig; chartFormat?: AxisChartFormat }
export type DonutChartConfig = { type: "donut"; dataConfig: DonutDataConfig; chartFormat?: DonutChartFormat }
export type NumberChartFormat = ChartFormatBase & { hideTitle?: boolean; numberColor?: string; numberConditionalColor?: { rules: Array<{ id: string; operator: string; value: number; color?: string }>; elseColor?: string } }
export type NumberChartConfig = { type: "number"; dataConfig: NumberDataConfig; chartFormat?: NumberChartFormat }
export type ChartConfig = AxisChartConfig | DonutChartConfig | NumberChartConfig

export type TableView = { type: "table"; name: string; dataSourceUrl: string; defaultPageTemplate?: string; displayProperties?: Array<string>; simpleFilters?: Array<PropertySimpleFilter>; groupBy?: GroupBy; advancedFilter?: ViewFilter; sorts?: ViewSorts }
export type BoardView = { type: "board"; name: string; dataSourceUrl: string; defaultPageTemplate?: string; groupBy?: GroupBy; displayProperties?: Array<string>; fullWidthProperties?: Array<string>; simpleFilters?: Array<PropertySimpleFilter>; subGroupBy?: GroupBy; advancedFilter?: ViewFilter; sorts?: ViewSorts; cover?: CoverFormat; cardSize?: "small" | "medium" | "large"; coverAspect?: "contain" | "cover"; cardLayoutMode?: CardLayoutMode }
export type CalendarView = { type: "calendar"; name: string; dataSourceUrl: string; defaultPageTemplate?: string; displayProperties?: Array<string>; simpleFilters?: Array<PropertySimpleFilter>; calendarBy?: string; advancedFilter?: ViewFilter; sorts?: ViewSorts; viewRange?: { start?: string; end?: string }; showWeekends?: boolean }
export type ListView = { type: "list"; name: string; dataSourceUrl: string; defaultPageTemplate?: string; displayProperties?: Array<string>; simpleFilters?: Array<PropertySimpleFilter>; groupBy?: GroupBy; advancedFilter?: ViewFilter; sorts?: ViewSorts }
export type GalleryView = { type: "gallery"; name: string; dataSourceUrl: string; defaultPageTemplate?: string; displayProperties?: Array<string>; fullWidthProperties?: Array<string>; simpleFilters?: Array<PropertySimpleFilter>; groupBy?: GroupBy; advancedFilter?: ViewFilter; sorts?: ViewSorts; cover?: CoverFormat; cardSize?: "small" | "medium" | "large"; coverAspect?: "contain" | "cover"; cardLayoutMode?: CardLayoutMode }
export type TimelineView = { type: "timeline"; name: string; dataSourceUrl: string; defaultPageTemplate?: string; timelineBy?: string; timelineByEnd?: string; displayProperties?: Array<string>; simpleFilters?: Array<PropertySimpleFilter>; groupBy?: GroupBy; advancedFilter?: ViewFilter; sorts?: ViewSorts; showTable?: boolean }
export type ChartView = { type: "chart"; name: string; dataSourceUrl: string; chartConfig: ChartConfig; simpleFilters?: Array<PropertySimpleFilter>; advancedFilter?: ViewFilter }
export type DashboardView = { type: "dashboard"; name: string; rows: Array<{ id: string; widgets: Array<{ id: string; viewUrl?: string; view: View }>; height?: number }> }
export type FormEditorView = { type: "form_editor"; name: string; dataSourceUrl: string; title?: string; description?: string; questions: Array<{ property: string; name?: string; description?: string; required?: boolean; hasConditionalLogic?: boolean }>; icon?: string; hasConditionalLogic?: boolean }
export type MapView = { type: "map"; name: string; dataSourceUrl: string; defaultPageTemplate?: string; mapBy: string }

export type View = TableView | BoardView | CalendarView | ListView | GalleryView | TimelineView | ChartView | DashboardView | FormEditorView | MapView

export const collectionViewTypes: Array<View["type"]> = ["table", "board", "calendar", "list", "gallery", "timeline", "chart", "form_editor", "map", "dashboard"]

export type FormulaFilter = { type: "property"; property: string; propertyType: "formula"; operator?: "any" | "none" | "every"; resultFilter: PropertyFilter }
export type EmptyFilter = { type: "property"; property: string; propertyType: "title" | "text" | "url" | "email" | "phone_number" | "number" | "date" | "created_time" | "last_edited_time" | "select" | "multi_select" | "relation" | "file" | "status" | "person"; operator: "is_empty" | "is_not_empty" }
export type TextFilter = { type: "property"; property: string; propertyType: "title" | "text" | "url" | "email" | "phone_number"; operator: "string_is" | "string_is_not" | "string_contains" | "string_does_not_contain" | "string_starts_with" | "string_ends_with"; value: { type: "exact"; value: string | undefined } }
export type NumberFilter = { type: "property"; property: string; propertyType: "number"; operator: "number_equals" | "number_does_not_equal" | "number_greater_than" | "number_less_than" | "number_greater_than_or_equal_to" | "number_less_than_or_equal_to"; value: { type: "exact"; value: number | undefined } }
export type DateFilter = { type: "property"; property: string; propertyType: "date" | "created_time" | "last_edited_time"; operator: "date_is" | "date_is_before" | "date_is_after" | "date_is_on_or_before" | "date_is_on_or_after"; value: { type: "relative"; value: "today" | "tomorrow" | "yesterday" | "one_week_ago" | "one_week_from_now" | "one_month_ago" | "one_month_from_now" } | { type: "exact"; value: string | undefined }; use_end?: boolean }
export type SelectFilter = { type: "property"; property: string; propertyType: "select"; operator: "enum_is" | "enum_is_not"; value: { type: "exact"; value: string | undefined } | Array<{ type: "exact"; value: string | undefined }> }
export type MultiSelectFilter = { type: "property"; property: string; propertyType: "multi_select"; operator: "enum_contains" | "enum_does_not_contain"; value: { type: "exact"; value: string | undefined } | Array<{ type: "exact"; value: string | undefined }> }
export type CheckboxFilter = { type: "property"; property: string; propertyType: "checkbox"; operator: "checkbox_is" | "checkbox_is_not"; value: { type: "exact"; value: boolean | undefined } }
export type RelationFilter = { type: "property"; property: string; propertyType: "relation"; operator: "relation_contains" | "relation_does_not_contain"; value: { type: "exact"; value: string | undefined } | Array<{ type: "exact"; value: string | undefined }> }
export type StatusFilter = { type: "property"; property: string; propertyType: "status"; operator: "status_is" | "status_is_not"; value: { type: "is_group" | "is_option"; value: string | undefined } | Array<{ type: "is_group" | "is_option"; value: string | undefined }> }
export type PersonFilter = { type: "property"; property: string; propertyType: "person"; operator: "person_contains" | "person_does_not_contain"; value: { type: "exact"; value: string | undefined } | { type: "relative"; value: "me" } | Array<{ type: "exact"; value: string | undefined } | { type: "relative"; value: "me" }> }

export type PropertyFilter = TextFilter | NumberFilter | DateFilter | SelectFilter | MultiSelectFilter | CheckboxFilter | RelationFilter | StatusFilter | PersonFilter | EmptyFilter | FormulaFilter
export type PropertySimpleFilter = { id?: string; filter: PropertyFilter }
