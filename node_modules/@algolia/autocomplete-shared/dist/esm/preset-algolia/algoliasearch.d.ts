import * as ClientSearch from '@algolia/client-search';
import type * as AlgoliaSearch from 'algoliasearch/lite';
declare type AnyToUnknown<TSubject> = (0 extends 1 & TSubject ? true : false) extends true ? unknown : TSubject;
declare type SearchClientShape = {
    search: unknown;
};
declare type ClientLiteV5 = AnyToUnknown<
/** @ts-ignore */
ReturnType<typeof AlgoliaSearch.liteClient>>;
declare type ClientSearchV5 = AnyToUnknown<
/** @ts-ignore */
ReturnType<typeof ClientSearch.searchClient>>;
declare type ClientV5 = ClientLiteV5 extends SearchClientShape ? ClientLiteV5 : ClientSearchV5 extends SearchClientShape ? ClientSearchV5 : unknown;
declare type PickForClient<TMapping extends {
    v4: unknown;
    v5: unknown;
}> = ClientV5 extends SearchClientShape ? TMapping['v5'] : TMapping['v4'];
export declare type SearchClient = PickForClient<{
    /** @ts-ignore */
    v4: AlgoliaSearch.SearchClient;
    /** @ts-ignore */
    v5: ClientV5;
}>;
export declare type MultipleQueriesQuery = PickForClient<{
    /** @ts-ignore */
    v4: ClientSearch.MultipleQueriesQuery;
    /** @ts-ignore */
    v5: AlgoliaSearch.LegacySearchMethodProps[number];
}>;
export declare type SearchForFacetValuesResponse = PickForClient<{
    /** @ts-ignore */
    v4: ClientSearch.SearchForFacetValuesResponse;
    /** @ts-ignore */
    v5: AlgoliaSearch.SearchForFacetValuesResponse;
}>;
export declare type SearchResponse<THit> = PickForClient<{
    /** @ts-ignore */
    v4: ClientSearch.SearchResponse<THit>;
    /** @ts-ignore */
    v5: AlgoliaSearch.SearchResponse<THit>;
}>;
export declare type HighlightResult<THit> = PickForClient<{
    /** @ts-ignore */
    v4: ClientSearch.HighlightResult<THit>;
    /** @ts-ignore */
    v5: AlgoliaSearch.HighlightResult;
}>;
export declare type SnippetResult<THit> = PickForClient<{
    /** @ts-ignore */
    v4: ClientSearch.SnippetResult<THit>;
    /** @ts-ignore */
    v5: AlgoliaSearch.SnippetResult;
}>;
export declare type FacetHit = PickForClient<{
    /** @ts-ignore */
    v4: ClientSearch.FacetHit;
    /** @ts-ignore */
    v5: AlgoliaSearch.FacetHits;
}>;
export {};
