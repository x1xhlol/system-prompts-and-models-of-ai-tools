# hast-util-to-html

[![Build][badge-build-image]][badge-build-url]
[![Coverage][badge-coverage-image]][badge-coverage-url]
[![Downloads][badge-downloads-image]][badge-downloads-url]
[![Size][badge-size-image]][badge-size-url]

[hast][github-hast] utility to serialize hast as HTML.

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`toHtml(tree[, options])`](#tohtmltree-options)
  * [`CharacterReferences`](#characterreferences)
  * [`Options`](#options)
  * [`Quote`](#quote-1)
  * [`Space`](#space-1)
* [Syntax](#syntax)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Related](#related)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package is a utility that turns a hast tree into a string of HTML.

## When should I use this?

You can use this utility when you want to get the serialized HTML that is
represented by the syntax tree,
either because you’re done with the syntax tree,
or because you’re integrating with another tool that does not support syntax
trees.

This utility has many options to configure how the HTML is serialized.
These options help when building tools that make output pretty (such as
formatters) or ugly (such as minifiers).

The utility [`hast-util-from-html`][github-hast-util-from-html] does the
inverse of this utility.
It turns HTML into hast.

The rehype plugin [`rehype-stringify`][github-rehype-stringify] wraps this
utility to also serialize HTML at a higher-level (easier) abstraction.

## Install

This package is [ESM only][github-gist-esm].
In Node.js (version 16+),
install with [npm][npmjs-install]:

```sh
npm install hast-util-to-html
```

In Deno with [`esm.sh`][esmsh]:

```js
import {toHtml} from 'https://esm.sh/hast-util-to-html@9'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {toHtml} from 'https://esm.sh/hast-util-to-html@9?bundle'
</script>
```

## Use

```js
import {h} from 'hastscript'
import {toHtml} from 'hast-util-to-html'

const tree = h('.alpha', [
  'bravo ',
  h('b', 'charlie'),
  ' delta ',
  h('a.echo', {download: true}, 'foxtrot')
])

console.log(toHtml(tree))
```

Yields:

```html
<div class="alpha">bravo <b>charlie</b> delta <a class="echo" download>foxtrot</a></div>
```

## API

This package exports the identifier [`toHtml`][api-to-html].
There is no default export.

### `toHtml(tree[, options])`

Serialize hast as HTML.

###### Parameters

* `tree`
  ([`Node`][github-hast-nodes] or `Array<Node>`)
  — tree to serialize
* `options`
  ([`Options`][api-options], optional)
  — configuration

###### Returns

Serialized HTML (`string`).

### `CharacterReferences`

How to serialize character references (TypeScript type).

##### Fields

###### `useNamedReferences`

Prefer named character references (`&amp;`) where possible
(`boolean`, default: `false`).

###### `omitOptionalSemicolons`

Whether to omit semicolons when possible
(`boolean`, default: `false`).

> ⚠️ **Note**:
> this creates what HTML calls “parse errors” but is otherwise still valid HTML:
> don’t use this except when building a minifier;
> omitting semicolons is possible for certain named and numeric references in
> some cases.

###### `useShortestReferences`

Prefer the shortest possible reference,
if that results in less bytes
(`boolean`, default: `false`).

> ⚠️ **Note**:
> `useNamedReferences` can be omitted when using `useShortestReferences`.

### `Options`

Configuration (TypeScript type).

##### Fields

###### `allowDangerousCharacters`

Do not encode some characters which cause XSS vulnerabilities in older browsers
(`boolean`, default: `false`).

> ⚠️ **Danger**:
> only set this if you completely trust the content.

###### `allowDangerousHtml`

Allow `raw` nodes and insert them as raw HTML
(`boolean`, default: `false`).

When `false`,
`Raw` nodes are encoded.

> ⚠️ **Danger**:
> only set this if you completely trust the content.

###### `allowParseErrors`

Do not encode characters which cause parse errors
(even though they work),
to save bytes
(`boolean`, default: `false`).

Not used in the SVG space.

> 👉 **Note**:
> intentionally creates parse errors in markup
> (how parse errors are handled is well defined,
> so this works but isn’t pretty).

###### `bogusComments`

Use “bogus comments” instead of comments to save byes:
`<?charlie>` instead of `<!--charlie-->`
(`boolean`, default: `false`).

> 👉 **Note**:
> intentionally creates parse errors in markup
> (how parse errors are handled is well defined,
> so this works but isn’t pretty).

###### `characterReferences`

Configure how to serialize character references
([`CharacterReferences`][api-character-references], optional).

###### `closeEmptyElements`

Close SVG elements without any content with slash (`/`) on the opening tag
instead of an end tag:
`<circle />` instead of `<circle></circle>`
(`boolean`, default: `false`).

See `tightSelfClosing` to control whether a space is used before the slash.

Not used in the HTML space.

###### `closeSelfClosing`

Close self-closing nodes with an extra slash (`/`):
`<img />` instead of `<img>`
(`boolean`, default: `false`).

See `tightSelfClosing` to control whether a space is used before the slash.

Not used in the SVG space.

###### `collapseEmptyAttributes`

Collapse empty attributes:
get `class` instead of `class=""`
(`boolean`, default: `false`).

Not used in the SVG space.

> 👉 **Note**:
> boolean attributes
> (such as `hidden`)
> are always collapsed.

###### `omitOptionalTags`

Omit optional opening and closing tags
(`boolean`, default: `false`).

For example,
in `<ol><li>one</li><li>two</li></ol>`,
both `</li>` closing tags can be omitted.
The first because it’s followed by another `li`,
the last because it’s followed by nothing.

Not used in the SVG space.

###### `preferUnquoted`

Leave attributes unquoted if that results in less bytes
(`boolean`, default: `false`).

Not used in the SVG space.

###### `quote`

Preferred quote to use
([`Quote`][api-quote], default: `'"'`).

###### `quoteSmart`

Use the other quote if that results in less bytes
(`boolean`, default: `false`).

###### `space`

Which space the document is in
([`Space`][api-space], default: `'html'`).

When an `<svg>` element is found in the HTML space,
this package already automatically switches to and from the SVG space when
entering and exiting it.

> 👉 **Note**:
> hast is not XML.
> It supports SVG as embedded in HTML.
> It does not support the features available in XML.
> Passing SVG might break but fragments of modern SVG should be fine.
> Use [`xast`][github-xast] if you need to support SVG as XML.

###### `tightAttributes`

Join attributes together,
without whitespace,
if possible:
get `class="a b"title="c d"` instead of `class="a b" title="c d"` to save bytes
(`boolean`, default: `false`).

Not used in the SVG space.

> 👉 **Note**:
> intentionally creates parse errors in markup
> (how parse errors are handled is well defined,
> so this works but isn’t pretty).

###### `tightCommaSeparatedLists`

Join known comma-separated attribute values with just a comma (`,`),
instead of padding them on the right as well
(`,␠`, where `␠` represents a space)
(`boolean`, default: `false`).

###### `tightDoctype`

Drop unneeded spaces in doctypes:
`<!doctypehtml>` instead of `<!doctype html>` to save bytes
(`boolean`, default: `false`).

> 👉 **Note**:
> intentionally creates parse errors in markup
> (how parse errors are handled is well defined,
> so this works but isn’t pretty).

###### `tightSelfClosing`

Do not use an extra space when closing self-closing elements:
`<img/>` instead of `<img />`
(`boolean`, default: `false`).

> 👉 **Note**:
> only used if `closeSelfClosing: true` or `closeEmptyElements: true`.

###### `upperDoctype`

Use a `<!DOCTYPE…` instead of `<!doctype…`
(`boolean`, default: `false`).

Useless except for XHTML.

###### `voids`

Tag names of elements to serialize without closing tag
(`Array<string>`,
default: [`html-void-elements`][github-html-void-elements]).

Not used in the SVG space.

> 👉 **Note**:
> it’s highly unlikely that you want to pass this,
> because hast is not for XML,
> and HTML will not add more void elements.

### `Quote`

HTML quotes for attribute values (TypeScript type).

###### Type

```ts
type Quote = '"' | "'"
```

### `Space`

Namespace (TypeScript type).

###### Type

```ts
type Space = 'html' | 'svg'
```

## Syntax

HTML is serialized according to WHATWG HTML (the living standard),
which is also followed by browsers such as Chrome and Firefox.

## Types

This package is fully typed with [TypeScript][].
It exports the additional types
[`CharacterReferences`][api-character-references],
[`Options`][api-options],
[`Quote`][api-quote],
and
[`Space`][api-space].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release,
we drop support for unmaintained versions of Node.
This means we try to keep the current release line,
`hast-util-to-html@9`,
compatible with Node.js 16.

## Security

Use of `hast-util-to-html` can open you up to a
[cross-site scripting (XSS)][wikipedia-xss] attack if the hast tree is unsafe.
Use [`hast-util-santize`][github-hast-util-sanitize] to make the hast tree
safe.

## Related

* [`hast-util-sanitize`][github-hast-util-sanitize]
  — sanitize hast

## Contribute

See [`contributing.md`][health-contributing]
in
[`syntax-tree/.github`][health]
for ways to get started.
See [`support.md`][health-support] for ways to get help.

This project has a [code of conduct][health-coc].
By interacting with this repository,
organization,
or community you agree to abide by its terms.

## License

[MIT][file-license] © [Titus Wormer][wooorm]

<!-- Definitions -->

[api-character-references]: #characterreferences

[api-options]: #options

[api-quote]: #quote-1

[api-space]: #space-1

[api-to-html]: #tohtmltree-options

[badge-build-image]: https://github.com/syntax-tree/hast-util-to-html/workflows/main/badge.svg

[badge-build-url]: https://github.com/syntax-tree/hast-util-to-html/actions

[badge-coverage-image]: https://img.shields.io/codecov/c/github/syntax-tree/hast-util-to-html.svg

[badge-coverage-url]: https://codecov.io/github/syntax-tree/hast-util-to-html

[badge-downloads-image]: https://img.shields.io/npm/dm/hast-util-to-html.svg

[badge-downloads-url]: https://www.npmjs.com/package/hast-util-to-html

[badge-size-image]: https://img.shields.io/bundlejs/size/hast-util-to-html

[badge-size-url]: https://bundlejs.com/?q=hast-util-to-html

[esmsh]: https://esm.sh

[file-license]: license

[github-gist-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[github-hast]: https://github.com/syntax-tree/hast

[github-hast-nodes]: https://github.com/syntax-tree/hast#nodes

[github-hast-util-from-html]: https://github.com/syntax-tree/hast-util-from-html

[github-hast-util-sanitize]: https://github.com/syntax-tree/hast-util-sanitize

[github-html-void-elements]: https://github.com/wooorm/html-void-elements

[github-rehype-stringify]: https://github.com/rehypejs/rehype/tree/main/packages/rehype-stringify#readme

[github-xast]: https://github.com/syntax-tree/xast

[health]: https://github.com/syntax-tree/.github

[health-coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[health-contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[health-support]: https://github.com/syntax-tree/.github/blob/main/support.md

[npmjs-install]: https://docs.npmjs.com/cli/install

[typescript]: https://www.typescriptlang.org

[wikipedia-xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[wooorm]: https://wooorm.com
