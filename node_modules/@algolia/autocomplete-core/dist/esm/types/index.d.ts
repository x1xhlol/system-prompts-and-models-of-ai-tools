export * from '@algolia/autocomplete-shared/dist/esm/core';
export * from './AutocompleteStore';
export * from './AutocompleteSubscribers';
import { CreateAlgoliaInsightsPluginParams, AutocompleteInsightsApi as _AutocompleteInsightsApi, AlgoliaInsightsHit as _AlgoliaInsightsHit } from '@algolia/autocomplete-plugin-algolia-insights';
import { AutocompleteOptions as _AutocompleteOptions, InternalAutocompleteOptions as _InternalAutocompleteOptions, BaseItem } from '@algolia/autocomplete-shared/dist/esm/core';
export declare type AutocompleteInsightsApi = _AutocompleteInsightsApi;
export declare type AlgoliaInsightsHit = _AlgoliaInsightsHit;
declare type InsightsOption = {
    /**
     * Whether to enable the Insights plugin and load the Insights library if it has not been loaded yet.
     *
     * See [**autocomplete-plugin-algolia-insights**](https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-plugin-algolia-insights/) for more information.
     *
     * @default undefined
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-insights
     */
    insights?: CreateAlgoliaInsightsPluginParams | boolean | undefined;
};
export interface AutocompleteOptions<TItem extends BaseItem> extends _AutocompleteOptions<TItem>, InsightsOption {
}
export interface InternalAutocompleteOptions<TItem extends BaseItem> extends _InternalAutocompleteOptions<TItem>, InsightsOption {
}
