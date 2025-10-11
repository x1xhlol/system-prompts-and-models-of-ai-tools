# Changelog

## 7.6.5

### Patch Changes

- d51ad78: Allow activation element in shadow DOM to be auto-focused after trap is deactivated

## 7.6.4

### Patch Changes

- bb47f7a: Remove engine requirement that crept into `package.json`. Sorry about that! ([#1343](https://github.com/focus-trap/focus-trap/issues/1343))

## 7.6.3

### Patch Changes

- 0a9b746: Prevent a previous focus trap that is manually paused from being automatically unpaused when the current trap is deactivated. Also prevent a paused trap that is not at the top of the stack from being unpaused.

## 7.6.2

### Patch Changes

- d4a4c34: Replace findIndex with native implementation - [Closes #1305](https://github.com/focus-trap/focus-trap/issues/1305

## 7.6.1

### Patch Changes

- fc5910d: Fix fallbackFocus not used when initialFocus is selector to non-existent node ([#1218](https://github.com/focus-trap/focus-trap/issues/1218))

## 7.6.0

### Minor Changes

- 8aeacee: Move `Escape` key handler to target phase to allow more control in `escapeDeactivates` ([#1247](https://github.com/focus-trap/focus-trap/issues/1247))

## 7.5.4

### Patch Changes

- 680f6e8: Fix issue with not being able to cycle back to the start from the last element if there is a focusable web component inside the focus-trap ((#1068)[https://github.com/focus-trap/focus-trap/issues/1068])

## 7.5.3

### Patch Changes

- 203b322: Fix missing typings for initialFocus option ([#1060](https://github.com/focus-trap/focus-trap/issues/1060))

## 7.5.2

### Patch Changes

- b73eb02: Remove references to `Array.prototype.findLast()` not well supported in Safari ([#996](https://github.com/focus-trap/focus-trap/issues/996))

## 7.5.1

### Patch Changes

- d9e2546: Fix possible exception in new `Tabbable.getTabIndex()` when initializing trap

## 7.5.0

### Minor Changes

- 5e2f913: Adds support for nodes with a positive tabindex in single-container traps only ([#375](https://github.com/focus-trap/focus-trap/issues/375))

## 7.4.3

### Patch Changes

- 134678b: Ensure focus is kept inside the trap when focused element is removed from the DOM ([focus-trap/focus-trap-react#962](https://github.com/focus-trap/focus-trap-react/issues/962))

## 7.4.2

### Patch Changes

- db62ce3: Clicking on open shadowDOM components within a focus trap's container when `clickOutsideDeactivates=true` should not deactivate the focus trap. ([#959](https://github.com/focus-trap/focus-trap/issues/959))

## 7.4.1

### Patch Changes

- 4f720ff: Bump tabbable to v6.1.2 for nwsapi patch

## 7.4.0

### Minor Changes

- da97007: Added new onPost/Pause and onPost/Unpause hooks when un/pausing a trap (also called when auto-un/paused as a result of de/activating a second trap while another is currently active). ([focus-trap-react#948](https://github.com/focus-trap/focus-trap-react/issues/948))

## 7.3.1

### Patch Changes

- a00cfa5: Bump tabbable to v6.1.1 for JSDom fixes

## 7.3.0

### Minor Changes

- ae7129d: Bump tabbable to v6.1.0 adding support for the new HTML `inert` attribute in browsers that support it (NOTE: FireFox does not support it at this time). Also fixes a bug. See tabbable CHANGELOG for more info.

### Patch Changes

- a27ad58: Fix incorrect behavior of `returnFocusOnDeactivate` option when set to true (or defaulted to true) along with `clickOutsideDeactivates=true` and the outside click that deactivates is on a focusable node. Focus was remaining on that node instead of returning to the node focused just prior to activation. ([#893](https://github.com/focus-trap/focus-trap/issues/893))

## 7.2.0

### Minor Changes

- b0482af: Add new `isKeyForward()` and `isKeyBackward()` options ([#612](https://github.com/focus-trap/focus-trap/issues/612))

## 7.1.0

### Minor Changes

- 88cc9bc: Provide new `trapStack` option to make it possible to coordinate auto-activation/pausing between multiple `focus-trap` instances on the same page.

### Patch Changes

- 4f97b38: Bump tabbable to v6.0.1 for a bug fix. See tabbable's changelog for more details.
- f13de76: Mention special Safari setting to enable normal DOM-based tab order in README. [#783](https://github.com/focus-trap/focus-trap/issues/783)

## 7.0.0

### Major Changes

- 5b64423: Revised and clarified official browser support (still as broad and deep as _reasonably_ possible).
- 47f62ac: 🚨 **Breaking:** Tabbable dependency has been updated to v6.0.0 and contains a breaking change related to detached nodes with its default `displayCheck` setting. See tabbable's [changelog](https://github.com/focus-trap/tabbable/blob/master/CHANGELOG.md#600) for more information.
- 5b64423: 🚨 **Breaking:** Dropped support of IE browsers, all versions.
  - IE11 was [officially retired](https://blogs.windows.com/windowsexperience/2022/06/15/internet-explorer-11-has-retired-and-is-officially-out-of-support-what-you-need-to-know/) on June 15, 2022 (6 weeks ago). There are no longer any versions of IE that are still maintained or even supported by Microsoft.

## 6.9.4

### Patch Changes

- f68882e: Fix docs and typings to clarify that initialFocus, fallbackFocus, and setReturnFocus options can be functions that also return selector strings.

## 6.9.3

### Patch Changes

- 8a8b1f1: Bump tabbable to v5.3.3 to pick up a small bug fix to web component (shadow DOM) support.

## 6.9.2

### Patch Changes

- ef0ce48: Handle unexpected param (true) passed as the value for the `initialFocus`, `fallbackFocus`, and `setReturnFocus` options: Ignore and perform default behavior.

## 6.9.1

### Patch Changes

- 83262a7: Bumps tabbable to v5.3.2 to pick-up a fix to `displayCheck=full` (default) option behavior that caused issues with detached nodes.

## 6.9.0

### Minor Changes

- 2a57e4b: Add new `trap.active` and `trap.paused` readonly state properties on the trap so that the trap's active/paused state can be queried.

### Patch Changes

- 8fd49df: Fixed bug where `clickOutsideDeactivate` handler would get called on the 'click' event even if the node clicked was in the trap. As with 'mousedown' and 'touchstart' events where this option is also used, the handler should only get called if the target node is _outside_ the trap.
- c32c60a: Fixed: onDeactivate, onPostDeactivate, and checkCanReturnFocus options originally given to createFocusTrap() were not being used by default when calling `trap.deactivate({...})` with an option set even if that option set didn't specify any overrides of these options.

## 6.8.1

### Patch Changes

- 7c86111:
  - Bump tabbable to `^5.3.1` (fixing previous update which was incorrectly set to `5.3.0`).
  - Fix `tabbableOptions` not being used in all internal uses of tabbable APIs.
  - Expose `displayCheck` option in `tabbableOptions` typings and pass it through to tabbable APIs.
  - Add info to README about testing traps in JSDom (which is not officially supported).

## 6.8.0

### Minor Changes

- 21458c9: Bumps tabbable to v5.3.0 and includes all changes from the past v6.8.0 beta releases. The big new feature is opt-in Shadow DOM support in tabbable, and a new `getShadowRoot` tabbable option exposed in a new `tabbableOptions` focus-trap config option.
  - ⚠️ This will likely break your tests **if you're using JSDom** (e.g. with Jest). See [testing in JSDom](./README.md#testing-in-jsdom) for more info.

## 6.8.0-beta.2

- When updating tabbable nodes, make sure that `getShadowRoot` tabbable option is also passed to `focusable()`.
- Fix bug where having a tabbable node inside a web component in the middle of a tab sequence would cause the tab key to seemingly stop working just before focus should move to it ((#643)[https://github.com/focus-trap/focus-trap/issues/643]).
- Bumps tabbable to `v5.3.0-beta.1`

## 6.8.0-beta.1

- Previous beta didn't include new source. This one does.

## 6.8.0-beta.0

- Adds new `tabbableOptions` configuration option, which allows specifically for the new `getShadowRoot` Tabbable configuration option: `focusTrap.createFocusTrap(rootElement, { tabbableOptions: { getShadowRoot: (node) => closedShadowRoot } })`, for example (where your code has the reference to `closedShadowRoot` previously created on `node` which Tabbable cannot find on its own).
- Bumps tabbable to `v5.3.0-beta.0`

## 6.7.3

### Patch Changes

- ab20d3d: Fix issue with focusing negative tabindex node and then tabbing away when this node is _not_ the last node in the trap's container ((#611)[https://github.com/focus-trap/focus-trap/issues/611])

## 6.7.2

### Patch Changes

- c932330: Fixed bug where tabbing forward from an element with negative tabindex that is last in the trap would result in focus remaining on that element ([565](https://github.com/focus-trap/focus-trap/issues/565))

## 6.7.1

### Patch Changes

- 28a069f: Fix bug from #504 where it's no longer possible to create a trap without any options [#525]

## 6.7.0

### Minor Changes

- 893dd2c: Add `document` option to support focus traps inside `<iframe>` elements (#97)
- 244f0c1: Extend the `setReturnFocus` option to receive a reference to the element that had focus prior to the trap being activated when a function is specified. Additionally, the function can now return `false` to leave focus where it is at the time of deactivation. (#485)

### Patch Changes

- 60162eb: Fix bug where `KeyboardEvent` was not being passed to `escapeDeactivates` option when it's a function (#498)
- 7b6abfa: Fix how focus-trap determines the event's target, which was preventing traps inside open shadow DOMs from working properly (#496)
- 14b0ee8: Fix `initialFocus` option not supporting function returning `false` as documented (#490)

## 6.6.1

### Patch Changes

- 24063d7: Update tabbable to v5.2.1 to get bug fix for disabled fieldsets.

## 6.6.0

### Minor Changes

- 281e66c: Add option to allow no initial focus when trap activates via `initialFocus: false`

  There may be cases where we don't want to focus the first tabbable element when a focus trap activates.

  Examples use-cases:

  - Modals/dialogs
  - On mobile devices where "tabbing" doesn't make sense without a connected Bluetooth keyboard

  In addition, this change ensures that any element inside the trap manually focused outside of `focus-trap` code will be brought back in focus if focus is somehow found outside of the trap.

  Example usage:

  When the trap activates, there will be no initially focused element inside the new trap.

  ```js
  const focusTrap = createFocusTrap('#some-container', {
    initialFocus: false,
  });
  ```

- 75be463: `escapeDeactivates` can now be either a boolean (as before) or a function that takes an event and returns a boolean.

### Patch Changes

- e2294f0: Fix race condition when activating a second trap where initial focus in the second trap may be thwarted because pausing of first trap clears the `delayInitialFocus` timer created for the second trap before during its activation sequence.

## 6.5.1

### Patch Changes

- c38bf3f: onPostDeactivate should always be called even if returnFocus/OnDeactivate is disabled.

## 6.5.0

### Minor Changes

- 278e77e: Adding 4 new configuration event options to improve support for animated dialogs and animated focus trap triggers: `checkCanFocusTrap()`, `onPostActivate()`, `checkCanReturnFocus()`, and `onPostDeactivate()`.

### Patch Changes

- 8d11e15: Improve docs and types for most options, adding `SVGElement` as a supported type of "DOM node" since it supports the `focus()` method, same as `HTMLElement`.

## 6.4.0

### Minor Changes

- 21c82ce: Bump tabbable from 5.1.6 to 5.2.0. There should be no changes in behavior as a result of this upgrade as `focus-trap` does not currently leverage the new `displayCheck` option.

### Patch Changes

- 1baf62e: Fix focus trapped on initial focus container with tabindex=-1 when pressing shift+tab (#363)

## 6.3.0

### Minor Changes

- a882d62: `clickOutsideDeactivates` can now also be a function that returns a `boolean`, similar to `allowOutsideClick`. The function receives the `MouseEvent` that triggered the click. (#289)

### Patch Changes

- 4d67dee: Fix a focus escape when pressing TAB after hiding element with focus (#281)
- ca32014: Bump tabbable from 5.1.4 to 5.1.5

## 6.2.3

### Patch Changes

- 036a72e: Fix crash in IE due to use of `Array.findIndex()` not supported in that browser (#257)

## 6.2.2

### Patch Changes

- fd3f2d1: Fix a bug where a multi-container trap would cease to work if all tabbable nodes were removed from one of the containers (fixes #223). As a result, an error is now thrown if the trap is left in a state where none of its containers contain any tabbable nodes (unless a `fallbackFocus` node has been configured in the trap's options). Also, the most-recently-focused node is more reliably tracked now, should focus somehow escape the trap and be brought back in by the trap, resulting in the truly most-recently-focused node to regain focus if that ever happens.

## 6.2.1

### Patch Changes

- f0c2aff: Bump tabbable to [5.1.4](https://github.com/focus-trap/tabbable/blob/master/CHANGELOG.md#514) for bug fix.
- 2ba512b:
  - Refactored code to use function declarations instead of hoisted functions (this should have no bearing on functionality in the build output included in `./dist`.
  - Fixed bugs where `trap.activate()` and `trap.deactivate()` would not always return the trap (now they do in all circumstances).
- d26d2e1: Refactoring to use const/let, and simplify a few lines. This does NOT impact the build output published in `./dist`, however, and hence does not impact browser support.

## 6.2.0

### Minor Changes

- 2267d17: Adding support for multiple elements to be passed in #217

## 6.1.4

### Patch Changes

- 38b6b98: Update tabbable to [5.1.3](https://github.com/focus-trap/tabbable/blob/master/CHANGELOG.md#513) to get bug fixes related to detail and summary elements.

## 6.1.3

### Patch Changes

- 6a39217: Close the gap with #172 and bump `tabbable` to 5.1.2 which has a similar fix.
- 756c79d: Fix #172 (again): Transpile ESM bundle down to the same browser target used for the CJS and UMD bundles. ESM is just the module system, not the browser target.

## 6.1.2

### Patch Changes

- 00674dd: Fix #172: Transpile non-minified bundles so they are compatible with IE11.
- 679009b: Update tabbable dependency to 5.1.1 to get transpiled non-minified bundles.

## 6.1.1

### Patch Changes

- fe2b0ad: Fixed #103: `returnFocusOnDeactivate` is now respected on auto-deactivation with `clickOutsideDeactivates=true`.

## 6.1.0

### Minor Changes

- 5174ce1: Add delayInitialFocus option

### Patch Changes

- 53b906b: Change `prepublishOnly` script to `prepare` script so that it also runs if someone installs the package directly from the git repo (e.g. from your work in which you fixed a bug or added a feature you're waiting to get merged to master and published to NPM).
- 31bb28e: Update tabbable dependency to 5.1.0. The most significant update for focus-trap is a bug fix related to fixed-position containers.

## 6.0.1

### Patch Changes

- 694e2fa: Package main/module entries no longer point to minified bundles.

## 6.0.0

- Add boolean value support for `allowOutsideClick` option.
- New `preventScroll` feature to _prevent_ scrolling to the element getting focus if not in the viewport.
- Changed code formatting to use dangling commas where ES5 supports them.
- **BREAKING**: Updated [tabbable](https://github.com/focus-trap/tabbable/blob/master/CHANGELOG.md#500) dependency to the new 5.0.0 release which contains breaking changes to its `isTabbableRadio()` internal function.
- Help with tree shaking by having `package.json` state `sideEffects: false` to mark this module as having no side effects as a result of merely importing it.
- **BREAKING**: This `package.json`'s "main" no longer points to `./index.js` in the package (although it still points to a CJS module, so it's possible this actually doesn't break anything). It now has:
  - "main": `dist/focus-trap.min.js` (the CJS bundle)
  - "module": `dist/focus-trap.esm.min.js` (the **new ESM bundle**)
  - the UMD is `dist/focus-trap.umd.min.js` if needed (convenient for loading directly in an older browser that doesn't support ESM)
  - **NOTE:** The CJS build no longer provides a function as a default export. Use `const { createFocusTrap } = require('focus-trap');` to get the function from before.
  - **NOTE:** The ESM build does not provide a default export. Use `import { createFocusTrap } from 'focus-trap';` to import the module.
- **New ESM Build**: Included in `dist/focus-trap.esm.*`.
- New UMD Build: Included in `dist/focus-trap.umd.*`.

## 5.1.0

- Add `setReturnFocus` option that allows you to set which element receives focus when the trap closes.

## 5.0.2

- Add `allowOutsideClick` option that allows you to pass a click event through, even when `clickOutsideDeactivates` is `false`.

## 5.0.0

- Update Tabbable to improve performance (see [Tabbable's changelog](https://github.com/davidtheclark/tabbable/blob/master/CHANGELOG.md)).
- **Breaking (kind of):** if the `onActivate` callback changes the list of tabbable nodes and the `initialFocus` option is not used, the initial focus will still go to the first element present before the callback.
- Improve performance of activating a trap.
- Register document-level event listeners as active (`passive: false`).

## 4.0.2

- Fix reference to root element that caused errors within Shadow DOM.

(Release 4.0.1 was a mistake, containing no changes.)

## 4.0.0

- **Breaking (kind of):** Focus trap now manages a queue of traps, so when a trap is paused because another trap activates, it will be unpaused when that other trap deactivates. If Trap A was automatically _paused_ because Trap B activated (existing behavior), when Trap B is deactivated Trap A will be automatically _unpaused_ (new behavior).

## 3.0.0

- **Breaking (kind of):** Update Tabbable to detect more elements and be more careful with radio buttons (see [Tabbable's changelog](https://github.com/davidtheclark/tabbable/blob/master/CHANGELOG.md)).
- **Breaking (kind of):** If `clickOutsideDeactivates` and `returnFocusOnDeactivate` are both `true`, focus will be returned to the pre-trap element only if the clicked element is not focusable.

## 2.4.6

- Add slight delay before moving focus to the first element in the trap. This should prevent an occasional bug caused when the first element in the trap will close the trap if it picks up on the event that triggered the trap's opening.

## 2.4.5

- Fix `"main"` field in `package.json`.

## 2.4.4

- Publish UMD build so people can download it from `unpkg.com`.

## 2.4.3

- Fixed: TypeScript signature for `activate` function.

## 2.4.2

- Added: TypeScript declaration file.

## 2.3.1

- Fixed: Activation does not re-focus already-focused node.
- Fixed: Tabbing works as expected when initially focused Node has a negative `tabindex` and is in the middle of other tabbable elements.

## 2.3.0

- Added: `initialFocus` and `fallbackFocus` options can take functions that return DOM nodes.
- Fixed: `pause` and `unpause` cannot accidentally add extra event listeners.

## 2.2.0

- Added/fixed, depending on your perspective: If focus is already inside the focus trap when it is activated, leave focus where it is instead of forcing it to the first tabbable node or `initialFocus`.

## 2.1.0

- Added: `fallbackFocus` option.

## 2.0.2

- Fixed: `clickOutsideDeactivates` no longer triggers deactivation when you click _inside_ the trap.

## 2.0.1

- Fix bug when activating multiple focus traps.

## 2.0.0

- Rewrote the thing, altering the API. Read the new docs please.
- Update `tabbable` to fix handling of traps with changing contents.

## 1.1.1

- Improve `clickOutsideDeactivates` functionality.

## 1.1.0

- Add `clickOutsideDeactivates` option.
- Add `escapeDeactivates` option.

## 1.0.2

- Make sure to `select()` `<input>` elements when they receive focus via tab.

## 1.0.1

- Fix buggy attempts to focus nodes that don't exist.

## 1.0.0

- Initial release.
