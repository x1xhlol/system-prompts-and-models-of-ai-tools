function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
import { invariant } from '@algolia/autocomplete-shared';
import { createAlgoliaRequester } from './createAlgoliaRequester';

/**
 * Retrieves Algolia results from multiple indices.
 */
export function getAlgoliaResults(requestParams) {
  invariant(_typeof(requestParams.searchClient) === 'object', 'The `searchClient` parameter is required for getAlgoliaResults({ searchClient }).');
  var requester = createAlgoliaRequester({
    transformResponse: function transformResponse(response) {
      return response.hits;
    }
  });
  return requester(requestParams);
}