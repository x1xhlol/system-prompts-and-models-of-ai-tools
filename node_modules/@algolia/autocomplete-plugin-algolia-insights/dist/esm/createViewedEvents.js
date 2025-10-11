export function createViewedEvents(_ref) {
  var items = _ref.items;
  var itemsByIndexName = items.reduce(function (acc, current) {
    var _acc$current$__autoco;
    acc[current.__autocomplete_indexName] = ((_acc$current$__autoco = acc[current.__autocomplete_indexName]) !== null && _acc$current$__autoco !== void 0 ? _acc$current$__autoco : []).concat(current);
    return acc;
  }, {});
  return Object.keys(itemsByIndexName).map(function (indexName) {
    var items = itemsByIndexName[indexName];
    return {
      index: indexName,
      items: items,
      algoliaSource: ['autocomplete']
    };
  });
}