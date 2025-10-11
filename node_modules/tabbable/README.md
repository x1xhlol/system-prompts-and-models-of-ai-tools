# tabbable [![CI](https://github.com/focus-trap/tabbable/workflows/CI/badge.svg?branch=master&event=push)](https://github.com/focus-trap/tabbable/actions?query=workflow:CI+branch:master) [![Codecov](https://img.shields.io/codecov/c/github/focus-trap/tabbable)](https://codecov.io/gh/focus-trap/tabbable) [![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-15-orange.svg?style=flat-square)](#contributors)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Small utility that returns an array of all\* tabbable DOM nodes within a containing node.

<small>_\***all** has some necessary caveats, which you'll learn about by reading below._</small>

The following are considered tabbable:

- `<button>` elements
- `<input>` elements
- `<select>` elements
- `<textarea>` elements
- `<a>` elements with an `href` attribute
- `<audio>` and `<video>` elements with `controls` attributes
- the first `<summary>` element directly under a `<details>` element
- `<details>` element without a `<summary>` element
- elements with the `[contenteditable]` attribute
- anything with a non-negative `tabindex` attribute

Any of the above will _not_ be considered tabbable, though, if any of the following are also true about it:

- has a negative `tabindex` attribute
- has a `disabled` attribute
- either the node itself _or an ancestor of it_ is hidden via `display: none` (*see ["Display check"](#displaycheck-option) below to modify this behavior)
- has `visibility: hidden` style
- is nested under a closed `<details>` element (with the exception of the first `<summary>` element)
- is an `<input type="radio">` element and a different radio in its group is `checked`
- is a form field (button, input, select, textarea) inside a disabled `<fieldset>`
- is [inert](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert) or in an inert container
    - ❗️ Only supported in [newer browsers](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert#browser_compatibility) that support this new attribute)
    - ⚠️ Notably __not (yet) supported__ on Firefox and Safari (Feb 2023)

**If you think a node should be included in your array of tabbables _but it's not_, all you need to do is add `tabindex="0"` to deliberately include it.** (Or if it is in your array but you don't want it, you can add `tabindex="-1"` to deliberately exclude it.) This will also result in more consistent cross-browser behavior. For information about why your special node might _not_ be included, see ["More details"](#more-details), below.

## Goals

- Accurate (or, as accurate as possible & reasonable)
- No dependencies
- Small
- Fast

## Browser Support

As old and as broad as _reasonably_ possible, excluding browsers that are out of support or have nearly no user base.

Focused on desktop browsers, particularly Chrome, Edge, FireFox, Safari, and Opera.

Tabbable is not officially tested on any mobile browsers or devices.

> ⚠️ Microsoft [no longer supports](https://blogs.windows.com/windowsexperience/2022/06/15/internet-explorer-11-has-retired-and-is-officially-out-of-support-what-you-need-to-know/) any version of IE, so IE is no longer supported by this library.

> 💬 Keep in mind that performance optimization and old browser support are often at odds, so tabbable may not always be able to use the most optimal (typically modern) APIs in all cases.

## Installation

```
npm install tabbable
```

> 💬 Some very old browsers may need a [polyfill](https://www.npmjs.com/package/css.escape) for the [CSS.escape](https://developer.mozilla.org/en-US/docs/Web/API/CSS/escape) API for tabbable to work properly with radio buttons that have `name` attributes containing special characters.

## API

### tabbable

```js
import { tabbable } from 'tabbable';

tabbable(container, [options]);
```

- `container: Node` (**Required**)
- `options`:
    - All the [common options](#common-options).
    - `includeContainer: boolean` (default: false)
        - If set to `true`, `container` will be included in the returned tabbable node array, if `container` is tabbable.
        - Note that whether this option is true or false, if the `container` is [inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert), none of its children (deep) will be considered tabbable.

Returns an array of ordered tabbable nodes (i.e. in tab order) within the `container`.

Summary of ordering principles:

- First include any nodes with positive `tabindex` attributes (1 or higher), ordered by ascending `tabindex` and source order.
- Then include any nodes with a zero `tabindex` and any element that by default receives focus (listed above) and does not have a positive `tabindex` set, in source order.

### isTabbable

```js
import { isTabbable } from 'tabbable';

isTabbable(node, [options]);
```

- `node: Node` (**Required**)
- `options`:
    - All the [common options](#common-options).

Returns a boolean indicating whether the provided node is considered tabbable.

> 💬 If the node has an [inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert) ancestor, it will not be tabbable.

### focusable

```js
import { focusable } from 'tabbable';

focusable(container, [options]);
```

- `container: Node`: **Required**
- `options`:
    - All the [common options](#common-options).
    - `includeContainer: boolean` (default: false)
        - If set to `true`, `container` will be included in the returned focusable node array, if `container` is focusable.
        - Note that whether this option is true or false, if the `container` is [inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert), none of its children (deep) will be considered focusable.

Returns an array of focusable nodes within the `container`, in DOM order. This will not match the order in which `tabbable()` returns nodes.

### isFocusable

```js
import { isFocusable } from 'tabbable';

isFocusable(node, [options]);
```

- `node: Node` (**Required**)
- `options`:
    - All the [common options](#common-options).

Returns a boolean indicating whether the provided node is considered _focusable_.

> 💬 All tabbable elements are focusable, but not all focusable elements are tabbable. For example, elements with `tabindex="-1"` are focusable but not tabbable. Also note that if the node has an[inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert) ancestor, it will not be focusable.

### getTabIndex

```js
import { getTabIndex } from 'tabbable';

getTabIndex(node);
```

- `node: Element` (**Required**)

Returns a negative, 0, or positive number that expresses the node's tab index in the DOM, with exceptions made where there are browser inconsistencies related to `<audio>`, `<video>`, `<details>`, and elements with the `contenteditable="true"` attribute.

The specific exceptions may change over time. See the implementation for specific behavior.

## Common Options

These options apply to all APIs.

### displayCheck option

Type: `full` | `legacy-full` | `non-zero-area` | `none` . Default: `full`.

Configures how to check if an element is displayed.

To reliably check if an element is tabbable/focusable, Tabbable defaults to the most reliable option to keep consistent with browser behavior, however this comes at a cost since every node needs to be validated as displayed using Web APIs that cause layout reflow.

For this reason Tabbable offers the ability of an alternative way to check if an element is displayed (or completely opt out of the check).

The `displayCheck` configuration accepts the following options:

- `full`: (default) Most reliably resembling browser behavior, this option checks that an element is displayed, which requires it to be attached to the DOM, and for all of his ancestors to be displayed (notice this doesn't exclude `visibility: hidden` or elements with zero size). This option will cause layout reflow, however. If that is a concern, consider the `none` option.
    - ⚠️ If the container given to `tabbable()` or `focusable()`, or the node given to `isTabbable()` or `isFocusable()`, is not attached to the window's main `document`, the node will be considered hidden and neither tabbable nor focusable. This behavior is new as of `v6.0.0`.
    - If your code relies on the legacy behavior where detached nodes were considered visible, and you are unable to fix your code to use tabbable once the node is attached, use the `legacy-full` option.
- `legacy-full`: Same as `full` but restores the __legacy behavior__ of treating detached nodes as visible. This means that if a node is detached, it's then treated as though the display check was set to `none` (see below for details).
    - ❗️ Since detached nodes are not treated as tabbable/focusable by browsers, using this option is __not recommended__ as it knowingly diverges from browser behavior.
    - ⚠️ This option may be removed in the future. Tabbable will not maintain it at the expense of new features or if having it makes the code disproportionately more complex. It only exists to make the upgrade path to the correct behavior (i.e. the `full` option) as long and smooth as reasonably possible.
    - The APIs used to determine a node's display are not supported unless its attached (i.e. the browser does not calculate its display unless it is attached). This has effectively been tabbable's behavior for a _very_ long time (up until the `v6.0.0` release), and you may never have encountered an issue if the nodes with which you used tabbable were always displayed anyway (i.e. the `none` mode assumption was coincidentally correct).
    - You may encounter the above situation if, for example, you render to a node via React, and this node is [not attached](https://github.com/facebook/react/issues/9117#issuecomment-284228870) to the document (or perhaps, due to timing, it is not _yet_ attached at the time you use tabbable's APIs on it).
- `non-zero-area`: This option checks display under the assumption that elements that are not displayed have zero area (width AND height equals zero). While not keeping true to browser behavior, this option may enhance accessibility, as zero-size elements with focusable content are considered a strong accessibility anti-pattern.
    - Like the `full` option, this option also causes layout reflow, and should have basically the same performance. Consider the `none` option if reflow is a concern.
    - ⚠️ As with the `full` option, there is a nuance in behavior depending on whether tabbable APIs are executed on attached vs detached nodes using this mode: Attached nodes that are actually displayed will be deemed visible. Detached nodes, _even though displayed_ will always be deemed __hidden__ because detached nodes always have a zero area as the browser does not calculate is dimensions.
- `none`: This completely opts out of the display check. **This option is not recommended**, as it might return elements that are not displayed, and as such not tabbable/focusable and can break accessibility. Make sure you know which elements in your DOM are not displayed and can filter them out yourself before using this option.

> ⚠️ __Testing in JSDom__ (e.g. with Jest): See notes about [testing in JSDom](#testing-in-jsdom).

### getShadowRoot option

By default, tabbable overlooks (i.e. does not consider) __all__ elements contained in shadow DOMs (whether open or closed). This has been the behavior since the beginning.

Setting this option to a _truthy_ value enables Shadow DOM support, which means tabbable will consider elements _inside_ web components as candidates, both open (automatically) and closed (provided this function returns the shadow root).

Type: `boolean | (node: FocusableElement) => ShadowRoot | boolean | undefined`

- `boolean`:
    - `true` simply enables shadow DOM support for any __open__ shadow roots, but never presumes there is an undisclosed shadow. This is the equivalent of setting `getShadowRoot: () => false`
    - `false` (default) disables shadow DOM support in so far as calculated tab order and closed shadow roots are concerned. If a child of a shadow (open or closed) is given to `isTabbable()` or `isFocusable()`, the shadow DOM is still considered for visibility and display checks.
- `function`:
    - `node` will be a descendent of the `container` given to `tabbable()`, `isTabbable()`, `focusable()`, or `isFocusable()`.
    - Returns: The node's `ShadowRoot` if available, `true` indicating a `ShadowRoot` is attached but not available (i.e. "undisclosed"), or a _falsy_ value indicating there is no shadow attached to the node.

> If set to a function, and if it returns `true`, Tabbable assumes a closed `ShadowRoot` is attached and will treat the node as a scope, iterating its children for additional tabbable/focusable candidates as though it was looking inside the shadow, but not. This will get tabbing order _closer_ to -- but not necessarily the same as -- browser order.
>
> Returning `true` from a function will also inform how the node's visibility check is done, causing tabbable to use the __non-zero-area__ [Display Check](#displaycheck-option) when determining if it's visible, and so tabbable/focusable.

## More details

- **Tabbable tries to identify elements that are reliably tabbable across (not dead) browsers.** Browsers are inconsistent in their behavior, though — especially for edge-case elements like `<object>` and `<iframe>` — so this means _some_ elements that you _can_ tab to in _some_ browsers will be left out of the results. (To learn more about this inconsistency, see this [amazing table](https://allyjs.io/data-tables/focusable.html)). To provide better consistency across browsers and ensure the elements you _want_ in your tabbables list show up there, **try adding `tabindex="0"` to edge-case elements that Tabbable ignores**.
- (Exemplifying the above ^^:) **The tabbability of `<iframe>`, `<embed>`, `<object>`, `<summary>`, and `<svg>` nodes is [inconsistent across browsers](https://allyjs.io/data-tables/focusable.html)**, so if you need an accurate read on one of these elements you should try giving it a `tabindex`. (You'll also need to pay attention to the `focusable` attribute on SVGs in Edge.) But you also might _not_ be able to get an accurate read — so you should avoid relying on it.
- **Radio groups have some edge cases, which you can avoid by always having a `checked` one in each group** (and that is what you should usually do anyway). If there is no `checked` radio in the radio group, _all_ of the radios will be considered tabbable. (Some browsers do this, otherwise don't — there's not consistency.)
- If you're thinking, "Why not just use the right `querySelectorAll`?", you _may_ be on to something ... but, as with most "just" statements, you're probably not. For example, a simple `querySelectorAll` approach will not figure out whether an element is _hidden_, and therefore not actually tabbable. (That said, if you do think Tabbable can be simplified or otherwise improved, I'd love to hear your idea.)
- jQuery UI's `:tabbable` selector ignores elements with height and width of `0`. I'm not sure why — because I've found that I can still tab to those elements. So I kept them in. Only elements hidden with `display: none` or `visibility: hidden` are left out. See ["Display check"](#displaycheck-option) below for other options.
- Although Tabbable tries to deal with positive tabindexes, **you should not use positive tabindexes**. Accessibility experts seem to be in (rare) unanimous and clear consent about this: rely on the order of elements in the document.
- Safari on Mac OS X does not Tab to `<a>` elements by default: you have to change a setting to get the standard behavior. Tabbable does not know whether you've changed that setting or not, so it will include `<a>` elements in its list.

## Help

### Testing in JSDom

> ⚠️ JSDom is not officially supported. Your mileage may vary, and tests may break from one release to the next (even a patch or minor release).
>
> This topic is just here to help with what we know may affect your tests.

Tabbable uses some DOM APIs such as [Element.getClientRects()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects) in order to determine node visibility, which helps in deciding whether a node is tabbable, focusable, or neither.

When using test engines such as Jest that use [JSDom](https://github.com/jsdom/jsdom) under the hood in order to run tests in Node.js (as opposed to using an automated browser testing tool like Cypress, Playwright, or Nightwatch where a full DOM is available), it is __highly recommended__ (if not _essential_) to set the [displayCheck](#displaycheck-option) option to `none` when calling any of the APIs in this library that accept it.

Using any other `displayCheck` setting will likely lead to failed tests due to nodes expected to be tabbable/focusable being determined to be the opposite because JSDom doesn't fully support some of the DOM APIs being used (even old ones that have been around for a long time).

You can globally overwrite the `diplayCheck` property by including this file in your `__mocks__` folder:

```jsx
// __mocks__/tabbable.js

const lib = jest.requireActual('tabbable');

const tabbable = {
   ...lib,
   tabbable: (node, options) => lib.tabbable(node, { ...options, displayCheck: 'none' }),
   focusable: (node, options) => lib.focusable(node, { ...options, displayCheck: 'none' }),
   isFocusable: (node, options) => lib.isFocusable(node, { ...options, displayCheck: 'none' }),
   isTabbable: (node, options) => lib.isTabbable(node, { ...options, displayCheck: 'none' }),
};

module.exports = tabbable;
```

## Contributing

Feedback and contributions more than welcome!

See [CONTRIBUTING](CONTRIBUTING.md).

## Contributors

In alphabetical order:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tidychips"><img src="https://avatars2.githubusercontent.com/u/11446636?v=4?s=100" width="100px;" alt="Bryan Murphy"/><br /><sub><b>Bryan Murphy</b></sub></a><br /><a href="https://github.com/focus-trap/tabbable/issues?q=author%3Atidychips" title="Bug reports">🐛</a> <a href="https://github.com/focus-trap/tabbable/commits?author=tidychips" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/craigkovatch"><img src="https://avatars.githubusercontent.com/u/10970257?v=4?s=100" width="100px;" alt="Craig Kovatch"/><br /><sub><b>Craig Kovatch</b></sub></a><br /><a href="https://github.com/focus-trap/tabbable/issues?q=author%3Acraigkovatch" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/DaviDevMod"><img src="https://avatars.githubusercontent.com/u/98312056?v=4?s=100" width="100px;" alt="DaviDevMod"/><br /><sub><b>DaviDevMod</b></sub></a><br /><a href="https://github.com/focus-trap/tabbable/issues?q=author%3ADaviDevMod" title="Bug reports">🐛</a> <a href="https://github.com/focus-trap/tabbable/commits?author=DaviDevMod" title="Code">💻</a> <a href="https://github.com/focus-trap/tabbable/commits?author=DaviDevMod" title="Tests">⚠️</a> <a href="https://github.com/focus-trap/tabbable/commits?author=DaviDevMod" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://davidtheclark.com/"><img src="https://avatars2.githubusercontent.com/u/628431?v=4?s=100" width="100px;" alt="David Clark"/><br /><sub><b>David Clark</b></sub></a><br /><a href="https://github.com/focus-trap/tabbable/commits?author=davidtheclark" title="Code">💻</a> <a href="https://github.com/focus-trap/tabbable/issues?q=author%3Adavidtheclark" title="Bug reports">🐛</a> <a href="#infra-davidtheclark" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/focus-trap/tabbable/commits?author=davidtheclark" title="Tests">⚠️</a> <a href="https://github.com/focus-trap/tabbable/commits?author=davidtheclark" title="Documentation">📖</a> <a href="#maintenance-davidtheclark" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/features/security"><img src="https://avatars1.githubusercontent.com/u/27347476?v=4?s=100" width="100px;" alt="Dependabot"/><br /><sub><b>Dependabot</b></sub></a><br /><a href="#maintenance-dependabot" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/thumbsupep"><img src="https://avatars.githubusercontent.com/u/5598732?v=4?s=100" width="100px;" alt="Erica Pramer"/><br /><sub><b>Erica Pramer</b></sub></a><br /><a href="https://github.com/focus-trap/tabbable/commits?author=thumbsupep" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/idoros"><img src="https://avatars1.githubusercontent.com/u/574751?v=4?s=100" width="100px;" alt="Ido Rosenthal"/><br /><sub><b>Ido Rosenthal</b></sub></a><br /><a href="https://github.com/focus-trap/tabbable/issues?q=author%3Aidoros" title="Bug reports">🐛</a> <a href="https://github.com/focus-trap/tabbable/commits?author=idoros" title="Code">💻</a> <a href="https://github.com/focus-trap/tabbable/pulls?q=is%3Apr+reviewed-by%3Aidoros" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/focus-trap/tabbable/commits?author=idoros" title="Tests">⚠️</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.khamilton.co.uk"><img src="https://avatars1.githubusercontent.com/u/4013283?v=4?s=100" width="100px;" alt="Kristian Hamilton"/><br /><sub><b>Kristian Hamilton</b></sub></a><br /><a href="https://github.com/focus-trap/tabbable/issues?q=author%3Akhamiltonuk" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/les-lim"><img src="https://avatars.githubusercontent.com/u/7660876?v=4?s=100" width="100px;" alt="Les Lim"/><br /><sub><b>Les Lim</b></sub></a><br /><a href="https://github.com/focus-trap/tabbable/issues?q=author%3Ales-lim" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Andarist"><img src="https://avatars2.githubusercontent.com/u/9800850?v=4?s=100" width="100px;" alt="Mateusz Burzyński"/><br /><sub><b>Mateusz Burzyński</b></sub></a><br /><a href="https://github.com/focus-trap/tabbable/commits?author=Andarist" title="Code">💻</a> <a href="https://github.com/focus-trap/tabbable/issues?q=author%3AAndarist" title="Bug reports">🐛</a> <a href="https://github.com/focus-trap/tabbable/commits?author=Andarist" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/rvsia"><img src="https://avatars.githubusercontent.com/u/32869456?v=4?s=100" width="100px;" alt="Richard Všianský"/><br /><sub><b>Richard Všianský</b></sub></a><br /><a href="https://github.com/focus-trap/tabbable/commits?author=rvsia" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://stefancameron.com/"><img src="https://avatars3.githubusercontent.com/u/2855350?v=4?s=100" width="100px;" alt="Stefan Cameron"/><br /><sub><b>Stefan Cameron</b></sub></a><br /><a href="https://github.com/focus-trap/tabbable/commits?author=stefcameron" title="Code">💻</a> <a href="https://github.com/focus-trap/tabbable/issues?q=author%3Astefcameron" title="Bug reports">🐛</a> <a href="#infra-stefcameron" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/focus-trap/tabbable/commits?author=stefcameron" title="Tests">⚠️</a> <a href="https://github.com/focus-trap/tabbable/commits?author=stefcameron" title="Documentation">📖</a> <a href="#maintenance-stefcameron" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://tylerhawkins.info/201R/"><img src="https://avatars0.githubusercontent.com/u/13806458?v=4?s=100" width="100px;" alt="Tyler Hawkins"/><br /><sub><b>Tyler Hawkins</b></sub></a><br /><a href="#tool-thawkin3" title="Tools">🔧</a> <a href="https://github.com/focus-trap/tabbable/commits?author=thawkin3" title="Tests">⚠️</a> <a href="#infra-thawkin3" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/focus-trap/tabbable/commits?author=thawkin3" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/BFrost"><img src="https://avatars.githubusercontent.com/u/3368761?v=4?s=100" width="100px;" alt="bfrost"/><br /><sub><b>bfrost</b></sub></a><br /><a href="https://github.com/focus-trap/tabbable/issues?q=author%3ABFrost" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pebble2050"><img src="https://avatars1.githubusercontent.com/u/47210889?v=4?s=100" width="100px;" alt="pebble2050"/><br /><sub><b>pebble2050</b></sub></a><br /><a href="https://github.com/focus-trap/tabbable/issues?q=author%3Apebble2050" title="Bug reports">🐛</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
