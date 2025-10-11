# unist-util-visit

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[unist][] utility to walk the tree.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`visit(tree[, test], visitor[, reverse])`](#visittree-test-visitor-reverse)
    *   [`CONTINUE`](#continue)
    *   [`EXIT`](#exit)
    *   [`SKIP`](#skip)
    *   [`Action`](#action)
    *   [`ActionTuple`](#actiontuple)
    *   [`BuildVisitor`](#buildvisitor)
    *   [`Index`](#index)
    *   [`Test`](#test)
    *   [`Visitor`](#visitor)
    *   [`VisitorResult`](#visitorresult)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This is a very important utility for working with unist as it lets you walk the
tree.

## When should I use this?

You can use this utility when you want to walk the tree.
You can use [`unist-util-visit-parents`][vp] if you care about the entire stack
of parents.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install unist-util-visit
```

In Deno with [`esm.sh`][esmsh]:

```js
import {CONTINUE, EXIT, SKIP, visit} from 'https://esm.sh/unist-util-visit@5'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {CONTINUE, EXIT, SKIP, visit} from 'https://esm.sh/unist-util-visit@5?bundle'
</script>
```

## Use

```js
import {fromMarkdown} from 'mdast-util-from-markdown'
import {visit} from 'unist-util-visit'

const tree = fromMarkdown('Some *emphasis*, **strong**, and `code`.')

visit(tree, 'text', function (node, index, parent) {
  console.log([node.value, parent ? parent.type : index])
})
```

Yields:

```js
[ 'Some ', 'paragraph' ]
[ 'emphasis', 'emphasis' ]
[ ', ', 'paragraph' ]
[ 'strong', 'strong' ]
[ ', and ', 'paragraph' ]
[ '.', 'paragraph' ]
```

## API

This package exports the identifiers [`CONTINUE`][api-continue],
[`EXIT`][api-exit], [`SKIP`][api-skip], and [`visit`][api-visit].
There is no default export.

### `visit(tree[, test], visitor[, reverse])`

This function works exactly the same as [`unist-util-visit-parents`][vp],
but [`Visitor`][api-visitor] has a different signature.

### `CONTINUE`

Continue traversing as normal (`true`).

### `EXIT`

Stop traversing immediately (`false`).

### `SKIP`

Do not traverse this node’s children (`'skip'`).

### `Action`

Union of the action types (TypeScript type).
See [`Action` in `unist-util-visit-parents`][vp-action].

### `ActionTuple`

List with an action and an index (TypeScript type).
See [`ActionTuple` in `unist-util-visit-parents`][vp-action-tuple].

### `BuildVisitor`

Build a typed `Visitor` function from a tree and a test (TypeScript type).
See [`BuildVisitor` in `unist-util-visit-parents`][vp-build-visitor].

### `Index`

Move to the sibling at `index` next (TypeScript type).
See [`Index` in `unist-util-visit-parents`][vp-index].

### `Test`

[`unist-util-is`][unist-util-is] compatible test (TypeScript type).

### `Visitor`

Handle a node (matching `test`, if given) (TypeScript type).

Visitors are free to transform `node`.
They can also transform `parent`.

Replacing `node` itself, if `SKIP` is not returned, still causes its
descendants to be walked (which is a bug).

When adding or removing previous siblings of `node` (or next siblings, in
case of reverse), the `Visitor` should return a new `Index` to specify the
sibling to traverse after `node` is traversed.
Adding or removing next siblings of `node` (or previous siblings, in case
of reverse) is handled as expected without needing to return a new `Index`.

Removing the children property of `parent` still results in them being
traversed.

###### Parameters

*   `node` ([`Node`][node])
    — found node
*   `index` (`number` or `undefined`)
    — index of `node` in `parent`
*   `parent` ([`Node`][node] or `undefined`)
    — parent of `node`

###### Returns

What to do next.

An `Index` is treated as a tuple of `[CONTINUE, Index]`.
An `Action` is treated as a tuple of `[Action]`.

Passing a tuple back only makes sense if the `Action` is `SKIP`.
When the `Action` is `EXIT`, that action can be returned.
When the `Action` is `CONTINUE`, `Index` can be returned.

### `VisitorResult`

Any value that can be returned from a visitor (TypeScript type).
See [`VisitorResult` in `unist-util-visit-parents`][vp-visitor-result].

## Types

This package is fully typed with [TypeScript][].
It exports the additional types [`Action`][api-action],
[`ActionTuple`][api-action-tuple], [`BuildVisitor`][api-build-visitor],
[`Index`][api-index], [`Test`][api-test], [`Visitor`][api-visitor], and
[`VisitorResult`][api-visitor-result].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `unist-util-visit@^5`,
compatible with Node.js 16.

## Related

*   [`unist-util-visit-parents`][vp]
    — walk the tree with a stack of parents
*   [`unist-util-filter`](https://github.com/syntax-tree/unist-util-filter)
    — create a new tree with all nodes that pass a test
*   [`unist-util-map`](https://github.com/syntax-tree/unist-util-map)
    — create a new tree with all nodes mapped by a given function
*   [`unist-util-flatmap`](https://gitlab.com/staltz/unist-util-flatmap)
    — create a new tree by mapping (to an array) with the given function
*   [`unist-util-remove`](https://github.com/syntax-tree/unist-util-remove)
    — remove nodes from a tree that pass a test
*   [`unist-util-select`](https://github.com/syntax-tree/unist-util-select)
    — select nodes with CSS-like selectors

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definition -->

[build-badge]: https://github.com/syntax-tree/unist-util-visit/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/unist-util-visit/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/unist-util-visit.svg

[coverage]: https://codecov.io/github/syntax-tree/unist-util-visit

[downloads-badge]: https://img.shields.io/npm/dm/unist-util-visit.svg

[downloads]: https://www.npmjs.com/package/unist-util-visit

[size-badge]: https://img.shields.io/badge/dynamic/json?label=minzipped%20size&query=$.size.compressedSize&url=https://deno.bundlejs.com/?q=unist-util-visit

[size]: https://bundlejs.com/?q=unist-util-visit

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

[node]: https://github.com/syntax-tree/unist#nodes

[unist-util-is]: https://github.com/syntax-tree/unist-util-is

[vp]: https://github.com/syntax-tree/unist-util-visit-parents

[vp-action]: https://github.com/syntax-tree/unist-util-visit-parents#action

[vp-action-tuple]: https://github.com/syntax-tree/unist-util-visit-parents#actiontuple

[vp-build-visitor]: https://github.com/syntax-tree/unist-util-visit-parents#buildvisitor

[vp-index]: https://github.com/syntax-tree/unist-util-visit-parents#index

[vp-visitor-result]: https://github.com/syntax-tree/unist-util-visit-parents#visitorresult

[api-visit]: #visittree-test-visitor-reverse

[api-continue]: #continue

[api-exit]: #exit

[api-skip]: #skip

[api-action]: #action

[api-action-tuple]: #actiontuple

[api-build-visitor]: #buildvisitor

[api-index]: #index

[api-test]: #test

[api-visitor]: #visitor

[api-visitor-result]: #visitorresult
