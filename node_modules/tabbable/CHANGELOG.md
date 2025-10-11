# Changelog

## 6.2.0

### Minor Changes

- 18a093f: Add new `getTabIndex()` API which enables Focus-trap to determine tab indexes in the same way as Tabbable when necessary (see [focus-trap#974](https://github.com/focus-trap/focus-trap/pull/974)).

## 6.1.2

### Patch Changes

- b39b217: Pin jsdom downstream dependency nwsapi to v2.2.2 while awaiting fix ([#982](https://github.com/focus-trap/tabbable/issues/982))

## 6.1.1

### Patch Changes

- 97373cc: Fix JSDom not supporting HTMLElement.inert and HTMLElement.contentEditable APIs, and not supporting CSS selector ':not([inert *])' resulting in no nodes found and "focus-trap must have at least one tabbable node..." error in focus-trap.

## 6.1.0

### Minor Changes

- 1756c90: Add support for new [inert](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert#browser_compatibility) attribute ([#292](https://github.com/focus-trap/tabbable/issues/292))

### Patch Changes

- b8c7550: Fix a corner case where a node's root node can be itself, indicating detachment from the DOM, leading to a crash in `isHidden() -> isNodeAttached() -> getRootNode()` if not handled properly ([focus-trap-react #905](https://github.com/focus-trap/focus-trap-react/issues/905))

## 6.0.1

### Patch Changes

- 0aab1e3: Fix crash with tabbable scoped table header elements ([#832](https://github.com/focus-trap/tabbable/issues/832))

## 6.0.0

### Major Changes

- 5f40c8e: Revised and clarified official browser support (still as broad and deep as _reasonably_ possible).
- 5f40c8e: 🚨 **Breaking:** Dropped support of IE browsers, all versions.
  - IE11 was [officially retired](https://blogs.windows.com/windowsexperience/2022/06/15/internet-explorer-11-has-retired-and-is-officially-out-of-support-what-you-need-to-know/) on June 15, 2022 (6 weeks ago). There are no longer any versions of IE that are still maintained or even supported by Microsoft.
- a09ba0b: 🚨 **Breaking:** Default `displayCheck` 'full' option no longer treats detached nodes as visible. Use the new 'legacy-full' option to restore old (incorrect) behavior only if you must. Ideally, make sure tabbable only runs once all nodes of interest have been attached to the document.

## 5.3.3

### Patch Changes

- 0210a1c: fix: align with browser behaviour when a web component has a negative tabindex

## 5.3.2

### Patch Changes

- 320bfd1: Updated docs for `displayCheck` configuration.
- aa2a699: Fixed an issue with `displayCheck=full` (default setting) determining all nodes were hidden when the container is not attached to the document. In this case, tabbable will revert to a `displayCheck=none` mode, which is the equivalent legacy behavior. Also updated the `displayCheck` option docs to add warnings about this corner case for the `full` and `non-zero-area` modes. `non-zero-area` behaves differently in the corner case. See the docs for more info.

## 5.3.1

### Patch Changes

- cf1da66: Add warnings and help in documentation about running tabbable under JSDom (e.g. with Jest). JSDom is not technically supported, and 5.3.0 introduced some changes that use DOM APIs that JSDom stubs out, which may cause some JSDom-based tests to fail. Also revamp the API docs a bit to make them clearer, and add missing `getShadowRoot` option to `isTabbable()` and `isFocusable()` (docs only; no code changes necessary).

## 5.3.0

### Minor Changes

- 685a906: Adds new Shadow DOM support (must be explicitly enabled using the new `getShadowRoot` option).
  - When enabled, supports open shadows by default, and can support closed shadows if the option is a function that returns the shadow for a given node. See documentation for more information.
  - Includes all updates from `5.3.0-beta.0` and `5.3.0-beta.1` releases.

### Patch Changes

- b341412: Made "isDisabledFromFieldset" more readable and concise (even marginally faster).
- 685a906: Fixed a bug in `getTabIndex`: the tab index of `<audio>`, `<video>` and `<details>` was left to the browser default if explicitly set to a value that couldn't be parsed as integer, leading to inconsistent behavior across browsers. Also slightly modified the function's logic to make it more efficient. Finally added tests to cover the fix.
- dd6d0ec: Optimized and extended `displayCheck: "full"` option (now checks for any element having no display boxes) and added test for `display: "contents"` property (this bug was never reported). [(#592)](https://github.com/focus-trap/tabbable/issues/592)
  - ⚠️ This will likely break your tests **if you're using JSDom** (e.g. with Jest). See [testing in JSDom](./README.md#testing-in-jsdom) for more info.
- 193fca2: Fixed bug in `isDisabledFromFieldset`. The function wasn't checking whether the disabled `<fieldset>` containing `node` is the top-most disabled `<fieldset>` ([#596](https://github.com/focus-trap/tabbable/issues/596)).

## 5.3.0-beta.1

- Add support for setting `getShadowRoot: true` as an easy way to simply _enable_ shadow DOM support. This is the equivalent of setting `getShadowRoot: () => false`, which means tabbable will find nodes in **open** shadow roots only.

## 5.3.0-beta.0

- Includes new Shadow DOM support for open shadows by default
- Includes a new `getShadowRoot()` configuration option, enabling support for closed shadows

## 5.2.1

### Patch Changes

- 1d5fcb5: Fixed: Form elements in disabled fieldsets should not be tabbable/focusable (#413)

## 5.2.0

### Minor Changes

- bf0a8f0: Exposed an option to select the way that an element is checked as displayed

## 5.1.6

### Patch Changes

- f9f6d25: Replaces Karma/Mocha/Sinon/Chai in test suite with Jest/Dom Testing Library. Removes README reference to identifying anchor tags with an `xlink:href` attribute as tabbable since that information is incorrect.

## 5.1.5

### Patch Changes

- c048203: fix crash when radio button name attributes contain CSS selector special characters (#168)

## 5.1.4

### Patch Changes

- a188c71: use element.matches fallback for IE11 and Webkit5
- 0d4cdf8: Update the code to use const/let and function declarations only for the repo; this does NOT affect browser compatibility as the code is still transpiled when published into the `./dist` directory for various targets.

## 5.1.3

### Patch Changes

- 5579825: fixes to details elements
  - ignore elements nested under a closed details element
  - ignore any extra summary elements after the first summary element
  - add details element as tabbable in case it has no direct summary element

## 5.1.2

### Patch Changes

- d3c6514: Fix UMD build incorrectly using `focusTrap` as output name.
- 95563c2: Fix #99: Transpile ESM bundle down to the same browser target used for the CJS and UMD bundles. ESM is just the module system, not the browser target.

## 5.1.1

### Patch Changes

- fb49d23: Fix #96: Transpile non-minified bundles for expected browser targets.

## 5.1.0

### Minor Changes

- bd21d91: Add `focusable()` for getting all focusable nodes.

### Patch Changes

- 3665d0b: The TypeScript return type of `tabbable` has been fixed: Was `Array<Element>` (an `Element` is technically not focusable), is now `Array<HTMLElement | SVGElement>` (which are both still/also `Element` instances).
- 8a25135: Fixed: Tabbable elements in fixed-position (`position: fixed`) containers should now be consistently found in supported browsers.
- 9544de2: Replace `prepublishOnly` script with `prepare` script. This has the added benefit of running automatically when installing the package from GitHub (as supported by NPM) where the published `./dist` directory is not automatically included.
- 672f4a2: Add `focusable()` type definition.
- 2424c0f: Small improvements for improving tree-shakeability of this package. A missing `#__PURE__` annotation has been added to allow dropping one of the top-level calls (if its result stays unused) and removed minification of the file referenced as `package.json#module` to avoid dropping the comments (including existing `#__PURE__` annotations).

## 5.0.0

- Changed code formatting to use dangling commas where ES5 supports them.
- Fixed a bug where `<audio controls />` and `<video controls />` elements _without `tabindex` attribute specified_ would be deemed **NOT** tabbable in Chrome, but would be in FireFox, because Chrome has `tabIndex` (the DOM Element property) returning -1 (focusable, but not tabbable), while FireFox has `tabIndex` returning 0 (focusable, and tabbable), yet **both** browsers include these elements in the _regular tab order_ (as if `tabIndex` was 0 for both browsers). Now these elements are considered tabbable in Chrome too!
- Add any `<summary>` element directly under a `<details>` element as tabbable and focusable.
- **BREAKING**: Changes to the `isTabbableRadio()` internal function in order to better support nested radio buttons:
  - In case a form parent element exists, include only nested radio inputs from that form.
  - Ignore checked radio elements from forms different from the one the validated node belongs to.
  - NOTE: This may result in _less_ radio elements being flagged as tabbable depending on context from the "root" node given to `tabbable()`.
- **BREAKING**: The exports have changed to be all named, and separate, as follows in order to help make the module more compatible with tree shaking:
  - `tabbable` -> `import { tabbable } from 'tabbable';
  - `tabbable.isTabbable` -> `import { isTabbable } from 'tabbable';
  - `tabbable.isFocusable` -> `import { isFocusable } from 'tabbable';
- Also to help with tree shaking, `package.json` now states `sideEffects: false` to mark this module as having no side effects as a result of merely importing it.
- Added new UMD build, see `./dist/index.umd.*`.

## 4.0.0

- Improve performance by changing the method for detecting whether a DOM node is focusable or not. It's expected that this change will _not_ affect results; but this is a major version bump as a warning for you to check your edge cases before upgrading.

## 3.1.2

- Fix reference to root element that caused errors within Shadow DOM.

## 3.1.1

- Allow module to be imported by non-browser JavaScript.

## 3.1.0

- Add `tabbable.isFocusable` and `tabbable.isTabbable` functions.

## 3.0.0

- Add `[contenteditable]` elements.

## 2.0.0

- Add `<audio>` and `<video>` elements with `controls` attributes.
- Only consider radio buttons tabbable if they are the `checked` on in their group, or if none in their group are `checked`.

## 1.1.3

- Fix bug causing SVG elements to precede elements they should follow in the tab order in IE.

## 1.1.2

- Ensure `querySelectorAll` receives a string argument.

## 1.1.1

- Fix crash when you call `tabbable(document)` (passing the `document` element).

## 1.1.0

- Add `includeContainer` option.

## 1.0.8

- Allows operation against elements that reside within iframes, by inspecting the element to determine its correct parent `document` (rather than relying on the global `document` object).

## 1.0.7

- Ensure stable sort of `tabindex`ed elements even in browsers that have an unstable `Array.prototype.sort`.

## 1.0.6

- Check `tabindex` attribute (via `getAttribute`), in addition to `node.tabIndex`, to fix handling of SVGs with `tabindex="-1"` in IE.

## 1.0.5

- Children of `visibility: hidden` elements that themselves have `visibility: visible` are considered tabbable.

## 1.0.4

- Fix IE9 compatibility.

## 1.0.3

- Further improvements to caching.

## 1.0.2

- Fix overaggressive caching that would prevent `tabbable` from knowing an element's children had changed.

## 1.0.1

- Fix handling of `<a>` elements with `tabindex="0"`.

## 1.0.0

- Initial release.
