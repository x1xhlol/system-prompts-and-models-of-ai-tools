import {
  tabbable,
  focusable,
  isFocusable,
  isTabbable,
  getTabIndex,
} from 'tabbable';

const activeFocusTraps = {
  activateTrap(trapStack, trap) {
    if (trapStack.length > 0) {
      const activeTrap = trapStack[trapStack.length - 1];
      if (activeTrap !== trap) {
        activeTrap._setPausedState(true);
      }
    }

    const trapIndex = trapStack.indexOf(trap);
    if (trapIndex === -1) {
      trapStack.push(trap);
    } else {
      // move this existing trap to the front of the queue
      trapStack.splice(trapIndex, 1);
      trapStack.push(trap);
    }
  },

  deactivateTrap(trapStack, trap) {
    const trapIndex = trapStack.indexOf(trap);
    if (trapIndex !== -1) {
      trapStack.splice(trapIndex, 1);
    }

    if (
      trapStack.length > 0 &&
      !trapStack[trapStack.length - 1]._isManuallyPaused()
    ) {
      trapStack[trapStack.length - 1]._setPausedState(false);
    }
  },
};

const isSelectableInput = function (node) {
  return (
    node.tagName &&
    node.tagName.toLowerCase() === 'input' &&
    typeof node.select === 'function'
  );
};

const isEscapeEvent = function (e) {
  return e?.key === 'Escape' || e?.key === 'Esc' || e?.keyCode === 27;
};

const isTabEvent = function (e) {
  return e?.key === 'Tab' || e?.keyCode === 9;
};

// checks for TAB by default
const isKeyForward = function (e) {
  return isTabEvent(e) && !e.shiftKey;
};

// checks for SHIFT+TAB by default
const isKeyBackward = function (e) {
  return isTabEvent(e) && e.shiftKey;
};

const delay = function (fn) {
  return setTimeout(fn, 0);
};

/**
 * Get an option's value when it could be a plain value, or a handler that provides
 *  the value.
 * @param {*} value Option's value to check.
 * @param {...*} [params] Any parameters to pass to the handler, if `value` is a function.
 * @returns {*} The `value`, or the handler's returned value.
 */
const valueOrHandler = function (value, ...params) {
  return typeof value === 'function' ? value(...params) : value;
};

const getActualTarget = function (event) {
  // NOTE: If the trap is _inside_ a shadow DOM, event.target will always be the
  //  shadow host. However, event.target.composedPath() will be an array of
  //  nodes "clicked" from inner-most (the actual element inside the shadow) to
  //  outer-most (the host HTML document). If we have access to composedPath(),
  //  then use its first element; otherwise, fall back to event.target (and
  //  this only works for an _open_ shadow DOM; otherwise,
  //  composedPath()[0] === event.target always).
  return event.target.shadowRoot && typeof event.composedPath === 'function'
    ? event.composedPath()[0]
    : event.target;
};

// NOTE: this must be _outside_ `createFocusTrap()` to make sure all traps in this
//  current instance use the same stack if `userOptions.trapStack` isn't specified
const internalTrapStack = [];

const createFocusTrap = function (elements, userOptions) {
  // SSR: a live trap shouldn't be created in this type of environment so this
  //  should be safe code to execute if the `document` option isn't specified
  const doc = userOptions?.document || document;

  const trapStack = userOptions?.trapStack || internalTrapStack;

  const config = {
    returnFocusOnDeactivate: true,
    escapeDeactivates: true,
    delayInitialFocus: true,
    isKeyForward,
    isKeyBackward,
    ...userOptions,
  };

  const state = {
    // containers given to createFocusTrap()
    // @type {Array<HTMLElement>}
    containers: [],

    // list of objects identifying tabbable nodes in `containers` in the trap
    // NOTE: it's possible that a group has no tabbable nodes if nodes get removed while the trap
    //  is active, but the trap should never get to a state where there isn't at least one group
    //  with at least one tabbable node in it (that would lead to an error condition that would
    //  result in an error being thrown)
    // @type {Array<{
    //   container: HTMLElement,
    //   tabbableNodes: Array<HTMLElement>, // empty if none
    //   focusableNodes: Array<HTMLElement>, // empty if none
    //   posTabIndexesFound: boolean,
    //   firstTabbableNode: HTMLElement|undefined,
    //   lastTabbableNode: HTMLElement|undefined,
    //   firstDomTabbableNode: HTMLElement|undefined,
    //   lastDomTabbableNode: HTMLElement|undefined,
    //   nextTabbableNode: (node: HTMLElement, forward: boolean) => HTMLElement|undefined
    // }>}
    containerGroups: [], // same order/length as `containers` list

    // references to objects in `containerGroups`, but only those that actually have
    //  tabbable nodes in them
    // NOTE: same order as `containers` and `containerGroups`, but __not necessarily__
    //  the same length
    tabbableGroups: [],

    nodeFocusedBeforeActivation: null,
    mostRecentlyFocusedNode: null,
    active: false,
    paused: false,
    manuallyPaused: false,

    // timer ID for when delayInitialFocus is true and initial focus in this trap
    //  has been delayed during activation
    delayInitialFocusTimer: undefined,

    // the most recent KeyboardEvent for the configured nav key (typically [SHIFT+]TAB), if any
    recentNavEvent: undefined,
  };

  let trap; // eslint-disable-line prefer-const -- some private functions reference it, and its methods reference private functions, so we must declare here and define later

  /**
   * Gets a configuration option value.
   * @param {Object|undefined} configOverrideOptions If true, and option is defined in this set,
   *  value will be taken from this object. Otherwise, value will be taken from base configuration.
   * @param {string} optionName Name of the option whose value is sought.
   * @param {string|undefined} [configOptionName] Name of option to use __instead of__ `optionName`
   *  IIF `configOverrideOptions` is not defined. Otherwise, `optionName` is used.
   */
  const getOption = (configOverrideOptions, optionName, configOptionName) => {
    return configOverrideOptions &&
      configOverrideOptions[optionName] !== undefined
      ? configOverrideOptions[optionName]
      : config[configOptionName || optionName];
  };

  /**
   * Finds the index of the container that contains the element.
   * @param {HTMLElement} element
   * @param {Event} [event] If available, and `element` isn't directly found in any container,
   *  the event's composed path is used to see if includes any known trap containers in the
   *  case where the element is inside a Shadow DOM.
   * @returns {number} Index of the container in either `state.containers` or
   *  `state.containerGroups` (the order/length of these lists are the same); -1
   *  if the element isn't found.
   */
  const findContainerIndex = function (element, event) {
    const composedPath =
      typeof event?.composedPath === 'function'
        ? event.composedPath()
        : undefined;
    // NOTE: search `containerGroups` because it's possible a group contains no tabbable
    //  nodes, but still contains focusable nodes (e.g. if they all have `tabindex=-1`)
    //  and we still need to find the element in there
    return state.containerGroups.findIndex(
      ({ container, tabbableNodes }) =>
        container.contains(element) ||
        // fall back to explicit tabbable search which will take into consideration any
        //  web components if the `tabbableOptions.getShadowRoot` option was used for
        //  the trap, enabling shadow DOM support in tabbable (`Node.contains()` doesn't
        //  look inside web components even if open)
        composedPath?.includes(container) ||
        tabbableNodes.find((node) => node === element)
    );
  };

  /**
   * Gets the node for the given option, which is expected to be an option that
   *  can be either a DOM node, a string that is a selector to get a node, `false`
   *  (if a node is explicitly NOT given), or a function that returns any of these
   *  values.
   * @param {string} optionName
   * @param {Object} options
   * @param {boolean} [options.hasFallback] True if the option could be a selector string
   *  and the option allows for a fallback scenario in the case where the selector is
   *  valid but does not match a node (i.e. the queried node doesn't exist in the DOM).
   * @param {Array} [options.params] Params to pass to the option if it's a function.
   * @returns {undefined | null | false | HTMLElement | SVGElement} Returns
   *  `undefined` if the option is not specified; `null` if the option didn't resolve
   *  to a node but `options.hasFallback=true`, `false` if the option resolved to `false`
   *  (node explicitly not given); otherwise, the resolved DOM node.
   * @throws {Error} If the option is set, not `false`, and is not, or does not
   *  resolve to a node, unless the option is a selector string and `options.hasFallback=true`.
   */
  const getNodeForOption = function (
    optionName,
    { hasFallback = false, params = [] } = {}
  ) {
    let optionValue = config[optionName];

    if (typeof optionValue === 'function') {
      optionValue = optionValue(...params);
    }

    if (optionValue === true) {
      optionValue = undefined; // use default value
    }

    if (!optionValue) {
      if (optionValue === undefined || optionValue === false) {
        return optionValue;
      }
      // else, empty string (invalid), null (invalid), 0 (invalid)

      throw new Error(
        `\`${optionName}\` was specified but was not a node, or did not return a node`
      );
    }

    let node = optionValue; // could be HTMLElement, SVGElement, or non-empty string at this point

    if (typeof optionValue === 'string') {
      try {
        node = doc.querySelector(optionValue); // resolve to node, or null if fails
      } catch (err) {
        throw new Error(
          `\`${optionName}\` appears to be an invalid selector; error="${err.message}"`
        );
      }

      if (!node) {
        if (!hasFallback) {
          throw new Error(
            `\`${optionName}\` as selector refers to no known node`
          );
        }
        // else, `node` MUST be `null` because that's what `Document.querySelector()` returns
        //  if the selector is valid but doesn't match anything
      }
    }

    return node;
  };

  const getInitialFocusNode = function () {
    let node = getNodeForOption('initialFocus', { hasFallback: true });

    // false explicitly indicates we want no initialFocus at all
    if (node === false) {
      return false;
    }

    if (
      node === undefined ||
      (node && !isFocusable(node, config.tabbableOptions))
    ) {
      // option not specified nor focusable: use fallback options
      if (findContainerIndex(doc.activeElement) >= 0) {
        node = doc.activeElement;
      } else {
        const firstTabbableGroup = state.tabbableGroups[0];
        const firstTabbableNode =
          firstTabbableGroup && firstTabbableGroup.firstTabbableNode;

        // NOTE: `fallbackFocus` option function cannot return `false` (not supported)
        node = firstTabbableNode || getNodeForOption('fallbackFocus');
      }
    } else if (node === null) {
      // option is a VALID selector string that doesn't yield a node: use the `fallbackFocus`
      //  option instead of the default behavior when the option isn't specified at all
      node = getNodeForOption('fallbackFocus');
    }

    if (!node) {
      throw new Error(
        'Your focus-trap needs to have at least one focusable element'
      );
    }

    return node;
  };

  const updateTabbableNodes = function () {
    state.containerGroups = state.containers.map((container) => {
      const tabbableNodes = tabbable(container, config.tabbableOptions);

      // NOTE: if we have tabbable nodes, we must have focusable nodes; focusable nodes
      //  are a superset of tabbable nodes since nodes with negative `tabindex` attributes
      //  are focusable but not tabbable
      const focusableNodes = focusable(container, config.tabbableOptions);

      const firstTabbableNode =
        tabbableNodes.length > 0 ? tabbableNodes[0] : undefined;
      const lastTabbableNode =
        tabbableNodes.length > 0
          ? tabbableNodes[tabbableNodes.length - 1]
          : undefined;

      const firstDomTabbableNode = focusableNodes.find((node) =>
        isTabbable(node)
      );
      const lastDomTabbableNode = focusableNodes
        .slice()
        .reverse()
        .find((node) => isTabbable(node));

      const posTabIndexesFound = !!tabbableNodes.find(
        (node) => getTabIndex(node) > 0
      );

      return {
        container,
        tabbableNodes,
        focusableNodes,

        /** True if at least one node with positive `tabindex` was found in this container. */
        posTabIndexesFound,

        /** First tabbable node in container, __tabindex__ order; `undefined` if none. */
        firstTabbableNode,
        /** Last tabbable node in container, __tabindex__ order; `undefined` if none. */
        lastTabbableNode,

        // NOTE: DOM order is NOT NECESSARILY "document position" order, but figuring that out
        //  would require more than just https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
        //  because that API doesn't work with Shadow DOM as well as it should (@see
        //  https://github.com/whatwg/dom/issues/320) and since this first/last is only needed, so far,
        //  to address an edge case related to positive tabindex support, this seems like a much easier,
        //  "close enough most of the time" alternative for positive tabindexes which should generally
        //  be avoided anyway...
        /** First tabbable node in container, __DOM__ order; `undefined` if none. */
        firstDomTabbableNode,
        /** Last tabbable node in container, __DOM__ order; `undefined` if none. */
        lastDomTabbableNode,

        /**
         * Finds the __tabbable__ node that follows the given node in the specified direction,
         *  in this container, if any.
         * @param {HTMLElement} node
         * @param {boolean} [forward] True if going in forward tab order; false if going
         *  in reverse.
         * @returns {HTMLElement|undefined} The next tabbable node, if any.
         */
        nextTabbableNode(node, forward = true) {
          const nodeIdx = tabbableNodes.indexOf(node);
          if (nodeIdx < 0) {
            // either not tabbable nor focusable, or was focused but not tabbable (negative tabindex):
            //  since `node` should at least have been focusable, we assume that's the case and mimic
            //  what browsers do, which is set focus to the next node in __document position order__,
            //  regardless of positive tabindexes, if any -- and for reasons explained in the NOTE
            //  above related to `firstDomTabbable` and `lastDomTabbable` properties, we fall back to
            //  basic DOM order
            if (forward) {
              return focusableNodes
                .slice(focusableNodes.indexOf(node) + 1)
                .find((el) => isTabbable(el));
            }

            return focusableNodes
              .slice(0, focusableNodes.indexOf(node))
              .reverse()
              .find((el) => isTabbable(el));
          }

          return tabbableNodes[nodeIdx + (forward ? 1 : -1)];
        },
      };
    });

    state.tabbableGroups = state.containerGroups.filter(
      (group) => group.tabbableNodes.length > 0
    );

    // throw if no groups have tabbable nodes and we don't have a fallback focus node either
    if (
      state.tabbableGroups.length <= 0 &&
      !getNodeForOption('fallbackFocus') // returning false not supported for this option
    ) {
      throw new Error(
        'Your focus-trap must have at least one container with at least one tabbable node in it at all times'
      );
    }

    // NOTE: Positive tabindexes are only properly supported in single-container traps because
    //  doing it across multiple containers where tabindexes could be all over the place
    //  would require Tabbable to support multiple containers, would require additional
    //  specialized Shadow DOM support, and would require Tabbable's multi-container support
    //  to look at those containers in document position order rather than user-provided
    //  order (as they are treated in Focus-trap, for legacy reasons). See discussion on
    //  https://github.com/focus-trap/focus-trap/issues/375 for more details.
    if (
      state.containerGroups.find((g) => g.posTabIndexesFound) &&
      state.containerGroups.length > 1
    ) {
      throw new Error(
        "At least one node with a positive tabindex was found in one of your focus-trap's multiple containers. Positive tabindexes are only supported in single-container focus-traps."
      );
    }
  };

  /**
   * Gets the current activeElement. If it's a web-component and has open shadow-root
   * it will recursively search inside shadow roots for the "true" activeElement.
   *
   * @param {Document | ShadowRoot} el
   *
   * @returns {HTMLElement} The element that currently has the focus
   **/
  const getActiveElement = function (el) {
    const activeElement = el.activeElement;

    if (!activeElement) {
      return;
    }

    if (
      activeElement.shadowRoot &&
      activeElement.shadowRoot.activeElement !== null
    ) {
      return getActiveElement(activeElement.shadowRoot);
    }

    return activeElement;
  };

  const tryFocus = function (node) {
    if (node === false) {
      return;
    }

    if (node === getActiveElement(document)) {
      return;
    }

    if (!node || !node.focus) {
      tryFocus(getInitialFocusNode());
      return;
    }

    node.focus({ preventScroll: !!config.preventScroll });
    // NOTE: focus() API does not trigger focusIn event so set MRU node manually
    state.mostRecentlyFocusedNode = node;

    if (isSelectableInput(node)) {
      node.select();
    }
  };

  const getReturnFocusNode = function (previousActiveElement) {
    const node = getNodeForOption('setReturnFocus', {
      params: [previousActiveElement],
    });
    return node ? node : node === false ? false : previousActiveElement;
  };

  /**
   * Finds the next node (in either direction) where focus should move according to a
   *  keyboard focus-in event.
   * @param {Object} params
   * @param {Node} [params.target] Known target __from which__ to navigate, if any.
   * @param {KeyboardEvent|FocusEvent} [params.event] Event to use if `target` isn't known (event
   *  will be used to determine the `target`). Ignored if `target` is specified.
   * @param {boolean} [params.isBackward] True if focus should move backward.
   * @returns {Node|undefined} The next node, or `undefined` if a next node couldn't be
   *  determined given the current state of the trap.
   */
  const findNextNavNode = function ({ target, event, isBackward = false }) {
    target = target || getActualTarget(event);
    updateTabbableNodes();

    let destinationNode = null;

    if (state.tabbableGroups.length > 0) {
      // make sure the target is actually contained in a group
      // NOTE: the target may also be the container itself if it's focusable
      //  with tabIndex='-1' and was given initial focus
      const containerIndex = findContainerIndex(target, event);
      const containerGroup =
        containerIndex >= 0 ? state.containerGroups[containerIndex] : undefined;

      if (containerIndex < 0) {
        // target not found in any group: quite possible focus has escaped the trap,
        //  so bring it back into...
        if (isBackward) {
          // ...the last node in the last group
          destinationNode =
            state.tabbableGroups[state.tabbableGroups.length - 1]
              .lastTabbableNode;
        } else {
          // ...the first node in the first group
          destinationNode = state.tabbableGroups[0].firstTabbableNode;
        }
      } else if (isBackward) {
        // REVERSE

        // is the target the first tabbable node in a group?
        let startOfGroupIndex = state.tabbableGroups.findIndex(
          ({ firstTabbableNode }) => target === firstTabbableNode
        );

        if (
          startOfGroupIndex < 0 &&
          (containerGroup.container === target ||
            (isFocusable(target, config.tabbableOptions) &&
              !isTabbable(target, config.tabbableOptions) &&
              !containerGroup.nextTabbableNode(target, false)))
        ) {
          // an exception case where the target is either the container itself, or
          //  a non-tabbable node that was given focus (i.e. tabindex is negative
          //  and user clicked on it or node was programmatically given focus)
          //  and is not followed by any other tabbable node, in which
          //  case, we should handle shift+tab as if focus were on the container's
          //  first tabbable node, and go to the last tabbable node of the LAST group
          startOfGroupIndex = containerIndex;
        }

        if (startOfGroupIndex >= 0) {
          // YES: then shift+tab should go to the last tabbable node in the
          //  previous group (and wrap around to the last tabbable node of
          //  the LAST group if it's the first tabbable node of the FIRST group)
          const destinationGroupIndex =
            startOfGroupIndex === 0
              ? state.tabbableGroups.length - 1
              : startOfGroupIndex - 1;

          const destinationGroup = state.tabbableGroups[destinationGroupIndex];

          destinationNode =
            getTabIndex(target) >= 0
              ? destinationGroup.lastTabbableNode
              : destinationGroup.lastDomTabbableNode;
        } else if (!isTabEvent(event)) {
          // user must have customized the nav keys so we have to move focus manually _within_
          //  the active group: do this based on the order determined by tabbable()
          destinationNode = containerGroup.nextTabbableNode(target, false);
        }
      } else {
        // FORWARD

        // is the target the last tabbable node in a group?
        let lastOfGroupIndex = state.tabbableGroups.findIndex(
          ({ lastTabbableNode }) => target === lastTabbableNode
        );

        if (
          lastOfGroupIndex < 0 &&
          (containerGroup.container === target ||
            (isFocusable(target, config.tabbableOptions) &&
              !isTabbable(target, config.tabbableOptions) &&
              !containerGroup.nextTabbableNode(target)))
        ) {
          // an exception case where the target is the container itself, or
          //  a non-tabbable node that was given focus (i.e. tabindex is negative
          //  and user clicked on it or node was programmatically given focus)
          //  and is not followed by any other tabbable node, in which
          //  case, we should handle tab as if focus were on the container's
          //  last tabbable node, and go to the first tabbable node of the FIRST group
          lastOfGroupIndex = containerIndex;
        }

        if (lastOfGroupIndex >= 0) {
          // YES: then tab should go to the first tabbable node in the next
          //  group (and wrap around to the first tabbable node of the FIRST
          //  group if it's the last tabbable node of the LAST group)
          const destinationGroupIndex =
            lastOfGroupIndex === state.tabbableGroups.length - 1
              ? 0
              : lastOfGroupIndex + 1;

          const destinationGroup = state.tabbableGroups[destinationGroupIndex];

          destinationNode =
            getTabIndex(target) >= 0
              ? destinationGroup.firstTabbableNode
              : destinationGroup.firstDomTabbableNode;
        } else if (!isTabEvent(event)) {
          // user must have customized the nav keys so we have to move focus manually _within_
          //  the active group: do this based on the order determined by tabbable()
          destinationNode = containerGroup.nextTabbableNode(target);
        }
      }
    } else {
      // no groups available
      // NOTE: the fallbackFocus option does not support returning false to opt-out
      destinationNode = getNodeForOption('fallbackFocus');
    }

    return destinationNode;
  };

  // This needs to be done on mousedown and touchstart instead of click
  // so that it precedes the focus event.
  const checkPointerDown = function (e) {
    const target = getActualTarget(e);

    if (findContainerIndex(target, e) >= 0) {
      // allow the click since it ocurred inside the trap
      return;
    }

    if (valueOrHandler(config.clickOutsideDeactivates, e)) {
      // immediately deactivate the trap
      trap.deactivate({
        // NOTE: by setting `returnFocus: false`, deactivate() will do nothing,
        //  which will result in the outside click setting focus to the node
        //  that was clicked (and if not focusable, to "nothing"); by setting
        //  `returnFocus: true`, we'll attempt to re-focus the node originally-focused
        //  on activation (or the configured `setReturnFocus` node), whether the
        //  outside click was on a focusable node or not
        returnFocus: config.returnFocusOnDeactivate,
      });
      return;
    }

    // This is needed for mobile devices.
    // (If we'll only let `click` events through,
    // then on mobile they will be blocked anyways if `touchstart` is blocked.)
    if (valueOrHandler(config.allowOutsideClick, e)) {
      // allow the click outside the trap to take place
      return;
    }

    // otherwise, prevent the click
    e.preventDefault();
  };

  // In case focus escapes the trap for some strange reason, pull it back in.
  // NOTE: the focusIn event is NOT cancelable, so if focus escapes, it may cause unexpected
  //  scrolling if the node that got focused was out of view; there's nothing we can do to
  //  prevent that from happening by the time we discover that focus escaped
  const checkFocusIn = function (event) {
    const target = getActualTarget(event);
    const targetContained = findContainerIndex(target, event) >= 0;

    // In Firefox when you Tab out of an iframe the Document is briefly focused.
    if (targetContained || target instanceof Document) {
      if (targetContained) {
        state.mostRecentlyFocusedNode = target;
      }
    } else {
      // escaped! pull it back in to where it just left
      event.stopImmediatePropagation();

      // focus will escape if the MRU node had a positive tab index and user tried to nav forward;
      //  it will also escape if the MRU node had a 0 tab index and user tried to nav backward
      //  toward a node with a positive tab index
      let nextNode; // next node to focus, if we find one
      let navAcrossContainers = true;
      if (state.mostRecentlyFocusedNode) {
        if (getTabIndex(state.mostRecentlyFocusedNode) > 0) {
          // MRU container index must be >=0 otherwise we wouldn't have it as an MRU node...
          const mruContainerIdx = findContainerIndex(
            state.mostRecentlyFocusedNode
          );
          // there MAY not be any tabbable nodes in the container if there are at least 2 containers
          //  and the MRU node is focusable but not tabbable (focus-trap requires at least 1 container
          //  with at least one tabbable node in order to function, so this could be the other container
          //  with nothing tabbable in it)
          const { tabbableNodes } = state.containerGroups[mruContainerIdx];
          if (tabbableNodes.length > 0) {
            // MRU tab index MAY not be found if the MRU node is focusable but not tabbable
            const mruTabIdx = tabbableNodes.findIndex(
              (node) => node === state.mostRecentlyFocusedNode
            );
            if (mruTabIdx >= 0) {
              if (config.isKeyForward(state.recentNavEvent)) {
                if (mruTabIdx + 1 < tabbableNodes.length) {
                  nextNode = tabbableNodes[mruTabIdx + 1];
                  navAcrossContainers = false;
                }
                // else, don't wrap within the container as focus should move to next/previous
                //  container
              } else {
                if (mruTabIdx - 1 >= 0) {
                  nextNode = tabbableNodes[mruTabIdx - 1];
                  navAcrossContainers = false;
                }
                // else, don't wrap within the container as focus should move to next/previous
                //  container
              }
              // else, don't find in container order without considering direction too
            }
          }
          // else, no tabbable nodes in that container (which means we must have at least one other
          //  container with at least one tabbable node in it, otherwise focus-trap would've thrown
          //  an error the last time updateTabbableNodes() was run): find next node among all known
          //  containers
        } else {
          // check to see if there's at least one tabbable node with a positive tab index inside
          //  the trap because focus seems to escape when navigating backward from a tabbable node
          //  with tabindex=0 when this is the case (instead of wrapping to the tabbable node with
          //  the greatest positive tab index like it should)
          if (
            !state.containerGroups.some((g) =>
              g.tabbableNodes.some((n) => getTabIndex(n) > 0)
            )
          ) {
            // no containers with tabbable nodes with positive tab indexes which means the focus
            //  escaped for some other reason and we should just execute the fallback to the
            //  MRU node or initial focus node, if any
            navAcrossContainers = false;
          }
        }
      } else {
        // no MRU node means we're likely in some initial condition when the trap has just
        //  been activated and initial focus hasn't been given yet, in which case we should
        //  fall through to trying to focus the initial focus node, which is what should
        //  happen below at this point in the logic
        navAcrossContainers = false;
      }

      if (navAcrossContainers) {
        nextNode = findNextNavNode({
          // move FROM the MRU node, not event-related node (which will be the node that is
          //  outside the trap causing the focus escape we're trying to fix)
          target: state.mostRecentlyFocusedNode,
          isBackward: config.isKeyBackward(state.recentNavEvent),
        });
      }

      if (nextNode) {
        tryFocus(nextNode);
      } else {
        tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
      }
    }

    state.recentNavEvent = undefined; // clear
  };

  // Hijack key nav events on the first and last focusable nodes of the trap,
  // in order to prevent focus from escaping. If it escapes for even a
  // moment it can end up scrolling the page and causing confusion so we
  // kind of need to capture the action at the keydown phase.
  const checkKeyNav = function (event, isBackward = false) {
    state.recentNavEvent = event;

    const destinationNode = findNextNavNode({ event, isBackward });
    if (destinationNode) {
      if (isTabEvent(event)) {
        // since tab natively moves focus, we wouldn't have a destination node unless we
        //  were on the edge of a container and had to move to the next/previous edge, in
        //  which case we want to prevent default to keep the browser from moving focus
        //  to where it normally would
        event.preventDefault();
      }
      tryFocus(destinationNode);
    }
    // else, let the browser take care of [shift+]tab and move the focus
  };

  const checkTabKey = function (event) {
    if (config.isKeyForward(event) || config.isKeyBackward(event)) {
      checkKeyNav(event, config.isKeyBackward(event));
    }
  };

  // we use a different event phase for the Escape key to allow canceling the event and checking for this in escapeDeactivates
  const checkEscapeKey = function (event) {
    if (
      isEscapeEvent(event) &&
      valueOrHandler(config.escapeDeactivates, event) !== false
    ) {
      event.preventDefault();
      trap.deactivate();
    }
  };

  const checkClick = function (e) {
    const target = getActualTarget(e);

    if (findContainerIndex(target, e) >= 0) {
      return;
    }

    if (valueOrHandler(config.clickOutsideDeactivates, e)) {
      return;
    }

    if (valueOrHandler(config.allowOutsideClick, e)) {
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();
  };

  //
  // EVENT LISTENERS
  //

  const addListeners = function () {
    if (!state.active) {
      return;
    }

    // There can be only one listening focus trap at a time
    activeFocusTraps.activateTrap(trapStack, trap);

    // Delay ensures that the focused element doesn't capture the event
    // that caused the focus trap activation.
    state.delayInitialFocusTimer = config.delayInitialFocus
      ? delay(function () {
          tryFocus(getInitialFocusNode());
        })
      : tryFocus(getInitialFocusNode());

    doc.addEventListener('focusin', checkFocusIn, true);
    doc.addEventListener('mousedown', checkPointerDown, {
      capture: true,
      passive: false,
    });
    doc.addEventListener('touchstart', checkPointerDown, {
      capture: true,
      passive: false,
    });
    doc.addEventListener('click', checkClick, {
      capture: true,
      passive: false,
    });
    doc.addEventListener('keydown', checkTabKey, {
      capture: true,
      passive: false,
    });
    doc.addEventListener('keydown', checkEscapeKey);

    return trap;
  };

  const removeListeners = function () {
    if (!state.active) {
      return;
    }

    doc.removeEventListener('focusin', checkFocusIn, true);
    doc.removeEventListener('mousedown', checkPointerDown, true);
    doc.removeEventListener('touchstart', checkPointerDown, true);
    doc.removeEventListener('click', checkClick, true);
    doc.removeEventListener('keydown', checkTabKey, true);
    doc.removeEventListener('keydown', checkEscapeKey);

    return trap;
  };

  //
  // MUTATION OBSERVER
  //

  const checkDomRemoval = function (mutations) {
    const isFocusedNodeRemoved = mutations.some(function (mutation) {
      const removedNodes = Array.from(mutation.removedNodes);
      return removedNodes.some(function (node) {
        return node === state.mostRecentlyFocusedNode;
      });
    });

    // If the currently focused is removed then browsers will move focus to the
    // <body> element. If this happens, try to move focus back into the trap.
    if (isFocusedNodeRemoved) {
      tryFocus(getInitialFocusNode());
    }
  };

  // Use MutationObserver - if supported - to detect if focused node is removed
  // from the DOM.
  const mutationObserver =
    typeof window !== 'undefined' && 'MutationObserver' in window
      ? new MutationObserver(checkDomRemoval)
      : undefined;

  const updateObservedNodes = function () {
    if (!mutationObserver) {
      return;
    }

    mutationObserver.disconnect();
    if (state.active && !state.paused) {
      state.containers.map(function (container) {
        mutationObserver.observe(container, {
          subtree: true,
          childList: true,
        });
      });
    }
  };

  //
  // TRAP DEFINITION
  //

  trap = {
    get active() {
      return state.active;
    },

    get paused() {
      return state.paused;
    },

    activate(activateOptions) {
      if (state.active) {
        return this;
      }

      const onActivate = getOption(activateOptions, 'onActivate');
      const onPostActivate = getOption(activateOptions, 'onPostActivate');
      const checkCanFocusTrap = getOption(activateOptions, 'checkCanFocusTrap');

      if (!checkCanFocusTrap) {
        updateTabbableNodes();
      }

      state.active = true;
      state.paused = false;
      state.nodeFocusedBeforeActivation = getActiveElement(doc);

      onActivate?.();

      const finishActivation = () => {
        if (checkCanFocusTrap) {
          updateTabbableNodes();
        }
        addListeners();
        updateObservedNodes();
        onPostActivate?.();
      };

      if (checkCanFocusTrap) {
        checkCanFocusTrap(state.containers.concat()).then(
          finishActivation,
          finishActivation
        );
        return this;
      }

      finishActivation();
      return this;
    },

    deactivate(deactivateOptions) {
      if (!state.active) {
        return this;
      }

      const options = {
        onDeactivate: config.onDeactivate,
        onPostDeactivate: config.onPostDeactivate,
        checkCanReturnFocus: config.checkCanReturnFocus,
        ...deactivateOptions,
      };

      clearTimeout(state.delayInitialFocusTimer); // noop if undefined
      state.delayInitialFocusTimer = undefined;

      removeListeners();
      state.active = false;
      state.paused = false;
      updateObservedNodes();

      activeFocusTraps.deactivateTrap(trapStack, trap);

      const onDeactivate = getOption(options, 'onDeactivate');
      const onPostDeactivate = getOption(options, 'onPostDeactivate');
      const checkCanReturnFocus = getOption(options, 'checkCanReturnFocus');
      const returnFocus = getOption(
        options,
        'returnFocus',
        'returnFocusOnDeactivate'
      );

      onDeactivate?.();

      const finishDeactivation = () => {
        delay(() => {
          if (returnFocus) {
            tryFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation));
          }
          onPostDeactivate?.();
        });
      };

      if (returnFocus && checkCanReturnFocus) {
        checkCanReturnFocus(
          getReturnFocusNode(state.nodeFocusedBeforeActivation)
        ).then(finishDeactivation, finishDeactivation);
        return this;
      }

      finishDeactivation();
      return this;
    },

    pause(pauseOptions) {
      if (!state.active) {
        return this;
      }

      state.manuallyPaused = true;

      return this._setPausedState(true, pauseOptions);
    },

    unpause(unpauseOptions) {
      if (!state.active) {
        return this;
      }

      state.manuallyPaused = false;

      if (trapStack[trapStack.length - 1] !== this) {
        return this;
      }

      return this._setPausedState(false, unpauseOptions);
    },

    updateContainerElements(containerElements) {
      const elementsAsArray = [].concat(containerElements).filter(Boolean);

      state.containers = elementsAsArray.map((element) =>
        typeof element === 'string' ? doc.querySelector(element) : element
      );

      if (state.active) {
        updateTabbableNodes();
      }

      updateObservedNodes();

      return this;
    },
  };

  Object.defineProperties(trap, {
    _isManuallyPaused: {
      value() {
        return state.manuallyPaused;
      },
    },
    _setPausedState: {
      value(paused, options) {
        if (state.paused === paused) {
          return this;
        }

        state.paused = paused;
        if (paused) {
          const onPause = getOption(options, 'onPause');
          const onPostPause = getOption(options, 'onPostPause');
          onPause?.();

          removeListeners();
          updateObservedNodes();

          onPostPause?.();
        } else {
          const onUnpause = getOption(options, 'onUnpause');
          const onPostUnpause = getOption(options, 'onPostUnpause');

          onUnpause?.();

          updateTabbableNodes();
          addListeners();
          updateObservedNodes();

          onPostUnpause?.();
        }

        return this;
      },
    },
  });

  // initialize container elements
  trap.updateContainerElements(elements);

  return trap;
};

export { createFocusTrap };
