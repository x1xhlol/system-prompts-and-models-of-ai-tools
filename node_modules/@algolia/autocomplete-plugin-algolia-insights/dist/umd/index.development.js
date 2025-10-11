/*! @algolia/autocomplete-plugin-algolia-insights 1.17.7 | MIT License | © Algolia, Inc. and contributors | https://github.com/algolia/autocomplete */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["@algolia/autocomplete-plugin-algolia-insights"] = {}));
})(this, (function (exports) { 'use strict';

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
  function _objectSpread2(target) {
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
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
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

  var _excluded = ["items"],
    _excluded2 = ["items"];
  function chunk(item) {
    var chunkSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;
    var chunks = [];
    for (var i = 0; i < item.objectIDs.length; i += chunkSize) {
      chunks.push(_objectSpread2(_objectSpread2({}, item), {}, {
        objectIDs: item.objectIDs.slice(i, i + chunkSize)
      }));
    }
    return chunks;
  }
  function mapToInsightsParamsApi(params) {
    return params.map(function (_ref) {
      var items = _ref.items,
        param = _objectWithoutProperties(_ref, _excluded);
      return _objectSpread2(_objectSpread2({}, param), {}, {
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
            return [].concat(_toConsumableArray(acc), _toConsumableArray(chunk(_objectSpread2(_objectSpread2({}, param), {}, {
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
        return _objectSpread2({
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
      insightsClient('init', _objectSpread2({
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
              __algoliaSearchParameters: _objectSpread2(_objectSpread2({}, __autocomplete_clickAnalytics ? {
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
            insightsEvents: [_objectSpread2({
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
            insightsEvents: [_objectSpread2({
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
    return _objectSpread2({
      onItemsChange: function onItemsChange(_ref8) {
        var insights = _ref8.insights,
          insightsEvents = _ref8.insightsEvents,
          state = _ref8.state;
        insights.viewedObjectIDs.apply(insights, _toConsumableArray(insightsEvents.map(function (event) {
          return _objectSpread2(_objectSpread2({}, event), {}, {
            algoliaSource: getAlgoliaSources(event.algoliaSource, state.context)
          });
        })));
      },
      onSelect: function onSelect(_ref9) {
        var insights = _ref9.insights,
          insightsEvents = _ref9.insightsEvents,
          state = _ref9.state;
        insights.clickedObjectIDsAfterSearch.apply(insights, _toConsumableArray(insightsEvents.map(function (event) {
          return _objectSpread2(_objectSpread2({}, event), {}, {
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

  exports.createAlgoliaInsightsPlugin = createAlgoliaInsightsPlugin;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.development.js.map
