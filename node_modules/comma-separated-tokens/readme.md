# comma-separated-tokens

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Parse and stringify comma-separated tokens.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`parse(value)`](#parsevalue)
    *   [`stringify(values[, options])`](#stringifyvalues-options)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [Security](#security)
*   [License](#license)

## What is this?

This is a tiny package that can parse and stringify comma-separated tokens, as
used for example in the HTML `accept` attribute, according to the
[WHATWG spec][spec].

## When should I use this?

This package is rather niche, it’s low-level and particularly useful when
working with [hast][].

## Install

This package is [ESM only][esm].
In Node.js (version 14.14+, 16.0+), install with [npm][]:

```sh
npm install comma-separated-tokens
```

In Deno with [`esm.sh`][esmsh]:

```js
import {parse, stringify} from 'https://esm.sh/comma-separated-tokens@2'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {parse, stringify} from 'https://esm.sh/comma-separated-tokens@2?bundle'
</script>
```

## Use

```js
import {parse, stringify} from 'comma-separated-tokens'

parse(' a ,b,,d d ') //=> ['a', 'b', '', 'd d']
stringify(['a', 'b', '', 'd d']) //=> 'a, b, , d d'
```

## API

This package exports the identifier `parse` and `stringify`.
There is no default export.

### `parse(value)`

Parse commma-separated tokens (`string`) to an array of strings
(`Array<string>`), according to the [WHATWG spec][spec].

### `stringify(values[, options])`

Serialize an array of strings or numbers (`Array<string|number>`) to
comma-separated tokens (`string`).
Handles empty items at start or end correctly.

> 👉 **Note**: it’s not possible to specify initial or final whitespace per
> value.

##### `options`

Configuration (optional).

###### `options.padLeft`

Whether to pad a space before a token (`boolean`, default: `true`).

###### `options.padRight`

Whether to pad a space after a token (`boolean`, default: `false`).

## Types

This package is fully typed with [TypeScript][].
It exports the additional type `Options`.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 14.14+ and 16.0+.
It also works in Deno and modern browsers.

## Related

*   [`space-separated-tokens`](https://github.com/wooorm/space-separated-tokens)
    — parse/stringify space-separated tokens
*   [`collapse-white-space`](https://github.com/wooorm/collapse-white-space)
    — replace multiple white-space characters with a single space
*   [`property-information`](https://github.com/wooorm/property-information)
    — info on HTML properties

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## Security

This package is safe.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/comma-separated-tokens/workflows/main/badge.svg

[build]: https://github.com/wooorm/comma-separated-tokens/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/comma-separated-tokens.svg

[coverage]: https://codecov.io/github/wooorm/comma-separated-tokens

[downloads-badge]: https://img.shields.io/npm/dm/comma-separated-tokens.svg

[downloads]: https://www.npmjs.com/package/comma-separated-tokens

[size-badge]: https://img.shields.io/bundlephobia/minzip/comma-separated-tokens.svg

[size]: https://bundlephobia.com/result?p=comma-separated-tokens

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/

[license]: license

[author]: https://wooorm.com

[spec]: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#comma-separated-tokens

[hast]: https://github.com/syntax-tree/hast
