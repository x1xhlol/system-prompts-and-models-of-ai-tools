import { getActiveItem } from './utils';
export function getCompletion(_ref) {
  var _getActiveItem;
  var state = _ref.state;
  if (state.isOpen === false || state.activeItemId === null) {
    return null;
  }
  return ((_getActiveItem = getActiveItem(state)) === null || _getActiveItem === void 0 ? void 0 : _getActiveItem.itemInputValue) || null;
}