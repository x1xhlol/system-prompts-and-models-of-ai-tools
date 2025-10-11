import type { SearchResponse } from '@algolia/autocomplete-shared';
import type { SearchForFacetValuesResponse, SearchParams } from '../types';
export declare function fetchAlgoliaResults<TRecord>({ searchClient, queries, userAgents, }: SearchParams): Promise<Array<SearchResponse<TRecord> | SearchForFacetValuesResponse>>;
