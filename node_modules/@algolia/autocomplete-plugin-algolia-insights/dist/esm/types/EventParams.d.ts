import type { AutocompleteState } from '@algolia/autocomplete-shared';
import type { ClickedObjectIDsAfterSearchParams, InsightsParamsWithItems, ViewedObjectIDsParams } from './AutocompleteInsightsApi';
import type { AlgoliaInsightsHit, AutocompleteInsightsApi } from '.';
export declare type OnSelectParams = {
    insights: AutocompleteInsightsApi;
    insightsEvents: Array<InsightsParamsWithItems<ClickedObjectIDsAfterSearchParams & {
        algoliaSource?: string[];
    }>>;
    item: AlgoliaInsightsHit;
    state: AutocompleteState<any>;
    event: any;
};
export declare type OnActiveParams = OnSelectParams;
export declare type OnItemsChangeParams = {
    insights: AutocompleteInsightsApi;
    insightsEvents: Array<InsightsParamsWithItems<ViewedObjectIDsParams & {
        algoliaSource?: string[];
    }>>;
    state: AutocompleteState<any>;
};
