# ccount

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Count how often a character (or substring) is used in a string.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`ccount(value, character)`](#ccountvalue-character)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a small utility that helps you find how frequently a substring
occurs in another string.

## When should I use this?

I find this particularly useful when generating code, for example, when building
a string that can either be double or single quoted.
I use this utility to choose single quotes when double quotes are used more
frequently, and double quotes otherwise.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install ccount
```

In Deno with [Skypack][]:

```js
import {ccount} from 'https://cdn.skypack.dev/ccount@2?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import {ccount} from 'https://cdn.skypack.dev/ccount@2?min'
</script>
```

## Use

```js
import {ccount} from 'ccount'

ccount('foo(bar(baz)', '(') // => 2
ccount('foo(bar(baz)', ')') // => 1
```

## API

This package exports the following identifier: `ccount`.
There is no default export.

### `ccount(value, character)`

Count how often a character (or substring) is used in a string.

###### Parameters

*   `value` (`string`)
    — value to search in
*   `character` (`string`)
    — character (or substring) to look for

###### Returns

`number` — number of times `character` occurred in `value`.

## Types

This package is fully typed with [TypeScript][].

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
It also works in Deno and modern browsers.

## Security

This package is safe.

## Related

*   [`wooorm/longest-streak`](https://github.com/wooorm/longest-streak)
    — count of longest repeating streak of `character` in `value`
*   [`wooorm/direction`](https://github.com/wooorm/direction)
    — detect directionality: left-to-right, right-to-left, or neutral

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/ccount/workflows/main/badge.svg

[build]: https://github.com/wooorm/ccount/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/ccount.svg

[coverage]: https://codecov.io/github/wooorm/ccount

[downloads-badge]: https://img.shields.io/npm/dm/ccount.svg

[downloads]: https://www.npmjs.com/package/ccount

[size-badge]: https://img.shields.io/bundlephobia/minzip/ccount.svg

[size]: https://bundlephobia.com/result?p=ccount

[npm]: https://docs.npmjs.com/cli/install

[skypack]: https://www.skypack.dev

[license]: license

[author]: https://wooorm.com

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/
