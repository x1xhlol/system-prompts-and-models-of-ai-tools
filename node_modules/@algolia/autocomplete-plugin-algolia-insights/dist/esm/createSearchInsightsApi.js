var _excluded = ["items"],
  _excluded2 = ["items"];
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { isModernInsightsClient } from './isModernInsightsClient';
function chunk(item) {
  var chunkSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;
  var chunks = [];
  for (var i = 0; i < item.objectIDs.length; i += chunkSize) {
    chunks.push(_objectSpread(_objectSpread({}, item), {}, {
      objectIDs: item.objectIDs.slice(i, i + chunkSize)
    }));
  }
  return chunks;
}
function mapToInsightsParamsApi(params) {
  return params.map(function (_ref) {
    var items = _ref.items,
      param = _objectWithoutProperties(_ref, _excluded);
    return _objectSpread(_objectSpread({}, param), {}, {
      objectIDs: (items === null || items === void 0 ? void 0 : items.map(function (_ref2) {
        var objectID = _ref2.objectID;
        return objectID;
      })) || param.objectIDs
    });
  });
}
export function createSearchInsightsApi(searchInsights) {
  var canSendHeaders = isModernInsightsClient(searchInsights);
  function sendToInsights(method, payloads, items) {
    if (canSendHeaders && typeof items !== 'undefined') {
      var _items$0$__autocomple = items[0].__autocomplete_algoliaCredentials,
        appId = _items$0$__autocomple.appId,
        apiKey = _items$0$__autocomple.apiKey;
      var headers = {
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': apiKey
      };
      searchInsights.apply(void 0, [method].concat(_toConsumableArray(payloads), [{
        headers: headers
      }]));
    } else {
      searchInsights.apply(void 0, [method].concat(_toConsumableArray(payloads)));
    }
  }
  return {
    /**
     * Initializes Insights with Algolia credentials.
     */
    init: function init(appId, apiKey) {
      searchInsights('init', {
        appId: appId,
        apiKey: apiKey
      });
    },
    /**
     * Sets the authenticated user token to attach to events.
     * Unsets the authenticated token by passing `undefined`.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/set-authenticated-user-token/
     */
    setAuthenticatedUserToken: function setAuthenticatedUserToken(authenticatedUserToken) {
      searchInsights('setAuthenticatedUserToken', authenticatedUserToken);
    },
    /**
     * Sets the user token to attach to events.
     */
    setUserToken: function setUserToken(userToken) {
      searchInsights('setUserToken', userToken);
    },
    /**
     * Sends click events to capture a query and its clicked items and positions.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/clicked-object-ids-after-search/
     */
    clickedObjectIDsAfterSearch: function clickedObjectIDsAfterSearch() {
      for (var _len = arguments.length, params = new Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }
      if (params.length > 0) {
        sendToInsights('clickedObjectIDsAfterSearch', mapToInsightsParamsApi(params), params[0].items);
      }
    },
    /**
     * Sends click events to capture clicked items.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/clicked-object-ids/
     */
    clickedObjectIDs: function clickedObjectIDs() {
      for (var _len2 = arguments.length, params = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        params[_key2] = arguments[_key2];
      }
      if (params.length > 0) {
        sendToInsights('clickedObjectIDs', mapToInsightsParamsApi(params), params[0].items);
      }
    },
    /**
     * Sends click events to capture the filters a user clicks on.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/clicked-filters/
     */
    clickedFilters: function clickedFilters() {
      for (var _len3 = arguments.length, params = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        params[_key3] = arguments[_key3];
      }
      if (params.length > 0) {
        searchInsights.apply(void 0, ['clickedFilters'].concat(params));
      }
    },
    /**
     * Sends conversion events to capture a query and its clicked items.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/converted-object-ids-after-search/
     */
    convertedObjectIDsAfterSearch: function convertedObjectIDsAfterSearch() {
      for (var _len4 = arguments.length, params = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        params[_key4] = arguments[_key4];
      }
      if (params.length > 0) {
        sendToInsights('convertedObjectIDsAfterSearch', mapToInsightsParamsApi(params), params[0].items);
      }
    },
    /**
     * Sends conversion events to capture clicked items.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/converted-object-ids/
     */
    convertedObjectIDs: function convertedObjectIDs() {
      for (var _len5 = arguments.length, params = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        params[_key5] = arguments[_key5];
      }
      if (params.length > 0) {
        sendToInsights('convertedObjectIDs', mapToInsightsParamsApi(params), params[0].items);
      }
    },
    /**
     * Sends conversion events to capture the filters a user uses when converting.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/converted-filters/
     */
    convertedFilters: function convertedFilters() {
      for (var _len6 = arguments.length, params = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        params[_key6] = arguments[_key6];
      }
      if (params.length > 0) {
        searchInsights.apply(void 0, ['convertedFilters'].concat(params));
      }
    },
    /**
     * Sends view events to capture clicked items.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/viewed-object-ids/
     */
    viewedObjectIDs: function viewedObjectIDs() {
      for (var _len7 = arguments.length, params = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        params[_key7] = arguments[_key7];
      }
      if (params.length > 0) {
        params.reduce(function (acc, _ref3) {
          var items = _ref3.items,
            param = _objectWithoutProperties(_ref3, _excluded2);
          return [].concat(_toConsumableArray(acc), _toConsumableArray(chunk(_objectSpread(_objectSpread({}, param), {}, {
            objectIDs: (items === null || items === void 0 ? void 0 : items.map(function (_ref4) {
              var objectID = _ref4.objectID;
              return objectID;
            })) || param.objectIDs
          })).map(function (payload) {
            return {
              items: items,
              payload: payload
            };
          })));
        }, []).forEach(function (_ref5) {
          var items = _ref5.items,
            payload = _ref5.payload;
          return sendToInsights('viewedObjectIDs', [payload], items);
        });
      }
    },
    /**
     * Sends view events to capture the filters a user uses when viewing.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/viewed-filters/
     */
    viewedFilters: function viewedFilters() {
      for (var _len8 = arguments.length, params = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        params[_key8] = arguments[_key8];
      }
      if (params.length > 0) {
        searchInsights.apply(void 0, ['viewedFilters'].concat(params));
      }
    }
  };
}