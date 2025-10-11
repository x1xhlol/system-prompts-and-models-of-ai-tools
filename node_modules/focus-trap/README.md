# focus-trap [![CI](https://github.com/focus-trap/focus-trap/workflows/CI/badge.svg?branch=master&event=push)](https://github.com/focus-trap/focus-trap/actions?query=workflow:CI+branch:master) [![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-37-orange.svg?style=flat-square)](#contributors)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Trap focus within a DOM node.

There may come a time when you find it important to trap focus within a DOM node — so that when a user hits `Tab` or `Shift+Tab` or clicks around, she can't escape a certain cycle of focusable elements.

You will definitely face this challenge when you are trying to build **accessible modals**.

This module is a little, modular **vanilla JS** solution to that problem.

Use it in your higher-level components. For example, if you are using React check out [focus-trap-react](https://github.com/focus-trap/focus-trap-react), a light wrapper around this library. If you are not a React user, consider creating light wrappers in your framework-of-choice.

## What it does

When a focus trap is activated, this is what should happen:

- Some element within the focus trap receives focus. By default, this will be the first element in the focus trap's tab order (as determined by [tabbable](https://github.com/focus-trap/tabbable)). Alternately, you can specify an element that should receive this initial focus.
- The `Tab` and `Shift+Tab` keys will cycle through the focus trap's tabbable elements *but will not leave the focus trap*.
- Clicks within the focus trap behave normally; but clicks *outside* the focus trap are blocked.
- The `Escape` key will deactivate the focus trap.

When the focus trap is deactivated, this is what should happen:

- Focus is passed to *whichever element had focus when the trap was activated* (e.g. the button that opened the modal or menu).
- Tabbing and clicking behave normally everywhere.

[Check out the demos.](http://focus-trap.github.io/focus-trap/)

For more advanced usage (e.g. focus traps within focus traps), you can also pause a focus trap's behavior without deactivating it entirely, then unpause at will.

## Installation

```bash
npm install focus-trap
```

### UMD

You can also use a UMD version published to `unpkg.com` as `dist/focus-trap.umd.js` and `dist/focus-trap.umd.min.js`.

> NOTE: The UMD build does not bundle the `tabbable` dependency. Therefore you will have to also include that one, and include it *before* `focus-trap`.

```html
<head>
  <script src="https://unpkg.com/tabbable/dist/index.umd.js"></script>
  <script src="https://unpkg.com/focus-trap/dist/focus-trap.umd.js"></script>
</head>
```

## Browser Support

As old and as broad as _reasonably_ possible, excluding browsers that are out of support or have nearly no user base.

Focused on desktop browsers, particularly Chrome, Edge, FireFox, Safari, and Opera.

Focus-trap is not officially tested on any mobile browsers or devices.

> ❗️ __Safari__: By default, Safari does not tab through all elements on a page, which alters the normal DOM-based tab order expected by focus-trap. If you use or support Safari with this library, make sure you and your users know they __must enable__ the `Preferences > Advanced > Press Tab to highlight each item on a webpage` feature. Otherwise, your traps [will not work the way you expect them to](https://github.com/focus-trap/focus-trap/issues/783).

> ⚠️ Microsoft [no longer supports](https://blogs.windows.com/windowsexperience/2022/06/15/internet-explorer-11-has-retired-and-is-officially-out-of-support-what-you-need-to-know/) any version of IE, so IE is no longer supported by this library.

> 💬 Focus-trap relies on tabbable so its browser support is at least [what tabbable supports](https://github.com/focus-trap/tabbable#browser-support).

> 💬 Keep in mind that performance optimization and old browser support are often at odds, so tabbable may not always be able to use the most optimal (typically modern) APIs in all cases.

## Usage

### createFocusTrap()

```javascript
import * as focusTrap from 'focus-trap'; // ESM
const focusTrap = require('focus-trap'); // CJS
// UMD: `focusTrap` is defined as a global on `window`

trap = focusTrap.createFocusTrap(element[, createOptions]);
```

Returns a new focus trap on `element` (one or more "containers" of tabbable nodes that, together, form the total set of nodes that can be visited, with clicks or the tab key, within the trap).

`element` can be:

- a DOM node (the focus trap itself);
- a selector string (which will be passed to `document.querySelector()` to find the DOM node); or
- an array of DOM nodes or selector strings (where the order determines where the focus will go after the last tabbable element of a DOM node/selector is reached).

> A focus trap must have at least one container with at least one tabbable/focusable node in it to be considered valid. While nodes can be added/removed at runtime, with the trap adjusting to added/removed tabbable nodes, **an error will be thrown** if the trap ever gets into a state where it determines none of its containers have any tabbable nodes in them *and* the `fallbackFocus` option does not resolve to an alternate node where focus can go.

#### createOptions

- **onActivate** `{() => void}`: A function that will be called **before** sending focus to the target element upon activation.
- **onPostActivate** `{() => void}`: A function that will be called **after** sending focus to the target element upon activation.
- **onPause** `{() => void}`: A function that will be called immediately after the trap's state is updated to be paused.
- **onPostPause** `{() => void}`: A function that will be called after the trap has been completely paused and is no longer managing/trapping focus.
- **onUnpause** `{() => void}`: A function that will be called immediately after the trap's state is updated to be active again, but prior to updating its knowledge of what nodes are tabbable within its containers, and prior to actively managing/trapping focus.
- **onPostUnpause** `{() => void}`: A function that will be called after the trap has been completely unpaused and is once again managing/trapping focus.
- **checkCanFocusTrap** `{(containers: Array<HTMLElement | SVGElement>) => Promise<void>}`: Animated dialogs have a small delay between when `onActivate` is called and when the focus trap is focusable. `checkCanFocusTrap` expects a promise to be returned. When that promise settles (resolves or rejects), focus will be sent to the first tabbable node (in tab order) in the focus trap (or the node configured in the `initialFocus` option).
- **onDeactivate** `{() => void}`: A function that will be called **before** returning focus to the node that had focus prior to activation (or configured with the `setReturnFocus` option) upon deactivation.
- **onPostDeactivate** `{() => void}`: A function that will be called after the trap is deactivated, after `onDeactivate`. If the `returnFocus` deactivation option was set, it will be called **after** returning focus to the node that had focus prior to activation (or configured with the `setReturnFocus` option) upon deactivation; otherwise, it will be called after deactivation completes.
- **checkCanReturnFocus** `{(trigger: HTMLElement | SVGElement) => Promise<void>}`: An animated trigger button will have a small delay between when `onDeactivate` is called and when the focus is able to be sent back to the trigger. `checkCanReturnFocus` expects a promise to be returned. When that promise settles (resolves or rejects), focus will be sent to to the node that had focus prior to the activation of the trap (or the node configured in the `setReturnFocus` option).
- **initialFocus** `{HTMLElement | SVGElement | string | false | undefined | (() => HTMLElement | SVGElement | string | false | undefined)}`: By default (when `undefined` or the function returns `undefined`), when a focus trap is activated, the active element will receive focus if it's in the trap, otherwise, the first element in the focus trap's tab order will receive focus. With this option you can specify a different element to receive that initial focus. Can be a DOM node, or a selector string (which will be passed to `document.querySelector()` to find the DOM node), or a function that returns any of these. You can also set this option to `false` (or to a function that returns `false`) to prevent any initial focus at all when the trap activates.
  - 💬 Setting this option to `false` (or a function that returns `false`) will prevent the `fallbackFocus` option from being used.
  - 💬 If the option resolves to a non-focusable node (e.g. one that exists, but is hidden), the default behavior will be used (as though the option weren't set at all).
  - 💬 If the option resolves to a non-existent node, an exception will be thrown.
  - 💬 If the option resolves to a valid selector string (directly set, or returned from a function), but the selector doesn't match a node, the trap will fall back to the `fallbackFocus` node option. If that option also fails to yield a node, an exception will be thrown.
  - 💬 If the option resolves to `undefined` (i.e. not set or function returns `undefined`), the default behavior will be used.
  - ⚠️ See warning below about **Shadow DOM** and selector strings.
- **fallbackFocus** `{HTMLElement | SVGElement | string | () => HTMLElement | SVGElement | string}`: By default, an error will be thrown if the focus trap contains no elements in its tab order. With this option you can specify a fallback element to programmatically receive focus if no other tabbable elements are found. For example, you may want a popover's `<div>` to receive focus if the popover's content includes no tabbable elements. *Make sure the fallback element has a negative `tabindex` so it can be programmatically focused.* The option value can be a DOM node, a selector string (which will be passed to `document.querySelector()` to find the DOM node), or a function that returns any of these.
  - 💬 If `initialFocus` is `false` (or a function that returns `false`), this function will not be called when the trap is activated, and no element will be initially focused. This function may still be called while the trap is active if things change such that there are no longer any tabbable nodes in the trap.
  - ⚠️ See warning below about **Shadow DOM** and selector strings.
- **escapeDeactivates** `{boolean} | (e: KeyboardEvent) => boolean)`: Default: `true`. If `false` or returns `false`, the `Escape` key will not trigger deactivation of the focus trap. This can be useful if you want to force the user to make a decision instead of allowing an easy way out. Note that if a function is given, it's only called if the ESC key was pressed.
- **clickOutsideDeactivates** `{boolean | (e: MouseEvent | TouchEvent) => boolean}`: If `true` or returns `true`, a click outside the focus trap will immediately deactivate the focus trap and allow the click event to do its thing (i.e. to pass-through to the element that was clicked). This option **takes precedence** over `allowOutsideClick` when it's set to `true`. Default: `false`.
  - 💬 If a function is provided, it will be called up to **twice** (but only if the click occurs *outside* the trap's containers): First on the `mousedown` (or `touchstart` on mobile) event and, if `true` was returned, again on the `click` event. It will get the same node each time, and it's recommended that the returned value is also the same each time. Be sure to check the event type if the double call is an issue in your code.
  - ⚠️ If you're using a password manager such as 1Password, where the app adds a clickable icon to all fillable fields, you should avoid using this option, and instead use the `allowOutsideClick` option to better control exactly when the focus trap can be deactivated. The clickable icons are usually positioned absolutely, floating on top of the fields, and therefore *not* part of the container the trap is managing. When using the `clickOutsideDeactivates` option, clicking on a field's 1Password icon will likely cause the trap to be unintentionally deactivated.
- **allowOutsideClick** `{boolean | (e: MouseEvent | TouchEvent) => boolean}`: If set and is or returns `true`, a click outside the focus trap will not be prevented (letting focus temporarily escape the trap, without deactivating it), even if `clickOutsideDeactivates=false`. Default: `false`.
  - 💬 If this is a function, it will be called up to **twice** on every click (but only if the click occurs *outside* the trap's containers): First on `mousedown` (or `touchstart` on mobile), and then on the actual `click` if the function returned `true` on the first event. Be sure to check the event type if the double call is an issue in your code.
  - 💡 When `clickOutsideDeactivates=true`, this option is **ignored** (i.e. if it's a function, it will not be called).
  - Use this option to control if (and even which) clicks are allowed outside the trap in conjunction with `clickOutsideDeactivates=false`.
- **returnFocusOnDeactivate** `{boolean}`: Default: `true`. If `false`, when the trap is deactivated, focus will *not* return to the element that had focus before activation.
  - 💬 When using this option in conjunction with `clickOutsideDeactivates=true`:
    - If `returnFocusOnDeactivate=true` and the outside click causing deactivation is on a focusable element, focus will __not__ return to that element; instead, it will return to the node focused just before activation.
    - If `returnFocusOnDeactivate=false` and the outside click is on a focusable node, focus will __remain__ on that node instead of the node focused just before activation. If the outside click is on a non-focusable node, then "nothing" will have focus post-deactivation.
- **setReturnFocus** `{HTMLElement | SVGElement | string | (previousActiveElement: HTMLElement | SVGElement) => HTMLElement | SVGElement | string | false}`: By default, on **deactivation**, if `returnFocusOnDeactivate=true` (or if `returnFocus=true` in the [deactivation options](#trapdeactivate)), focus will be returned to the element that was focused just before activation. With this option, you can specify another element to programmatically receive focus after deactivation. It can be a DOM node, a selector string (which will be passed to `document.querySelector()` to find the DOM node **upon deactivation**), or a function that returns any of these to call **upon deactivation** (i.e. the selector and function options are only executed at the time the trap is deactivated). Can also be `false` (or return `false`) to leave focus where it is at the time of deactivation.
  - 💬 Using the selector or function options is a good way to return focus to a DOM node that may not exist at the time the trap is activated.
  - ⚠️ See warning below about **Shadow DOM** and selector strings.
- **preventScroll** `{boolean}`: By default, focus() will scroll to the element if not in viewport. It can produce unintended effects like scrolling back to the top of a modal. If set to `true`, no scroll will happen.
- **delayInitialFocus** `{boolean}`: Default: `true`. Delays the autofocus to the next execution frame when the focus trap is activated. This prevents elements within the focusable element from capturing the event that triggered the focus trap activation.
- **document** {Document}: Default: `window.document`. Document where the focus trap will be active. This enables the use of FocusTrap [inside an iFrame](https://focus-trap.github.io/focus-trap/#demo-in-iframe).
    - ⚠️ Note that FocusTrap will be unable to trap focus outside the iFrame if you configure this option to be the iFrame's document. It will only trap focus _inside_ of it (as the demo shows). If you want to trap focus _outside_ as well, then your FocusTrap must be configured on an element that [contains the iFrame](https://focus-trap.github.io/focus-trap/#demo-iframe).
- **tabbableOptions**: (optional) [tabbable options](https://github.com/focus-trap/tabbable#common-options) configurable on FocusTrap (all the *common options*).
  - ⚠️ See notes about **[testing in JSDom](#testing-in-jsdom)** (e.g. using Jest).
- **trapStack** (optional) `{Array<FocusTrap>}`: Define the global trap stack. This makes it possible to share the same stack in multiple instances of `focus-trap` in the same page such that auto-activation/pausing of traps is properly coordinated among all instances as activating a trap when another is already active should result in the other being auto-paused. By default, each instance will have its own internal stack, leading to conflicts if they each try to trap the focus at the same time.
- **isKeyForward** `{(event: KeyboardEvent) => boolean}`: (optional) Determines if the given keyboard event is a "tab forward" event that will move the focus to the next trapped element in tab order. Defaults to the `TAB` key. Use this to override the trap's behavior if you want to use arrow keys to control keyboard navigation within the trap, for example. Also see `isKeyBackward()` option.
    - ⚠️ Using this option will not automatically prevent use of the `TAB` key as the browser will continue to respond to it by moving focus forward because that's what using the `TAB` key does in a browser, but it will no longer respect the trap's container edges as it normally would. You will need to add your own `keydown` handler to call `preventDefault()` on a `TAB` key event if you want to completely suppress the use of the `TAB` key.
- **isKeyBackward** `{(event: KeyboardEvent) => boolean}`: (optional) Determines if the given keyboard event is a "tab backward" event that will move the focus to the previous trapped element in tab order. Defaults to the `SHIFT+TAB` key. Use this to override the trap's behavior if you want to use arrow keys to control keyboard navigation within the trap, for example. Also see `isKeyForward()` option.
    - ⚠️ Using this option will not automatically prevent use of the `SHIFT+TAB` key as the browser will continue to respond to it by moving focus backward because that's what using the `SHIFT+TAB` key sequence does in a browser, but it will no longer respect the trap's container edges as it normally would. You will need to add your own `keydown` handler to call `preventDefault()` on a `TAB` key event if you want to completely suppress the use of the `SHIFT+TAB` key sequence.

#### Shadow DOM

##### Selector strings

⚠️ Beware that putting a focus-trap **inside** an open Shadow DOM means you must **not use selector strings** for options that support these (because nodes inside Shadow DOMs, even open shadows, are not visible via `document.querySelector()`).

##### Closed shadows

If you have closed shadow roots that you would like considered for tabbable/focusable nodes, use the `tabbableOptions.getShadowRoot` option to provide Tabbable (used internally) with a reference to a given node's shadow root so that it can be searched for candidates.

#### Positive Tabindexes

⚠️ Using positive tab indexes (i.e. `<button tabindex="1">Label</button>`) [is not recommended](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex#accessibility_concerns), primarily for accessibility reasons. Supporting them properly also means a lot of hoops to jump through when Shadow DOM is used as some key DOM APIs like [Node.compareDocumentPosition()](https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition) [do not](https://github.com/whatwg/dom/issues/320) properly support Shadow DOM.

As such, focus-trap considers using positive tabindexes an edge case and only supports them in __single-container__ traps with some caveats for related edge case behavior (see the [demo](https://focus-trap.github.io/focus-trap/#demo-positive-tabindex) for more details).

If you try to create a multi-container trap where at least one container has one node with a positive tabindex, an exception will be thrown:

```
At least one node with a positive tabindex was found in one of your focus-trap's multiple containers. Positive tabindexes are only supported in single-container focus-traps.
```

### trap.active

```typescript
trap.active: boolean
```

True if the trap is currently active.

### trap.paused

```typescript
trap.paused: boolean
```

True if the trap is currently paused.

### trap.activate()

```typescript
trap.activate([activateOptions]) => FocusTrap
```

Activates the focus trap, adding various event listeners to the document.

If focus is already within it the trap, it remains unaffected. Otherwise, focus-trap will try to focus the following nodes, in order:

- `createOptions.initialFocus`
- The first tabbable node in the trap
- `createOptions.fallbackFocus`

If none of the above exist, an error will be thrown. You cannot have a focus trap that lacks focus.

Returns the `trap`.

`activateOptions`:

These options are used to override the focus trap's default behavior for this particular activation.

- **onActivate** `{() => void}`: Default: whatever you chose for `createOptions.onActivate`. `null` or `false` are the equivalent of a `noop`.
- **onPostActivate** `{() => void}`: Default: whatever you chose for `createOptions.onPostActivate`. `null` or `false` are the equivalent of a `noop`.
- **checkCanFocusTrap** `{(containers: Array<HTMLElement | SVGElement>) => Promise<void>}`: Default: whatever you chose for `createOptions.checkCanFocusTrap`.

### trap.deactivate()

```typescript
trap.deactivate([deactivateOptions]) => FocusTrap
```

Deactivates the focus trap.

Returns the `trap`.

`deactivateOptions`:

These options are used to override the focus trap's default behavior for this particular deactivation.

- **returnFocus** `{boolean}`: Default: whatever you set for `createOptions.returnFocusOnDeactivate`. If `true`, then the `setReturnFocus` option (specified when the trap was created) is used to determine where focus will be returned.
- **onDeactivate** `{() => void}`: Default: whatever you set for `createOptions.onDeactivate`. `null` or `false` are the equivalent of a `noop`.
- **onPostDeactivate** `{() => void}`: Default: whatever you set for `createOptions.onPostDeactivate`. `null` or `false` are the equivalent of a `noop`.
- **checkCanReturnFocus** `{(trigger: HTMLElement | SVGElement) => Promise<void>}`: Default: whatever you set for `createOptions.checkCanReturnFocus`. Not called if the `returnFocus` option is falsy. `trigger` is either the originally focused node prior to activation, or the result of the `setReturnFocus` configuration option.

### trap.pause()

```typescript
trap.pause([pauseOptions]) => FocusTrap
```

Pause an active focus trap's event listening without deactivating the trap.

If the focus trap has not been activated, nothing happens.

Whether the trap is already paused or not, its paused state becomes __manually-paused__ even if the trap has already been auto-paused as a result of another trap being activated after this one (and so being higher on the stack than this one).

> Note that a manually-paused trap will not be auto-unpaused if it becomes the trap at the top of the `trapStack` again by way of all other traps higher than it on the stack being deactivated. It will remain paused until manually unpaused by calling `unpause()`. If the trap was auto-paused the entire time it was not at the top of the stack, then it will be auto-unpaused when it gets to the top of the stack again.

Returns the `trap`.

Any `onDeactivate` callback will not be called, and focus will not return to the element that was focused before the trap's activation. But the trap's behavior will be paused.

This is useful in various cases, one of which is when you want one focus trap within another. `demo-six` exemplifies how you can implement this.

`pauseOptions`:

These options are used to override the focus trap's default behavior for this particular pausing.

- **onPause** `{() => void}`: Default: whatever you chose for `createOptions.onPause`. `null` or `false` are the equivalent of a `noop`.
- **onPostPause** `{() => void}`: Default: whatever you chose for `createOptions.onPostPause`. `null` or `false` are the equivalent of a `noop`.

### trap.unpause()

```typescript
trap.unpause([unpauseOptions]) => FocusTrap
```

Unpause an active focus trap. (See `pause()`, above.)

Focus is forced into the trap just as described for `focusTrap.activate()`.

If the focus trap has not been activated, nothing happens.

If the focus trap has not been paused, nothing happens other than resetting its __manually-paused__ state.

If the focus trap is not at the top of the `trapStack`, it will not be unpaused (whether previously auto- or manually-paused) until all traps higher on the stack have been deactivated and this trap becomes the one at the top again.

Returns the `trap`.

`unpauseOptions`:

These options are used to override the focus trap's default behavior for this particular unpausing.

- **onUnpause** `{() => void}`: Default: whatever you chose for `createOptions.onUnpause`. `null` or `false` are the equivalent of a `noop`.
- **onPostUnpause** `{() => void}`: Default: whatever you chose for `createOptions.onPostUnpause`. `null` or `false` are the equivalent of a `noop`.

### trap.updateContainerElements()

```typescript
trap.updateContainerElements(HTMLElement | SVGElement | string | Array<HTMLElement | SVGElement | string>) => FocusTrap
```

Update the element(s) that are used as containers for the focus trap.

When you call `createFocusTrap()`, you give it an element (or selector), or an array of elements (or selectors) to keep the focus within. This method simply allows you to update which elements to keep the focus within even while the trap is active.

A use case for this is found in focus-trap-react, where React `ref`'s may not be initialized yet, but when they are you want to have them be a container element.

Returns the `trap`.

## Examples

Read code in `docs/` and [see how it works](http://focus-trap.github.io/focus-trap/).

Here's generally what happens in `default.js` (the "default behavior" demo):

```js
const { createFocusTrap } = require('../../index');

const container = document.getElementById('default');

const focusTrap = createFocusTrap('#default', {
  onActivate: () => container.classList.add('is-active'),
  onDeactivate: () => container.classList.remove('is-active'),
});

document
  .getElementById('activate-default')
  .addEventListener('click', focusTrap.activate);
document
  .getElementById('deactivate-default')
  .addEventListener('click', focusTrap.deactivate);
```

## Other details

### One at a time

*Only one focus trap can be listening at a time.* If a second focus trap is activated the first will automatically pause. The first trap is unpaused and again traps focus when the second is deactivated.

Focus trap manages a queue of traps: if A activates; then B activates, pausing A; then C activates, pausing B; when C then deactivates, B is unpaused; and when B then deactivates, A is unpaused.

### Use predictable elements for the first and last tabbable elements in your trap

The focus trap will work best if the *first* and *last* focusable elements in your trap are simple elements that all browsers treat the same, like buttons and inputs.**

Tabbing will work as expected with trickier, less predictable elements — like iframes, shadow trees, audio and video elements, etc. — as long as they are *between* more predictable elements (that is, if they are not the first or last tabbable element in the trap).

This limitation is ultimately rooted in browser inconsistencies and inadequacies, but it comes to focus-trap through its dependency [Tabbable](https://github.com/focus-trap/tabbable). You can read about more details [in the Tabbable documentation](https://github.com/focus-trap/tabbable#more-details).

### Your trap should include a tabbable element or a focusable container

You can't have a focus trap without focus, so an error will be thrown if you try to initialize focus-trap with an element that contains no tabbable nodes.

If you find yourself in this situation, you should give you container `tabindex="-1"` and set it as `initialFocus` or `fallbackFocus`. A couple of demos illustrate this.

## Development

Because of the nature of the functionality, involving keyboard and click and (especially) focus events, JavaScript unit tests don't make sense. After all, JSDom does not fully support focus events. Since the demo was developed to also be the test, we use Cypress to automate running through all demos in the demo page.

## Help

### Testing in JSDom

> ⚠️ JSDom is not officially supported. Your mileage may vary, and tests may break from one release to the next (even a patch or minor release).
>
> This topic is just here to help with what we know may affect your tests.

In general, a focus trap is best tested in a full browser environment such as Cypress, Playwright, or Nightwatch where a full DOM is available.

Sometimes, that's not entirely desirable, and depending on what you're testing, you may be able to get away with using JSDom (e.g. via Jest), but you'll have to configure your traps using the `tabbableOptions.displayCheck: 'none'` option.

See [Testing tabbable in JSDom](https://github.com/focus-trap/tabbable#testing-in-jsdom) for more details.

### ERROR: Your focus-trap must have at least one container with at least one tabbable node in it at all times

This error happens when the containers you specified when you [setup](#createfocustrap) your focus trap do not have -- or no longer have -- any tabbable elements in them, which means that focus will inevitably escape your trap because focus __must__ always go _somewhere_.

You will hit this error if your trap does not have (or no longer has) any [tabbable](https://github.com/focus-trap/tabbable#readme) (and therefore focusable) elements in it, and it was not configured with a backup element (see the `fallbackFocus` [option](#createoptions) -- which must still be in the trap, but does not necessarily have to be tabbable, i.e. it could have `tabindex="-1"`, making it focusable, but not tabbable).

This often happens when traps are related to elements that appear and disappear dynamically. Typically, the error will fire either as the element is being shown (because the trap gets created before the trapped children have been inserted into the DOM), or as it's being hidden (because the trapped children are destroyed before the trap is either destroyed or disabled).

### First element in trap is unreachable with the TAB key

If you create a trap and try to use the TAB key to set focus to the first element in your trap, the first element seems unreachable because focus keeps skipping over it for some reason.

This can happen in projects where the Angular-related [zone.js](https://www.npmjs.com/package/zone.js) module is being used because Zone can interfere with Focus-trap's ability to control where focus goes when it _leaves an edge node_ (that is, a node that is on the edge of a container in which it is trapping focus).

What is actually happening is that Focus-trap is correctly wrapping focus around to that first element (or last element, if going in reverse with SHIFT+TAB, and you're seeing that get skipped) and setting focus to it, but because of Zone's interference (in which Focus-trap's call to `preventDefault()` on the focus event triggered by the TAB key press is rendered ineffective), once Focus-trap is done handling the event, the browser hasn't received the signal that its default behavior should be prevented, and so it proceeds to move focus to the _next_ element -- effectively "skipping" over the element to which Focus-trap set focus, making it seem "unreachable".

Unfortunately, there's no good workaround to this issue from Focus-trap's perspective. The issue was [reported to Angular](https://github.com/angular/angular/issues/45020) (not by Focus-trap) and [has a PR](https://github.com/angular/angular/pull/49477) (also not by Focus-trap) for a fix.

This was originally investigated in [#1165](https://github.com/focus-trap/focus-trap/issues/1165) if you want to go deeper.

# Contributing

See [CONTRIBUTING](CONTRIBUTING.md).

## Contributors

In alphabetical order:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/andersthorsen"><img src="https://avatars.githubusercontent.com/u/190081?v=4?s=100" width="100px;" alt="Anders Thorsen"/><br /><sub><b>Anders Thorsen</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Aandersthorsen" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bparish628"><img src="https://avatars1.githubusercontent.com/u/8492971?v=4?s=100" width="100px;" alt="Benjamin Parish"/><br /><sub><b>Benjamin Parish</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Abparish628" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bernhardoj"><img src="https://avatars.githubusercontent.com/u/50919443?v=4?s=100" width="100px;" alt="Bernhard Owen Josephus"/><br /><sub><b>Bernhard Owen Josephus</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=bernhardoj" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/chrisbishop-looka"><img src="https://avatars.githubusercontent.com/u/128391384?v=4?s=100" width="100px;" alt="Chris Bishop"/><br /><sub><b>Chris Bishop</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Achrisbishop-looka" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://clintgoodman.com"><img src="https://avatars3.githubusercontent.com/u/5473697?v=4?s=100" width="100px;" alt="Clint Goodman"/><br /><sub><b>Clint Goodman</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=cgood92" title="Code">💻</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=cgood92" title="Documentation">📖</a> <a href="#example-cgood92" title="Examples">💡</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=cgood92" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Dan503"><img src="https://avatars.githubusercontent.com/u/10610368?v=4?s=100" width="100px;" alt="Daniel Tonon"/><br /><sub><b>Daniel Tonon</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=Dan503" title="Documentation">📖</a> <a href="#tool-Dan503" title="Tools">🔧</a> <a href="#a11y-Dan503" title="Accessibility">️️️️♿️</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=Dan503" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/DaviDevMod"><img src="https://avatars.githubusercontent.com/u/98312056?v=4?s=100" width="100px;" alt="DaviDevMod"/><br /><sub><b>DaviDevMod</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=DaviDevMod" title="Documentation">📖</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=DaviDevMod" title="Code">💻</a> <a href="https://github.com/focus-trap/focus-trap/issues?q=author%3ADaviDevMod" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://davidtheclark.com/"><img src="https://avatars2.githubusercontent.com/u/628431?v=4?s=100" width="100px;" alt="David Clark"/><br /><sub><b>David Clark</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=davidtheclark" title="Code">💻</a> <a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Adavidtheclark" title="Bug reports">🐛</a> <a href="#infra-davidtheclark" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=davidtheclark" title="Tests">⚠️</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=davidtheclark" title="Documentation">📖</a> <a href="#maintenance-davidtheclark" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/features/security"><img src="https://avatars1.githubusercontent.com/u/27347476?v=4?s=100" width="100px;" alt="Dependabot"/><br /><sub><b>Dependabot</b></sub></a><br /><a href="#maintenance-dependabot" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jcfranco"><img src="https://avatars.githubusercontent.com/u/197440?v=4?s=100" width="100px;" alt="JC Franco"/><br /><sub><b>JC Franco</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=jcfranco" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.schilljs.com/"><img src="https://avatars.githubusercontent.com/u/213943?v=4?s=100" width="100px;" alt="Joas Schilling"/><br /><sub><b>Joas Schilling</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/pulls?q=is%3Apr+reviewed-by%3Anickvergessen" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/skjnldsv"><img src="https://avatars.githubusercontent.com/u/14975046?v=4?s=100" width="100px;" alt="John Molakvoæ"/><br /><sub><b>John Molakvoæ</b></sub></a><br /><a href="#ideas-skjnldsv" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://reload.dk"><img src="https://avatars.githubusercontent.com/u/73966?v=4?s=100" width="100px;" alt="Kasper Garnæs"/><br /><sub><b>Kasper Garnæs</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=kasperg" title="Documentation">📖</a> <a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Akasperg" title="Bug reports">🐛</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=kasperg" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/marioliu-block"><img src="https://avatars.githubusercontent.com/u/104794152?v=4?s=100" width="100px;" alt="Mario Liu"/><br /><sub><b>Mario Liu</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=marioliu-block" title="Code">💻</a> <a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Amarioliu-block" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://blogs.esri.com/esri/arcgis/"><img src="https://avatars.githubusercontent.com/u/1231455?v=4?s=100" width="100px;" alt="Matt Driscoll"/><br /><sub><b>Matt Driscoll</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Adriskull" title="Bug reports">🐛</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=driskull" title="Code">💻</a> <a href="#tutorial-driskull" title="Tutorials">✅</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/msev"><img src="https://avatars.githubusercontent.com/u/1529562?v=4?s=100" width="100px;" alt="Maxime"/><br /><sub><b>Maxime</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Amsev" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/michael-ar"><img src="https://avatars3.githubusercontent.com/u/18557997?v=4?s=100" width="100px;" alt="Michael Reynolds"/><br /><sub><b>Michael Reynolds</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Amichael-ar" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/liunate"><img src="https://avatars2.githubusercontent.com/u/38996291?v=4?s=100" width="100px;" alt="Nate Liu"/><br /><sub><b>Nate Liu</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=liunate" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/far-fetched"><img src="https://avatars.githubusercontent.com/u/11621383?v=4?s=100" width="100px;" alt="Piotr Panek"/><br /><sub><b>Piotr Panek</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Afar-fetched" title="Bug reports">🐛</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=far-fetched" title="Documentation">📖</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=far-fetched" title="Code">💻</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=far-fetched" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/randypuro"><img src="https://avatars2.githubusercontent.com/u/2579?v=4?s=100" width="100px;" alt="Randy Puro"/><br /><sub><b>Randy Puro</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Arandypuro" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sadick254"><img src="https://avatars2.githubusercontent.com/u/5238135?v=4?s=100" width="100px;" alt="Sadick"/><br /><sub><b>Sadick</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=sadick254" title="Code">💻</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=sadick254" title="Tests">⚠️</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=sadick254" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://scottblinch.me/"><img src="https://avatars2.githubusercontent.com/u/4682114?v=4?s=100" width="100px;" alt="Scott Blinch"/><br /><sub><b>Scott Blinch</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=scottblinch" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://seanmcp.com/"><img src="https://avatars1.githubusercontent.com/u/6360367?v=4?s=100" width="100px;" alt="Sean McPherson"/><br /><sub><b>Sean McPherson</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=SeanMcP" title="Code">💻</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=SeanMcP" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/skriems"><img src="https://avatars.githubusercontent.com/u/15573317?v=4?s=100" width="100px;" alt="Sebastian Kriems"/><br /><sub><b>Sebastian Kriems</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Askriems" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://recollectr.io"><img src="https://avatars2.githubusercontent.com/u/6835891?v=4?s=100" width="100px;" alt="Slapbox"/><br /><sub><b>Slapbox</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/issues?q=author%3ASlapbox" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://stefancameron.com/"><img src="https://avatars3.githubusercontent.com/u/2855350?v=4?s=100" width="100px;" alt="Stefan Cameron"/><br /><sub><b>Stefan Cameron</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=stefcameron" title="Code">💻</a> <a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Astefcameron" title="Bug reports">🐛</a> <a href="#infra-stefcameron" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=stefcameron" title="Tests">⚠️</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=stefcameron" title="Documentation">📖</a> <a href="#maintenance-stefcameron" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://tylerhawkins.info/201R/"><img src="https://avatars0.githubusercontent.com/u/13806458?v=4?s=100" width="100px;" alt="Tyler Hawkins"/><br /><sub><b>Tyler Hawkins</b></sub></a><br /><a href="#tool-thawkin3" title="Tools">🔧</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=thawkin3" title="Tests">⚠️</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=thawkin3" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/vasiliki-b"><img src="https://avatars.githubusercontent.com/u/98032598?v=4?s=100" width="100px;" alt="Vasiliki Boutas"/><br /><sub><b>Vasiliki Boutas</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Avasiliki-b" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://vinicius73.dev/"><img src="https://avatars.githubusercontent.com/u/1561347?v=4?s=100" width="100px;" alt="Vinicius Reis"/><br /><sub><b>Vinicius Reis</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=vinicius73" title="Code">💻</a> <a href="#ideas-vinicius73" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/wandroll"><img src="https://avatars.githubusercontent.com/u/4492317?v=4?s=100" width="100px;" alt="Wandrille Verlut"/><br /><sub><b>Wandrille Verlut</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=wandroll" title="Code">💻</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=wandroll" title="Tests">⚠️</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=wandroll" title="Documentation">📖</a> <a href="#tool-wandroll" title="Tools">🔧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://willmruzek.com/"><img src="https://avatars.githubusercontent.com/u/108522?v=4?s=100" width="100px;" alt="Will Mruzek"/><br /><sub><b>Will Mruzek</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=mruzekw" title="Code">💻</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=mruzekw" title="Documentation">📖</a> <a href="#example-mruzekw" title="Examples">💡</a> <a href="https://github.com/focus-trap/focus-trap/commits?author=mruzekw" title="Tests">⚠️</a> <a href="#question-mruzekw" title="Answering Questions">💬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/zioth"><img src="https://avatars3.githubusercontent.com/u/945603?v=4?s=100" width="100px;" alt="Zioth"/><br /><sub><b>Zioth</b></sub></a><br /><a href="#ideas-zioth" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Azioth" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/glushkova91"><img src="https://avatars.githubusercontent.com/u/13402897?v=4?s=100" width="100px;" alt="glushkova91"/><br /><sub><b>glushkova91</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=glushkova91" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jpveooys"><img src="https://avatars.githubusercontent.com/u/66470099?v=4?s=100" width="100px;" alt="jpveooys"/><br /><sub><b>jpveooys</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Ajpveooys" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/konradr33"><img src="https://avatars.githubusercontent.com/u/32595283?v=4?s=100" width="100px;" alt="konradr33"/><br /><sub><b>konradr33</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Akonradr33" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tomasvn"><img src="https://avatars.githubusercontent.com/u/17225564?v=4?s=100" width="100px;" alt="tomasvn"/><br /><sub><b>tomasvn</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=tomasvn" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/simonxabris"><img src="https://avatars.githubusercontent.com/u/27497229?v=4?s=100" width="100px;" alt="Ábris Simon"/><br /><sub><b>Ábris Simon</b></sub></a><br /><a href="https://github.com/focus-trap/focus-trap/commits?author=simonxabris" title="Code">💻</a> <a href="https://github.com/focus-trap/focus-trap/issues?q=author%3Asimonxabris" title="Bug reports">🐛</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
