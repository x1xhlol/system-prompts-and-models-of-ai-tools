import { AutocompletePlugin } from '@algolia/autocomplete-shared';
import { InsightsClient, InsightsMethodMap, OnActiveParams, OnItemsChangeParams, OnSelectParams } from './types';
export declare type CreateAlgoliaInsightsPluginParams = {
    /**
     * The initialized Search Insights client.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-plugin-algolia-insights/createAlgoliaInsightsPlugin/#param-insightsclient
     */
    insightsClient?: InsightsClient;
    /**
     * Insights parameters to forward to the Insights client’s init method.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-plugin-algolia-insights/createAlgoliaInsightsPlugin/#param-insightsinitparams
     */
    insightsInitParams?: Partial<InsightsMethodMap['init'][0]>;
    /**
     * Hook to send an Insights event when the items change.
     *
     * By default, it sends a `viewedObjectIDs` event.
     *
     * In as-you-type experiences, items change as the user types. This hook is debounced every 400ms to reflect actual items that users notice and avoid generating too many events for items matching "in progress" queries.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-plugin-algolia-insights/createAlgoliaInsightsPlugin/#param-onitemschange
     */
    onItemsChange?(params: OnItemsChangeParams): void;
    /**
     * Hook to send an Insights event when an item is selected.
     *
     * By default, it sends a clickedObjectIDsAfterSearch event.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-plugin-algolia-insights/createAlgoliaInsightsPlugin/#param-onselect
     */
    onSelect?(params: OnSelectParams): void;
    /**
     * Hook to send an Insights event when an item is active.
     *
     * By default, it doesn't send any events.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-plugin-algolia-insights/createAlgoliaInsightsPlugin/#param-onactive
     */
    onActive?(params: OnActiveParams): void;
    /**
     * @internal
     */
    __autocomplete_clickAnalytics?: boolean;
};
export declare function createAlgoliaInsightsPlugin(options: CreateAlgoliaInsightsPluginParams): AutocompletePlugin<any, undefined>;
