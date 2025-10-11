/*! @algolia/autocomplete-core 1.17.7 | MIT License | © Algolia, Inc. and contributors | https://github.com/algolia/autocomplete */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["@algolia/autocomplete-core"] = {}));
})(this, (function (exports) { 'use strict';

  function ownKeys$2(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys$2(Object(source), !0).forEach(function (key) {
        _defineProperty$2(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$2(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _typeof$3(obj) {
    "@babel/helpers - typeof";

    return _typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof$3(obj);
  }
  function _defineProperty$2(obj, key, value) {
    key = _toPropertyKey$2(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _objectWithoutPropertiesLoose$1(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
    return target;
  }
  function _objectWithoutProperties$1(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose$1(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }
    return target;
  }
  function _toConsumableArray$2(arr) {
    return _arrayWithoutHoles$2(arr) || _iterableToArray$2(arr) || _unsupportedIterableToArray$4(arr) || _nonIterableSpread$2();
  }
  function _arrayWithoutHoles$2(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray$4(arr);
  }
  function _iterableToArray$2(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _unsupportedIterableToArray$4(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$4(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$4(o, minLen);
  }
  function _arrayLikeToArray$4(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableSpread$2() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive$2(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey$2(arg) {
    var key = _toPrimitive$2(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  function createRef(initialValue) {
    return {
      current: initialValue
    };
  }

  function debounce(fn, time) {
    var timerId = undefined;
    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(function () {
        return fn.apply(void 0, args);
      }, time);
    };
  }

  function _slicedToArray$1(arr, i) {
    return _arrayWithHoles$1(arr) || _iterableToArrayLimit$1(arr, i) || _unsupportedIterableToArray$3(arr, i) || _nonIterableRest$1();
  }
  function _nonIterableRest$1() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$3(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$3(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$3(o, minLen);
  }
  function _arrayLikeToArray$3(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _iterableToArrayLimit$1(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _arrayWithHoles$1(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _typeof$2(obj) {
    "@babel/helpers - typeof";

    return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof$2(obj);
  }
  /**
   * Decycles objects with circular references.
   * This is used to print cyclic structures in development environment only.
   */
  function decycle(obj) {
    var seen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Set();
    if (!obj || _typeof$2(obj) !== 'object') {
      return obj;
    }
    if (seen.has(obj)) {
      return '[Circular]';
    }
    var newSeen = seen.add(obj);
    if (Array.isArray(obj)) {
      return obj.map(function (x) {
        return decycle(x, newSeen);
      });
    }
    return Object.fromEntries(Object.entries(obj).map(function (_ref) {
      var _ref2 = _slicedToArray$1(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];
      return [key, decycle(value, newSeen)];
    }));
  }

  function flatten(values) {
    return values.reduce(function (a, b) {
      return a.concat(b);
    }, []);
  }

  var autocompleteId = 0;
  function generateAutocompleteId() {
    return "autocomplete-".concat(autocompleteId++);
  }

  function getItemsCount(state) {
    if (state.collections.length === 0) {
      return 0;
    }
    return state.collections.reduce(function (sum, collection) {
      return sum + collection.items.length;
    }, 0);
  }

  /**
   * Throws an error if the condition is not met in development mode.
   * This is used to make development a better experience to provide guidance as
   * to where the error comes from.
   */
  function invariant(condition, message) {
    if (!condition) {
      throw new Error("[Autocomplete] ".concat(typeof message === 'function' ? message() : message));
    }
  }

  function isPrimitive(obj) {
    return obj !== Object(obj);
  }
  function isEqual(first, second) {
    if (first === second) {
      return true;
    }
    if (isPrimitive(first) || isPrimitive(second) || typeof first === 'function' || typeof second === 'function') {
      return first === second;
    }
    if (Object.keys(first).length !== Object.keys(second).length) {
      return false;
    }
    for (var _i = 0, _Object$keys = Object.keys(first); _i < _Object$keys.length; _i++) {
      var key = _Object$keys[_i];
      if (!(key in second)) {
        return false;
      }
      if (!isEqual(first[key], second[key])) {
        return false;
      }
    }
    return true;
  }

  var noop = function noop() {};

  /**
   * Safely runs code meant for browser environments only.
   */
  function safelyRunOnBrowser(callback) {
    if (typeof window !== 'undefined') {
      return callback({
        window: window
      });
    }
    return undefined;
  }

  var version = '1.17.7';

  var userAgents = [{
    segment: 'autocomplete-core',
    version: version
  }];

  var warnCache = {
    current: {}
  };

  /**
   * Logs a warning if the condition is not met.
   * This is used to log issues in development environment only.
   */
  function warn(condition, message) {
    if (condition) {
      return;
    }
    var sanitizedMessage = message.trim();
    var hasAlreadyPrinted = warnCache.current[sanitizedMessage];
    if (!hasAlreadyPrinted) {
      warnCache.current[sanitizedMessage] = true;

      // eslint-disable-next-line no-console
      console.warn("[Autocomplete] ".concat(sanitizedMessage));
    }
  }

  function createClickedEvent(_ref) {
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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray$2(arr, i) || _nonIterableRest();
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$2(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$2(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen);
  }
  function _arrayLikeToArray$2(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  /**
   * Determines if a given insights `client` supports the optional call to `init`
   * and the ability to set credentials via extra parameters when sending events.
   */
  function isModernInsightsClient(client) {
    var _split$map = (client.version || '').split('.').map(Number),
      _split$map2 = _slicedToArray(_split$map, 2),
      major = _split$map2[0],
      minor = _split$map2[1];

    /* eslint-disable @typescript-eslint/camelcase */
    var v3 = major >= 3;
    var v2_4 = major === 2 && minor >= 4;
    var v1_10 = major === 1 && minor >= 10;
    return v3 || v2_4 || v1_10;
    /* eslint-enable @typescript-eslint/camelcase */
  }

  var _excluded$3 = ["items"],
    _excluded2$1 = ["items"];
  function _typeof$1(obj) {
    "@babel/helpers - typeof";

    return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof$1(obj);
  }
  function _toConsumableArray$1(arr) {
    return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _unsupportedIterableToArray$1(arr) || _nonIterableSpread$1();
  }
  function _nonIterableSpread$1() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$1(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$1(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen);
  }
  function _iterableToArray$1(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles$1(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray$1(arr);
  }
  function _arrayLikeToArray$1(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
    return target;
  }
  function ownKeys$1(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread$1(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) {
        _defineProperty$1(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty$1(obj, key, value) {
    key = _toPropertyKey$1(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey$1(arg) {
    var key = _toPrimitive$1(arg, "string");
    return _typeof$1(key) === "symbol" ? key : String(key);
  }
  function _toPrimitive$1(input, hint) {
    if (_typeof$1(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (_typeof$1(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function chunk(item) {
    var chunkSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;
    var chunks = [];
    for (var i = 0; i < item.objectIDs.length; i += chunkSize) {
      chunks.push(_objectSpread$1(_objectSpread$1({}, item), {}, {
        objectIDs: item.objectIDs.slice(i, i + chunkSize)
      }));
    }
    return chunks;
  }
  function mapToInsightsParamsApi(params) {
    return params.map(function (_ref) {
      var items = _ref.items,
        param = _objectWithoutProperties(_ref, _excluded$3);
      return _objectSpread$1(_objectSpread$1({}, param), {}, {
        objectIDs: (items === null || items === void 0 ? void 0 : items.map(function (_ref2) {
          var objectID = _ref2.objectID;
          return objectID;
        })) || param.objectIDs
      });
    });
  }
  function createSearchInsightsApi(searchInsights) {
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
        searchInsights.apply(void 0, [method].concat(_toConsumableArray$1(payloads), [{
          headers: headers
        }]));
      } else {
        searchInsights.apply(void 0, [method].concat(_toConsumableArray$1(payloads)));
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
              param = _objectWithoutProperties(_ref3, _excluded2$1);
            return [].concat(_toConsumableArray$1(acc), _toConsumableArray$1(chunk(_objectSpread$1(_objectSpread$1({}, param), {}, {
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

  function createViewedEvents(_ref) {
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

  function isAlgoliaInsightsHit(hit) {
    return hit.objectID && hit.__autocomplete_indexName && hit.__autocomplete_queryID;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return _typeof(key) === "symbol" ? key : String(key);
  }
  function _toPrimitive(input, hint) {
    if (_typeof(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (_typeof(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  var VIEW_EVENT_DELAY = 400;
  var ALGOLIA_INSIGHTS_VERSION = '2.15.0';
  var ALGOLIA_INSIGHTS_SRC = "https://cdn.jsdelivr.net/npm/search-insights@".concat(ALGOLIA_INSIGHTS_VERSION, "/dist/search-insights.min.js");
  var sendViewedObjectIDs = debounce(function (_ref) {
    var onItemsChange = _ref.onItemsChange,
      items = _ref.items,
      insights = _ref.insights,
      state = _ref.state;
    onItemsChange({
      insights: insights,
      insightsEvents: createViewedEvents({
        items: items
      }).map(function (event) {
        return _objectSpread({
          eventName: 'Items Viewed'
        }, event);
      }),
      state: state
    });
  }, VIEW_EVENT_DELAY);
  function createAlgoliaInsightsPlugin(options) {
    var _getOptions = getOptions(options),
      providedInsightsClient = _getOptions.insightsClient,
      insightsInitParams = _getOptions.insightsInitParams,
      onItemsChange = _getOptions.onItemsChange,
      onSelectEvent = _getOptions.onSelect,
      onActiveEvent = _getOptions.onActive,
      __autocomplete_clickAnalytics = _getOptions.__autocomplete_clickAnalytics;
    var insightsClient = providedInsightsClient;
    if (!providedInsightsClient) {
      safelyRunOnBrowser(function (_ref2) {
        var window = _ref2.window;
        var pointer = window.AlgoliaAnalyticsObject || 'aa';
        if (typeof pointer === 'string') {
          insightsClient = window[pointer];
        }
        if (!insightsClient) {
          window.AlgoliaAnalyticsObject = pointer;
          if (!window[pointer]) {
            window[pointer] = function () {
              if (!window[pointer].queue) {
                window[pointer].queue = [];
              }
              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }
              window[pointer].queue.push(args);
            };
          }
          window[pointer].version = ALGOLIA_INSIGHTS_VERSION;
          insightsClient = window[pointer];
          loadInsights(window);
        }
      });
    }

    // We return an empty plugin if `insightsClient` is still undefined at
    // this stage, which can happen in server environments.
    if (!insightsClient) {
      return {};
    }
    if (insightsInitParams) {
      insightsClient('init', _objectSpread({
        partial: true
      }, insightsInitParams));
    }
    var insights = createSearchInsightsApi(insightsClient);
    var previousItems = createRef([]);
    var debouncedOnStateChange = debounce(function (_ref3) {
      var state = _ref3.state;
      if (!state.isOpen) {
        return;
      }
      var items = state.collections.reduce(function (acc, current) {
        return [].concat(_toConsumableArray(acc), _toConsumableArray(current.items));
      }, []).filter(isAlgoliaInsightsHit);
      if (!isEqual(previousItems.current.map(function (x) {
        return x.objectID;
      }), items.map(function (x) {
        return x.objectID;
      }))) {
        previousItems.current = items;
        if (items.length > 0) {
          sendViewedObjectIDs({
            onItemsChange: onItemsChange,
            items: items,
            insights: insights,
            state: state
          });
        }
      }
    }, 0);
    return {
      name: 'aa.algoliaInsightsPlugin',
      subscribe: function subscribe(_ref4) {
        var setContext = _ref4.setContext,
          onSelect = _ref4.onSelect,
          onActive = _ref4.onActive;
        var isAuthenticatedToken = false;
        function setInsightsContext(userToken) {
          setContext({
            algoliaInsightsPlugin: {
              __algoliaSearchParameters: _objectSpread(_objectSpread({}, __autocomplete_clickAnalytics ? {
                clickAnalytics: true
              } : {}), userToken ? {
                userToken: normalizeUserToken(userToken)
              } : {}),
              insights: insights
            }
          });
        }
        insightsClient('addAlgoliaAgent', 'insights-plugin');
        setInsightsContext();

        // Handles user token changes
        insightsClient('onUserTokenChange', function (userToken) {
          if (!isAuthenticatedToken) {
            setInsightsContext(userToken);
          }
        });
        insightsClient('getUserToken', null, function (_error, userToken) {
          if (!isAuthenticatedToken) {
            setInsightsContext(userToken);
          }
        });

        // Handles authenticated user token changes
        insightsClient('onAuthenticatedUserTokenChange', function (authenticatedUserToken) {
          if (authenticatedUserToken) {
            isAuthenticatedToken = true;
            setInsightsContext(authenticatedUserToken);
          } else {
            isAuthenticatedToken = false;
            insightsClient('getUserToken', null, function (_error, userToken) {
              return setInsightsContext(userToken);
            });
          }
        });
        insightsClient('getAuthenticatedUserToken', null, function (_error, authenticatedUserToken) {
          if (authenticatedUserToken) {
            isAuthenticatedToken = true;
            setInsightsContext(authenticatedUserToken);
          }
        });
        onSelect(function (_ref5) {
          var item = _ref5.item,
            state = _ref5.state,
            event = _ref5.event,
            source = _ref5.source;
          if (!isAlgoliaInsightsHit(item)) {
            return;
          }
          onSelectEvent({
            state: state,
            event: event,
            insights: insights,
            item: item,
            insightsEvents: [_objectSpread({
              eventName: 'Item Selected'
            }, createClickedEvent({
              item: item,
              items: source.getItems().filter(isAlgoliaInsightsHit)
            }))]
          });
        });
        onActive(function (_ref6) {
          var item = _ref6.item,
            source = _ref6.source,
            state = _ref6.state,
            event = _ref6.event;
          if (!isAlgoliaInsightsHit(item)) {
            return;
          }
          onActiveEvent({
            state: state,
            event: event,
            insights: insights,
            item: item,
            insightsEvents: [_objectSpread({
              eventName: 'Item Active'
            }, createClickedEvent({
              item: item,
              items: source.getItems().filter(isAlgoliaInsightsHit)
            }))]
          });
        });
      },
      onStateChange: function onStateChange(_ref7) {
        var state = _ref7.state;
        debouncedOnStateChange({
          state: state
        });
      },
      __autocomplete_pluginOptions: options
    };
  }
  function getAlgoliaSources() {
    var _context$algoliaInsig;
    var algoliaSourceBase = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var context = arguments.length > 1 ? arguments[1] : undefined;
    return [].concat(_toConsumableArray(algoliaSourceBase), ['autocomplete-internal'], _toConsumableArray((_context$algoliaInsig = context.algoliaInsightsPlugin) !== null && _context$algoliaInsig !== void 0 && _context$algoliaInsig.__automaticInsights ? ['autocomplete-automatic'] : []));
  }
  function getOptions(options) {
    return _objectSpread({
      onItemsChange: function onItemsChange(_ref8) {
        var insights = _ref8.insights,
          insightsEvents = _ref8.insightsEvents,
          state = _ref8.state;
        insights.viewedObjectIDs.apply(insights, _toConsumableArray(insightsEvents.map(function (event) {
          return _objectSpread(_objectSpread({}, event), {}, {
            algoliaSource: getAlgoliaSources(event.algoliaSource, state.context)
          });
        })));
      },
      onSelect: function onSelect(_ref9) {
        var insights = _ref9.insights,
          insightsEvents = _ref9.insightsEvents,
          state = _ref9.state;
        insights.clickedObjectIDsAfterSearch.apply(insights, _toConsumableArray(insightsEvents.map(function (event) {
          return _objectSpread(_objectSpread({}, event), {}, {
            algoliaSource: getAlgoliaSources(event.algoliaSource, state.context)
          });
        })));
      },
      onActive: noop,
      __autocomplete_clickAnalytics: true
    }, options);
  }
  function loadInsights(environment) {
    var errorMessage = "[Autocomplete]: Could not load search-insights.js. Please load it manually following https://alg.li/insights-autocomplete";
    try {
      var script = environment.document.createElement('script');
      script.async = true;
      script.src = ALGOLIA_INSIGHTS_SRC;
      script.onerror = function () {
        // eslint-disable-next-line no-console
        console.error(errorMessage);
      };
      document.body.appendChild(script);
    } catch (cause) {
      // eslint-disable-next-line no-console
      console.error(errorMessage);
    }
  }

  /**
   * While `search-insights` supports both string and number user tokens,
   * the Search API only accepts strings. This function normalizes the user token.
   */
  function normalizeUserToken(userToken) {
    return typeof userToken === 'number' ? userToken.toString() : userToken;
  }

  function checkOptions(options) {
    "development" !== 'production' ? warn(!options.debug, 'The `debug` option is meant for development debugging and should not be used in production.') : void 0;
  }

  function createInternalCancelablePromise(promise, initialState) {
    var state = initialState;
    return {
      then: function then(onfulfilled, onrejected) {
        return createInternalCancelablePromise(promise.then(createCallback(onfulfilled, state, promise), createCallback(onrejected, state, promise)), state);
      },
      catch: function _catch(onrejected) {
        return createInternalCancelablePromise(promise.catch(createCallback(onrejected, state, promise)), state);
      },
      finally: function _finally(onfinally) {
        if (onfinally) {
          state.onCancelList.push(onfinally);
        }
        return createInternalCancelablePromise(promise.finally(createCallback(onfinally && function () {
          state.onCancelList = [];
          return onfinally();
        }, state, promise)), state);
      },
      cancel: function cancel() {
        state.isCanceled = true;
        var callbacks = state.onCancelList;
        state.onCancelList = [];
        callbacks.forEach(function (callback) {
          callback();
        });
      },
      isCanceled: function isCanceled() {
        return state.isCanceled === true;
      }
    };
  }
  function cancelable(promise) {
    return createInternalCancelablePromise(promise, {
      isCanceled: false,
      onCancelList: []
    });
  }
  function createCallback(onResult, state, fallback) {
    if (!onResult) {
      return fallback;
    }
    return function callback(arg) {
      if (state.isCanceled) {
        return arg;
      }
      return onResult(arg);
    };
  }

  function createCancelablePromiseList() {
    var list = [];
    return {
      add: function add(cancelablePromise) {
        list.push(cancelablePromise);
        return cancelablePromise.finally(function () {
          list = list.filter(function (item) {
            return item !== cancelablePromise;
          });
        });
      },
      cancelAll: function cancelAll() {
        list.forEach(function (promise) {
          return promise.cancel();
        });
      },
      isEmpty: function isEmpty() {
        return list.length === 0;
      }
    };
  }

  /**
   * Creates a runner that executes promises in a concurrent-safe way.
   *
   * This is useful to prevent older promises to resolve after a newer promise,
   * otherwise resulting in stale resolved values.
   */
  function createConcurrentSafePromise() {
    var basePromiseId = -1;
    var latestResolvedId = -1;
    var latestResolvedValue = undefined;
    return function runConcurrentSafePromise(promise) {
      basePromiseId++;
      var currentPromiseId = basePromiseId;
      return Promise.resolve(promise).then(function (x) {
        // The promise might take too long to resolve and get outdated. This would
        // result in resolving stale values.
        // When this happens, we ignore the promise value and return the one
        // coming from the latest resolved value.
        //
        // +----------------------------------+
        // |        100ms                     |
        // | run(1) +--->  R1                 |
        // |        300ms                     |
        // | run(2) +-------------> R2 (SKIP) |
        // |        200ms                     |
        // | run(3) +--------> R3             |
        // +----------------------------------+
        if (latestResolvedValue && currentPromiseId < latestResolvedId) {
          return latestResolvedValue;
        }
        latestResolvedId = currentPromiseId;
        latestResolvedValue = x;
        return x;
      });
    };
  }

  /**
   * Returns the next active item ID from the current state.
   *
   * We allow circular keyboard navigation from the base index.
   * The base index can either be `null` (nothing is highlighted) or `0`
   * (the first item is highlighted).
   * The base index is allowed to get assigned `null` only if
   * `props.defaultActiveItemId` is `null`. This pattern allows to "stop"
   * by the actual query before navigating to other suggestions as seen on
   * Google or Amazon.
   *
   * @param moveAmount The offset to increment (or decrement) the last index
   * @param baseIndex The current index to compute the next index from
   * @param itemCount The number of items
   * @param defaultActiveItemId The default active index to fallback to
   */
  function getNextActiveItemId(moveAmount, baseIndex, itemCount, defaultActiveItemId) {
    if (!itemCount) {
      return null;
    }
    if (moveAmount < 0 && (baseIndex === null || defaultActiveItemId !== null && baseIndex === 0)) {
      return itemCount + moveAmount;
    }
    var numericIndex = (baseIndex === null ? -1 : baseIndex) + moveAmount;
    if (numericIndex <= -1 || numericIndex >= itemCount) {
      return defaultActiveItemId === null ? null : 0;
    }
    return numericIndex;
  }

  function getNormalizedSources(getSources, params) {
    var seenSourceIds = [];
    return Promise.resolve(getSources(params)).then(function (sources) {
      invariant(Array.isArray(sources), function () {
        return "The `getSources` function must return an array of sources but returned type ".concat(JSON.stringify(_typeof$3(sources)), ":\n\n").concat(JSON.stringify(decycle(sources), null, 2));
      });
      return Promise.all(sources
      // We allow `undefined` and `false` sources to allow users to use
      // `Boolean(query) && source` (=> `false`).
      // We need to remove these values at this point.
      .filter(function (maybeSource) {
        return Boolean(maybeSource);
      }).map(function (source) {
        invariant(typeof source.sourceId === 'string', 'A source must provide a `sourceId` string.');
        if (seenSourceIds.includes(source.sourceId)) {
          throw new Error("[Autocomplete] The `sourceId` ".concat(JSON.stringify(source.sourceId), " is not unique."));
        }
        seenSourceIds.push(source.sourceId);
        var defaultSource = {
          getItemInputValue: function getItemInputValue(_ref) {
            var state = _ref.state;
            return state.query;
          },
          getItemUrl: function getItemUrl() {
            return undefined;
          },
          onSelect: function onSelect(_ref2) {
            var setIsOpen = _ref2.setIsOpen;
            setIsOpen(false);
          },
          onActive: noop,
          onResolve: noop
        };
        Object.keys(defaultSource).forEach(function (key) {
          defaultSource[key].__default = true;
        });
        var normalizedSource = _objectSpread2(_objectSpread2({}, defaultSource), source);
        return Promise.resolve(normalizedSource);
      }));
    });
  }

  // We don't have access to the autocomplete source when we call `onKeyDown`
  // or `onClick` because those are native browser events.
  // However, we can get the source from the suggestion index.
  function getCollectionFromActiveItemId(state) {
    // Given 3 sources with respectively 1, 2 and 3 suggestions: [1, 2, 3]
    // We want to get the accumulated counts:
    // [1, 1 + 2, 1 + 2 + 3] = [1, 3, 3 + 3] = [1, 3, 6]
    var accumulatedCollectionsCount = state.collections.map(function (collections) {
      return collections.items.length;
    }).reduce(function (acc, collectionsCount, index) {
      var previousValue = acc[index - 1] || 0;
      var nextValue = previousValue + collectionsCount;
      acc.push(nextValue);
      return acc;
    }, []);

    // Based on the accumulated counts, we can infer the index of the suggestion.
    var collectionIndex = accumulatedCollectionsCount.reduce(function (acc, current) {
      if (current <= state.activeItemId) {
        return acc + 1;
      }
      return acc;
    }, 0);
    return state.collections[collectionIndex];
  }

  /**
   * Gets the highlighted index relative to a suggestion object (not the absolute
   * highlighted index).
   *
   * Example:
   *  [['a', 'b'], ['c', 'd', 'e'], ['f']]
   *                      ↑
   *         (absolute: 3, relative: 1)
   */
  function getRelativeActiveItemId(_ref) {
    var state = _ref.state,
      collection = _ref.collection;
    var isOffsetFound = false;
    var counter = 0;
    var previousItemsOffset = 0;
    while (isOffsetFound === false) {
      var currentCollection = state.collections[counter];
      if (currentCollection === collection) {
        isOffsetFound = true;
        break;
      }
      previousItemsOffset += currentCollection.items.length;
      counter++;
    }
    return state.activeItemId - previousItemsOffset;
  }
  function getActiveItem(state) {
    var collection = getCollectionFromActiveItemId(state);
    if (!collection) {
      return null;
    }
    var item = collection.items[getRelativeActiveItemId({
      state: state,
      collection: collection
    })];
    var source = collection.source;
    var itemInputValue = source.getItemInputValue({
      item: item,
      state: state
    });
    var itemUrl = source.getItemUrl({
      item: item,
      state: state
    });
    return {
      item: item,
      itemInputValue: itemInputValue,
      itemUrl: itemUrl,
      source: source
    };
  }

  /**
   * Returns a full element id for an autocomplete element.
   *
   * @param autocompleteInstanceId The id of the autocomplete instance
   * @param elementId The specific element id
   * @param source The source of the element, when it needs to be scoped
   */
  function getAutocompleteElementId(autocompleteInstanceId, elementId, source) {
    return [autocompleteInstanceId, source === null || source === void 0 ? void 0 : source.sourceId, elementId].filter(Boolean).join('-').replace(/\s/g, '');
  }

  function isOrContainsNode(parent, child) {
    return parent === child || parent.contains(child);
  }

  var regex = /((gt|sm)-|galaxy nexus)|samsung[- ]|samsungbrowser/i;
  function isSamsung(userAgent) {
    return Boolean(userAgent && userAgent.match(regex));
  }

  function mapToAlgoliaResponse(rawResults) {
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

  function getNativeEvent(event) {
    return event.nativeEvent || event;
  }

  function createStore(reducer, props, onStoreStateChange) {
    var state = props.initialState;
    return {
      getState: function getState() {
        return state;
      },
      dispatch: function dispatch(action, payload) {
        var prevState = _objectSpread2({}, state);
        state = reducer(state, {
          type: action,
          props: props,
          payload: payload
        });
        onStoreStateChange({
          state: state,
          prevState: prevState
        });
      },
      pendingRequests: createCancelablePromiseList()
    };
  }

  function getAutocompleteSetters(_ref) {
    var store = _ref.store;
    var setActiveItemId = function setActiveItemId(value) {
      store.dispatch('setActiveItemId', value);
    };
    var setQuery = function setQuery(value) {
      store.dispatch('setQuery', value);
    };
    var setCollections = function setCollections(rawValue) {
      var baseItemId = 0;
      var value = rawValue.map(function (collection) {
        return _objectSpread2(_objectSpread2({}, collection), {}, {
          // We flatten the stored items to support calling `getAlgoliaResults`
          // from the source itself.
          items: flatten(collection.items).map(function (item) {
            return _objectSpread2(_objectSpread2({}, item), {}, {
              __autocomplete_id: baseItemId++
            });
          })
        });
      });
      store.dispatch('setCollections', value);
    };
    var setIsOpen = function setIsOpen(value) {
      store.dispatch('setIsOpen', value);
    };
    var setStatus = function setStatus(value) {
      store.dispatch('setStatus', value);
    };
    var setContext = function setContext(value) {
      store.dispatch('setContext', value);
    };
    return {
      setActiveItemId: setActiveItemId,
      setQuery: setQuery,
      setCollections: setCollections,
      setIsOpen: setIsOpen,
      setStatus: setStatus,
      setContext: setContext
    };
  }

  function getDefaultProps(props, pluginSubscribers) {
    var _props$id;
    /* eslint-disable no-restricted-globals */
    var environment = typeof window !== 'undefined' ? window : {};
    /* eslint-enable no-restricted-globals */
    var plugins = props.plugins || [];
    return _objectSpread2(_objectSpread2({
      debug: false,
      openOnFocus: false,
      enterKeyHint: undefined,
      ignoreCompositionEvents: false,
      placeholder: '',
      autoFocus: false,
      defaultActiveItemId: null,
      stallThreshold: 300,
      insights: undefined,
      environment: environment,
      shouldPanelOpen: function shouldPanelOpen(_ref) {
        var state = _ref.state;
        return getItemsCount(state) > 0;
      },
      reshape: function reshape(_ref2) {
        var sources = _ref2.sources;
        return sources;
      }
    }, props), {}, {
      // Since `generateAutocompleteId` triggers a side effect (it increments
      // an internal counter), we don't want to execute it if unnecessary.
      id: (_props$id = props.id) !== null && _props$id !== void 0 ? _props$id : generateAutocompleteId(),
      plugins: plugins,
      // The following props need to be deeply defaulted.
      initialState: _objectSpread2({
        activeItemId: null,
        query: '',
        completion: null,
        collections: [],
        isOpen: false,
        status: 'idle',
        context: {}
      }, props.initialState),
      onStateChange: function onStateChange(params) {
        var _props$onStateChange;
        (_props$onStateChange = props.onStateChange) === null || _props$onStateChange === void 0 ? void 0 : _props$onStateChange.call(props, params);
        plugins.forEach(function (x) {
          var _x$onStateChange;
          return (_x$onStateChange = x.onStateChange) === null || _x$onStateChange === void 0 ? void 0 : _x$onStateChange.call(x, params);
        });
      },
      onSubmit: function onSubmit(params) {
        var _props$onSubmit;
        (_props$onSubmit = props.onSubmit) === null || _props$onSubmit === void 0 ? void 0 : _props$onSubmit.call(props, params);
        plugins.forEach(function (x) {
          var _x$onSubmit;
          return (_x$onSubmit = x.onSubmit) === null || _x$onSubmit === void 0 ? void 0 : _x$onSubmit.call(x, params);
        });
      },
      onReset: function onReset(params) {
        var _props$onReset;
        (_props$onReset = props.onReset) === null || _props$onReset === void 0 ? void 0 : _props$onReset.call(props, params);
        plugins.forEach(function (x) {
          var _x$onReset;
          return (_x$onReset = x.onReset) === null || _x$onReset === void 0 ? void 0 : _x$onReset.call(x, params);
        });
      },
      getSources: function getSources(params) {
        return Promise.all([].concat(_toConsumableArray$2(plugins.map(function (plugin) {
          return plugin.getSources;
        })), [props.getSources]).filter(Boolean).map(function (getSources) {
          return getNormalizedSources(getSources, params);
        })).then(function (nested) {
          return flatten(nested);
        }).then(function (sources) {
          return sources.map(function (source) {
            return _objectSpread2(_objectSpread2({}, source), {}, {
              onSelect: function onSelect(params) {
                source.onSelect(params);
                pluginSubscribers.forEach(function (x) {
                  var _x$onSelect;
                  return (_x$onSelect = x.onSelect) === null || _x$onSelect === void 0 ? void 0 : _x$onSelect.call(x, params);
                });
              },
              onActive: function onActive(params) {
                source.onActive(params);
                pluginSubscribers.forEach(function (x) {
                  var _x$onActive;
                  return (_x$onActive = x.onActive) === null || _x$onActive === void 0 ? void 0 : _x$onActive.call(x, params);
                });
              },
              onResolve: function onResolve(params) {
                source.onResolve(params);
                pluginSubscribers.forEach(function (x) {
                  var _x$onResolve;
                  return (_x$onResolve = x.onResolve) === null || _x$onResolve === void 0 ? void 0 : _x$onResolve.call(x, params);
                });
              }
            });
          });
        });
      },
      navigator: _objectSpread2({
        navigate: function navigate(_ref3) {
          var itemUrl = _ref3.itemUrl;
          environment.location.assign(itemUrl);
        },
        navigateNewTab: function navigateNewTab(_ref4) {
          var itemUrl = _ref4.itemUrl;
          var windowReference = environment.open(itemUrl, '_blank', 'noopener');
          windowReference === null || windowReference === void 0 ? void 0 : windowReference.focus();
        },
        navigateNewWindow: function navigateNewWindow(_ref5) {
          var itemUrl = _ref5.itemUrl;
          environment.open(itemUrl, '_blank', 'noopener');
        }
      }, props.navigator)
    });
  }

  function reshape(_ref) {
    var collections = _ref.collections,
      props = _ref.props,
      state = _ref.state;
    // Sources are grouped by `sourceId` to conveniently pick them via destructuring.
    // Example: `const { recentSearchesPlugin } = sourcesBySourceId`
    var originalSourcesBySourceId = collections.reduce(function (acc, collection) {
      return _objectSpread2(_objectSpread2({}, acc), {}, _defineProperty$2({}, collection.source.sourceId, _objectSpread2(_objectSpread2({}, collection.source), {}, {
        getItems: function getItems() {
          // We provide the resolved items from the collection to the `reshape` prop.
          return flatten(collection.items);
        }
      })));
    }, {});
    var _props$plugins$reduce = props.plugins.reduce(function (acc, plugin) {
        if (plugin.reshape) {
          return plugin.reshape(acc);
        }
        return acc;
      }, {
        sourcesBySourceId: originalSourcesBySourceId,
        state: state
      }),
      sourcesBySourceId = _props$plugins$reduce.sourcesBySourceId;
    var reshapeSources = props.reshape({
      sourcesBySourceId: sourcesBySourceId,
      sources: Object.values(sourcesBySourceId),
      state: state
    });

    // We reconstruct the collections with the items modified by the `reshape` prop.
    return flatten(reshapeSources).filter(Boolean).map(function (source) {
      return {
        source: source,
        items: source.getItems()
      };
    });
  }

  function isDescription(item) {
    return Boolean(item.execute);
  }
  function isRequesterDescription(description) {
    return Boolean(description === null || description === void 0 ? void 0 : description.execute);
  }
  function preResolve(itemsOrDescription, sourceId, state) {
    if (isRequesterDescription(itemsOrDescription)) {
      var contextParameters = itemsOrDescription.requesterId === 'algolia' ? Object.assign.apply(Object, [{}].concat(_toConsumableArray$2(Object.keys(state.context).map(function (key) {
        var _state$context$key;
        return (_state$context$key = state.context[key]) === null || _state$context$key === void 0 ? void 0 : _state$context$key.__algoliaSearchParameters;
      })))) : {};
      return _objectSpread2(_objectSpread2({}, itemsOrDescription), {}, {
        requests: itemsOrDescription.queries.map(function (query) {
          return {
            query: itemsOrDescription.requesterId === 'algolia' ? _objectSpread2(_objectSpread2({}, query), {}, {
              params: _objectSpread2(_objectSpread2({}, contextParameters), query.params)
            }) : query,
            sourceId: sourceId,
            transformResponse: itemsOrDescription.transformResponse
          };
        })
      });
    }
    return {
      items: itemsOrDescription,
      sourceId: sourceId
    };
  }
  function resolve(items) {
    var packed = items.reduce(function (acc, current) {
      if (!isDescription(current)) {
        acc.push(current);
        return acc;
      }
      var searchClient = current.searchClient,
        execute = current.execute,
        requesterId = current.requesterId,
        requests = current.requests;
      var container = acc.find(function (item) {
        return isDescription(current) && isDescription(item) && item.searchClient === searchClient && Boolean(requesterId) && item.requesterId === requesterId;
      });
      if (container) {
        var _container$items;
        (_container$items = container.items).push.apply(_container$items, _toConsumableArray$2(requests));
      } else {
        var request = {
          execute: execute,
          requesterId: requesterId,
          items: requests,
          searchClient: searchClient
        };
        acc.push(request);
      }
      return acc;
    }, []);
    var values = packed.map(function (maybeDescription) {
      if (!isDescription(maybeDescription)) {
        return Promise.resolve(maybeDescription);
      }
      var _ref = maybeDescription,
        execute = _ref.execute,
        items = _ref.items,
        searchClient = _ref.searchClient;
      return execute({
        searchClient: searchClient,
        requests: items
      });
    });
    return Promise.all(values).then(function (responses) {
      return flatten(responses);
    });
  }
  function postResolve(responses, sources, store) {
    return sources.map(function (source) {
      var matches = responses.filter(function (response) {
        return response.sourceId === source.sourceId;
      });
      var results = matches.map(function (_ref2) {
        var items = _ref2.items;
        return items;
      });
      var transform = matches[0].transformResponse;
      var items = transform ? transform(mapToAlgoliaResponse(results)) : results;
      source.onResolve({
        source: source,
        results: results,
        items: items,
        state: store.getState()
      });
      invariant(Array.isArray(items), function () {
        return "The `getItems` function from source \"".concat(source.sourceId, "\" must return an array of items but returned type ").concat(JSON.stringify(_typeof$3(items)), ":\n\n").concat(JSON.stringify(decycle(items), null, 2), ".\n\nSee: https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/sources/#param-getitems");
      });
      invariant(items.every(Boolean), "The `getItems` function from source \"".concat(source.sourceId, "\" must return an array of items but returned ").concat(JSON.stringify(undefined), ".\n\nDid you forget to return items?\n\nSee: https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/sources/#param-getitems"));
      return {
        source: source,
        items: items
      };
    });
  }

  var _excluded$2 = ["event", "nextState", "props", "query", "refresh", "store"];
  var lastStalledId = null;
  var runConcurrentSafePromise = createConcurrentSafePromise();
  function onInput(_ref) {
    var event = _ref.event,
      _ref$nextState = _ref.nextState,
      nextState = _ref$nextState === void 0 ? {} : _ref$nextState,
      props = _ref.props,
      query = _ref.query,
      refresh = _ref.refresh,
      store = _ref.store,
      setters = _objectWithoutProperties$1(_ref, _excluded$2);
    if (lastStalledId) {
      props.environment.clearTimeout(lastStalledId);
    }
    var setCollections = setters.setCollections,
      setIsOpen = setters.setIsOpen,
      setQuery = setters.setQuery,
      setActiveItemId = setters.setActiveItemId,
      setStatus = setters.setStatus,
      setContext = setters.setContext;
    setQuery(query);
    setActiveItemId(props.defaultActiveItemId);
    if (!query && props.openOnFocus === false) {
      var _nextState$isOpen;
      var collections = store.getState().collections.map(function (collection) {
        return _objectSpread2(_objectSpread2({}, collection), {}, {
          items: []
        });
      });
      setStatus('idle');
      setCollections(collections);
      setIsOpen((_nextState$isOpen = nextState.isOpen) !== null && _nextState$isOpen !== void 0 ? _nextState$isOpen : props.shouldPanelOpen({
        state: store.getState()
      }));

      // We make sure to update the latest resolved value of the tracked
      // promises to keep late resolving promises from "cancelling" the state
      // updates performed in this code path.
      // We chain with a void promise to respect `onInput`'s expected return type.
      var _request = cancelable(runConcurrentSafePromise(collections).then(function () {
        return Promise.resolve();
      }));
      return store.pendingRequests.add(_request);
    }
    setStatus('loading');
    lastStalledId = props.environment.setTimeout(function () {
      setStatus('stalled');
    }, props.stallThreshold);

    // We track the entire promise chain triggered by `onInput` before mutating
    // the Autocomplete state to make sure that any state manipulation is based on
    // fresh data regardless of when promises individually resolve.
    // We don't track nested promises and only rely on the full chain resolution,
    // meaning we should only ever manipulate the state once this concurrent-safe
    // promise is resolved.
    var request = cancelable(runConcurrentSafePromise(props.getSources(_objectSpread2({
      query: query,
      refresh: refresh,
      state: store.getState()
    }, setters)).then(function (sources) {
      return Promise.all(sources.map(function (source) {
        return Promise.resolve(source.getItems(_objectSpread2({
          query: query,
          refresh: refresh,
          state: store.getState()
        }, setters))).then(function (itemsOrDescription) {
          return preResolve(itemsOrDescription, source.sourceId, store.getState());
        });
      })).then(resolve).then(function (responses) {
        var __automaticInsights = responses.some(function (_ref2) {
          var items = _ref2.items;
          return isSearchResponseWithAutomaticInsightsFlag(items);
        });

        // No need to pollute the context if `__automaticInsights=false`
        if (__automaticInsights) {
          var _store$getState$conte;
          setContext({
            algoliaInsightsPlugin: _objectSpread2(_objectSpread2({}, ((_store$getState$conte = store.getState().context) === null || _store$getState$conte === void 0 ? void 0 : _store$getState$conte.algoliaInsightsPlugin) || {}), {}, {
              __automaticInsights: __automaticInsights
            })
          });
        }
        return postResolve(responses, sources, store);
      }).then(function (collections) {
        return reshape({
          collections: collections,
          props: props,
          state: store.getState()
        });
      });
    }))).then(function (collections) {
      var _nextState$isOpen2;
      // Parameters passed to `onInput` could be stale when the following code
      // executes, because `onInput` calls may not resolve in order.
      // If it becomes a problem we'll need to save the last passed parameters.
      // See: https://codesandbox.io/s/agitated-cookies-y290z

      setStatus('idle');
      setCollections(collections);
      var isPanelOpen = props.shouldPanelOpen({
        state: store.getState()
      });
      setIsOpen((_nextState$isOpen2 = nextState.isOpen) !== null && _nextState$isOpen2 !== void 0 ? _nextState$isOpen2 : props.openOnFocus && !query && isPanelOpen || isPanelOpen);
      var highlightedItem = getActiveItem(store.getState());
      if (store.getState().activeItemId !== null && highlightedItem) {
        var item = highlightedItem.item,
          itemInputValue = highlightedItem.itemInputValue,
          itemUrl = highlightedItem.itemUrl,
          source = highlightedItem.source;
        source.onActive(_objectSpread2({
          event: event,
          item: item,
          itemInputValue: itemInputValue,
          itemUrl: itemUrl,
          refresh: refresh,
          source: source,
          state: store.getState()
        }, setters));
      }
    }).finally(function () {
      setStatus('idle');
      if (lastStalledId) {
        props.environment.clearTimeout(lastStalledId);
      }
    });
    return store.pendingRequests.add(request);
  }
  function isSearchResponseWithAutomaticInsightsFlag(items) {
    return !Array.isArray(items) && Boolean(items === null || items === void 0 ? void 0 : items._automaticInsights);
  }

  var _excluded$1 = ["event", "props", "refresh", "store"];
  function onKeyDown(_ref) {
    var event = _ref.event,
      props = _ref.props,
      refresh = _ref.refresh,
      store = _ref.store,
      setters = _objectWithoutProperties$1(_ref, _excluded$1);
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      // eslint-disable-next-line no-inner-declarations
      var triggerScrollIntoView = function triggerScrollIntoView() {
        var highlightedItem = getActiveItem(store.getState());
        var nodeItem = props.environment.document.getElementById(getAutocompleteElementId(props.id, "item-".concat(store.getState().activeItemId), highlightedItem === null || highlightedItem === void 0 ? void 0 : highlightedItem.source));
        if (nodeItem) {
          if (nodeItem.scrollIntoViewIfNeeded) {
            nodeItem.scrollIntoViewIfNeeded(false);
          } else {
            nodeItem.scrollIntoView(false);
          }
        }
      }; // eslint-disable-next-line no-inner-declarations
      var triggerOnActive = function triggerOnActive() {
        var highlightedItem = getActiveItem(store.getState());
        if (store.getState().activeItemId !== null && highlightedItem) {
          var item = highlightedItem.item,
            itemInputValue = highlightedItem.itemInputValue,
            itemUrl = highlightedItem.itemUrl,
            source = highlightedItem.source;
          source.onActive(_objectSpread2({
            event: event,
            item: item,
            itemInputValue: itemInputValue,
            itemUrl: itemUrl,
            refresh: refresh,
            source: source,
            state: store.getState()
          }, setters));
        }
      }; // Default browser behavior changes the caret placement on ArrowUp and
      // ArrowDown.
      event.preventDefault();

      // When re-opening the panel, we need to split the logic to keep the actions
      // synchronized as `onInput` returns a promise.
      if (store.getState().isOpen === false && (props.openOnFocus || Boolean(store.getState().query))) {
        onInput(_objectSpread2({
          event: event,
          props: props,
          query: store.getState().query,
          refresh: refresh,
          store: store
        }, setters)).then(function () {
          store.dispatch(event.key, {
            nextActiveItemId: props.defaultActiveItemId
          });
          triggerOnActive();
          // Since we rely on the DOM, we need to wait for all the micro tasks to
          // finish (which include re-opening the panel) to make sure all the
          // elements are available.
          setTimeout(triggerScrollIntoView, 0);
        });
      } else {
        store.dispatch(event.key, {});
        triggerOnActive();
        triggerScrollIntoView();
      }
    } else if (event.key === 'Escape') {
      // This prevents the default browser behavior on `input[type="search"]`
      // from removing the query right away because we first want to close the
      // panel.
      event.preventDefault();
      store.dispatch(event.key, null);

      // Hitting the `Escape` key signals the end of a user interaction with the
      // autocomplete. At this point, we should ignore any requests that are still
      // pending and could reopen the panel once they resolve, because that would
      // result in an unsolicited UI behavior.
      store.pendingRequests.cancelAll();
    } else if (event.key === 'Tab') {
      store.dispatch('blur', null);

      // Hitting the `Tab` key signals the end of a user interaction with the
      // autocomplete. At this point, we should ignore any requests that are still
      // pending and could reopen the panel once they resolve, because that would
      // result in an unsolicited UI behavior.
      store.pendingRequests.cancelAll();
    } else if (event.key === 'Enter') {
      // No active item, so we let the browser handle the native `onSubmit` form
      // event.
      if (store.getState().activeItemId === null || store.getState().collections.every(function (collection) {
        return collection.items.length === 0;
      })) {
        // If requests are still pending when the panel closes, they could reopen
        // the panel once they resolve.
        // We want to prevent any subsequent query from reopening the panel
        // because it would result in an unsolicited UI behavior.
        if (!props.debug) {
          store.pendingRequests.cancelAll();
        }
        return;
      }

      // This prevents the `onSubmit` event to be sent because an item is
      // highlighted.
      event.preventDefault();
      var _ref2 = getActiveItem(store.getState()),
        item = _ref2.item,
        itemInputValue = _ref2.itemInputValue,
        itemUrl = _ref2.itemUrl,
        source = _ref2.source;
      if (event.metaKey || event.ctrlKey) {
        if (itemUrl !== undefined) {
          source.onSelect(_objectSpread2({
            event: event,
            item: item,
            itemInputValue: itemInputValue,
            itemUrl: itemUrl,
            refresh: refresh,
            source: source,
            state: store.getState()
          }, setters));
          props.navigator.navigateNewTab({
            itemUrl: itemUrl,
            item: item,
            state: store.getState()
          });
        }
      } else if (event.shiftKey) {
        if (itemUrl !== undefined) {
          source.onSelect(_objectSpread2({
            event: event,
            item: item,
            itemInputValue: itemInputValue,
            itemUrl: itemUrl,
            refresh: refresh,
            source: source,
            state: store.getState()
          }, setters));
          props.navigator.navigateNewWindow({
            itemUrl: itemUrl,
            item: item,
            state: store.getState()
          });
        }
      } else if (event.altKey) ; else {
        if (itemUrl !== undefined) {
          source.onSelect(_objectSpread2({
            event: event,
            item: item,
            itemInputValue: itemInputValue,
            itemUrl: itemUrl,
            refresh: refresh,
            source: source,
            state: store.getState()
          }, setters));
          props.navigator.navigate({
            itemUrl: itemUrl,
            item: item,
            state: store.getState()
          });
          return;
        }
        onInput(_objectSpread2({
          event: event,
          nextState: {
            isOpen: false
          },
          props: props,
          query: itemInputValue,
          refresh: refresh,
          store: store
        }, setters)).then(function () {
          source.onSelect(_objectSpread2({
            event: event,
            item: item,
            itemInputValue: itemInputValue,
            itemUrl: itemUrl,
            refresh: refresh,
            source: source,
            state: store.getState()
          }, setters));
        });
      }
    }
  }

  var _excluded = ["props", "refresh", "store"],
    _excluded2 = ["inputElement", "formElement", "panelElement"],
    _excluded3 = ["inputElement"],
    _excluded4 = ["inputElement", "maxLength"],
    _excluded5 = ["source"],
    _excluded6 = ["item", "source"];
  function getPropGetters(_ref) {
    var props = _ref.props,
      refresh = _ref.refresh,
      store = _ref.store,
      setters = _objectWithoutProperties$1(_ref, _excluded);
    var getEnvironmentProps = function getEnvironmentProps(providedProps) {
      var inputElement = providedProps.inputElement,
        formElement = providedProps.formElement,
        panelElement = providedProps.panelElement,
        rest = _objectWithoutProperties$1(providedProps, _excluded2);
      function onMouseDownOrTouchStart(event) {
        // The `onTouchStart`/`onMouseDown` events shouldn't trigger the `blur`
        // handler when it's not an interaction with Autocomplete.
        // We detect it with the following heuristics:
        // - the panel is closed AND there are no pending requests
        //   (no interaction with the autocomplete, no future state updates)
        // - OR the touched target is the input element (should open the panel)
        var isAutocompleteInteraction = store.getState().isOpen || !store.pendingRequests.isEmpty();
        if (!isAutocompleteInteraction || event.target === inputElement) {
          return;
        }

        // @TODO: support cases where there are multiple Autocomplete instances.
        // Right now, a second instance makes this computation return false.
        var isTargetWithinAutocomplete = [formElement, panelElement].some(function (contextNode) {
          return isOrContainsNode(contextNode, event.target);
        });
        if (isTargetWithinAutocomplete === false) {
          store.dispatch('blur', null);

          // If requests are still pending when the user closes the panel, they
          // could reopen the panel once they resolve.
          // We want to prevent any subsequent query from reopening the panel
          // because it would result in an unsolicited UI behavior.
          if (!props.debug) {
            store.pendingRequests.cancelAll();
          }
        }
      }
      return _objectSpread2({
        // We do not rely on the native `blur` event of the input to close the
        // panel, but rather on a custom `touchstart`/`mousedown` event outside
        // of the autocomplete elements.
        // This ensures we don't mistakenly interpret interactions within the
        // autocomplete (but outside of the input) as a signal to close the panel.
        // For example, clicking reset button causes an input blur, but if
        // `openOnFocus=true`, it shouldn't close the panel.
        // On touch devices, scrolling results (`touchmove`) causes an input blur
        // but shouldn't close the panel.
        onTouchStart: onMouseDownOrTouchStart,
        onMouseDown: onMouseDownOrTouchStart,
        // When scrolling on touch devices (mobiles, tablets, etc.), we want to
        // mimic the native platform behavior where the input is blurred to
        // hide the virtual keyboard. This gives more vertical space to
        // discover all the suggestions showing up in the panel.
        onTouchMove: function onTouchMove(event) {
          if (store.getState().isOpen === false || inputElement !== props.environment.document.activeElement || event.target === inputElement) {
            return;
          }
          inputElement.blur();
        }
      }, rest);
    };
    var getRootProps = function getRootProps(rest) {
      return _objectSpread2({
        role: 'combobox',
        'aria-expanded': store.getState().isOpen,
        'aria-haspopup': 'listbox',
        'aria-controls': store.getState().isOpen ? store.getState().collections.map(function (_ref2) {
          var source = _ref2.source;
          return getAutocompleteElementId(props.id, 'list', source);
        }).join(' ') : undefined,
        'aria-labelledby': getAutocompleteElementId(props.id, 'label')
      }, rest);
    };
    var getFormProps = function getFormProps(providedProps) {
      providedProps.inputElement;
        var rest = _objectWithoutProperties$1(providedProps, _excluded3);
      return _objectSpread2({
        action: '',
        noValidate: true,
        role: 'search',
        onSubmit: function onSubmit(event) {
          var _providedProps$inputE;
          event.preventDefault();
          props.onSubmit(_objectSpread2({
            event: event,
            refresh: refresh,
            state: store.getState()
          }, setters));
          store.dispatch('submit', null);
          (_providedProps$inputE = providedProps.inputElement) === null || _providedProps$inputE === void 0 ? void 0 : _providedProps$inputE.blur();
        },
        onReset: function onReset(event) {
          var _providedProps$inputE2;
          event.preventDefault();
          props.onReset(_objectSpread2({
            event: event,
            refresh: refresh,
            state: store.getState()
          }, setters));
          store.dispatch('reset', null);
          (_providedProps$inputE2 = providedProps.inputElement) === null || _providedProps$inputE2 === void 0 ? void 0 : _providedProps$inputE2.focus();
        }
      }, rest);
    };
    var getInputProps = function getInputProps(providedProps) {
      var _props$environment$na;
      function onFocus(event) {
        // We want to trigger a query when `openOnFocus` is true
        // because the panel should open with the current query.
        if (props.openOnFocus || Boolean(store.getState().query)) {
          onInput(_objectSpread2({
            event: event,
            props: props,
            query: store.getState().completion || store.getState().query,
            refresh: refresh,
            store: store
          }, setters));
        }
        store.dispatch('focus', null);
      }
      var _ref3 = providedProps || {};
        _ref3.inputElement;
        var _ref3$maxLength = _ref3.maxLength,
        maxLength = _ref3$maxLength === void 0 ? 512 : _ref3$maxLength,
        rest = _objectWithoutProperties$1(_ref3, _excluded4);
      var activeItem = getActiveItem(store.getState());
      var userAgent = ((_props$environment$na = props.environment.navigator) === null || _props$environment$na === void 0 ? void 0 : _props$environment$na.userAgent) || '';
      var shouldFallbackKeyHint = isSamsung(userAgent);
      var enterKeyHint = props.enterKeyHint || (activeItem !== null && activeItem !== void 0 && activeItem.itemUrl && !shouldFallbackKeyHint ? 'go' : 'search');
      return _objectSpread2({
        'aria-autocomplete': 'both',
        'aria-activedescendant': store.getState().isOpen && store.getState().activeItemId !== null ? getAutocompleteElementId(props.id, "item-".concat(store.getState().activeItemId), activeItem === null || activeItem === void 0 ? void 0 : activeItem.source) : undefined,
        'aria-controls': store.getState().isOpen ? store.getState().collections.map(function (_ref4) {
          var source = _ref4.source;
          return getAutocompleteElementId(props.id, 'list', source);
        }).join(' ') : undefined,
        'aria-labelledby': getAutocompleteElementId(props.id, 'label'),
        value: store.getState().completion || store.getState().query,
        id: getAutocompleteElementId(props.id, 'input'),
        autoComplete: 'off',
        autoCorrect: 'off',
        autoCapitalize: 'off',
        enterKeyHint: enterKeyHint,
        spellCheck: 'false',
        autoFocus: props.autoFocus,
        placeholder: props.placeholder,
        maxLength: maxLength,
        type: 'search',
        onChange: function onChange(event) {
          var value = event.currentTarget.value;
          if (props.ignoreCompositionEvents && getNativeEvent(event).isComposing) {
            setters.setQuery(value);
            return;
          }
          onInput(_objectSpread2({
            event: event,
            props: props,
            query: value.slice(0, maxLength),
            refresh: refresh,
            store: store
          }, setters));
        },
        onCompositionEnd: function onCompositionEnd(event) {
          onInput(_objectSpread2({
            event: event,
            props: props,
            query: event.currentTarget.value.slice(0, maxLength),
            refresh: refresh,
            store: store
          }, setters));
        },
        onKeyDown: function onKeyDown$1(event) {
          if (getNativeEvent(event).isComposing) {
            return;
          }
          onKeyDown(_objectSpread2({
            event: event,
            props: props,
            refresh: refresh,
            store: store
          }, setters));
        },
        onFocus: onFocus,
        // We don't rely on the `blur` event.
        // See explanation in `onTouchStart`/`onMouseDown`.
        // @MAJOR See if we need to keep this handler.
        onBlur: noop,
        onClick: function onClick(event) {
          // When the panel is closed and you click on the input while
          // the input is focused, the `onFocus` event is not triggered
          // (default browser behavior).
          // In an autocomplete context, it makes sense to open the panel in this
          // case.
          // We mimic this event by catching the `onClick` event which
          // triggers the `onFocus` for the panel to open.
          if (providedProps.inputElement === props.environment.document.activeElement && !store.getState().isOpen) {
            onFocus(event);
          }
        }
      }, rest);
    };
    var getLabelProps = function getLabelProps(rest) {
      return _objectSpread2({
        htmlFor: getAutocompleteElementId(props.id, 'input'),
        id: getAutocompleteElementId(props.id, 'label')
      }, rest);
    };
    var getListProps = function getListProps(providedProps) {
      var _ref5 = providedProps || {},
        source = _ref5.source,
        rest = _objectWithoutProperties$1(_ref5, _excluded5);
      return _objectSpread2({
        role: 'listbox',
        'aria-labelledby': getAutocompleteElementId(props.id, 'label'),
        id: getAutocompleteElementId(props.id, 'list', source)
      }, rest);
    };
    var getPanelProps = function getPanelProps(rest) {
      return _objectSpread2({
        onMouseDown: function onMouseDown(event) {
          // Prevents the `activeElement` from being changed to the panel so
          // that the blur event is not triggered, otherwise it closes the
          // panel.
          event.preventDefault();
        },
        onMouseLeave: function onMouseLeave() {
          store.dispatch('mouseleave', null);
        }
      }, rest);
    };
    var getItemProps = function getItemProps(providedProps) {
      var item = providedProps.item,
        source = providedProps.source,
        rest = _objectWithoutProperties$1(providedProps, _excluded6);
      return _objectSpread2({
        id: getAutocompleteElementId(props.id, "item-".concat(item.__autocomplete_id), source),
        role: 'option',
        'aria-selected': store.getState().activeItemId === item.__autocomplete_id,
        onMouseMove: function onMouseMove(event) {
          if (item.__autocomplete_id === store.getState().activeItemId) {
            return;
          }
          store.dispatch('mousemove', item.__autocomplete_id);
          var activeItem = getActiveItem(store.getState());
          if (store.getState().activeItemId !== null && activeItem) {
            var _item = activeItem.item,
              itemInputValue = activeItem.itemInputValue,
              itemUrl = activeItem.itemUrl,
              _source = activeItem.source;
            _source.onActive(_objectSpread2({
              event: event,
              item: _item,
              itemInputValue: itemInputValue,
              itemUrl: itemUrl,
              refresh: refresh,
              source: _source,
              state: store.getState()
            }, setters));
          }
        },
        onMouseDown: function onMouseDown(event) {
          // Prevents the `activeElement` from being changed to the item so it
          // can remain with the current `activeElement`.
          event.preventDefault();
        },
        onClick: function onClick(event) {
          var itemInputValue = source.getItemInputValue({
            item: item,
            state: store.getState()
          });
          var itemUrl = source.getItemUrl({
            item: item,
            state: store.getState()
          });

          // If `getItemUrl` is provided, it means that the suggestion
          // is a link, not plain text that aims at updating the query.
          // We can therefore skip the state change because it will update
          // the `activeItemId`, resulting in a UI flash, especially
          // noticeable on mobile.
          var runPreCommand = itemUrl ? Promise.resolve() : onInput(_objectSpread2({
            event: event,
            nextState: {
              isOpen: false
            },
            props: props,
            query: itemInputValue,
            refresh: refresh,
            store: store
          }, setters));
          runPreCommand.then(function () {
            source.onSelect(_objectSpread2({
              event: event,
              item: item,
              itemInputValue: itemInputValue,
              itemUrl: itemUrl,
              refresh: refresh,
              source: source,
              state: store.getState()
            }, setters));
          });
        }
      }, rest);
    };
    return {
      getEnvironmentProps: getEnvironmentProps,
      getRootProps: getRootProps,
      getFormProps: getFormProps,
      getLabelProps: getLabelProps,
      getInputProps: getInputProps,
      getPanelProps: getPanelProps,
      getListProps: getListProps,
      getItemProps: getItemProps
    };
  }

  function getMetadata(_ref) {
    var _, _options$__autocomple, _options$__autocomple2, _options$__autocomple3;
    var plugins = _ref.plugins,
      options = _ref.options;
    var optionsKey = (_ = (((_options$__autocomple = options.__autocomplete_metadata) === null || _options$__autocomple === void 0 ? void 0 : _options$__autocomple.userAgents) || [])[0]) === null || _ === void 0 ? void 0 : _.segment;
    var extraOptions = optionsKey ? _defineProperty$2({}, optionsKey, Object.keys(((_options$__autocomple2 = options.__autocomplete_metadata) === null || _options$__autocomple2 === void 0 ? void 0 : _options$__autocomple2.options) || {})) : {};
    return {
      plugins: plugins.map(function (plugin) {
        return {
          name: plugin.name,
          options: Object.keys(plugin.__autocomplete_pluginOptions || [])
        };
      }),
      options: _objectSpread2({
        'autocomplete-core': Object.keys(options)
      }, extraOptions),
      ua: userAgents.concat(((_options$__autocomple3 = options.__autocomplete_metadata) === null || _options$__autocomple3 === void 0 ? void 0 : _options$__autocomple3.userAgents) || [])
    };
  }
  function injectMetadata(_ref3) {
    var _environment$navigato, _environment$navigato2;
    var metadata = _ref3.metadata,
      environment = _ref3.environment;
    var isMetadataEnabled = (_environment$navigato = environment.navigator) === null || _environment$navigato === void 0 ? void 0 : (_environment$navigato2 = _environment$navigato.userAgent) === null || _environment$navigato2 === void 0 ? void 0 : _environment$navigato2.includes('Algolia Crawler');
    if (isMetadataEnabled) {
      var metadataContainer = environment.document.createElement('meta');
      var headRef = environment.document.querySelector('head');
      metadataContainer.name = 'algolia:metadata';
      setTimeout(function () {
        metadataContainer.content = JSON.stringify(metadata);
        headRef.appendChild(metadataContainer);
      }, 0);
    }
  }

  function getCompletion(_ref) {
    var _getActiveItem;
    var state = _ref.state;
    if (state.isOpen === false || state.activeItemId === null) {
      return null;
    }
    return ((_getActiveItem = getActiveItem(state)) === null || _getActiveItem === void 0 ? void 0 : _getActiveItem.itemInputValue) || null;
  }

  var stateReducer = function stateReducer(state, action) {
    switch (action.type) {
      case 'setActiveItemId':
        {
          return _objectSpread2(_objectSpread2({}, state), {}, {
            activeItemId: action.payload
          });
        }
      case 'setQuery':
        {
          return _objectSpread2(_objectSpread2({}, state), {}, {
            query: action.payload,
            completion: null
          });
        }
      case 'setCollections':
        {
          return _objectSpread2(_objectSpread2({}, state), {}, {
            collections: action.payload
          });
        }
      case 'setIsOpen':
        {
          return _objectSpread2(_objectSpread2({}, state), {}, {
            isOpen: action.payload
          });
        }
      case 'setStatus':
        {
          return _objectSpread2(_objectSpread2({}, state), {}, {
            status: action.payload
          });
        }
      case 'setContext':
        {
          return _objectSpread2(_objectSpread2({}, state), {}, {
            context: _objectSpread2(_objectSpread2({}, state.context), action.payload)
          });
        }
      case 'ArrowDown':
        {
          var nextState = _objectSpread2(_objectSpread2({}, state), {}, {
            activeItemId: action.payload.hasOwnProperty('nextActiveItemId') ? action.payload.nextActiveItemId : getNextActiveItemId(1, state.activeItemId, getItemsCount(state), action.props.defaultActiveItemId)
          });
          return _objectSpread2(_objectSpread2({}, nextState), {}, {
            completion: getCompletion({
              state: nextState
            })
          });
        }
      case 'ArrowUp':
        {
          var _nextState = _objectSpread2(_objectSpread2({}, state), {}, {
            activeItemId: getNextActiveItemId(-1, state.activeItemId, getItemsCount(state), action.props.defaultActiveItemId)
          });
          return _objectSpread2(_objectSpread2({}, _nextState), {}, {
            completion: getCompletion({
              state: _nextState
            })
          });
        }
      case 'Escape':
        {
          if (state.isOpen) {
            return _objectSpread2(_objectSpread2({}, state), {}, {
              activeItemId: null,
              isOpen: false,
              completion: null
            });
          }
          return _objectSpread2(_objectSpread2({}, state), {}, {
            activeItemId: null,
            query: '',
            status: 'idle',
            collections: []
          });
        }
      case 'submit':
        {
          return _objectSpread2(_objectSpread2({}, state), {}, {
            activeItemId: null,
            isOpen: false,
            status: 'idle'
          });
        }
      case 'reset':
        {
          return _objectSpread2(_objectSpread2({}, state), {}, {
            activeItemId:
            // Since we open the panel on reset when openOnFocus=true
            // we need to restore the highlighted index to the defaultActiveItemId. (DocSearch use-case)

            // Since we close the panel when openOnFocus=false
            // we lose track of the highlighted index. (Query-suggestions use-case)
            action.props.openOnFocus === true ? action.props.defaultActiveItemId : null,
            status: 'idle',
            completion: null,
            query: ''
          });
        }
      case 'focus':
        {
          return _objectSpread2(_objectSpread2({}, state), {}, {
            activeItemId: action.props.defaultActiveItemId,
            isOpen: (action.props.openOnFocus || Boolean(state.query)) && action.props.shouldPanelOpen({
              state: state
            })
          });
        }
      case 'blur':
        {
          if (action.props.debug) {
            return state;
          }
          return _objectSpread2(_objectSpread2({}, state), {}, {
            isOpen: false,
            activeItemId: null
          });
        }
      case 'mousemove':
        {
          return _objectSpread2(_objectSpread2({}, state), {}, {
            activeItemId: action.payload
          });
        }
      case 'mouseleave':
        {
          return _objectSpread2(_objectSpread2({}, state), {}, {
            activeItemId: action.props.defaultActiveItemId
          });
        }
      default:
        invariant(false, "The reducer action ".concat(JSON.stringify(action.type), " is not supported."));
        return state;
    }
  };

  function createAutocomplete(options) {
    checkOptions(options);
    var subscribers = [];
    var props = getDefaultProps(options, subscribers);
    var store = createStore(stateReducer, props, onStoreStateChange);
    var setters = getAutocompleteSetters({
      store: store
    });
    var propGetters = getPropGetters(_objectSpread2({
      props: props,
      refresh: refresh,
      store: store,
      navigator: props.navigator
    }, setters));
    function onStoreStateChange(_ref) {
      var _state$context, _state$context$algoli;
      var prevState = _ref.prevState,
        state = _ref.state;
      props.onStateChange(_objectSpread2({
        prevState: prevState,
        state: state,
        refresh: refresh,
        navigator: props.navigator
      }, setters));
      if (!isAlgoliaInsightsPluginEnabled() && (_state$context = state.context) !== null && _state$context !== void 0 && (_state$context$algoli = _state$context.algoliaInsightsPlugin) !== null && _state$context$algoli !== void 0 && _state$context$algoli.__automaticInsights && props.insights !== false) {
        var plugin = createAlgoliaInsightsPlugin({
          __autocomplete_clickAnalytics: false
        });
        props.plugins.push(plugin);
        subscribePlugins([plugin]);
      }
    }
    function refresh() {
      return onInput(_objectSpread2({
        event: new Event('input'),
        nextState: {
          isOpen: store.getState().isOpen
        },
        props: props,
        navigator: props.navigator,
        query: store.getState().query,
        refresh: refresh,
        store: store
      }, setters));
    }
    function subscribePlugins(plugins) {
      plugins.forEach(function (plugin) {
        var _plugin$subscribe;
        return (_plugin$subscribe = plugin.subscribe) === null || _plugin$subscribe === void 0 ? void 0 : _plugin$subscribe.call(plugin, _objectSpread2(_objectSpread2({}, setters), {}, {
          navigator: props.navigator,
          refresh: refresh,
          onSelect: function onSelect(fn) {
            subscribers.push({
              onSelect: fn
            });
          },
          onActive: function onActive(fn) {
            subscribers.push({
              onActive: fn
            });
          },
          onResolve: function onResolve(fn) {
            subscribers.push({
              onResolve: fn
            });
          }
        }));
      });
    }
    function isAlgoliaInsightsPluginEnabled() {
      return props.plugins.some(function (plugin) {
        return plugin.name === 'aa.algoliaInsightsPlugin';
      });
    }
    if (props.insights && !isAlgoliaInsightsPluginEnabled()) {
      var insightsParams = typeof props.insights === 'boolean' ? {} : props.insights;
      props.plugins.push(createAlgoliaInsightsPlugin(insightsParams));
    }
    subscribePlugins(props.plugins);
    injectMetadata({
      metadata: getMetadata({
        plugins: props.plugins,
        options: options
      }),
      environment: props.environment
    });
    return _objectSpread2(_objectSpread2({
      refresh: refresh,
      navigator: props.navigator
    }, propGetters), setters);
  }

  exports.createAutocomplete = createAutocomplete;
  exports.getDefaultProps = getDefaultProps;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.development.js.map
