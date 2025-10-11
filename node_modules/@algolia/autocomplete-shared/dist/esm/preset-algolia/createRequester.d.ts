import type { SearchResponse } from '../SearchResponse';
import { UserAgent } from '../UserAgent';
import { MultipleQueriesQuery, SearchClient, SearchForFacetValuesResponse } from './algoliasearch';
export interface SearchParams {
    /**
     * The initialized Algolia search client.
     */
    searchClient: SearchClient;
    /**
     * A list of queries to execute.
     */
    queries: MultipleQueriesQuery[];
    /**
     * A list of user agents to add to the search client.
     *
     * This is useful to track usage of an integration.
     */
    userAgents?: UserAgent[];
}
export declare type Fetcher = <TRecord>({ searchClient, queries, userAgents, }: SearchParams) => Promise<Array<SearchForFacetValuesResponse | SearchResponse<TRecord>>>;
declare type FacetHit = {
    label: string;
    count: number;
    _highlightResult: {
        label: {
            value: string;
        };
    };
};
export declare type FetcherParams = Pick<Parameters<Fetcher>[0], 'searchClient' | 'queries'>;
export declare type RequesterParams<THit> = {
    transformResponse(response: TransformResponseParams<THit>): TransformedRequesterResponse<THit>;
};
declare type TransformResponseParams<THit> = {
    results: Array<SearchResponse<THit> | SearchForFacetValuesResponse>;
    hits: Array<SearchResponse<THit>['hits']>;
    facetHits: FacetHit[][];
};
export declare type TransformedRequesterResponse<THit> = Array<SearchResponse<THit>['hits']> | SearchResponse<THit>['hits'] | FacetHit[][] | FacetHit[];
export declare type TransformResponse<THit> = (response: TransformResponseParams<THit>) => TransformedRequesterResponse<THit>;
declare type FetcherParamsQuery<THit> = {
    query: MultipleQueriesQuery;
    sourceId: string;
    transformResponse: TransformResponse<THit>;
};
export declare type ExecuteParams<THit> = {
    searchClient: SearchClient;
    requests: Array<FetcherParamsQuery<THit>>;
};
export declare type Execute<THit> = (params: ExecuteParams<THit>) => Promise<ExecuteResponse<THit>>;
export declare type ExecuteResponse<THit> = Array<{
    items: SearchResponse<THit> | SearchForFacetValuesResponse;
    sourceId: string;
    transformResponse: TransformResponse<THit>;
}>;
export declare type RequestParams<THit> = FetcherParams & {
    /**
     * The function to transform the Algolia response before passing it to the Autocomplete state. You have access to the full Algolia results, as well as the pre-computed hits and facet hits.
     *
     * This is useful to manipulate the hits, or store data from the results in the [context](https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/context/).
     */
    transformResponse?: TransformResponse<THit>;
};
export declare type RequesterDescription<THit> = {
    /**
     * The search client used for this request. Multiple queries with the same client are batched (if `requesterId` is also the same).
     */
    searchClient: SearchClient;
    /**
     * Identifies requesters to confirm their queries should be batched.
     * This ensures that requesters with the same client but different
     * post-processing functions don't get batched.
     * When falsy, batching is disabled.
     * For example, the Algolia requesters use "algolia".
     */
    requesterId?: string;
    /**
     * The search parameters used for this query.
     */
    queries: MultipleQueriesQuery[];
    /**
     * Transforms the response of this search before returning it to the caller.
     */
    transformResponse: TransformResponse<THit>;
    /**
     * Post-processing function for multi-queries.
     */
    execute: Execute<THit>;
};
export {};
