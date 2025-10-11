import type { InsightsClient } from './types';
/**
 * Determines if a given insights `client` supports the optional call to `init`
 * and the ability to set credentials via extra parameters when sending events.
 */
export declare function isModernInsightsClient(client: InsightsClient): boolean;
