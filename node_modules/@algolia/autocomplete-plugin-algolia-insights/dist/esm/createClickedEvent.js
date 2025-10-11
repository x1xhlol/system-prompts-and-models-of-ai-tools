export function createClickedEvent(_ref) {
  var item = _ref.item,
    _ref$items = _ref.items,
    items = _ref$items === void 0 ? [] : _ref$items;
  return {
    index: item.__autocomplete_indexName,
    items: [item],
    positions: [1 + items.findIndex(function (x) {
      return x.objectID === item.objectID;
    })],
    queryID: item.__autocomplete_queryID,
    algoliaSource: ['autocomplete']
  };
}