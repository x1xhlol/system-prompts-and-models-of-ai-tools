import { ClickedFiltersParams, ClickedObjectIDsAfterSearchParams, ClickedObjectIDsParams, ConvertedFiltersParams, ConvertedObjectIDsAfterSearchParams, ConvertedObjectIDsParams, InsightsClient, WithArbitraryParams, InsightsParamsWithItems, ViewedFiltersParams, ViewedObjectIDsParams } from './types';
export declare function createSearchInsightsApi(searchInsights: InsightsClient): {
    /**
     * Initializes Insights with Algolia credentials.
     */
    init(appId: string, apiKey: string): void;
    /**
     * Sets the authenticated user token to attach to events.
     * Unsets the authenticated token by passing `undefined`.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/set-authenticated-user-token/
     */
    setAuthenticatedUserToken(authenticatedUserToken: string | undefined): void;
    /**
     * Sets the user token to attach to events.
     */
    setUserToken(userToken: string): void;
    /**
     * Sends click events to capture a query and its clicked items and positions.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/clicked-object-ids-after-search/
     */
    clickedObjectIDsAfterSearch(...params: Array<WithArbitraryParams<InsightsParamsWithItems<ClickedObjectIDsAfterSearchParams>>>): void;
    /**
     * Sends click events to capture clicked items.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/clicked-object-ids/
     */
    clickedObjectIDs(...params: Array<WithArbitraryParams<InsightsParamsWithItems<ClickedObjectIDsParams>>>): void;
    /**
     * Sends click events to capture the filters a user clicks on.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/clicked-filters/
     */
    clickedFilters(...params: Array<WithArbitraryParams<ClickedFiltersParams>>): void;
    /**
     * Sends conversion events to capture a query and its clicked items.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/converted-object-ids-after-search/
     */
    convertedObjectIDsAfterSearch(...params: Array<WithArbitraryParams<InsightsParamsWithItems<ConvertedObjectIDsAfterSearchParams>>>): void;
    /**
     * Sends conversion events to capture clicked items.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/converted-object-ids/
     */
    convertedObjectIDs(...params: Array<WithArbitraryParams<InsightsParamsWithItems<ConvertedObjectIDsParams>>>): void;
    /**
     * Sends conversion events to capture the filters a user uses when converting.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/converted-filters/
     */
    convertedFilters(...params: Array<WithArbitraryParams<ConvertedFiltersParams>>): void;
    /**
     * Sends view events to capture clicked items.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/viewed-object-ids/
     */
    viewedObjectIDs(...params: Array<WithArbitraryParams<InsightsParamsWithItems<ViewedObjectIDsParams>>>): void;
    /**
     * Sends view events to capture the filters a user uses when viewing.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/viewed-filters/
     */
    viewedFilters(...params: Array<WithArbitraryParams<ViewedFiltersParams>>): void;
};
