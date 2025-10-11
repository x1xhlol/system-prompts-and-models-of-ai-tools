import { RequestParams } from '../types';
/**
 * Retrieves Algolia facet hits from multiple indices.
 */
export declare function getAlgoliaFacets<TTHit>(requestParams: RequestParams<TTHit>): import("@algolia/autocomplete-shared/dist/esm/preset-algolia/createRequester").RequesterDescription<TTHit>;
