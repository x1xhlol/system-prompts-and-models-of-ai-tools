import { AlgoliaInsightsHit, InsightsParamsWithItems, ViewedObjectIDsParams } from './types';
declare type CreateViewedEventsParams = {
    items: AlgoliaInsightsHit[];
};
export declare function createViewedEvents({ items, }: CreateViewedEventsParams): Array<Omit<InsightsParamsWithItems<ViewedObjectIDsParams>, 'eventName'>>;
export {};
