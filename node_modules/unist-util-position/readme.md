# unist-util-position

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[unist][] utility to get positional info of nodes.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`position(node)`](#positionnode)
    *   [`pointEnd(node)`](#pointendnode)
    *   [`pointStart(node)`](#pointstartnode)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This utility helps with accessing positional info on a potentially dirty tree.

## When should I use this?

The positional info is typically consistent and proper in unist trees generated
by our ecosystem, but, user plugins could mess that up.
If you’re making a reusable plugin, and accessing the positional info often, you
might want to guard against that by using this utility.

You might also find the utility [`unist-util-generated`][unist-util-generated]
useful to check whether a node is considered to be generated (not in the
original input file).

You might also enjoy
[`unist-util-stringify-position`][unist-util-stringify-position] when you want
to display positional info to users.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install unist-util-position
```

In Deno with [`esm.sh`][esmsh]:

```js
import {pointEnd, pointStart, position} from 'https://esm.sh/unist-util-position@5'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {pointEnd, pointStart, position} from 'https://esm.sh/unist-util-position@5?bundle'
</script>
```

## Use

```js
import {fromMarkdown} from 'mdast-util-from-markdown'
import {pointEnd, pointStart, position} from 'unist-util-position'

const tree = fromMarkdown('# foo\n\n* bar\n')

console.log(position(tree))
console.log(pointStart(tree))
console.log(pointEnd(tree))
```

Yields:

```js
{start: {line: 1, column: 1, offset: 0}, end: {line: 4, column: 1, offset: 13}}
{line: 1, column: 1, offset: 0}
{line: 4, column: 1, offset: 13}
```

## API

This package exports the identifiers [`pointEnd`][pointend],
[`pointStart`][pointstart], and [`position`][position].
There is no default export.

### `position(node)`

Get the positional info of `node`.

###### Parameters

*   `node` ([`Node`][node])
    — node

###### Returns

Position, if valid ([`Position`][unist-position] or `undefined`).

### `pointEnd(node)`

Get the ending point of `node`.

###### Parameters

*   `node` ([`Node`][node])
    — node

###### Returns

Point, if valid ([`Point`][unist-point] or `undefined`).

### `pointStart(node)`

Get the starting point of `node`.

###### Parameters

*   `node` ([`Node`][node])
    — node

###### Returns

Point, if valid ([`Point`][unist-point] or `undefined`).

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `unist-util-position@^5`,
compatible with Node.js 16.

## Related

*   [`unist-util-stringify-position`](https://github.com/syntax-tree/unist-util-stringify-position)
    — serialize a node, position, or point as a human readable location
*   [`unist-util-position-from-estree`](https://github.com/syntax-tree/unist-util-position-from-estree)
    — get a position from an estree node
*   [`unist-util-remove-position`](https://github.com/syntax-tree/unist-util-remove-position)
    — remove positions from tree
*   [`unist-util-generated`](https://github.com/syntax-tree/unist-util-generated)
    — check if a node is generated
*   [`unist-util-source`](https://github.com/syntax-tree/unist-util-source)
    — get the source of a node

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/unist-util-position/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/unist-util-position/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/unist-util-position.svg

[coverage]: https://codecov.io/github/syntax-tree/unist-util-position

[downloads-badge]: https://img.shields.io/npm/dm/unist-util-position.svg

[downloads]: https://www.npmjs.com/package/unist-util-position

[size-badge]: https://img.shields.io/badge/dynamic/json?label=minzipped%20size&query=$.size.compressedSize&url=https://deno.bundlejs.com/?q=unist-util-position

[size]: https://bundlejs.com/?q=unist-util-position

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[license]: license

[author]: https://wooorm.com

[health]: https://github.com/syntax-tree/.github

[contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/main/support.md

[coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[unist]: https://github.com/syntax-tree/unist

[node]: https://github.com/syntax-tree/unist#node

[unist-position]: https://github.com/syntax-tree/unist#position

[unist-point]: https://github.com/syntax-tree/unist#point

[unist-util-generated]: https://github.com/syntax-tree/unist-util-generated

[unist-util-stringify-position]: https://github.com/syntax-tree/unist-util-stringify-position

[position]: #positionnode

[pointend]: #pointendnode

[pointstart]: #pointstartnode
