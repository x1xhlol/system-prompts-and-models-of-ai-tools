# space-separated-tokens

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Parse and stringify space-separated tokens.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`parse(value)`](#parsevalue)
    *   [`stringify(values)`](#stringifyvalues)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [Security](#security)
*   [License](#license)

## What is this?

This is a tiny package that can parse and stringify space-separated tokens, as
used for example in the HTML `class` attribute, according to the
[WHATWG spec][spec].

## When should I use this?

This package is rather niche, it’s low-level and particularly useful when
working with [hast][].

## Install

This package is [ESM only][esm].
In Node.js (version 14.14+, 16.0+), install with [npm][]:

```sh
npm install space-separated-tokens
```

In Deno with [`esm.sh`][esmsh]:

```js
import {parse, stringify} from 'https://esm.sh/space-separated-tokens@2'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {parse, stringify} from 'https://esm.sh/space-separated-tokens@2?bundle'
</script>
```

## Use

```js
import {parse, stringify} from 'space-separated-tokens'

parse(' foo\tbar\nbaz  ')
//=> ['foo', 'bar', 'baz']

stringify(['foo', 'bar', 'baz'])
//=> 'foo bar baz'
```

## API

This package exports the identifiers `parse` and `stringify`.
There is no default export.

### `parse(value)`

Parse space-separated tokens (`string`) to an array of strings
(`Array<string>`), according to the [WHATWG spec][spec].

### `stringify(values)`

Serialize an array of strings or numbers (`Array<string|number>`) to
space-separated tokens (`string`).

> 👉 **Note**: it’s not possible to specify empty or whitespace only values.

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 14.14+ and 16.0+.
It also works in Deno and modern browsers.

## Related

*   [`comma-separated-tokens`](https://github.com/wooorm/comma-separated-tokens)
    — parse/stringify comma-separated tokens
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

<!-- Definition -->

[build-badge]: https://github.com/wooorm/space-separated-tokens/workflows/main/badge.svg

[build]: https://github.com/wooorm/space-separated-tokens/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/space-separated-tokens.svg

[coverage]: https://codecov.io/github/wooorm/space-separated-tokens

[downloads-badge]: https://img.shields.io/npm/dm/space-separated-tokens.svg

[downloads]: https://www.npmjs.com/package/space-separated-tokens

[size-badge]: https://img.shields.io/bundlephobia/minzip/space-separated-tokens.svg

[size]: https://bundlephobia.com/result?p=space-separated-tokens

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/

[license]: license

[author]: https://wooorm.com

[spec]: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#space-separated-tokens

[hast]: https://github.com/syntax-tree/hast
