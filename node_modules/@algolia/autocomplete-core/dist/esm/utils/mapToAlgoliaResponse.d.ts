import type { SearchResponse } from '@algolia/autocomplete-shared';
import type { SearchForFacetValuesResponse } from '@algolia/client-search';
export declare function mapToAlgoliaResponse<THit>(rawResults: Array<SearchResponse<THit> | SearchForFacetValuesResponse>): {
    results: (SearchResponse<THit> | SearchForFacetValuesResponse)[];
    hits: import("@algolia/client-search").Hit<THit>[][];
    facetHits: {
        label: string;
        count: number;
        _highlightResult: {
            label: {
                value: string;
            };
        };
    }[][];
};
