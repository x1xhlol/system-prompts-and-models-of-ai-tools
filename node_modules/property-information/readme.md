# property-information

[![Build][badge-build-image]][badge-build-url]
[![Coverage][badge-coverage-image]][badge-coverage-url]
[![Downloads][badge-downloads-image]][badge-downloads-url]
[![Size][badge-size-image]][badge-size-url]

Info on the properties and attributes of the web platform
(HTML, SVG, ARIA, XML, XMLNS, XLink).

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`Info`](#info)
  * [`Schema`](#schema)
  * [`Space`](#space)
  * [`find(schema, name)`](#findschema-name)
  * [`hastToReact`](#hasttoreact)
  * [`html`](#html)
  * [`normalize(name)`](#normalizename)
  * [`svg`](#svg)
* [Compatibility](#compatibility)
* [Support](#support)
* [Security](#security)
* [Related](#related)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package contains lots of info on all the properties and attributes found
on the web platform.
It includes data on
HTML, SVG, ARIA, XML, XMLNS, and XLink.
The names of the properties follow [hast][github-hast-property-name]’s
sensible naming scheme.
It includes info on what data types attributes hold,
such as whether they’re booleans or contain lists of space separated numbers.

## When should I use this?

You can use this package if you’re working with hast,
which is an AST for HTML,
or have goals related to ASTs,
such as figuring out which properties or attributes are valid,
or what data types they hold.

## Install

This package is [ESM only][github-gist-esm].
In Node.js (version 16+),
install with [npm][npmjs-install]:

```sh
npm install property-information
```

In Deno with [`esm.sh`][esmsh]:

```js
import * as propertyInformation from 'https://esm.sh/property-information@7'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import * as propertyInformation from 'https://esm.sh/property-information@7?bundle'
</script>
```

## Use

```js
import {find, html, svg} from 'property-information'

console.log(find(html, 'className'))
// Or: find(html, 'class')
console.log(find(svg, 'horiz-adv-x'))
// Or: find(svg, 'horizAdvX')
console.log(find(svg, 'xlink:arcrole'))
// Or: find(svg, 'xLinkArcRole')
console.log(find(html, 'xmlLang'))
// Or: find(html, 'xml:lang')
console.log(find(html, 'ariaValueNow'))
// Or: find(html, 'aria-valuenow')
```

Yields:

```js
{attribute: 'class', property: 'className', spaceSeparated: true, space: 'html'}
{attribute: 'horiz-adv-x', number: true, property: 'horizAdvX', space: 'svg'}
{attribute: 'xlink:arcrole', property: 'xLinkArcRole', space: 'xlink'}
{attribute: 'xml:lang', property: 'xmlLang', space: 'xml'}
{attribute: 'aria-valuenow', number: true, property: 'ariaValueNow'}
```

## API

This package exports the identifiers
[`find`][api-find],
[`hastToReact`][api-hast-to-react],
[`html`][api-html],
[`normalize`][api-normalize],
and
[`svg`][api-svg].
There is no default export.
It exports the [TypeScript][] types
[`Info`][api-info],
[`Schema`][api-schema],
and
[`Space`][api-space].

### `Info`

Info on a property (TypeScript type).

###### Fields

* `attribute` (`string`)
  — attribute name for the property that could be used in markup
  (such as `'aria-describedby'`, `'allowfullscreen'`, `'xml:lang'`, `'for'`,
  or `'charoff'`)
* `booleanish` (`boolean`)
  — the property is *like* a `boolean`
  (such as `draggable`);
  these properties have both an on and off state when defined,
  *and* another state when not defined
* `boolean` (`boolean`)
  — the property is a `boolean`
  (such as `hidden`);
  these properties have an on state when defined and an off state when not
  defined
* `commaOrSpaceSeparated` (`boolean`)
  — the property is a list separated by spaces or commas
  (such as `strokeDashArray`)
* `commaSeparated` (`boolean`)
  — the property is a list separated by commas
  (such as `coords`)
* `defined` (`boolean`)
  — the property is [defined by a space][section-support];
  this is the case for values in HTML
  (including [data][mozilla-dataset] and ARIA),
  SVG, XML, XMLNS, and XLink;
  not defined properties can only be found through `find`
* `mustUseProperty` (`boolean`)
  — when working with the DOM,
  this property has to be changed as a field on the element,
  instead of through `setAttribute`
  (this is true only for `'checked'`, `'multiple'`, `'muted'`, and
  `'selected'`)
* `number` (`boolean`)
  — the property is a `number` (such as `height`)
* `overloadedBoolean` (`boolean`)
  — the property is *like* a `boolean` (such as `download`);
  these properties have an on state *and* more states when defined and an off
  state when not defined
* `property` (`string`)
  — JavaScript-style camel-cased name;
  based on the DOM but sometimes different
  (such as `'ariaDescribedBy'`, `'allowFullScreen'`, `'xmlLang'`, `'htmlFor'`,
  `'charOff'`)
* `spaceSeparated` (`boolean`)
  — the property is a list separated by spaces
  (such as `className`)
* `space` ([`Space`][api-space] or `undefined`)
  — [space][github-web-namespaces] of the property

### `Schema`

Schema for a primary space (TypeScript type).

###### Fields

* `normal` (`Record<string, string>`)
  — object mapping normalized attributes and properties to properly cased
  properties
* `property` ([`Record<string, Info>`][api-info])
  — object mapping properties to info
* `space` (`'html'` or `'svg'`)
  — primary space of the schema

### `Space`

Space of a property (TypeScript type).

###### Type

```ts
type Space = 'html' | 'svg' | 'xlink' | 'xmlns' | 'xml'
```

### `find(schema, name)`

Look up info on a property.

In most cases the given `schema` contains info on the property.
All standard,
most legacy,
and some non-standard properties are supported.
For these cases,
the returned [`Info`][api-info] has hints about the value of the property.

`name` can also be a [valid data attribute or property][mozilla-dataset],
in which case an [`Info`][api-info] object with the correctly cased `attribute`
and `property` is returned.

`name` can be an unknown attribute,
in which case an [`Info`][api-info] object with `attribute` and `property` set
to the given name is returned.
It is not recommended to provide unsupported legacy or recently specced
properties.

###### Parameters

* `schema` ([`Schema`][api-schema])
  — schema;
  either the `html` or `svg` export
* `name` (`string`)
  — an attribute-like or property-like name;
  it will be passed through
  [`normalize`][api-normalize] to hopefully find the correct info

###### Returns

[`Info`][api-info].

###### Example

Aside from the aforementioned example,
which shows known HTML, SVG, XML, XLink, and ARIA support,
data properties and attributes are also supported:

```js
console.log(find(html, 'data-date-of-birth'))
// Or: find(html, 'dataDateOfBirth')
// => {attribute: 'data-date-of-birth', property: 'dataDateOfBirth'}
```

Unknown values are passed through untouched:

```js
console.log(find(html, 'un-Known'))
// => {attribute: 'un-Known', property: 'un-Known'}
```

### `hastToReact`

Special cases for React (`Record<string, string>`).

[`hast`][github-hast] is close to [`React`][github-react]
but differs in a couple of cases.
To get a React property from a hast property,
check if it is in `hastToReact`.
If it is,
use the corresponding value.

### `html`

[`Schema`][api-schema] for HTML,
with info on properties from HTML itself and related embedded spaces
(ARIA, XML, XMLNS, XLink).

###### Example

```js
console.log(html.property.htmlFor)
// => {attribute: 'for', property: 'htmlFor', spaceSeparated: true, space: 'html'}
console.log(html.property.unknown)
// => undefined
```

### `normalize(name)`

Get the cleaned case insensitive form of an attribute or property.

###### Parameters

* `name` (`string`)
  — an attribute-like or property-like name

###### Returns

Value (`string`) that can be used to look up the properly cased property on a
[`Schema`][api-schema].

###### Example

```js
html.normal[normalize('for')] // => 'htmlFor'
svg.normal[normalize('VIEWBOX')] // => 'viewBox'
html.normal[normalize('unknown')] // => undefined
html.normal[normalize('accept-charset')] // => 'acceptCharset'
```

### `svg`

[`Schema`][api-schema] for SVG,
with info on properties from SVG itself and related embedded spaces
(ARIA, XML, XMLNS, XLink).

###### Example

```js
console.log(svg.property.viewBox)
// => {attribute: 'viewBox', property: 'viewBox', space: 'svg'}
console.log(svg.property.unknown)
// => undefined
```

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now,
that is Node.js 16+.
It also works in Deno and modern browsers.

## Support

<!--list start-->

| Property                     | Attribute                      | Space         |
| ---------------------------- | ------------------------------ | ------------- |
| `aLink`                      | `alink`                        | `html`        |
| `abbr`                       | `abbr`                         | `html`        |
| `about`                      | `about`                        | `svg`         |
| `accentHeight`               | `accent-height`                | `svg`         |
| `accept`                     | `accept`                       | `html`        |
| `acceptCharset`              | `accept-charset`               | `html`        |
| `accessKey`                  | `accesskey`                    | `html`        |
| `accumulate`                 | `accumulate`                   | `svg`         |
| `action`                     | `action`                       | `html`        |
| `additive`                   | `additive`                     | `svg`         |
| `align`                      | `align`                        | `html`        |
| `alignmentBaseline`          | `alignment-baseline`           | `svg`         |
| `allow`                      | `allow`                        | `html`        |
| `allowFullScreen`            | `allowfullscreen`              | `html`        |
| `allowPaymentRequest`        | `allowpaymentrequest`          | `html`        |
| `allowTransparency`          | `allowtransparency`            | `html`        |
| `allowUserMedia`             | `allowusermedia`               | `html`        |
| `alphabetic`                 | `alphabetic`                   | `svg`         |
| `alt`                        | `alt`                          | `html`        |
| `amplitude`                  | `amplitude`                    | `svg`         |
| `arabicForm`                 | `arabic-form`                  | `svg`         |
| `archive`                    | `archive`                      | `html`        |
| `ariaActiveDescendant`       | `aria-activedescendant`        |               |
| `ariaAtomic`                 | `aria-atomic`                  |               |
| `ariaAutoComplete`           | `aria-autocomplete`            |               |
| `ariaBusy`                   | `aria-busy`                    |               |
| `ariaChecked`                | `aria-checked`                 |               |
| `ariaColCount`               | `aria-colcount`                |               |
| `ariaColIndex`               | `aria-colindex`                |               |
| `ariaColSpan`                | `aria-colspan`                 |               |
| `ariaControls`               | `aria-controls`                |               |
| `ariaCurrent`                | `aria-current`                 |               |
| `ariaDescribedBy`            | `aria-describedby`             |               |
| `ariaDetails`                | `aria-details`                 |               |
| `ariaDisabled`               | `aria-disabled`                |               |
| `ariaDropEffect`             | `aria-dropeffect`              |               |
| `ariaErrorMessage`           | `aria-errormessage`            |               |
| `ariaExpanded`               | `aria-expanded`                |               |
| `ariaFlowTo`                 | `aria-flowto`                  |               |
| `ariaGrabbed`                | `aria-grabbed`                 |               |
| `ariaHasPopup`               | `aria-haspopup`                |               |
| `ariaHidden`                 | `aria-hidden`                  |               |
| `ariaInvalid`                | `aria-invalid`                 |               |
| `ariaKeyShortcuts`           | `aria-keyshortcuts`            |               |
| `ariaLabel`                  | `aria-label`                   |               |
| `ariaLabelledBy`             | `aria-labelledby`              |               |
| `ariaLevel`                  | `aria-level`                   |               |
| `ariaLive`                   | `aria-live`                    |               |
| `ariaModal`                  | `aria-modal`                   |               |
| `ariaMultiLine`              | `aria-multiline`               |               |
| `ariaMultiSelectable`        | `aria-multiselectable`         |               |
| `ariaOrientation`            | `aria-orientation`             |               |
| `ariaOwns`                   | `aria-owns`                    |               |
| `ariaPlaceholder`            | `aria-placeholder`             |               |
| `ariaPosInSet`               | `aria-posinset`                |               |
| `ariaPressed`                | `aria-pressed`                 |               |
| `ariaReadOnly`               | `aria-readonly`                |               |
| `ariaRelevant`               | `aria-relevant`                |               |
| `ariaRequired`               | `aria-required`                |               |
| `ariaRoleDescription`        | `aria-roledescription`         |               |
| `ariaRowCount`               | `aria-rowcount`                |               |
| `ariaRowIndex`               | `aria-rowindex`                |               |
| `ariaRowSpan`                | `aria-rowspan`                 |               |
| `ariaSelected`               | `aria-selected`                |               |
| `ariaSetSize`                | `aria-setsize`                 |               |
| `ariaSort`                   | `aria-sort`                    |               |
| `ariaValueMax`               | `aria-valuemax`                |               |
| `ariaValueMin`               | `aria-valuemin`                |               |
| `ariaValueNow`               | `aria-valuenow`                |               |
| `ariaValueText`              | `aria-valuetext`               |               |
| `as`                         | `as`                           | `html`        |
| `ascent`                     | `ascent`                       | `svg`         |
| `async`                      | `async`                        | `html`        |
| `attributeName`              | `attributeName`                | `svg`         |
| `attributeType`              | `attributeType`                | `svg`         |
| `autoCapitalize`             | `autocapitalize`               | `html`        |
| `autoComplete`               | `autocomplete`                 | `html`        |
| `autoCorrect`                | `autocorrect`                  | `html`        |
| `autoFocus`                  | `autofocus`                    | `html`        |
| `autoPlay`                   | `autoplay`                     | `html`        |
| `autoSave`                   | `autosave`                     | `html`        |
| `axis`                       | `axis`                         | `html`        |
| `azimuth`                    | `azimuth`                      | `svg`         |
| `background`                 | `background`                   | `html`        |
| `bandwidth`                  | `bandwidth`                    | `svg`         |
| `baseFrequency`              | `baseFrequency`                | `svg`         |
| `baseProfile`                | `baseProfile`                  | `svg`         |
| `baselineShift`              | `baseline-shift`               | `svg`         |
| `bbox`                       | `bbox`                         | `svg`         |
| `begin`                      | `begin`                        | `svg`         |
| `bgColor`                    | `bgcolor`                      | `html`        |
| `bias`                       | `bias`                         | `svg`         |
| `blocking`                   | `blocking`                     | `html`        |
| `border`                     | `border`                       | `html`        |
| `borderColor`                | `bordercolor`                  | `html`        |
| `bottomMargin`               | `bottommargin`                 | `html`        |
| `by`                         | `by`                           | `svg`         |
| `calcMode`                   | `calcMode`                     | `svg`         |
| `capHeight`                  | `cap-height`                   | `svg`         |
| `capture`                    | `capture`                      | `html`        |
| `cellPadding`                | `cellpadding`                  | `html`        |
| `cellSpacing`                | `cellspacing`                  | `html`        |
| `char`                       | `char`                         | `html`        |
| `charOff`                    | `charoff`                      | `html`        |
| `charSet`                    | `charset`                      | `html`        |
| `checked`                    | `checked`                      | `html`        |
| `cite`                       | `cite`                         | `html`        |
| `classId`                    | `classid`                      | `html`        |
| `className`                  | `class`                        | `svg`, `html` |
| `clear`                      | `clear`                        | `html`        |
| `clip`                       | `clip`                         | `svg`         |
| `clipPath`                   | `clip-path`                    | `svg`         |
| `clipPathUnits`              | `clipPathUnits`                | `svg`         |
| `clipRule`                   | `clip-rule`                    | `svg`         |
| `code`                       | `code`                         | `html`        |
| `codeBase`                   | `codebase`                     | `html`        |
| `codeType`                   | `codetype`                     | `html`        |
| `colSpan`                    | `colspan`                      | `html`        |
| `color`                      | `color`                        | `svg`, `html` |
| `colorInterpolation`         | `color-interpolation`          | `svg`         |
| `colorInterpolationFilters`  | `color-interpolation-filters`  | `svg`         |
| `colorProfile`               | `color-profile`                | `svg`         |
| `colorRendering`             | `color-rendering`              | `svg`         |
| `cols`                       | `cols`                         | `html`        |
| `compact`                    | `compact`                      | `html`        |
| `content`                    | `content`                      | `svg`, `html` |
| `contentEditable`            | `contenteditable`              | `html`        |
| `contentScriptType`          | `contentScriptType`            | `svg`         |
| `contentStyleType`           | `contentStyleType`             | `svg`         |
| `controls`                   | `controls`                     | `html`        |
| `controlsList`               | `controlslist`                 | `html`        |
| `coords`                     | `coords`                       | `html`        |
| `crossOrigin`                | `crossorigin`                  | `svg`, `html` |
| `cursor`                     | `cursor`                       | `svg`         |
| `cx`                         | `cx`                           | `svg`         |
| `cy`                         | `cy`                           | `svg`         |
| `d`                          | `d`                            | `svg`         |
| `data`                       | `data`                         | `html`        |
| `dataType`                   | `datatype`                     | `svg`         |
| `dateTime`                   | `datetime`                     | `html`        |
| `declare`                    | `declare`                      | `html`        |
| `decoding`                   | `decoding`                     | `html`        |
| `default`                    | `default`                      | `html`        |
| `defaultAction`              | `defaultAction`                | `svg`         |
| `defer`                      | `defer`                        | `html`        |
| `descent`                    | `descent`                      | `svg`         |
| `diffuseConstant`            | `diffuseConstant`              | `svg`         |
| `dir`                        | `dir`                          | `html`        |
| `dirName`                    | `dirname`                      | `html`        |
| `direction`                  | `direction`                    | `svg`         |
| `disablePictureInPicture`    | `disablepictureinpicture`      | `html`        |
| `disableRemotePlayback`      | `disableremoteplayback`        | `html`        |
| `disabled`                   | `disabled`                     | `html`        |
| `display`                    | `display`                      | `svg`         |
| `divisor`                    | `divisor`                      | `svg`         |
| `dominantBaseline`           | `dominant-baseline`            | `svg`         |
| `download`                   | `download`                     | `svg`, `html` |
| `draggable`                  | `draggable`                    | `html`        |
| `dur`                        | `dur`                          | `svg`         |
| `dx`                         | `dx`                           | `svg`         |
| `dy`                         | `dy`                           | `svg`         |
| `edgeMode`                   | `edgeMode`                     | `svg`         |
| `editable`                   | `editable`                     | `svg`         |
| `elevation`                  | `elevation`                    | `svg`         |
| `enableBackground`           | `enable-background`            | `svg`         |
| `encType`                    | `enctype`                      | `html`        |
| `end`                        | `end`                          | `svg`         |
| `enterKeyHint`               | `enterkeyhint`                 | `html`        |
| `event`                      | `event`                        | `svg`, `html` |
| `exponent`                   | `exponent`                     | `svg`         |
| `externalResourcesRequired`  | `externalResourcesRequired`    | `svg`         |
| `face`                       | `face`                         | `html`        |
| `fetchPriority`              | `fetchpriority`                | `html`        |
| `fill`                       | `fill`                         | `svg`         |
| `fillOpacity`                | `fill-opacity`                 | `svg`         |
| `fillRule`                   | `fill-rule`                    | `svg`         |
| `filter`                     | `filter`                       | `svg`         |
| `filterRes`                  | `filterRes`                    | `svg`         |
| `filterUnits`                | `filterUnits`                  | `svg`         |
| `floodColor`                 | `flood-color`                  | `svg`         |
| `floodOpacity`               | `flood-opacity`                | `svg`         |
| `focusHighlight`             | `focusHighlight`               | `svg`         |
| `focusable`                  | `focusable`                    | `svg`         |
| `fontFamily`                 | `font-family`                  | `svg`         |
| `fontSize`                   | `font-size`                    | `svg`         |
| `fontSizeAdjust`             | `font-size-adjust`             | `svg`         |
| `fontStretch`                | `font-stretch`                 | `svg`         |
| `fontStyle`                  | `font-style`                   | `svg`         |
| `fontVariant`                | `font-variant`                 | `svg`         |
| `fontWeight`                 | `font-weight`                  | `svg`         |
| `form`                       | `form`                         | `html`        |
| `formAction`                 | `formaction`                   | `html`        |
| `formEncType`                | `formenctype`                  | `html`        |
| `formMethod`                 | `formmethod`                   | `html`        |
| `formNoValidate`             | `formnovalidate`               | `html`        |
| `formTarget`                 | `formtarget`                   | `html`        |
| `format`                     | `format`                       | `svg`         |
| `fr`                         | `fr`                           | `svg`         |
| `frame`                      | `frame`                        | `html`        |
| `frameBorder`                | `frameborder`                  | `html`        |
| `from`                       | `from`                         | `svg`         |
| `fx`                         | `fx`                           | `svg`         |
| `fy`                         | `fy`                           | `svg`         |
| `g1`                         | `g1`                           | `svg`         |
| `g2`                         | `g2`                           | `svg`         |
| `glyphName`                  | `glyph-name`                   | `svg`         |
| `glyphOrientationHorizontal` | `glyph-orientation-horizontal` | `svg`         |
| `glyphOrientationVertical`   | `glyph-orientation-vertical`   | `svg`         |
| `glyphRef`                   | `glyphRef`                     | `svg`         |
| `gradientTransform`          | `gradientTransform`            | `svg`         |
| `gradientUnits`              | `gradientUnits`                | `svg`         |
| `hSpace`                     | `hspace`                       | `html`        |
| `handler`                    | `handler`                      | `svg`         |
| `hanging`                    | `hanging`                      | `svg`         |
| `hatchContentUnits`          | `hatchContentUnits`            | `svg`         |
| `hatchUnits`                 | `hatchUnits`                   | `svg`         |
| `headers`                    | `headers`                      | `html`        |
| `height`                     | `height`                       | `svg`, `html` |
| `hidden`                     | `hidden`                       | `html`        |
| `high`                       | `high`                         | `html`        |
| `horizAdvX`                  | `horiz-adv-x`                  | `svg`         |
| `horizOriginX`               | `horiz-origin-x`               | `svg`         |
| `horizOriginY`               | `horiz-origin-y`               | `svg`         |
| `href`                       | `href`                         | `svg`, `html` |
| `hrefLang`                   | `hreflang`                     | `svg`, `html` |
| `htmlFor`                    | `for`                          | `html`        |
| `httpEquiv`                  | `http-equiv`                   | `html`        |
| `id`                         | `id`                           | `svg`, `html` |
| `ideographic`                | `ideographic`                  | `svg`         |
| `imageRendering`             | `image-rendering`              | `svg`         |
| `imageSizes`                 | `imagesizes`                   | `html`        |
| `imageSrcSet`                | `imagesrcset`                  | `html`        |
| `in`                         | `in`                           | `svg`         |
| `in2`                        | `in2`                          | `svg`         |
| `inert`                      | `inert`                        | `html`        |
| `initialVisibility`          | `initialVisibility`            | `svg`         |
| `inputMode`                  | `inputmode`                    | `html`        |
| `integrity`                  | `integrity`                    | `html`        |
| `intercept`                  | `intercept`                    | `svg`         |
| `is`                         | `is`                           | `html`        |
| `isMap`                      | `ismap`                        | `html`        |
| `itemId`                     | `itemid`                       | `html`        |
| `itemProp`                   | `itemprop`                     | `html`        |
| `itemRef`                    | `itemref`                      | `html`        |
| `itemScope`                  | `itemscope`                    | `html`        |
| `itemType`                   | `itemtype`                     | `html`        |
| `k`                          | `k`                            | `svg`         |
| `k1`                         | `k1`                           | `svg`         |
| `k2`                         | `k2`                           | `svg`         |
| `k3`                         | `k3`                           | `svg`         |
| `k4`                         | `k4`                           | `svg`         |
| `kernelMatrix`               | `kernelMatrix`                 | `svg`         |
| `kernelUnitLength`           | `kernelUnitLength`             | `svg`         |
| `kerning`                    | `kerning`                      | `svg`         |
| `keyPoints`                  | `keyPoints`                    | `svg`         |
| `keySplines`                 | `keySplines`                   | `svg`         |
| `keyTimes`                   | `keyTimes`                     | `svg`         |
| `kind`                       | `kind`                         | `html`        |
| `label`                      | `label`                        | `html`        |
| `lang`                       | `lang`                         | `svg`, `html` |
| `language`                   | `language`                     | `html`        |
| `leftMargin`                 | `leftmargin`                   | `html`        |
| `lengthAdjust`               | `lengthAdjust`                 | `svg`         |
| `letterSpacing`              | `letter-spacing`               | `svg`         |
| `lightingColor`              | `lighting-color`               | `svg`         |
| `limitingConeAngle`          | `limitingConeAngle`            | `svg`         |
| `link`                       | `link`                         | `html`        |
| `list`                       | `list`                         | `html`        |
| `loading`                    | `loading`                      | `html`        |
| `local`                      | `local`                        | `svg`         |
| `longDesc`                   | `longdesc`                     | `html`        |
| `loop`                       | `loop`                         | `html`        |
| `low`                        | `low`                          | `html`        |
| `lowSrc`                     | `lowsrc`                       | `html`        |
| `manifest`                   | `manifest`                     | `html`        |
| `marginHeight`               | `marginheight`                 | `html`        |
| `marginWidth`                | `marginwidth`                  | `html`        |
| `markerEnd`                  | `marker-end`                   | `svg`         |
| `markerHeight`               | `markerHeight`                 | `svg`         |
| `markerMid`                  | `marker-mid`                   | `svg`         |
| `markerStart`                | `marker-start`                 | `svg`         |
| `markerUnits`                | `markerUnits`                  | `svg`         |
| `markerWidth`                | `markerWidth`                  | `svg`         |
| `mask`                       | `mask`                         | `svg`         |
| `maskContentUnits`           | `maskContentUnits`             | `svg`         |
| `maskUnits`                  | `maskUnits`                    | `svg`         |
| `mathematical`               | `mathematical`                 | `svg`         |
| `max`                        | `max`                          | `svg`, `html` |
| `maxLength`                  | `maxlength`                    | `html`        |
| `media`                      | `media`                        | `svg`, `html` |
| `mediaCharacterEncoding`     | `mediaCharacterEncoding`       | `svg`         |
| `mediaContentEncodings`      | `mediaContentEncodings`        | `svg`         |
| `mediaSize`                  | `mediaSize`                    | `svg`         |
| `mediaTime`                  | `mediaTime`                    | `svg`         |
| `method`                     | `method`                       | `svg`, `html` |
| `min`                        | `min`                          | `svg`, `html` |
| `minLength`                  | `minlength`                    | `html`        |
| `mode`                       | `mode`                         | `svg`         |
| `multiple`                   | `multiple`                     | `html`        |
| `muted`                      | `muted`                        | `html`        |
| `name`                       | `name`                         | `svg`, `html` |
| `navDown`                    | `nav-down`                     | `svg`         |
| `navDownLeft`                | `nav-down-left`                | `svg`         |
| `navDownRight`               | `nav-down-right`               | `svg`         |
| `navLeft`                    | `nav-left`                     | `svg`         |
| `navNext`                    | `nav-next`                     | `svg`         |
| `navPrev`                    | `nav-prev`                     | `svg`         |
| `navRight`                   | `nav-right`                    | `svg`         |
| `navUp`                      | `nav-up`                       | `svg`         |
| `navUpLeft`                  | `nav-up-left`                  | `svg`         |
| `navUpRight`                 | `nav-up-right`                 | `svg`         |
| `noHref`                     | `nohref`                       | `html`        |
| `noModule`                   | `nomodule`                     | `html`        |
| `noResize`                   | `noresize`                     | `html`        |
| `noShade`                    | `noshade`                      | `html`        |
| `noValidate`                 | `novalidate`                   | `html`        |
| `noWrap`                     | `nowrap`                       | `html`        |
| `nonce`                      | `nonce`                        | `html`        |
| `numOctaves`                 | `numOctaves`                   | `svg`         |
| `object`                     | `object`                       | `html`        |
| `observer`                   | `observer`                     | `svg`         |
| `offset`                     | `offset`                       | `svg`         |
| `onAbort`                    | `onabort`                      | `svg`, `html` |
| `onActivate`                 | `onactivate`                   | `svg`         |
| `onAfterPrint`               | `onafterprint`                 | `svg`, `html` |
| `onAuxClick`                 | `onauxclick`                   | `html`        |
| `onBeforeMatch`              | `onbeforematch`                | `html`        |
| `onBeforePrint`              | `onbeforeprint`                | `svg`, `html` |
| `onBeforeToggle`             | `onbeforetoggle`               | `html`        |
| `onBeforeUnload`             | `onbeforeunload`               | `html`        |
| `onBegin`                    | `onbegin`                      | `svg`         |
| `onBlur`                     | `onblur`                       | `html`        |
| `onCanPlay`                  | `oncanplay`                    | `svg`, `html` |
| `onCanPlayThrough`           | `oncanplaythrough`             | `svg`, `html` |
| `onCancel`                   | `oncancel`                     | `svg`, `html` |
| `onChange`                   | `onchange`                     | `svg`, `html` |
| `onClick`                    | `onclick`                      | `svg`, `html` |
| `onClose`                    | `onclose`                      | `svg`, `html` |
| `onContextLost`              | `oncontextlost`                | `html`        |
| `onContextMenu`              | `oncontextmenu`                | `html`        |
| `onContextRestored`          | `oncontextrestored`            | `html`        |
| `onCopy`                     | `oncopy`                       | `svg`, `html` |
| `onCueChange`                | `oncuechange`                  | `svg`, `html` |
| `onCut`                      | `oncut`                        | `svg`, `html` |
| `onDblClick`                 | `ondblclick`                   | `svg`, `html` |
| `onDrag`                     | `ondrag`                       | `svg`, `html` |
| `onDragEnd`                  | `ondragend`                    | `svg`, `html` |
| `onDragEnter`                | `ondragenter`                  | `svg`, `html` |
| `onDragExit`                 | `ondragexit`                   | `svg`, `html` |
| `onDragLeave`                | `ondragleave`                  | `svg`, `html` |
| `onDragOver`                 | `ondragover`                   | `svg`, `html` |
| `onDragStart`                | `ondragstart`                  | `svg`, `html` |
| `onDrop`                     | `ondrop`                       | `svg`, `html` |
| `onDurationChange`           | `ondurationchange`             | `svg`, `html` |
| `onEmptied`                  | `onemptied`                    | `svg`, `html` |
| `onEnd`                      | `onend`                        | `svg`         |
| `onEnded`                    | `onended`                      | `svg`, `html` |
| `onError`                    | `onerror`                      | `svg`, `html` |
| `onFocus`                    | `onfocus`                      | `svg`, `html` |
| `onFocusIn`                  | `onfocusin`                    | `svg`         |
| `onFocusOut`                 | `onfocusout`                   | `svg`         |
| `onFormData`                 | `onformdata`                   | `html`        |
| `onHashChange`               | `onhashchange`                 | `svg`, `html` |
| `onInput`                    | `oninput`                      | `svg`, `html` |
| `onInvalid`                  | `oninvalid`                    | `svg`, `html` |
| `onKeyDown`                  | `onkeydown`                    | `svg`, `html` |
| `onKeyPress`                 | `onkeypress`                   | `svg`, `html` |
| `onKeyUp`                    | `onkeyup`                      | `svg`, `html` |
| `onLanguageChange`           | `onlanguagechange`             | `html`        |
| `onLoad`                     | `onload`                       | `svg`, `html` |
| `onLoadEnd`                  | `onloadend`                    | `html`        |
| `onLoadStart`                | `onloadstart`                  | `svg`, `html` |
| `onLoadedData`               | `onloadeddata`                 | `svg`, `html` |
| `onLoadedMetadata`           | `onloadedmetadata`             | `svg`, `html` |
| `onMessage`                  | `onmessage`                    | `svg`, `html` |
| `onMessageError`             | `onmessageerror`               | `html`        |
| `onMouseDown`                | `onmousedown`                  | `svg`, `html` |
| `onMouseEnter`               | `onmouseenter`                 | `svg`, `html` |
| `onMouseLeave`               | `onmouseleave`                 | `svg`, `html` |
| `onMouseMove`                | `onmousemove`                  | `svg`, `html` |
| `onMouseOut`                 | `onmouseout`                   | `svg`, `html` |
| `onMouseOver`                | `onmouseover`                  | `svg`, `html` |
| `onMouseUp`                  | `onmouseup`                    | `svg`, `html` |
| `onMouseWheel`               | `onmousewheel`                 | `svg`         |
| `onOffline`                  | `onoffline`                    | `svg`, `html` |
| `onOnline`                   | `ononline`                     | `svg`, `html` |
| `onPageHide`                 | `onpagehide`                   | `svg`, `html` |
| `onPageShow`                 | `onpageshow`                   | `svg`, `html` |
| `onPaste`                    | `onpaste`                      | `svg`, `html` |
| `onPause`                    | `onpause`                      | `svg`, `html` |
| `onPlay`                     | `onplay`                       | `svg`, `html` |
| `onPlaying`                  | `onplaying`                    | `svg`, `html` |
| `onPopState`                 | `onpopstate`                   | `svg`, `html` |
| `onProgress`                 | `onprogress`                   | `svg`, `html` |
| `onRateChange`               | `onratechange`                 | `svg`, `html` |
| `onRejectionHandled`         | `onrejectionhandled`           | `html`        |
| `onRepeat`                   | `onrepeat`                     | `svg`         |
| `onReset`                    | `onreset`                      | `svg`, `html` |
| `onResize`                   | `onresize`                     | `svg`, `html` |
| `onScroll`                   | `onscroll`                     | `svg`, `html` |
| `onScrollEnd`                | `onscrollend`                  | `html`        |
| `onSecurityPolicyViolation`  | `onsecuritypolicyviolation`    | `html`        |
| `onSeeked`                   | `onseeked`                     | `svg`, `html` |
| `onSeeking`                  | `onseeking`                    | `svg`, `html` |
| `onSelect`                   | `onselect`                     | `svg`, `html` |
| `onShow`                     | `onshow`                       | `svg`         |
| `onSlotChange`               | `onslotchange`                 | `html`        |
| `onStalled`                  | `onstalled`                    | `svg`, `html` |
| `onStorage`                  | `onstorage`                    | `svg`, `html` |
| `onSubmit`                   | `onsubmit`                     | `svg`, `html` |
| `onSuspend`                  | `onsuspend`                    | `svg`, `html` |
| `onTimeUpdate`               | `ontimeupdate`                 | `svg`, `html` |
| `onToggle`                   | `ontoggle`                     | `svg`, `html` |
| `onUnhandledRejection`       | `onunhandledrejection`         | `html`        |
| `onUnload`                   | `onunload`                     | `svg`, `html` |
| `onVolumeChange`             | `onvolumechange`               | `svg`, `html` |
| `onWaiting`                  | `onwaiting`                    | `svg`, `html` |
| `onWheel`                    | `onwheel`                      | `html`        |
| `onZoom`                     | `onzoom`                       | `svg`         |
| `opacity`                    | `opacity`                      | `svg`         |
| `open`                       | `open`                         | `html`        |
| `operator`                   | `operator`                     | `svg`         |
| `optimum`                    | `optimum`                      | `html`        |
| `order`                      | `order`                        | `svg`         |
| `orient`                     | `orient`                       | `svg`         |
| `orientation`                | `orientation`                  | `svg`         |
| `origin`                     | `origin`                       | `svg`         |
| `overflow`                   | `overflow`                     | `svg`         |
| `overlay`                    | `overlay`                      | `svg`         |
| `overlinePosition`           | `overline-position`            | `svg`         |
| `overlineThickness`          | `overline-thickness`           | `svg`         |
| `paintOrder`                 | `paint-order`                  | `svg`         |
| `panose1`                    | `panose-1`                     | `svg`         |
| `path`                       | `path`                         | `svg`         |
| `pathLength`                 | `pathLength`                   | `svg`         |
| `pattern`                    | `pattern`                      | `html`        |
| `patternContentUnits`        | `patternContentUnits`          | `svg`         |
| `patternTransform`           | `patternTransform`             | `svg`         |
| `patternUnits`               | `patternUnits`                 | `svg`         |
| `phase`                      | `phase`                        | `svg`         |
| `ping`                       | `ping`                         | `svg`, `html` |
| `pitch`                      | `pitch`                        | `svg`         |
| `placeholder`                | `placeholder`                  | `html`        |
| `playbackOrder`              | `playbackorder`                | `svg`         |
| `playsInline`                | `playsinline`                  | `html`        |
| `pointerEvents`              | `pointer-events`               | `svg`         |
| `points`                     | `points`                       | `svg`         |
| `pointsAtX`                  | `pointsAtX`                    | `svg`         |
| `pointsAtY`                  | `pointsAtY`                    | `svg`         |
| `pointsAtZ`                  | `pointsAtZ`                    | `svg`         |
| `popover`                    | `popover`                      | `html`        |
| `popoverTarget`              | `popovertarget`                | `html`        |
| `popoverTargetAction`        | `popovertargetaction`          | `html`        |
| `poster`                     | `poster`                       | `html`        |
| `prefix`                     | `prefix`                       | `html`        |
| `preload`                    | `preload`                      | `html`        |
| `preserveAlpha`              | `preserveAlpha`                | `svg`         |
| `preserveAspectRatio`        | `preserveAspectRatio`          | `svg`         |
| `primitiveUnits`             | `primitiveUnits`               | `svg`         |
| `profile`                    | `profile`                      | `html`        |
| `prompt`                     | `prompt`                       | `html`        |
| `propagate`                  | `propagate`                    | `svg`         |
| `property`                   | `property`                     | `svg`, `html` |
| `r`                          | `r`                            | `svg`         |
| `radius`                     | `radius`                       | `svg`         |
| `readOnly`                   | `readonly`                     | `html`        |
| `refX`                       | `refX`                         | `svg`         |
| `refY`                       | `refY`                         | `svg`         |
| `referrerPolicy`             | `referrerpolicy`               | `svg`, `html` |
| `rel`                        | `rel`                          | `svg`, `html` |
| `renderingIntent`            | `rendering-intent`             | `svg`         |
| `repeatCount`                | `repeatCount`                  | `svg`         |
| `repeatDur`                  | `repeatDur`                    | `svg`         |
| `required`                   | `required`                     | `html`        |
| `requiredExtensions`         | `requiredExtensions`           | `svg`         |
| `requiredFeatures`           | `requiredFeatures`             | `svg`         |
| `requiredFonts`              | `requiredFonts`                | `svg`         |
| `requiredFormats`            | `requiredFormats`              | `svg`         |
| `resource`                   | `resource`                     | `svg`         |
| `restart`                    | `restart`                      | `svg`         |
| `result`                     | `result`                       | `svg`         |
| `results`                    | `results`                      | `html`        |
| `rev`                        | `rev`                          | `svg`, `html` |
| `reversed`                   | `reversed`                     | `html`        |
| `rightMargin`                | `rightmargin`                  | `html`        |
| `role`                       | `role`                         |               |
| `rotate`                     | `rotate`                       | `svg`         |
| `rowSpan`                    | `rowspan`                      | `html`        |
| `rows`                       | `rows`                         | `html`        |
| `rules`                      | `rules`                        | `html`        |
| `rx`                         | `rx`                           | `svg`         |
| `ry`                         | `ry`                           | `svg`         |
| `sandbox`                    | `sandbox`                      | `html`        |
| `scale`                      | `scale`                        | `svg`         |
| `scheme`                     | `scheme`                       | `html`        |
| `scope`                      | `scope`                        | `html`        |
| `scoped`                     | `scoped`                       | `html`        |
| `scrolling`                  | `scrolling`                    | `html`        |
| `seamless`                   | `seamless`                     | `html`        |
| `security`                   | `security`                     | `html`        |
| `seed`                       | `seed`                         | `svg`         |
| `selected`                   | `selected`                     | `html`        |
| `shadowRootClonable`         | `shadowrootclonable`           | `html`        |
| `shadowRootDelegatesFocus`   | `shadowrootdelegatesfocus`     | `html`        |
| `shadowRootMode`             | `shadowrootmode`               | `html`        |
| `shape`                      | `shape`                        | `html`        |
| `shapeRendering`             | `shape-rendering`              | `svg`         |
| `side`                       | `side`                         | `svg`         |
| `size`                       | `size`                         | `html`        |
| `sizes`                      | `sizes`                        | `html`        |
| `slope`                      | `slope`                        | `svg`         |
| `slot`                       | `slot`                         | `html`        |
| `snapshotTime`               | `snapshotTime`                 | `svg`         |
| `spacing`                    | `spacing`                      | `svg`         |
| `span`                       | `span`                         | `html`        |
| `specularConstant`           | `specularConstant`             | `svg`         |
| `specularExponent`           | `specularExponent`             | `svg`         |
| `spellCheck`                 | `spellcheck`                   | `html`        |
| `spreadMethod`               | `spreadMethod`                 | `svg`         |
| `src`                        | `src`                          | `html`        |
| `srcDoc`                     | `srcdoc`                       | `html`        |
| `srcLang`                    | `srclang`                      | `html`        |
| `srcSet`                     | `srcset`                       | `html`        |
| `standby`                    | `standby`                      | `html`        |
| `start`                      | `start`                        | `html`        |
| `startOffset`                | `startOffset`                  | `svg`         |
| `stdDeviation`               | `stdDeviation`                 | `svg`         |
| `stemh`                      | `stemh`                        | `svg`         |
| `stemv`                      | `stemv`                        | `svg`         |
| `step`                       | `step`                         | `html`        |
| `stitchTiles`                | `stitchTiles`                  | `svg`         |
| `stopColor`                  | `stop-color`                   | `svg`         |
| `stopOpacity`                | `stop-opacity`                 | `svg`         |
| `strikethroughPosition`      | `strikethrough-position`       | `svg`         |
| `strikethroughThickness`     | `strikethrough-thickness`      | `svg`         |
| `string`                     | `string`                       | `svg`         |
| `stroke`                     | `stroke`                       | `svg`         |
| `strokeDashArray`            | `stroke-dasharray`             | `svg`         |
| `strokeDashOffset`           | `stroke-dashoffset`            | `svg`         |
| `strokeLineCap`              | `stroke-linecap`               | `svg`         |
| `strokeLineJoin`             | `stroke-linejoin`              | `svg`         |
| `strokeMiterLimit`           | `stroke-miterlimit`            | `svg`         |
| `strokeOpacity`              | `stroke-opacity`               | `svg`         |
| `strokeWidth`                | `stroke-width`                 | `svg`         |
| `style`                      | `style`                        | `svg`, `html` |
| `summary`                    | `summary`                      | `html`        |
| `surfaceScale`               | `surfaceScale`                 | `svg`         |
| `syncBehavior`               | `syncBehavior`                 | `svg`         |
| `syncBehaviorDefault`        | `syncBehaviorDefault`          | `svg`         |
| `syncMaster`                 | `syncMaster`                   | `svg`         |
| `syncTolerance`              | `syncTolerance`                | `svg`         |
| `syncToleranceDefault`       | `syncToleranceDefault`         | `svg`         |
| `systemLanguage`             | `systemLanguage`               | `svg`         |
| `tabIndex`                   | `tabindex`                     | `svg`, `html` |
| `tableValues`                | `tableValues`                  | `svg`         |
| `target`                     | `target`                       | `svg`, `html` |
| `targetX`                    | `targetX`                      | `svg`         |
| `targetY`                    | `targetY`                      | `svg`         |
| `text`                       | `text`                         | `html`        |
| `textAnchor`                 | `text-anchor`                  | `svg`         |
| `textDecoration`             | `text-decoration`              | `svg`         |
| `textLength`                 | `textLength`                   | `svg`         |
| `textRendering`              | `text-rendering`               | `svg`         |
| `timelineBegin`              | `timelinebegin`                | `svg`         |
| `title`                      | `title`                        | `svg`, `html` |
| `to`                         | `to`                           | `svg`         |
| `topMargin`                  | `topmargin`                    | `html`        |
| `transform`                  | `transform`                    | `svg`         |
| `transformBehavior`          | `transformBehavior`            | `svg`         |
| `transformOrigin`            | `transform-origin`             | `svg`         |
| `translate`                  | `translate`                    | `html`        |
| `type`                       | `type`                         | `svg`, `html` |
| `typeMustMatch`              | `typemustmatch`                | `html`        |
| `typeOf`                     | `typeof`                       | `svg`         |
| `u1`                         | `u1`                           | `svg`         |
| `u2`                         | `u2`                           | `svg`         |
| `underlinePosition`          | `underline-position`           | `svg`         |
| `underlineThickness`         | `underline-thickness`          | `svg`         |
| `unicode`                    | `unicode`                      | `svg`         |
| `unicodeBidi`                | `unicode-bidi`                 | `svg`         |
| `unicodeRange`               | `unicode-range`                | `svg`         |
| `unitsPerEm`                 | `units-per-em`                 | `svg`         |
| `unselectable`               | `unselectable`                 | `html`        |
| `useMap`                     | `usemap`                       | `html`        |
| `vAlign`                     | `valign`                       | `html`        |
| `vAlphabetic`                | `v-alphabetic`                 | `svg`         |
| `vHanging`                   | `v-hanging`                    | `svg`         |
| `vIdeographic`               | `v-ideographic`                | `svg`         |
| `vLink`                      | `vlink`                        | `html`        |
| `vMathematical`              | `v-mathematical`               | `svg`         |
| `vSpace`                     | `vspace`                       | `html`        |
| `value`                      | `value`                        | `html`        |
| `valueType`                  | `valuetype`                    | `html`        |
| `values`                     | `values`                       | `svg`         |
| `vectorEffect`               | `vector-effect`                | `svg`         |
| `version`                    | `version`                      | `svg`, `html` |
| `vertAdvY`                   | `vert-adv-y`                   | `svg`         |
| `vertOriginX`                | `vert-origin-x`                | `svg`         |
| `vertOriginY`                | `vert-origin-y`                | `svg`         |
| `viewBox`                    | `viewBox`                      | `svg`         |
| `viewTarget`                 | `viewTarget`                   | `svg`         |
| `visibility`                 | `visibility`                   | `svg`         |
| `width`                      | `width`                        | `svg`, `html` |
| `widths`                     | `widths`                       | `svg`         |
| `wordSpacing`                | `word-spacing`                 | `svg`         |
| `wrap`                       | `wrap`                         | `html`        |
| `writingMode`                | `writing-mode`                 | `svg`         |
| `writingSuggestions`         | `writingsuggestions`           | `html`        |
| `x`                          | `x`                            | `svg`         |
| `x1`                         | `x1`                           | `svg`         |
| `x2`                         | `x2`                           | `svg`         |
| `xChannelSelector`           | `xChannelSelector`             | `svg`         |
| `xHeight`                    | `x-height`                     | `svg`         |
| `xLinkActuate`               | `xlink:actuate`                | `xlink`       |
| `xLinkArcRole`               | `xlink:arcrole`                | `xlink`       |
| `xLinkHref`                  | `xlink:href`                   | `xlink`       |
| `xLinkRole`                  | `xlink:role`                   | `xlink`       |
| `xLinkShow`                  | `xlink:show`                   | `xlink`       |
| `xLinkTitle`                 | `xlink:title`                  | `xlink`       |
| `xLinkType`                  | `xlink:type`                   | `xlink`       |
| `xmlBase`                    | `xml:base`                     | `xml`         |
| `xmlLang`                    | `xml:lang`                     | `xml`         |
| `xmlSpace`                   | `xml:space`                    | `xml`         |
| `xmlns`                      | `xmlns`                        | `xmlns`       |
| `xmlnsXLink`                 | `xmlns:xlink`                  | `xmlns`       |
| `y`                          | `y`                            | `svg`         |
| `y1`                         | `y1`                           | `svg`         |
| `y2`                         | `y2`                           | `svg`         |
| `yChannelSelector`           | `yChannelSelector`             | `svg`         |
| `z`                          | `z`                            | `svg`         |
| `zoomAndPan`                 | `zoomAndPan`                   | `svg`         |

<!--list end-->

## Security

This package is safe.

## Related

* [`wooorm/web-namespaces`][github-web-namespaces]
  — list of web namespaces
* [`wooorm/space-separated-tokens`](https://github.com/wooorm/space-separated-tokens)
  — parse/stringify space separated tokens
* [`wooorm/comma-separated-tokens`](https://github.com/wooorm/comma-separated-tokens)
  — parse/stringify comma separated tokens
* [`wooorm/html-tag-names`](https://github.com/wooorm/html-tag-names)
  — list of HTML tag names
* [`wooorm/mathml-tag-names`](https://github.com/wooorm/mathml-tag-names)
  — list of MathML tag names
* [`wooorm/svg-tag-names`](https://github.com/wooorm/svg-tag-names)
  — list of SVG tag names
* [`wooorm/html-void-elements`](https://github.com/wooorm/html-void-elements)
  — list of void HTML tag names
* [`wooorm/svg-element-attributes`](https://github.com/wooorm/svg-element-attributes)
  — map of SVG elements to allowed attributes
* [`wooorm/html-element-attributes`](https://github.com/wooorm/html-element-attributes)
  — map of HTML elements to allowed attributes
* [`wooorm/aria-attributes`](https://github.com/wooorm/aria-attributes)
  — list of ARIA attributes

## Contribute

Yes please!
See [*How to Contribute to Open Source*][opensource-guide].

## License

[MIT][file-license] © [Titus Wormer][wooorm]

Derivative work based on [React][github-react-source] licensed under
[MIT][github-react-source-license] © Facebook, Inc.

[api-find]: #findschema-name

[api-hast-to-react]: #hasttoreact

[api-html]: #html

[api-info]: #info

[api-normalize]: #normalizename

[api-schema]: #schema

[api-space]: #space

[api-svg]: #svg

[badge-build-image]: https://github.com/wooorm/property-information/workflows/main/badge.svg

[badge-build-url]: https://github.com/wooorm/property-information/actions

[badge-coverage-image]: https://img.shields.io/codecov/c/github/wooorm/property-information.svg

[badge-coverage-url]: https://codecov.io/github/wooorm/property-information

[badge-downloads-image]: https://img.shields.io/npm/dm/property-information.svg

[badge-downloads-url]: https://www.npmjs.com/package/property-information

[badge-size-image]: https://img.shields.io/bundlejs/size/property-information

[badge-size-url]: https://bundlejs.com/?q=property-information

[esmsh]: https://esm.sh

[file-license]: license

[github-gist-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[github-hast]: https://github.com/syntax-tree/hast

[github-hast-property-name]: https://github.com/syntax-tree/hast#propertyname

[github-react]: https://github.com/facebook/react

[github-react-source]: https://github.com/facebook/react/blob/4632e36/packages/react-dom-bindings/src/shared/possibleStandardNames.js

[github-react-source-license]: https://github.com/facebook/react/blob/4632e36/LICENSE

[github-web-namespaces]: https://github.com/wooorm/web-namespaces

[mozilla-dataset]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset

[npmjs-install]: https://docs.npmjs.com/cli/install

[opensource-guide]: https://opensource.guide/how-to-contribute/

[section-support]: #support

[typescript]: https://www.typescriptlang.org

[wooorm]: https://wooorm.com
