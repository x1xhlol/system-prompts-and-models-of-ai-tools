/*! @algolia/autocomplete-preset-algolia 1.17.7 | MIT License | © Algolia, Inc. and contributors | https://github.com/algolia/autocomplete */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["@algolia/autocomplete-preset-algolia"] = {}));
})(this, (function (exports) { 'use strict';

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
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
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
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
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

  function getAttributeValueByPath(record, path) {
    return path.reduce(function (current, key) {
      return current && current[key];
    }, record);
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

  var HIGHLIGHT_PRE_TAG = '__aa-highlight__';
  var HIGHLIGHT_POST_TAG = '__/aa-highlight__';

  /**
   * Creates a data structure that allows to concatenate similar highlighting
   * parts in a single value.
   */
  function createAttributeSet() {
    var initialValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var value = initialValue;
    return {
      get: function get() {
        return value;
      },
      add: function add(part) {
        var lastPart = value[value.length - 1];
        if ((lastPart === null || lastPart === void 0 ? void 0 : lastPart.isHighlighted) === part.isHighlighted) {
          value[value.length - 1] = {
            value: lastPart.value + part.value,
            isHighlighted: lastPart.isHighlighted
          };
        } else {
          value.push(part);
        }
      }
    };
  }
  function parseAttribute(_ref) {
    var highlightedValue = _ref.highlightedValue;
    var preTagParts = highlightedValue.split(HIGHLIGHT_PRE_TAG);
    var firstValue = preTagParts.shift();
    var parts = createAttributeSet(firstValue ? [{
      value: firstValue,
      isHighlighted: false
    }] : []);
    preTagParts.forEach(function (part) {
      var postTagParts = part.split(HIGHLIGHT_POST_TAG);
      parts.add({
        value: postTagParts[0],
        isHighlighted: true
      });
      if (postTagParts[1] !== '') {
        parts.add({
          value: postTagParts[1],
          isHighlighted: false
        });
      }
    });
    return parts.get();
  }

  function parseAlgoliaHitHighlight(_ref) {
    var hit = _ref.hit,
      attribute = _ref.attribute;
    var path = Array.isArray(attribute) ? attribute : [attribute];
    var highlightedValue = getAttributeValueByPath(hit, ['_highlightResult'].concat(_toConsumableArray(path), ['value']));
    if (typeof highlightedValue !== 'string') {
      "development" !== 'production' ? warn(false, "The attribute \"".concat(path.join('.'), "\" described by the path ").concat(JSON.stringify(path), " does not exist on the hit. Did you set it in `attributesToHighlight`?") + '\nSee https://www.algolia.com/doc/api-reference/api-parameters/attributesToHighlight/') : void 0;
      highlightedValue = getAttributeValueByPath(hit, path) || '';
    }
    return parseAttribute({
      highlightedValue: highlightedValue
    });
  }

  var htmlEscapes = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };
  var hasAlphanumeric = new RegExp(/\w/i);
  var regexEscapedHtml = /&(amp|quot|lt|gt|#39);/g;
  var regexHasEscapedHtml = RegExp(regexEscapedHtml.source);
  function unescape(value) {
    return value && regexHasEscapedHtml.test(value) ? value.replace(regexEscapedHtml, function (character) {
      return htmlEscapes[character];
    }) : value;
  }
  function isPartHighlighted(parts, i) {
    var _parts, _parts2;
    var current = parts[i];
    var isNextHighlighted = ((_parts = parts[i + 1]) === null || _parts === void 0 ? void 0 : _parts.isHighlighted) || true;
    var isPreviousHighlighted = ((_parts2 = parts[i - 1]) === null || _parts2 === void 0 ? void 0 : _parts2.isHighlighted) || true;
    if (!hasAlphanumeric.test(unescape(current.value)) && isPreviousHighlighted === isNextHighlighted) {
      return isPreviousHighlighted;
    }
    return current.isHighlighted;
  }

  function reverseHighlightedParts(parts) {
    // We don't want to highlight the whole word when no parts match.
    if (!parts.some(function (part) {
      return part.isHighlighted;
    })) {
      return parts.map(function (part) {
        return _objectSpread2(_objectSpread2({}, part), {}, {
          isHighlighted: false
        });
      });
    }
    return parts.map(function (part, i) {
      return _objectSpread2(_objectSpread2({}, part), {}, {
        isHighlighted: !isPartHighlighted(parts, i)
      });
    });
  }

  function parseAlgoliaHitReverseHighlight(props) {
    return reverseHighlightedParts(parseAlgoliaHitHighlight(props));
  }

  function parseAlgoliaHitSnippet(_ref) {
    var hit = _ref.hit,
      attribute = _ref.attribute;
    var path = Array.isArray(attribute) ? attribute : [attribute];
    var highlightedValue = getAttributeValueByPath(hit, ['_snippetResult'].concat(_toConsumableArray(path), ['value']));
    if (typeof highlightedValue !== 'string') {
      "development" !== 'production' ? warn(false, "The attribute \"".concat(path.join('.'), "\" described by the path ").concat(JSON.stringify(path), " does not exist on the hit. Did you set it in `attributesToSnippet`?") + '\nSee https://www.algolia.com/doc/api-reference/api-parameters/attributesToSnippet/') : void 0;
      highlightedValue = getAttributeValueByPath(hit, path) || '';
    }
    return parseAttribute({
      highlightedValue: highlightedValue
    });
  }

  function parseAlgoliaHitReverseSnippet(props) {
    return reverseHighlightedParts(parseAlgoliaHitSnippet(props));
  }

  function createRequester(fetcher, requesterId) {
    function execute(fetcherParams) {
      return fetcher({
        searchClient: fetcherParams.searchClient,
        queries: fetcherParams.requests.map(function (x) {
          return x.query;
        })
      }).then(function (responses) {
        return responses.map(function (response, index) {
          var _fetcherParams$reques = fetcherParams.requests[index],
            sourceId = _fetcherParams$reques.sourceId,
            transformResponse = _fetcherParams$reques.transformResponse;
          return {
            items: response,
            sourceId: sourceId,
            transformResponse: transformResponse
          };
        });
      });
    }
    return function createSpecifiedRequester(requesterParams) {
      return function requester(requestParams) {
        return _objectSpread2(_objectSpread2({
          requesterId: requesterId,
          execute: execute
        }, requesterParams), requestParams);
      };
    };
  }

  // typed as any, since it accepts the _real_ js clients, not the interface we otherwise expect
  function getAppIdAndApiKey(searchClient) {
    var transporter = searchClient.transporter || {};
    var headers = transporter.headers || transporter.baseHeaders || {};
    var queryParameters = transporter.queryParameters || transporter.baseQueryParameters || {};
    var APP_ID = 'x-algolia-application-id';
    var API_KEY = 'x-algolia-api-key';
    var appId = headers[APP_ID] || queryParameters[APP_ID];
    var apiKey = headers[API_KEY] || queryParameters[API_KEY];
    return {
      appId: appId,
      apiKey: apiKey
    };
  }

  var _excluded = ["params"];
  function fetchAlgoliaResults(_ref) {
    var searchClient = _ref.searchClient,
      queries = _ref.queries,
      _ref$userAgents = _ref.userAgents,
      userAgents$1 = _ref$userAgents === void 0 ? [] : _ref$userAgents;
    if (typeof searchClient.addAlgoliaAgent === 'function') {
      var algoliaAgents = [].concat(_toConsumableArray(userAgents), _toConsumableArray(userAgents$1));
      algoliaAgents.forEach(function (_ref2) {
        var segment = _ref2.segment,
          version = _ref2.version;
        searchClient.addAlgoliaAgent(segment, version);
      });
    }
    var _getAppIdAndApiKey = getAppIdAndApiKey(searchClient),
      appId = _getAppIdAndApiKey.appId,
      apiKey = _getAppIdAndApiKey.apiKey;
    invariant(Boolean(appId), 'The Algolia `appId` was not accessible from the searchClient passed.');
    invariant(Boolean(apiKey), 'The Algolia `apiKey` was not accessible from the searchClient passed.');
    return searchClient.search(queries.map(function (searchParameters) {
      var params = searchParameters.params,
        headers = _objectWithoutProperties(searchParameters, _excluded);
      return _objectSpread2(_objectSpread2({}, headers), {}, {
        params: _objectSpread2({
          hitsPerPage: 5,
          highlightPreTag: HIGHLIGHT_PRE_TAG,
          highlightPostTag: HIGHLIGHT_POST_TAG
        }, params)
      });
    })).then(function (response) {
      return response.results.map(function (result, resultIndex) {
        var _result$hits;
        return _objectSpread2(_objectSpread2({}, result), {}, {
          hits: (_result$hits = result.hits) === null || _result$hits === void 0 ? void 0 : _result$hits.map(function (hit) {
            return _objectSpread2(_objectSpread2({}, hit), {}, {
              // Bring support for the Insights plugin.
              __autocomplete_indexName: result.index || queries[resultIndex].indexName,
              __autocomplete_queryID: result.queryID,
              __autocomplete_algoliaCredentials: {
                appId: appId,
                apiKey: apiKey
              }
            });
          })
        });
      });
    });
  }

  var createAlgoliaRequester = createRequester(fetchAlgoliaResults, 'algolia');

  /**
   * Retrieves Algolia facet hits from multiple indices.
   */
  function getAlgoliaFacets(requestParams) {
    invariant(_typeof(requestParams.searchClient) === 'object', 'The `searchClient` parameter is required for getAlgoliaFacets({ searchClient }).');
    var requester = createAlgoliaRequester({
      transformResponse: function transformResponse(response) {
        return response.facetHits;
      }
    });
    var queries = requestParams.queries.map(function (query) {
      return _objectSpread2(_objectSpread2({}, query), {}, {
        type: 'facet'
      });
    });
    return requester(_objectSpread2(_objectSpread2({}, requestParams), {}, {
      queries: queries
    }));
  }

  /**
   * Retrieves Algolia results from multiple indices.
   */
  function getAlgoliaResults(requestParams) {
    invariant(_typeof(requestParams.searchClient) === 'object', 'The `searchClient` parameter is required for getAlgoliaResults({ searchClient }).');
    var requester = createAlgoliaRequester({
      transformResponse: function transformResponse(response) {
        return response.hits;
      }
    });
    return requester(requestParams);
  }

  exports.createRequester = createRequester;
  exports.fetchAlgoliaResults = fetchAlgoliaResults;
  exports.getAlgoliaFacets = getAlgoliaFacets;
  exports.getAlgoliaResults = getAlgoliaResults;
  exports.parseAlgoliaHitHighlight = parseAlgoliaHitHighlight;
  exports.parseAlgoliaHitReverseHighlight = parseAlgoliaHitReverseHighlight;
  exports.parseAlgoliaHitReverseSnippet = parseAlgoliaHitReverseSnippet;
  exports.parseAlgoliaHitSnippet = parseAlgoliaHitSnippet;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.development.js.map
