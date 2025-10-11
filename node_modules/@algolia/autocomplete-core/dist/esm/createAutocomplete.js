function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { createAlgoliaInsightsPlugin } from '@algolia/autocomplete-plugin-algolia-insights';
import { checkOptions } from './checkOptions';
import { createStore } from './createStore';
import { getAutocompleteSetters } from './getAutocompleteSetters';
import { getDefaultProps } from './getDefaultProps';
import { getPropGetters } from './getPropGetters';
import { getMetadata, injectMetadata } from './metadata';
import { onInput } from './onInput';
import { stateReducer } from './stateReducer';
export function createAutocomplete(options) {
  checkOptions(options);
  var subscribers = [];
  var props = getDefaultProps(options, subscribers);
  var store = createStore(stateReducer, props, onStoreStateChange);
  var setters = getAutocompleteSetters({
    store: store
  });
  var propGetters = getPropGetters(_objectSpread({
    props: props,
    refresh: refresh,
    store: store,
    navigator: props.navigator
  }, setters));
  function onStoreStateChange(_ref) {
    var _state$context, _state$context$algoli;
    var prevState = _ref.prevState,
      state = _ref.state;
    props.onStateChange(_objectSpread({
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
    return onInput(_objectSpread({
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
      return (_plugin$subscribe = plugin.subscribe) === null || _plugin$subscribe === void 0 ? void 0 : _plugin$subscribe.call(plugin, _objectSpread(_objectSpread({}, setters), {}, {
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
  return _objectSpread(_objectSpread({
    refresh: refresh,
    navigator: props.navigator
  }, propGetters), setters);
}