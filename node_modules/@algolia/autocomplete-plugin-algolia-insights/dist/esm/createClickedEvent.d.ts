import type { AlgoliaInsightsHit, ClickedObjectIDsAfterSearchParams, InsightsParamsWithItems } from './types';
declare type CreateClickedEventParams = {
    item: AlgoliaInsightsHit;
    items: AlgoliaInsightsHit[];
};
export declare function createClickedEvent({ item, items, }: CreateClickedEventParams): Omit<InsightsParamsWithItems<ClickedObjectIDsAfterSearchParams>, 'eventName'> & {
    algoliaSource?: string[];
};
export {};
