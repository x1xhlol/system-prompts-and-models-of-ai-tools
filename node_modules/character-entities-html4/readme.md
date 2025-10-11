# character-entities-html4

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Map of named character references from HTML 4.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`characterEntitiesHtml4`](#characterentitieshtml4)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This is a map of named character references in HTML 4 to the characters they
represent.

## When should I use this?

Maybe when you’re writing an HTML parser or minifier, but otherwise probably
never!
Even then, it might be better to use [`parse-entities`][parse-entities] or
[`stringify-entities`][stringify-entities].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install character-entities-html4
```

In Deno with [Skypack][]:

```js
import {characterEntitiesHtml4} from 'https://cdn.skypack.dev/character-entities-html4@2?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import {characterEntitiesHtml4} from 'https://cdn.skypack.dev/character-entities-html4@2?min'
</script>
```

## Use

```js
import {characterEntitiesHtml4} from 'character-entities-html4'

console.log(characterEntitiesHtml4.AElig) // => 'Æ'
console.log(characterEntitiesHtml4.aelig) // => 'æ'
console.log(characterEntitiesHtml4.amp) // => '&'
console.log(characterEntitiesHtml4.apos) // => undefined
```

## API

This package exports the following identifiers: `characterEntitiesHtml4`.
There is no default export.

### `characterEntitiesHtml4`

Map of case sensitive named character references from HTML 4.
See [`w3.org`][html] for more info.

## Types

This package is fully typed with [TypeScript][].

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
It also works in Deno and modern browsers.

## Security

This package is safe.

## Related

*   [`parse-entities`](https://github.com/wooorm/parse-entities)
    — parse (decode) character references
*   [`stringify-entities`](https://github.com/wooorm/stringify-entities)
    — serialize (encode) character references
*   [`character-entities`](https://github.com/wooorm/character-entities)
    — info on character entities
*   [`character-entities-invalid`](https://github.com/wooorm/character-entities-invalid)
    — info on invalid numeric character references
*   [`character-entities-legacy`](https://github.com/wooorm/character-entities-legacy)
    — info on legacy named character references

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/character-entities-html4/workflows/main/badge.svg

[build]: https://github.com/wooorm/character-entities-html4/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/character-entities-html4.svg

[coverage]: https://codecov.io/github/wooorm/character-entities-html4

[downloads-badge]: https://img.shields.io/npm/dm/character-entities-html4.svg

[downloads]: https://www.npmjs.com/package/character-entities-html4

[size-badge]: https://img.shields.io/bundlephobia/minzip/character-entities-html4.svg

[size]: https://bundlephobia.com/result?p=character-entities-html4

[npm]: https://docs.npmjs.com/cli/install

[skypack]: https://www.skypack.dev

[license]: license

[author]: https://wooorm.com

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/

[parse-entities]: https://github.com/wooorm/parse-entities

[stringify-entities]: https://github.com/wooorm/stringify-entities

[html]: https://www.w3.org/TR/html4/sgml/entities.html
