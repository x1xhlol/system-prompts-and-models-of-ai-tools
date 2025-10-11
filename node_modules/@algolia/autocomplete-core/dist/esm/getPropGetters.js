function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var _excluded = ["props", "refresh", "store"],
  _excluded2 = ["inputElement", "formElement", "panelElement"],
  _excluded3 = ["inputElement"],
  _excluded4 = ["inputElement", "maxLength"],
  _excluded5 = ["source"],
  _excluded6 = ["item", "source"];
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
import { noop } from '@algolia/autocomplete-shared';
import { onInput } from './onInput';
import { onKeyDown as _onKeyDown } from './onKeyDown';
import { getActiveItem, getAutocompleteElementId, isOrContainsNode, isSamsung, getNativeEvent } from './utils';
export function getPropGetters(_ref) {
  var props = _ref.props,
    refresh = _ref.refresh,
    store = _ref.store,
    setters = _objectWithoutProperties(_ref, _excluded);
  var getEnvironmentProps = function getEnvironmentProps(providedProps) {
    var inputElement = providedProps.inputElement,
      formElement = providedProps.formElement,
      panelElement = providedProps.panelElement,
      rest = _objectWithoutProperties(providedProps, _excluded2);
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
    return _objectSpread({
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
    return _objectSpread({
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
    var inputElement = providedProps.inputElement,
      rest = _objectWithoutProperties(providedProps, _excluded3);
    return _objectSpread({
      action: '',
      noValidate: true,
      role: 'search',
      onSubmit: function onSubmit(event) {
        var _providedProps$inputE;
        event.preventDefault();
        props.onSubmit(_objectSpread({
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
        props.onReset(_objectSpread({
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
        onInput(_objectSpread({
          event: event,
          props: props,
          query: store.getState().completion || store.getState().query,
          refresh: refresh,
          store: store
        }, setters));
      }
      store.dispatch('focus', null);
    }
    var _ref3 = providedProps || {},
      inputElement = _ref3.inputElement,
      _ref3$maxLength = _ref3.maxLength,
      maxLength = _ref3$maxLength === void 0 ? 512 : _ref3$maxLength,
      rest = _objectWithoutProperties(_ref3, _excluded4);
    var activeItem = getActiveItem(store.getState());
    var userAgent = ((_props$environment$na = props.environment.navigator) === null || _props$environment$na === void 0 ? void 0 : _props$environment$na.userAgent) || '';
    var shouldFallbackKeyHint = isSamsung(userAgent);
    var enterKeyHint = props.enterKeyHint || (activeItem !== null && activeItem !== void 0 && activeItem.itemUrl && !shouldFallbackKeyHint ? 'go' : 'search');
    return _objectSpread({
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
        onInput(_objectSpread({
          event: event,
          props: props,
          query: value.slice(0, maxLength),
          refresh: refresh,
          store: store
        }, setters));
      },
      onCompositionEnd: function onCompositionEnd(event) {
        onInput(_objectSpread({
          event: event,
          props: props,
          query: event.currentTarget.value.slice(0, maxLength),
          refresh: refresh,
          store: store
        }, setters));
      },
      onKeyDown: function onKeyDown(event) {
        if (getNativeEvent(event).isComposing) {
          return;
        }
        _onKeyDown(_objectSpread({
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
    return _objectSpread({
      htmlFor: getAutocompleteElementId(props.id, 'input'),
      id: getAutocompleteElementId(props.id, 'label')
    }, rest);
  };
  var getListProps = function getListProps(providedProps) {
    var _ref5 = providedProps || {},
      source = _ref5.source,
      rest = _objectWithoutProperties(_ref5, _excluded5);
    return _objectSpread({
      role: 'listbox',
      'aria-labelledby': getAutocompleteElementId(props.id, 'label'),
      id: getAutocompleteElementId(props.id, 'list', source)
    }, rest);
  };
  var getPanelProps = function getPanelProps(rest) {
    return _objectSpread({
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
      rest = _objectWithoutProperties(providedProps, _excluded6);
    return _objectSpread({
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
          _source.onActive(_objectSpread({
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
        var runPreCommand = itemUrl ? Promise.resolve() : onInput(_objectSpread({
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
          source.onSelect(_objectSpread({
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