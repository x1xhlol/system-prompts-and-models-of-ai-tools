# vfile-message

[![Build][badge-build-image]][badge-build-url]
[![Coverage][badge-coverage-image]][badge-coverage-url]
[![Downloads][badge-downloads-image]][badge-downloads-url]
[![Size][badge-size-image]][badge-size-url]

Create [vfile][github-vfile] messages.

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`VFileMessage(reason[, options])`](#vfilemessagereason-options)
  * [`Options`](#options)
  * [Well-known](#well-known)
* [Compatibility](#compatibility)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package provides a (lint) message format.

## When should I use this?

In most cases,
you can use `file.message` from `VFile` itself,
but in some cases you might not have a file,
and still want to emit warnings or errors,
in which case this can be used directly.

## Install

This package is [ESM only][github-gist-esm].
In Node.js (version 16+),
install with [npm][npmjs-install]:

```sh
npm install vfile-message
```

In Deno with [`esm.sh`][esmsh]:

```js
import {VFileMessage} from 'https://esm.sh/vfile-message@4'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {VFileMessage} from 'https://esm.sh/vfile-message@4?bundle'
</script>
```

## Use

```js
import {VFileMessage} from 'vfile-message'

const message = new VFileMessage(
  'Unexpected unknown word `braavo`, did you mean `bravo`?',
  {place: {column: 8, line: 1}, ruleId: 'typo', source: 'spell'}
)

console.log(message)
```

Yields:

```text
[1:8: Unexpected unknown word `braavo`, did you mean `bravo`?] {
  reason: 'Unexpected unknown word `braavo`, did you mean `bravo`?',
  line: 1,
  column: 8,
  ancestors: undefined,
  cause: undefined,
  fatal: undefined,
  place: {line: 1, column: 8},
  ruleId: 'typo',
  source: 'spell'
}
```

## API

This package exports the identifier [`VFileMessage`][api-vfile-message].
There is no default export.
It exports the additional [TypeScript][] type [`Options`][api-options].

### `VFileMessage(reason[, options])`

Create a message for `reason`.

> 🪦 **Note**: also has obsolete signatures.

###### Parameters

* `reason` (`string`)
  — reason for message (should use markdown)
* `options` ([`Options`][api-options], optional)
  — configuration.

###### Extends

[`Error`][developer-mozilla-error].

###### Returns

Instance of `VFileMessage`.

###### Fields

* `ancestors` ([`Array<Node>`][github-unist-node] or `undefined`)
  — stack of (inclusive) ancestor nodes surrounding the message
* `cause` ([`Error`][developer-mozilla-error] or `undefined`)
  — original error cause of the message
* `column` (`number` or `undefined`)
  — starting column of message
* `fatal` (`boolean` or `undefined`)
  — state of problem; `true`: error, file not usable; `false`: warning,
  change may be needed; `undefined`: info, change likely not needed
* `line` (`number` or `undefined`)
  — starting line of message
* `place` ([`Point`][github-unist-point], [`Position`][github-unist-position]
  or `undefined`)
  — place of message
* `reason` (`string`)
  — reason for message (should use markdown)
* `ruleId` (`string` or `undefined`, example: `'my-rule'`)
  — category of message
* `source` (`string` or `undefined`, example: `'my-package'`)
  — namespace of message

### `Options`

Configuration (TypeScript type).

###### Fields

* `ancestors` ([`Array<Node>`][github-unist-node], optional)
  — stack of (inclusive) ancestor nodes surrounding the message
* `cause` ([`Error`][developer-mozilla-error], optional)
  — original error cause of the message
* `place` ([`Point`][github-unist-point] or [`Position`][github-unist-position],
  optional)
  — place of message
* `ruleId` (`string`, optional, example: `'my-rule'`)
  — category of message
* `source` (`string`, optional, , example: `'my-package'`)
  — namespace of who sent the message

### Well-known

It’s OK to store custom data directly on the `VFileMessage`, some of those are
handled by [utilities][github-vfile-util].
The following fields are documented and typed here.

###### Fields

* `actual` (`string`, optional)
  — specify the source value that’s being reported, which is deemed incorrect
* `expected` (`Array<string>`, optional)
  — suggest acceptable values that can be used instead of `actual`
* `url` (`string`, optional)
  — link to docs for the message (this must be an absolute URL that can be
  passed as `x` to `new URL(x)`)
* `note` (`string`, optional)
  — long form description of the message (you should use markdown)

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `vfile-message@^4`,
compatible with Node.js 16.

## Contribute

See [`contributing.md`][health-contributing] in [`vfile/.github`][health]
for ways to get started.
See [`support.md`][health-support] for ways to get help.

This project has a [code of conduct][health-coc].
By interacting with this repository,
organization,
or community you agree to abide by its terms.

## License

[MIT][file-license] © [Titus Wormer][wooorm]

<!-- Definitions -->

[api-options]: #options

[api-vfile-message]: #vfilemessagereason-options

[badge-build-image]: https://github.com/vfile/vfile-message/workflows/main/badge.svg

[badge-build-url]: https://github.com/vfile/vfile-message/actions

[badge-coverage-image]: https://img.shields.io/codecov/c/github/vfile/vfile-message.svg

[badge-coverage-url]: https://codecov.io/github/vfile/vfile-message

[badge-downloads-image]: https://img.shields.io/npm/dm/vfile-message.svg

[badge-downloads-url]: https://www.npmjs.com/package/vfile-message

[badge-size-image]: https://img.shields.io/bundlejs/size/vfile-message

[badge-size-url]: https://bundlejs.com/?q=vfile-message

[developer-mozilla-error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error

[esmsh]: https://esm.sh

[file-license]: license

[github-gist-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[github-unist-node]: https://github.com/syntax-tree/unist#node

[github-unist-point]: https://github.com/syntax-tree/unist#point

[github-unist-position]: https://github.com/syntax-tree/unist#position

[github-vfile]: https://github.com/vfile/vfile

[github-vfile-util]: https://github.com/vfile/vfile#utilities

[health]: https://github.com/vfile/.github

[health-coc]: https://github.com/vfile/.github/blob/main/code-of-conduct.md

[health-contributing]: https://github.com/vfile/.github/blob/main/contributing.md

[health-support]: https://github.com/vfile/.github/blob/main/support.md

[npmjs-install]: https://docs.npmjs.com/cli/install

[typescript]: https://www.typescriptlang.org

[wooorm]: https://wooorm.com
