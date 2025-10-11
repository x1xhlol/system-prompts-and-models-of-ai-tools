import type { ExecuteResponse, RequesterDescription, TransformResponse } from '@algolia/autocomplete-preset-algolia';
import type { SearchResponse } from '@algolia/autocomplete-shared';
import { MultipleQueriesQuery, SearchForFacetValuesResponse } from '@algolia/client-search';
import { AutocompleteState, AutocompleteStore, BaseItem, InternalAutocompleteSource } from './types';
declare type RequestDescriptionPreResolved<TItem extends BaseItem> = Pick<RequesterDescription<TItem>, 'execute' | 'requesterId' | 'searchClient' | 'transformResponse'> & {
    requests: Array<{
        query: MultipleQueriesQuery;
        sourceId: string;
        transformResponse: TransformResponse<TItem>;
    }>;
};
declare type RequestDescriptionPreResolvedCustom<TItem extends BaseItem> = {
    items: TItem[] | TItem[][];
    sourceId: string;
    transformResponse?: undefined;
};
export declare function preResolve<TItem extends BaseItem>(itemsOrDescription: TItem[] | TItem[][] | RequesterDescription<TItem>, sourceId: string, state: AutocompleteState<TItem>): RequestDescriptionPreResolved<TItem> | RequestDescriptionPreResolvedCustom<TItem>;
export declare function resolve<TItem extends BaseItem>(items: Array<RequestDescriptionPreResolved<TItem> | RequestDescriptionPreResolvedCustom<TItem>>): Promise<(RequestDescriptionPreResolvedCustom<TItem> | {
    items: SearchForFacetValuesResponse | SearchResponse<TItem>;
    sourceId: string;
    transformResponse: TransformResponse<TItem>;
})[]>;
export declare function postResolve<TItem extends BaseItem>(responses: Array<RequestDescriptionPreResolvedCustom<TItem> | ExecuteResponse<TItem>[0]>, sources: Array<InternalAutocompleteSource<TItem>>, store: AutocompleteStore<TItem>): {
    source: InternalAutocompleteSource<TItem>;
    items: {
        label: string;
        count: number;
        _highlightResult: {
            label: {
                value: string;
            };
        };
    }[][] | {
        label: string;
        count: number;
        _highlightResult: {
            label: {
                value: string;
            };
        };
    }[] | import("@algolia/client-search").Hit<TItem>[] | (SearchForFacetValuesResponse | SearchResponse<TItem> | TItem[] | TItem[][])[];
}[];
export {};
