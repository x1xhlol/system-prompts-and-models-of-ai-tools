import { ClientOptions, RequestOptions } from '@algolia/client-common';
import { Region as Region$2, RegionOptions as RegionOptions$2, AbtestingV3Client } from '@algolia/abtesting';
export * from '@algolia/abtesting';
export { Region as AbtestingV3Region, RegionOptions as AbtestingV3RegionOptions } from '@algolia/abtesting';
import { Region as Region$1, RegionOptions as RegionOptions$1, AbtestingClient } from '@algolia/client-abtesting';
export * from '@algolia/client-abtesting';
export { ABTest, ABTestConfiguration, ABTestResponse, AbTestsVariant, AbTestsVariantSearchParams, Region as AbtestingRegion, RegionOptions as AbtestingRegionOptions, AddABTestsRequest, AddABTestsVariant, CustomSearchParams, DeleteABTestProps, EffectMetric, EmptySearchFilter, EstimateABTestRequest, EstimateABTestResponse, EstimateConfiguration, FilterEffects, GetABTestProps, ListABTestsProps, ListABTestsResponse, MinimumDetectableEffect, OutliersFilter, ScheduleABTestResponse, ScheduleABTestsRequest, Status, StopABTestProps, Variant } from '@algolia/client-abtesting';
import { Region as Region$3, RegionOptions as RegionOptions$3, AnalyticsClient } from '@algolia/client-analytics';
export * from '@algolia/client-analytics';
export { Region as AnalyticsRegion, RegionOptions as AnalyticsRegionOptions, Direction } from '@algolia/client-analytics';
import { Region as Region$5, RegionOptions as RegionOptions$5, InsightsClient } from '@algolia/client-insights';
export * from '@algolia/client-insights';
export { Region as InsightsRegion, RegionOptions as InsightsRegionOptions } from '@algolia/client-insights';
import { Region as Region$6, RegionOptions as RegionOptions$6, PersonalizationClient } from '@algolia/client-personalization';
export * from '@algolia/client-personalization';
export { EventType, Region as PersonalizationRegion, RegionOptions as PersonalizationRegionOptions } from '@algolia/client-personalization';
import { Region as Region$7, RegionOptions as RegionOptions$7, QuerySuggestionsClient } from '@algolia/client-query-suggestions';
export * from '@algolia/client-query-suggestions';
export { Region as QuerySuggestionsRegion, RegionOptions as QuerySuggestionsRegionOptions } from '@algolia/client-query-suggestions';
import { SearchClient, SaveObjectsOptions, PartialUpdateObjectsOptions, ReplaceAllObjectsOptions, ReplaceAllObjectsWithTransformationResponse } from '@algolia/client-search';
export * from '@algolia/client-search';
export { Action, AdvancedSyntaxFeatures, AlternativesAsExact, Anchoring, AroundPrecision, AroundRadius, AroundRadiusAll, AutomaticFacetFilter, AutomaticFacetFilters, Banner, BannerImage, BannerImageUrl, BannerLink, BaseIndexSettings, BaseSearchParams, BaseSearchParamsWithoutQuery, BaseSearchResponse, BooleanString, Condition, Consequence, ConsequenceHide, ConsequenceParams, ConsequenceQuery, ConsequenceQueryObject, CustomDeleteProps, CustomGetProps, CustomPostProps, CustomPutProps, DeleteSourceProps, DeletedAtResponse, Distinct, Edit, EditType, ErrorBase, ExactOnSingleWordQuery, Exhaustive, FacetFilters, FacetHits, FacetOrdering, FacetStats, Facets, GetTaskProps, HighlightResult, HighlightResultOption, Hit, IgnorePlurals, IndexSettingsAsSearchParams, InsideBoundingBox, Languages, MatchLevel, MatchedGeoLocation, Mode, NumericFilters, OptionalFilters, OptionalWords, Params, Personalization, Promote, PromoteObjectID, PromoteObjectIDs, QueryType, Range, RankingInfo, ReRankingApplyFilter, Redirect, RedirectRuleIndexData, RedirectRuleIndexMetadata, RedirectURL, RemoveStopWords, RemoveWordsIfNoResults, RenderingContent, SearchForFacetValuesProps, SearchForFacetValuesRequest, SearchForFacetValuesResponse, SearchHits, SearchPagination, SearchParams, SearchParamsObject, SearchParamsQuery, SearchResponse, SemanticSearch, SnippetResult, SnippetResultOption, SortRemainingBy, Source, SupportedLanguage, TagFilters, TaskStatus, TimeRange, TypoTolerance, TypoToleranceEnum, Value, Widgets, apiClientVersion } from '@algolia/client-search';
import { Region as Region$4, RegionOptions as RegionOptions$4, IngestionClient, WatchResponse } from '@algolia/ingestion';
export * from '@algolia/ingestion';
export { Event, EventStatus, Region as IngestionRegion, RegionOptions as IngestionRegionOptions, WatchResponse } from '@algolia/ingestion';
import { MonitoringClient } from '@algolia/monitoring';
export * from '@algolia/monitoring';
import { RecommendClient } from '@algolia/recommend';
export * from '@algolia/recommend';

type Region = Region$1 | Region$2 | Region$3 | Region$4 | Region$5 | Region$6 | Region$7;
type RegionOptions = RegionOptions$1 | RegionOptions$2 | RegionOptions$3 | RegionOptions$4 | RegionOptions$5 | RegionOptions$6 | RegionOptions$7;

/**
 * Options forwarded to the client initialized via the `init` method.
 */
type InitClientOptions = Partial<{
    /**
     * App to target with the initialized client, defaults to the `algoliasearch` appId.
     */
    appId: string;
    /**
     * API key of the targeted app ID, defaults to the `algoliasearch` apiKey.
     */
    apiKey: string;
    options: ClientOptions;
}>;

type Algoliasearch = SearchClient & {
    initAbtesting: (initOptions: InitClientOptions & RegionOptions$1) => AbtestingClient;
    initAbtestingV3: (initOptions: InitClientOptions & RegionOptions$2) => AbtestingV3Client;
    initAnalytics: (initOptions: InitClientOptions & RegionOptions$3) => AnalyticsClient;
    initIngestion: (initOptions: InitClientOptions & RegionOptions$4) => IngestionClient;
    initInsights: (initOptions: InitClientOptions & RegionOptions$5) => InsightsClient;
    initMonitoring: (initOptions?: InitClientOptions) => MonitoringClient;
    initPersonalization: (initOptions: InitClientOptions & RegionOptions$6) => PersonalizationClient;
    initQuerySuggestions: (initOptions: InitClientOptions & RegionOptions$7) => QuerySuggestionsClient;
    initRecommend: (initOptions?: InitClientOptions) => RecommendClient;
    /**
     * Helper: Similar to the `saveObjects` method but requires a Push connector (https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/connectors/push/) to be created first, in order to transform records before indexing them to Algolia. The `region` must have been passed to the client instantiation method.
     *
     * @summary Save objects to an Algolia index by leveraging the Transformation pipeline setup using the Push connector (https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/connectors/push/).
     * @param saveObjects - The `saveObjects` object.
     * @param saveObjects.indexName - The `indexName` to save `objects` in.
     * @param saveObjects.objects - The array of `objects` to store in the given Algolia `indexName`.
     * @param saveObjects.batchSize - The size of the chunk of `objects`. The number of `batch` calls will be equal to `length(objects) / batchSize`. Defaults to 1000.
     * @param saveObjects.waitForTasks - Whether or not we should wait until every `batch` tasks has been processed, this operation may slow the total execution time of this method but is more reliable.
     * @param requestOptions - The requestOptions to send along with the query, they will be forwarded to the `push` method and merged with the transporter requestOptions.
     */
    saveObjectsWithTransformation: (options: SaveObjectsOptions, requestOptions?: RequestOptions | undefined) => Promise<Array<WatchResponse>>;
    /**
     * Helper: Similar to the `partialUpdateObjects` method but requires a Push connector (https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/connectors/push/) to be created first, in order to transform records before indexing them to Algolia. The `region` must have been passed to the client instantiation method.
     *
     * @summary Save objects to an Algolia index by leveraging the Transformation pipeline setup in the Push connector (https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/connectors/push/).
     * @param partialUpdateObjects - The `partialUpdateObjects` object.
     * @param partialUpdateObjects.indexName - The `indexName` to update `objects` in.
     * @param partialUpdateObjects.objects - The array of `objects` to update in the given Algolia `indexName`.
     * @param partialUpdateObjects.createIfNotExists - To be provided if non-existing objects are passed, otherwise, the call will fail..
     * @param partialUpdateObjects.batchSize - The size of the chunk of `objects`. The number of `batch` calls will be equal to `length(objects) / batchSize`. Defaults to 1000.
     * @param partialUpdateObjects.waitForTasks - Whether or not we should wait until every `batch` tasks has been processed, this operation may slow the total execution time of this method but is more reliable.
     * @param requestOptions - The requestOptions to send along with the query, they will be forwarded to the `push` method and merged with the transporter requestOptions.
     */
    partialUpdateObjectsWithTransformation: (options: PartialUpdateObjectsOptions, requestOptions?: RequestOptions | undefined) => Promise<Array<WatchResponse>>;
    /**
     * Helper: Similar to the `replaceAllObjects` method but requires a Push connector (https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/connectors/push/) to be created first, in order to transform records before indexing them to Algolia. The `region` must have been passed to the client instantiation method.
     *
     * @summary Helper: Replaces all objects (records) in the given `index_name` by leveraging the Transformation pipeline setup in the Push connector (https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/connectors/push/) with the given `objects`. A temporary index is created during this process in order to backup your data.
     * @param replaceAllObjects - The `replaceAllObjects` object.
     * @param replaceAllObjects.indexName - The `indexName` to replace `objects` in.
     * @param replaceAllObjects.objects - The array of `objects` to store in the given Algolia `indexName`.
     * @param replaceAllObjects.batchSize - The size of the chunk of `objects`. The number of `batch` calls will be equal to `objects.length / batchSize`. Defaults to 1000.
     * @param replaceAllObjects.scopes - The `scopes` to keep from the index. Defaults to ['settings', 'rules', 'synonyms'].
     * @param requestOptions - The requestOptions to send along with the query, they will be forwarded to the `push`, `operationIndex` and `getEvent` method and merged with the transporter requestOptions.
     */
    replaceAllObjectsWithTransformation: (options: ReplaceAllObjectsOptions, requestOptions?: RequestOptions | undefined) => Promise<ReplaceAllObjectsWithTransformationResponse>;
};
type TransformationOptions = {
    transformation?: {
        region: Region$4;
    } | undefined;
};
declare function algoliasearch(appId: string, apiKey: string, options?: (ClientOptions & TransformationOptions) | undefined): Algoliasearch;

export { type Algoliasearch, type InitClientOptions, type Region, type RegionOptions, type TransformationOptions, algoliasearch };
