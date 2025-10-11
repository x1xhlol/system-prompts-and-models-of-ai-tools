# html-void-elements

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

List of HTML void tag names.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`htmlVoidElements`](#htmlvoidelements)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This is a list of all void tag names according to HTML.

> 👉 **Note**: includes ancient (such as `basefont` and `bgsound`) tag names
> too.

## When should I use this?

You can use this when you’re writing HTML parsers, minifiers, or compilers.

## Install

This package is [ESM only][esm].
In Node.js (version 14.14+, 16.0+), install with [npm][]:

```sh
npm install html-void-elements
```

In Deno with [`esm.sh`][esmsh]:

```js
import {htmlVoidElements} from 'https://esm.sh/html-void-elements@2'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {htmlVoidElements} from 'https://esm.sh/html-void-elements@2?bundle'
</script>
```

## Use

```js
import {htmlVoidElements} from 'html-void-elements'

console.log(htmlVoidElements)
```

Yields:

```js
[
  'area',
  'base',
  'basefont',
  'bgsound',
  'br',
  'col',
  'command',
  'embed',
  'frame',
  'hr',
  'image',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]
```

## API

This package exports the identifier `htmlVoidElements`.
There is no default export.

### `htmlVoidElements`

List of HTML void tag names (`Array<string>`).

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 14.14+ and 16.0+.
It also works in Deno and modern browsers.

## Security

This package is safe.

## Related

*   [`wooorm/html-tag-names`](https://github.com/wooorm/html-tag-names)
    — list of HTML tag names
*   [`wooorm/html-element-attributes`](https://github.com/wooorm/html-element-attributes)
    — map of HTML elements to attributes

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definition -->

[build-badge]: https://github.com/wooorm/html-void-elements/workflows/main/badge.svg

[build]: https://github.com/wooorm/html-void-elements/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/html-void-elements.svg

[coverage]: https://codecov.io/github/wooorm/html-void-elements

[downloads-badge]: https://img.shields.io/npm/dm/html-void-elements.svg

[downloads]: https://www.npmjs.com/package/html-void-elements

[size-badge]: https://img.shields.io/bundlephobia/minzip/html-void-elements.svg

[size]: https://bundlephobia.com/result?p=html-void-elements

[npm]: https://docs.npmjs.com/cli/install

[esmsh]: https://esm.sh

[license]: license

[author]: https://wooorm.com

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/
