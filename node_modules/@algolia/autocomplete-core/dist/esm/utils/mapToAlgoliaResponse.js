export function mapToAlgoliaResponse(rawResults) {
  return {
    results: rawResults,
    hits: rawResults.map(function (result) {
      return result.hits;
    }).filter(Boolean),
    facetHits: rawResults.map(function (result) {
      var _facetHits;
      return (_facetHits = result.facetHits) === null || _facetHits === void 0 ? void 0 : _facetHits.map(function (facetHit) {
        // Bring support for the highlighting components.
        return {
          label: facetHit.value,
          count: facetHit.count,
          _highlightResult: {
            label: {
              value: facetHit.highlighted
            }
          }
        };
      });
    }).filter(Boolean)
  };
}