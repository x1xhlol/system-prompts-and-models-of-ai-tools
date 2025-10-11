# unist-util-visit-parents

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[unist][] utility to walk the tree with a stack of parents.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`visitParents(tree[, test], visitor[, reverse])`](#visitparentstree-test-visitor-reverse)
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

You can use this utility when you want to walk the tree and want to know about
every parent of each node.
You can use [`unist-util-visit`][unist-util-visit] if you don’t care about the
entire stack of parents.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install unist-util-visit-parents
```

In Deno with [`esm.sh`][esmsh]:

```js
import {visitParents} from 'https://esm.sh/unist-util-visit-parents@6'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {visitParents} from 'https://esm.sh/unist-util-visit-parents@6?bundle'
</script>
```

## Use

```js
import {visitParents} from 'unist-util-visit-parents'
import {fromMarkdown} from 'mdast-util-from-markdown'

const tree = fromMarkdown('Some *emphasis*, **strong**, and `code`.')

visitParents(tree, 'strong', function (node, ancestors) {
  console.log(node.type, ancestors.map(ancestor => ancestor.type))
})
```

Yields:

```js
strong ['root', 'paragraph']
```

## API

This package exports the identifiers [`CONTINUE`][api-continue],
[`EXIT`][api-exit], [`SKIP`][api-skip], and [`visitParents`][api-visitparents].
There is no default export.

### `visitParents(tree[, test], visitor[, reverse])`

Visit nodes, with ancestral information.

This algorithm performs *[depth-first][]* *[tree traversal][tree-traversal]*
in *[preorder][]* (**NLR**) or if `reverse` is given, in *reverse preorder*
(**NRL**).

You can choose for which nodes `visitor` is called by passing a `test`.
For complex tests, you should test yourself in `visitor`, as it will be
faster and will have improved type information.

Walking the tree is an intensive task.
Make use of the return values of the visitor when possible.
Instead of walking a tree multiple times, walk it once, use
[`unist-util-is`][unist-util-is] to check if a node matches, and then perform
different operations.

You can change the tree.
See [`Visitor`][api-visitor] for more info.

###### Parameters

*   `tree` ([`Node`][node])
    — tree to traverse
*   `test` ([`Test`][api-test], optional)
    — [`unist-util-is`][unist-util-is]-compatible test
*   `visitor` ([`Visitor`][api-visitor])
    — handle each node
*   `reverse` (`boolean`, default: `false`)
    — traverse in reverse preorder (NRL) instead of the default preorder (NLR)

###### Returns

Nothing (`undefined`).

### `CONTINUE`

Continue traversing as normal (`true`).

### `EXIT`

Stop traversing immediately (`false`).

### `SKIP`

Do not traverse this node’s children (`'skip'`).

### `Action`

Union of the action types (TypeScript type).

###### Type

```ts
type Action = typeof CONTINUE | typeof EXIT | typeof SKIP
```

### `ActionTuple`

List with one or two values, the first an action, the second an index
(TypeScript type).

###### Type

```ts
type ActionTuple = [
  (Action | null | undefined | void)?,
  (Index | null | undefined)?
]
```

### `BuildVisitor`

Build a typed `Visitor` function from a tree and a test (TypeScript type).

It will infer which values are passed as `node` and which as `parents`.

###### Type parameters

*   `Tree` ([`Node`][node], default: `Node`)
    — tree type
*   `Check` ([`Test`][api-test], default: `Test`)
    — test type

###### Returns

[`Visitor`][api-visitor].

### `Index`

Move to the sibling at `index` next (after node itself is completely
traversed) (TypeScript type).

Useful if mutating the tree, such as removing the node the visitor is currently
on, or any of its previous siblings.
Results less than `0` or greater than or equal to `children.length` stop
traversing the parent.

###### Type

```ts
type Index = number
```

### `Test`

[`unist-util-is`][unist-util-is] compatible test (TypeScript type).

### `Visitor`

Handle a node (matching `test`, if given) (TypeScript type).

Visitors are free to transform `node`.
They can also transform the parent of node (the last of `ancestors`).

Replacing `node` itself, if `SKIP` is not returned, still causes its
descendants to be walked (which is a bug).

When adding or removing previous siblings of `node` (or next siblings, in
case of reverse), the `Visitor` should return a new `Index` to specify the
sibling to traverse after `node` is traversed.
Adding or removing next siblings of `node` (or previous siblings, in case
of reverse) is handled as expected without needing to return a new `Index`.

Removing the children property of an ancestor still results in them being
traversed.

###### Parameters

*   `node` ([`Node`][node])
    — found node
*   `parents` ([`Array<Node>`][node])
    — ancestors of `node`

###### Returns

What to do next.

An `Index` is treated as a tuple of `[CONTINUE, Index]`.
An `Action` is treated as a tuple of `[Action]`.

Passing a tuple back only makes sense if the `Action` is `SKIP`.
When the `Action` is `EXIT`, that action can be returned.
When the `Action` is `CONTINUE`, `Index` can be returned.

### `VisitorResult`

Any value that can be returned from a visitor (TypeScript type).

###### Type

```ts
type VisitorResult =
  | Action
  | ActionTuple
  | Index
  | null
  | undefined
  | void
```

## Types

This package is fully typed with [TypeScript][].
It exports the additional types [`Action`][api-action],
[`ActionTuple`][api-actiontuple], [`BuildVisitor`][api-buildvisitor],
[`Index`][api-index], [`Test`][api-test], [`Visitor`][api-visitor], and
[`VisitorResult`][api-visitorresult].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line,
`unist-util-visit-parents@^6`, compatible with Node.js 16.

## Related

*   [`unist-util-visit`](https://github.com/syntax-tree/unist-util-visit)
    — walk the tree with one parent
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

[build-badge]: https://github.com/syntax-tree/unist-util-visit-parents/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/unist-util-visit-parents/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/unist-util-visit-parents.svg

[coverage]: https://codecov.io/github/syntax-tree/unist-util-visit-parents

[downloads-badge]: https://img.shields.io/npm/dm/unist-util-visit-parents.svg

[downloads]: https://www.npmjs.com/package/unist-util-visit-parents

[size-badge]: https://img.shields.io/badge/dynamic/json?label=minzipped%20size&query=$.size.compressedSize&url=https://deno.bundlejs.com/?q=unist-util-visit-parents

[size]: https://bundlejs.com/?q=unist-util-visit-parents

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

[contributing]: https://github.com/syntax-tree/.github/blob/HEAD/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/HEAD/support.md

[coc]: https://github.com/syntax-tree/.github/blob/HEAD/code-of-conduct.md

[unist]: https://github.com/syntax-tree/unist

[node]: https://github.com/syntax-tree/unist#node

[depth-first]: https://github.com/syntax-tree/unist#depth-first-traversal

[tree-traversal]: https://github.com/syntax-tree/unist#tree-traversal

[preorder]: https://github.com/syntax-tree/unist#preorder

[unist-util-visit]: https://github.com/syntax-tree/unist-util-visit

[unist-util-is]: https://github.com/syntax-tree/unist-util-is

[api-visitparents]: #visitparentstree-test-visitor-reverse

[api-continue]: #continue

[api-exit]: #exit

[api-skip]: #skip

[api-action]: #action

[api-actiontuple]: #actiontuple

[api-buildvisitor]: #buildvisitor

[api-index]: #index

[api-test]: #test

[api-visitor]: #visitor

[api-visitorresult]: #visitorresult
