# trim-lines

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Remove spaces and tabs around line breaks.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`trimLines(value)`](#trimlinesvalue)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a tiny utility that removes spaces and tabs around line endings,
keeping the line endings, and not removing whitespace at the start or end of the
string.
It might look trivial, but it’s actually pretty complex to get performant.

## When should I use this?

When you need to trim markdown-like whitespace around line endings and don’t
want to run into performance problems.

## Install

This package is [ESM only][esm].
In Node.js (version 14.14+, 16.0+, or 18.0+), install with [npm][]:

```sh
npm install trim-lines
```

In Deno with [`esm.sh`][esmsh]:

```js
import trimLines from 'https://esm.sh/trim-lines@3'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import trimLines from 'https://esm.sh/trim-lines@3?bundle'
</script>
```

## Use

```js
import {trimLines} from 'trim-lines'

console.log(trimLines(' foo\t\n\n bar \n\tbaz ')) // => ' foo\n\nbar\nbaz '
```

## API

This package exports the identifier `trimLines`.
There is no default export.

### `trimLines(value)`

Remove spaces and tabs around line breaks in `value` (`string`).

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 14.14+, 16.0+, and 18.0+.
It also works in Deno and modern browsers.

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/trim-lines/workflows/main/badge.svg

[build]: https://github.com/wooorm/trim-lines/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/trim-lines.svg

[coverage]: https://codecov.io/github/wooorm/trim-lines

[downloads-badge]: https://img.shields.io/npm/dm/trim-lines.svg

[downloads]: https://www.npmjs.com/package/trim-lines

[size-badge]: https://img.shields.io/bundlephobia/minzip/trim-lines.svg

[size]: https://bundlephobia.com/result?p=trim-lines

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/
