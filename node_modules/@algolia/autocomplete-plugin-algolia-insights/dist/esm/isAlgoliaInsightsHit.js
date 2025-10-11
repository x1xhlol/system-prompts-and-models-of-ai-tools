export function isAlgoliaInsightsHit(hit) {
  return hit.objectID && hit.__autocomplete_indexName && hit.__autocomplete_queryID;
}