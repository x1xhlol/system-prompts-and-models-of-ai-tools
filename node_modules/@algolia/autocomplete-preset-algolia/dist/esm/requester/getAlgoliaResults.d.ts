import { RequestParams } from '../types';
/**
 * Retrieves Algolia results from multiple indices.
 */
export declare function getAlgoliaResults<TTHit>(requestParams: RequestParams<TTHit>): import("@algolia/autocomplete-shared/dist/esm/preset-algolia/createRequester").RequesterDescription<TTHit>;
