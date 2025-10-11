<h1>
  <img src="https://raw.githubusercontent.com/vfile/vfile/fc8164b/logo.svg?sanitize=true" alt="vfile" />
</h1>

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**vfile** is a small and browser friendly virtual file format that tracks
metadata about files (such as its `path` and `value`) and lint
[messages][api-vfile-messages].

## Contents

* [unified](#unified)
* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`VFile(options?)`](#vfileoptions)
  * [`file.cwd`](#filecwd)
  * [`file.data`](#filedata)
  * [`file.history`](#filehistory)
  * [`file.messages`](#filemessages)
  * [`file.value`](#filevalue)
  * [`file.basename`](#filebasename)
  * [`file.dirname`](#filedirname)
  * [`file.extname`](#fileextname)
  * [`file.path`](#filepath)
  * [`file.stem`](#filestem)
  * [`VFile#fail(reason[, options])`](#vfilefailreason-options)
  * [`VFile#info(reason[, options])`](#vfileinforeason-options)
  * [`VFile#message(reason[, options])`](#vfilemessagereason-options)
  * [`VFile#toString(encoding?)`](#vfiletostringencoding)
  * [`Compatible`](#compatible)
  * [`Data`](#data)
  * [`DataMap`](#datamap)
  * [`Map`](#map)
  * [`MessageOptions`](#messageoptions)
  * [`Options`](#options)
  * [`Reporter`](#reporter)
  * [`ReporterSettings`](#reportersettings)
  * [`Value`](#value)
  * [Well-known](#well-known)
* [List of utilities](#list-of-utilities)
* [Reporters](#reporters)
* [Types](#types)
* [Compatibility](#compatibility)
* [Contribute](#contribute)
* [Sponsor](#sponsor)
* [Acknowledgments](#acknowledgments)
* [License](#license)

## unified

**vfile** is part of the unified collective.

* for more about us, see [`unifiedjs.com`][site]
* for how the collective is governed, see [`unifiedjs/collective`][governance]
* for updates, see [@unifiedjs][twitter] on Twitter

## What is this?

This package provides a virtual file format.
It exposes an API to access the file value, path, metadata about the file, and
specifically supports attaching lint messages and errors to certain places in
these files.

## When should I use this?

The virtual file format is useful when dealing with the concept of files in
places where you might not be able to access the file system.
The message API is particularly useful when making things that check files (as
in, linting).

vfile is made for [unified][], which amongst other things checks files.
However, vfile can be used in other projects that deal with parsing,
transforming, and serializing data, to build linters, compilers, static site
generators, and other build tools.

This is different from the excellent [`vinyl`][vinyl] in that vfile has a
smaller API, a smaller size, and focuses on messages.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install vfile
```

In Deno with [`esm.sh`][esmsh]:

```js
import {VFile} from 'https://esm.sh/vfile@6'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {VFile} from 'https://esm.sh/vfile@6?bundle'
</script>
```

## Use

```js
import {VFile} from 'vfile'

const file = new VFile({
  path: '~/example.txt',
  value: 'Alpha *braavo* charlie.'
})

console.log(file.path) // => '~/example.txt'
console.log(file.dirname) // => '~'

file.extname = '.md'

console.log(file.basename) // => 'example.md'

file.basename = 'index.text'

console.log(file.history) // => ['~/example.txt', '~/example.md', '~/index.text']

file.message('Unexpected unknown word `braavo`, did you mean `bravo`?', {
  place: {line: 1, column: 8},
  source: 'spell',
  ruleId: 'typo'
})

console.log(file.messages)
```

Yields:

```txt
[
  [~/index.text:1:8: Unexpected unknown word `braavo`, did you mean `bravo`?] {
    ancestors: undefined,
    cause: undefined,
    column: 8,
    fatal: false,
    line: 1,
    place: { line: 1, column: 8 },
    reason: 'Unexpected unknown word `braavo`, did you mean `bravo`?',
    ruleId: 'typo',
    source: 'spell',
    file: '~/index.text'
  }
]
```

## API

This package exports the identifier [`VFile`][api-vfile].
There is no default export.

### `VFile(options?)`

Create a new virtual file.

`options` is treated as:

* `string` or [`Uint8Array`][mdn-uint8-array] — `{value: options}`
* `URL` — `{path: options}`
* `VFile` — shallow copies its data over to the new file
* `object` — all fields are shallow copied over to the new file

Path related fields are set in the following order (least specific to
most specific): `history`, `path`, `basename`, `stem`, `extname`,
`dirname`.

You cannot set `dirname` or `extname` without setting either `history`,
`path`, `basename`, or `stem` too.

###### Parameters

* `options` ([`Compatible`][api-compatible], optional)
  — file value

###### Returns

New instance (`VFile`).

###### Example

```js
new VFile()
new VFile('console.log("alpha");')
new VFile(new Uint8Array([0x65, 0x78, 0x69, 0x74, 0x20, 0x31]))
new VFile({path: path.join('path', 'to', 'readme.md')})
new VFile({stem: 'readme', extname: '.md', dirname: path.join('path', 'to')})
new VFile({other: 'properties', are: 'copied', ov: {e: 'r'}})
```

### `file.cwd`

Base of `path` (`string`, default: `process.cwd()` or `'/'` in browsers).

### `file.data`

Place to store custom info (`Record<string, unknown>`, default: `{}`).

It’s OK to store custom data directly on the file but moving it to `data` is
recommended.

### `file.history`

List of file paths the file moved between (`Array<string>`).

The first is the original path and the last is the current path.

### `file.messages`

List of messages associated with the file
([`Array<VFileMessage>`][api-vfile-message]).

### `file.value`

Raw value ([`Uint8Array`][mdn-uint8-array], `string`, `undefined`).

### `file.basename`

Get or set the basename (including extname) (`string?`, example: `'index.min.js'`).

Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'` on
windows).
Cannot be nullified (use `file.path = file.dirname` instead).

### `file.dirname`

Get or set the parent path (`string?`, example: `'~'`).

Cannot be set if there’s no `path` yet.

### `file.extname`

Get or set the extname (including dot) (`string?`, example: `'.js'`).

Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'` on
windows).
Cannot be set if there’s no `path` yet.

### `file.path`

Get or set the full path (`string?`, example: `'~/index.min.js'`).

Cannot be nullified.
You can set a file URL (a `URL` object with a `file:` protocol) which will be
turned into a path with [`url.fileURLToPath`][file-url-to-path].

### `file.stem`

Get or set the stem (basename w/o extname) (`string?`, example: `'index.min'`).

Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'` on
windows).
Cannot be nullified.

### `VFile#fail(reason[, options])`

Create a fatal message for `reason` associated with the file.

The `fatal` field of the message is set to `true` (error; file not usable) and
the `file` field is set to the current file path.
The message is added to the `messages` field on `file`.

> 🪦 **Note**: also has obsolete signatures.

###### Parameters

* `reason` (`string`)
  — reason for message, should use markdown
* `options` ([`MessageOptions`][api-message-options], optional)
  — configuration

###### Returns

Nothing (`never`).

###### Throws

Message ([`VFileMessage`][vmessage]).

### `VFile#info(reason[, options])`

Create an info message for `reason` associated with the file.

The `fatal` field of the message is set to `undefined` (info; change likely not
needed) and the `file` field is set to the current file path.
The message is added to the `messages` field on `file`.

> 🪦 **Note**: also has obsolete signatures.

###### Parameters

* `reason` (`string`)
  — reason for message, should use markdown
* `options` ([`MessageOptions`][api-message-options], optional)
  — configuration

###### Returns

Message ([`VFileMessage`][vmessage]).

### `VFile#message(reason[, options])`

Create a message for `reason` associated with the file.

The `fatal` field of the message is set to `false` (warning; change may be
needed) and the `file` field is set to the current file path.
The message is added to the `messages` field on `file`.

> 🪦 **Note**: also has obsolete signatures.

###### Parameters

* `reason` (`string`)
  — reason for message, should use markdown
* `options` ([`MessageOptions`][api-message-options], optional)
  — configuration

###### Returns

Message ([`VFileMessage`][vmessage]).

### `VFile#toString(encoding?)`

Serialize the file.

> **Note**: which encodings are supported depends on the engine.
> For info on Node.js, see:
> <https://nodejs.org/api/util.html#whatwg-supported-encodings>.

###### Parameters

* `encoding` (`string`, default: `'utf8'`)
  — character encoding to understand `value` as when it’s a
  [`Uint8Array`][mdn-uint8-array]

###### Returns

Serialized file (`string`).

### `Compatible`

Things that can be passed to the constructor (TypeScript type).

###### Type

```ts
type Compatible = Options | URL | VFile | Value
```

### `Data`

Custom info (TypeScript type).

Known attributes can be added to [`DataMap`][api-data-map].

###### Type

```ts
type Data = Record<string, unknown> & Partial<DataMap>
```

### `DataMap`

This map registers the type of the `data` key of a `VFile` (TypeScript type).

This type can be augmented to register custom `data` types.

###### Type

```ts
interface DataMap {}
```

###### Example

```ts
declare module 'vfile' {
  interface DataMap {
    // `file.data.name` is typed as `string`
    name: string
  }
}
```

### `Map`

Raw source map (TypeScript type).

See [`source-map`][source-map].

###### Fields

* `version` (`number`)
  — which version of the source map spec this map is following
* `sources` (`Array<string>`)
  — an array of URLs to the original source files
* `names` (`Array<string>`)
  — an array of identifiers which can be referenced by individual mappings
* `sourceRoot` (`string`, optional)
  — the URL root from which all sources are relative
* `sourcesContent` (`Array<string>`, optional)
  — an array of contents of the original source files
* `mappings` (`string`)
  — a string of base64 VLQs which contain the actual mappings
* `file` (`string`)
  — the generated file this source map is associated with

### `MessageOptions`

Options to create messages (TypeScript type).

See [`Options` in `vfile-message`][vfile-message-options].

### `Options`

An object with arbitrary fields and the following known fields (TypeScript
type).

###### Fields

* `basename` (`string`, optional)
  — set `basename` (name)
* `cwd` (`string`, optional)
  — set `cwd` (working directory)
* `data` ([`Data`][api-data], optional)
  — set `data` (associated info)
* `dirname` (`string`, optional)
  — set `dirname` (path w/o basename)
* `extname` (`string`, optional)
  — set `extname` (extension with dot)
* `history` (`Array<string>`, optional)
  — set `history` (paths the file moved between)
* `path` (`URL | string`, optional)
  — set `path` (current path)
* `stem` (`string`, optional)
  — set `stem` (name without extension)
* `value` ([`Value`][api-value], optional)
  — set `value` (the contents of the file)

### `Reporter`

Type for a reporter (TypeScript type).

###### Type

```ts
type Reporter<Settings = ReporterSettings> = (
  files: Array<VFile>,
  options: Settings
) => string
```

### `ReporterSettings`

Configuration for reporters (TypeScript type).

###### Type

```ts
type ReporterSettings = Record<string, unknown>
```

### `Value`

Contents of the file (TypeScript type).

Can either be text or a [`Uint8Array`][mdn-uint8-array] structure.

###### Type

```ts
type Value = Uint8Array | string
```

### Well-known

The following fields are considered “non-standard”, but they are allowed, and
some utilities use them:

* `map` ([`Map`][api-map])
  — source map; this type is equivalent to the `RawSourceMap` type from the
  `source-map` module
* `result` (`unknown`)
  — custom, non-string, compiled, representation; this is used by unified to
  store non-string results; one example is when turning markdown into React
  nodes
* `stored` (`boolean`)
  — whether a file was saved to disk; this is used by vfile reporters

There are also well-known fields on messages, see
[them in a similar section of
`vfile-message`](https://github.com/vfile/vfile-message#well-known).

<a name="utilities"></a>

## List of utilities

* [`convert-vinyl-to-vfile`](https://github.com/dustinspecker/convert-vinyl-to-vfile)
  — transform from [Vinyl][]
* [`to-vfile`](https://github.com/vfile/to-vfile)
  — create a file from a file path and read and write to the file system
* [`vfile-find-down`](https://github.com/vfile/vfile-find-down)
  — find files by searching the file system downwards
* [`vfile-find-up`](https://github.com/vfile/vfile-find-up)
  — find files by searching the file system upwards
* [`vfile-glob`](https://github.com/shinnn/vfile-glob)
  — find files by glob patterns
* [`vfile-is`](https://github.com/vfile/vfile-is)
  — check if a file passes a test
* [`vfile-location`](https://github.com/vfile/vfile-location)
  — convert between positional and offset locations
* [`vfile-matter`](https://github.com/vfile/vfile-matter)
  — parse the YAML front matter
* [`vfile-message`](https://github.com/vfile/vfile-message)
  — create a file message
* [`vfile-messages-to-vscode-diagnostics`](https://github.com/shinnn/vfile-messages-to-vscode-diagnostics)
  — transform file messages to VS Code diagnostics
* [`vfile-mkdirp`](https://github.com/vfile/vfile-mkdirp)
  — make sure the directory of a file exists on the file system
* [`vfile-rename`](https://github.com/vfile/vfile-rename)
  — rename the path parts of a file
* [`vfile-sort`](https://github.com/vfile/vfile-sort)
  — sort messages by line/column
* [`vfile-statistics`](https://github.com/vfile/vfile-statistics)
  — count messages per category: failures, warnings, etc
* [`vfile-to-eslint`](https://github.com/vfile/vfile-to-eslint)
  — convert to ESLint formatter compatible output

> 👉 **Note**: see [unist][] for projects that work with nodes.

## Reporters

* [`vfile-reporter`][reporter]
  — create a report
* [`vfile-reporter-json`](https://github.com/vfile/vfile-reporter-json)
  — create a JSON report
* [`vfile-reporter-folder-json`](https://github.com/vfile/vfile-reporter-folder-json)
  — create a JSON representation of vfiles
* [`vfile-reporter-pretty`](https://github.com/vfile/vfile-reporter-pretty)
  — create a pretty report
* [`vfile-reporter-junit`](https://github.com/kellyselden/vfile-reporter-junit)
  — create a jUnit report
* [`vfile-reporter-position`](https://github.com/Hocdoc/vfile-reporter-position)
  — create a report with content excerpts

> 👉 **Note**: want to make your own reporter?
> Reporters *must* accept `Array<VFile>` as their first argument, and return
> `string`.
> Reporters *may* accept other values too, in which case it’s suggested to stick
> to `vfile-reporter`s interface.

## Types

This package is fully typed with [TypeScript][].
It exports the additional types
[`Compatible`][api-compatible],
[`Data`][api-data],
[`DataMap`][api-data-map],
[`Map`][api-map],
[`MessageOptions`][api-message-options],
[`Options`][api-options],
[`Reporter`][api-reporter],
[`ReporterSettings`][api-reporter-settings], and
[`Value`][api-value].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `vfile@^6`,
compatible with Node.js 16.

## Contribute

See [`contributing.md`][contributing] in [`vfile/.github`][health] for ways to
get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## Sponsor

Support this effort and give back by sponsoring on [OpenCollective][collective]!

<table>
<tr valign="middle">
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://vercel.com">Vercel</a><br><br>
  <a href="https://vercel.com"><img src="https://avatars1.githubusercontent.com/u/14985020?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://motif.land">Motif</a><br><br>
  <a href="https://motif.land"><img src="https://avatars1.githubusercontent.com/u/74457950?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.hashicorp.com">HashiCorp</a><br><br>
  <a href="https://www.hashicorp.com"><img src="https://avatars1.githubusercontent.com/u/761456?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.gitbook.com">GitBook</a><br><br>
  <a href="https://www.gitbook.com"><img src="https://avatars1.githubusercontent.com/u/7111340?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.gatsbyjs.org">Gatsby</a><br><br>
  <a href="https://www.gatsbyjs.org"><img src="https://avatars1.githubusercontent.com/u/12551863?s=256&v=4" width="128"></a>
</td>
</tr>
<tr valign="middle">
</tr>
<tr valign="middle">
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.netlify.com">Netlify</a><br><br>
  <!--OC has a sharper image-->
  <a href="https://www.netlify.com"><img src="https://images.opencollective.com/netlify/4087de2/logo/256.png" width="128"></a>
</td>
<td width="10%" align="center">
  <a href="https://www.coinbase.com">Coinbase</a><br><br>
  <a href="https://www.coinbase.com"><img src="https://avatars1.githubusercontent.com/u/1885080?s=256&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://themeisle.com">ThemeIsle</a><br><br>
  <a href="https://themeisle.com"><img src="https://avatars1.githubusercontent.com/u/58979018?s=128&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://expo.io">Expo</a><br><br>
  <a href="https://expo.io"><img src="https://avatars1.githubusercontent.com/u/12504344?s=128&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://boostnote.io">Boost Note</a><br><br>
  <a href="https://boostnote.io"><img src="https://images.opencollective.com/boosthub/6318083/logo/128.png" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://markdown.space">Markdown Space</a><br><br>
  <a href="https://markdown.space"><img src="https://images.opencollective.com/markdown-space/e1038ed/logo/128.png" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://www.holloway.com">Holloway</a><br><br>
  <a href="https://www.holloway.com"><img src="https://avatars1.githubusercontent.com/u/35904294?s=128&v=4" width="64"></a>
</td>
<td width="10%"></td>
<td width="10%"></td>
</tr>
<tr valign="middle">
<td width="100%" align="center" colspan="8">
  <br>
  <a href="https://opencollective.com/unified"><strong>You?</strong></a>
  <br><br>
</td>
</tr>
</table>

## Acknowledgments

The initial release of this project was authored by
[**@wooorm**](https://github.com/wooorm).

Thanks to [**@contra**](https://github.com/contra),
[**@phated**](https://github.com/phated), and others for their work on
[Vinyl][], which was a huge inspiration.

Thanks to
[**@brendo**](https://github.com/brendo),
[**@shinnn**](https://github.com/shinnn),
[**@KyleAMathews**](https://github.com/KyleAMathews),
[**@sindresorhus**](https://github.com/sindresorhus), and
[**@denysdovhan**](https://github.com/denysdovhan)
for contributing commits since!

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/vfile/vfile/workflows/main/badge.svg

[build]: https://github.com/vfile/vfile/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/vfile/vfile.svg

[coverage]: https://codecov.io/github/vfile/vfile

[downloads-badge]: https://img.shields.io/npm/dm/vfile.svg

[downloads]: https://www.npmjs.com/package/vfile

[size-badge]: https://img.shields.io/badge/dynamic/json?label=minzipped%20size&query=$.size.compressedSize&url=https://deno.bundlejs.com/?q=vfile

[size]: https://bundlejs.com/?q=vfile

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/vfile/vfile/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[health]: https://github.com/vfile/.github

[contributing]: https://github.com/vfile/.github/blob/main/contributing.md

[support]: https://github.com/vfile/.github/blob/main/support.md

[coc]: https://github.com/vfile/.github/blob/main/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[unified]: https://github.com/unifiedjs/unified

[vinyl]: https://github.com/gulpjs/vinyl

[site]: https://unifiedjs.com

[twitter]: https://twitter.com/unifiedjs

[unist]: https://github.com/syntax-tree/unist#list-of-utilities

[reporter]: https://github.com/vfile/vfile-reporter

[vmessage]: https://github.com/vfile/vfile-message

[vfile-message-options]: https://github.com/vfile/vfile-message#options

[mdn-uint8-array]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array

[source-map]: https://github.com/mozilla/source-map/blob/58819f0/source-map.d.ts#L15-L23

[file-url-to-path]: https://nodejs.org/api/url.html#url_url_fileurltopath_url

[governance]: https://github.com/unifiedjs/collective

[api-vfile-messages]: #filemessages

[api-vfile-message]: #vfilemessagereason-options

[api-vfile]: #vfileoptions

[api-compatible]: #compatible

[api-data]: #data

[api-data-map]: #datamap

[api-map]: #map

[api-message-options]: #messageoptions

[api-options]: #options

[api-reporter]: #reporter

[api-reporter-settings]: #reportersettings

[api-value]: #value
