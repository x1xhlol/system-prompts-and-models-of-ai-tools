export function getItemsCount(state) {
  if (state.collections.length === 0) {
    return 0;
  }
  return state.collections.reduce(function (sum, collection) {
    return sum + collection.items.length;
  }, 0);
}