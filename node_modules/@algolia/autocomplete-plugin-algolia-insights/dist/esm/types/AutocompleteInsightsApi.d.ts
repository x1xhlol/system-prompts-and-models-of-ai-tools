import { createSearchInsightsApi } from '../createSearchInsightsApi';
import type { AlgoliaInsightsHit } from './AlgoliaInsightsHit';
export declare type AutocompleteInsightsApi = ReturnType<typeof createSearchInsightsApi>;
export declare type WithArbitraryParams<TParams extends Record<string, unknown>> = Record<string, unknown> & TParams;
export declare type InsightsParamsWithItems<TParams extends {
    objectIDs: string[];
}> = Omit<TParams, 'objectIDs'> & {
    items: AlgoliaInsightsHit[];
    /**
     * @deprecated use `items` instead
     */
    objectIDs?: string[];
};
export declare type ClickedObjectIDsAfterSearchParams = {
    eventName: string;
    index: string;
    objectIDs: string[];
    positions: number[];
    queryID: string;
    userToken?: string;
};
export declare type ClickedObjectIDsParams = {
    eventName: string;
    index: string;
    objectIDs: string[];
    userToken?: string;
};
export declare type ClickedFiltersParams = {
    eventName: string;
    filters: string[];
    index: string;
    userToken: string;
};
export declare type ConvertedObjectIDsAfterSearchParams = {
    eventName: string;
    index: string;
    objectIDs: string[];
    queryID: string;
    userToken?: string;
};
export declare type ConvertedObjectIDsParams = {
    eventName: string;
    index: string;
    objectIDs: string[];
    userToken: string;
};
export declare type ConvertedFiltersParams = {
    eventName: string;
    filters: string[];
    index: string;
    userToken: string;
};
export declare type ViewedObjectIDsParams = {
    eventName: string;
    index: string;
    objectIDs: string[];
    userToken?: string;
};
export declare type ViewedFiltersParams = {
    eventName: string;
    filters: string[];
    index: string;
    userToken: string;
};
