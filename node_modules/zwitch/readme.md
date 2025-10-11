# zwitch

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Handle values based on a field.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`zwitch(key[, options])`](#zwitchkey-options)
    *   [`one(value[, rest…])`](#onevalue-rest)
    *   [`function handler(value[, rest…])`](#function-handlervalue-rest)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [Security](#security)
*   [License](#license)

## What is this?

This is a tiny package that lets you `switch` between some field on objects.

## When should I use this?

This package is very useful when mapping one AST to another.
It’s a lot like a `switch` statement on one field, but it’s extensible.

## Install

This package is [ESM only][esm].
In Node.js (version 14.14+, 16.0+), install with [npm][]:

```sh
npm install zwitch
```

In Deno with [`esm.sh`][esmsh]:

```js
import {zwitch} from 'https://esm.sh/zwitch@2'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {zwitch} from 'https://esm.sh/zwitch@2?bundle'
</script>
```

## Use

```js
import {zwitch} from 'zwitch'

const handle = zwitch('type', {invalid, unknown, handlers: {alpha: handleAlpha}})

handle({type: 'alpha'})

function handleAlpha() { /* … */ }
```

Or, with a `switch` statement:

```js
const field = 'type'

function handle(value) {
  let fn = invalid

  if (value && typeof value === 'object' && field in value) {
    switch (value[field]) {
      case 'alpha':
        fn = handleAlpha
        break
      default:
        fn = unknown
        break
    }
  }

  return fn.apply(this, arguments)
}

handle({type: 'alpha'})

function handleAlpha() { /* … */ }
function unknown() { /* … */ }
function invalid() { /* … */ }
```

## API

This package exports the identifier `zwitch`.
There is no default export.

### `zwitch(key[, options])`

Create a switch, based on a `key` (`string`).

##### `options`

Options can be omitted and added later to `one`.

###### `options.handlers`

Handlers to use, stored on `one.handlers` (`Record<string, Function>`,
optional).

###### `options.unknown`

Handler to use for unknown values, stored on `one.unknown` (`Function`,
optional).

###### `options.invalid`

Handler to use for invalid values, stored on `one.invalid` (`Function`,
optional).

###### Returns

See [`one`][one] (`Function`).

### `one(value[, rest…])`

Handle one value.
Based on the bound `key`, a respective handler will be called.
If `value` is not an object, or doesn’t have a `key` property, the special
“invalid” handler will be called.
If `value` has an unknown `key`, the special “unknown” handler will be called.

All arguments, and the context object (`this`), are passed through to the
[handler][], and it’s result is returned.

###### `one.handlers`

Map of [handler][]s (`Record<string, Function>`).

###### `one.invalid`

Special [`handler`][handler] called if a value doesn’t have a `key` property.
If not set, `undefined` is returned for invalid values.

###### `one.unknown`

Special [`handler`][handler] called if a value does not have a matching
handler.
If not set, `undefined` is returned for unknown values.

### `function handler(value[, rest…])`

Handle one value.

## Types

This package is fully typed with [TypeScript][].
It exports the types `Handler`, `UnknownHandler`, `InvalidHandler`, and
`Options`.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 14.14+ and 16.0+.
It also works in Deno and modern browsers.

## Related

*   [`mapz`](https://github.com/wooorm/mapz)
    — functional map

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## Security

This package is safe.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/zwitch/workflows/main/badge.svg

[build]: https://github.com/wooorm/zwitch/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/zwitch.svg

[coverage]: https://codecov.io/github/wooorm/zwitch

[downloads-badge]: https://img.shields.io/npm/dm/zwitch.svg

[downloads]: https://www.npmjs.com/package/zwitch

[size-badge]: https://img.shields.io/bundlephobia/minzip/zwitch.svg

[size]: https://bundlephobia.com/result?p=zwitch

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/

[license]: license

[author]: https://wooorm.com

[one]: #onevalue-rest

[handler]: #function-handlervalue-rest
