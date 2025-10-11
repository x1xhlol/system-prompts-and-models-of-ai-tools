# Changelog

`MiniSearch` follows [semantic versioning](https://semver.org/spec/v2.0.0.html).

## v7.2.0

  - [fix] Relax the return type of `extractField` to allow non-string values
    (when a field is stored but not indexed, it can be any type)
  - Add `stringifyField` option to customize how field values are turned into strings
    for indexing

## v7.1.2

  - [fix] Correctly specify that MiniSearch targets ES9 (ES2018), not ES6
    (ES2015), due to the use of Unicode character class escapes in the
    tokenizer RegExp. Note: the README explains how to achieve ES2015
    compatibility.

## v7.1.1

  - [fix] Fix ability to pass the default `filter` search option in the
    constructor alongside other search options

## v7.1.0

  - Add `boostTerm` search option to apply a custom boosting factor to specific
    terms in the query

## v7.0.2

  - [fix] Fix regression on tokenizer producing blank terms when multiple
    contiguous spaces or punctuation characters are present in the input,
    introduced in `v7.0.0`.

## v7.0.1

  - [fix] Fix type definitions directory in `package.json` (by
    [@brenoepics](https://github.com/brenoepics)
  - [fix] Remove redundant versions of distribution files and simplify build

## v7.0.0

This is a major release, but the only real breaking change is that it targets
ES6 (ES2015) and later. This means that it will not work in legacy browsers,
most notably Internet Explorer 11 and earlier (by now well below 1% global
usage according to https://caniuse.com). Among other benefits, this reduces the
package size (from 8.8KB to 5.8KB minified and gzipped).

  - [breaking change] Target ES6 (ES2015) and later, dropping support for
    Internet Explorer 11 and earlier.
  - [breaking change] Better TypeScript type of `combineWith` search option
    values, catching invalid operators at compile time. Note that this is a
    breaking change only if one was using unlikely weird casing for the
    `combineWith` option. For example, `AND`, `and`, `And` are all still valid,
    but `aNd` won't compile anymore.
  - More informative error when specifying an invalid value for `combineWith`
    in JavaScript (in TypeScript this would be a compile time error)
  - Use the Unicode flag to simplify the tokenizer regular expression
  - Add `loadJSONAsync` method, to load a serialized index asynchronously

## v6.3.0 - 2023-11-22

  - Add `queryTerms` array to the search results. This is useful to determine
    which query terms were matched by each search result.

## v6.2.0 - 2023-10-26

  - Add the possibility to search for the special value `MiniSearch.wildcard` to
    match all documents, but still apply search options like filtering and
    document boosting

## v6.1.0 - 2023-05-15

  - Add `getStoredFields` method to retrieve the stored fields for a document
    given its ID.

  - Pass stored fields to the `boostDocument` callback function, making it
    easier to perform dynamic document boosting.

## v6.0.1 - 2023-02-01

  - [fix] The `boost` search option now does not interfere with the `fields`
    search option: if `fields` is specified, boosting a field that is not
    included in `fields` has no effect, and will not include such boosted field
    in the search.
  - [fix] When using `search` with a `QuerySpec`, the `combineWith` option is
    now properly taking its default from the `SearchOptions` given as the second
    argument.

## v6.0.0 - 2022-12-01

This is a major release. The most notable change is the addition of `discard`,
`discardAll`, and `replace`. These method make it more convenient and performant
to remove or replace documents.

This release is almost completely backwards compatible with `v5`, apart from one
breaking change in the behavior of `add` when the document ID already exists.

Changes:

  - [breaking change] `add`, `addAll`, and `addAllAsync` now throw an error on
    duplicate document IDs. When necessary, it is now possible to check for the
    existence of a document with a certain ID with the new method `has`.
  - Add `discard` method to remove documents by ID. This is a convenient
    alternative to `remove` that takes only the ID of the documents to remove,
    as opposed to the whole document. The visible effect is the same as
    `remove`. The difference is that `remove` immediately mutates the index,
    while `discard` marks the current document version as discarded, so it is
    immedately ignored by searches, but delays modifying the index until a
    certain number of documents are discarded. At that point, a vacuuming is
    triggered, cleaning up the index from obsolete references and allowing
    memory to be released.
  - Add `discardAll` and `replace` methods, built on top of `discard`
  - Add vacuuming of references to discarded documents from the index. Vacuuming
    is performed automatically by default when the number of discarded documents
    reaches a threshold (controlled by the new `autoVacuum` constructor option),
    or can be triggered manually by calling the `vacuum` method. The new
    `dirtCount` and `dirtFactor` properties give the current value of the
    parameters used to decide whether to trigger an automatic vacuuming.
  - Add `termCount` property, giving the number of distinct terms present in the
    index
  - Allow customizing the parameters of the BM25+ scoring algorithm via the
    `bm25` search option.
  - Improve TypeScript type of some methods by marking the given array argument
    as `readonly`, signaling that it won't be mutated, and allowing passing
    readonly arrays.
  - Make it possible to overload the `loadJS` static method in subclasses

## v5.1.0

  - The `processTerm` option can now also expand a single term into several
    terms by returning an array of strings.
  - Add `logger` option to pass a custom logger function.

## v5.0.0

This is a major release. The main change is an improved scoring algorithm based
on [BM25+](https://en.wikipedia.org/wiki/Okapi_BM25). The new algorithm will
cause the scoring and sorting of search results to be different than in previous
versions (generally better), and need less aggressive boosting.

  - [breaking change] Use the [BM25+
    algorithm](https://en.wikipedia.org/wiki/Okapi_BM25) to score search
    results, improving their quality over the previous implementation. Note
    that, if you were using field boosting, you might need to re-adjust the
    boosting amounts, since their effect is now different.

  - [breaking change] auto suggestions now default to `combineWith: 'AND'`
    instead of `'OR'`, requiring all the query terms to match. The old defaults
    can be replicated by passing a new `autoSuggestOptions` option to the
    constructor, with value `{ autoSuggestOptions: { combineWith: 'OR' } }`.

  - Possibility to set the default auto suggest options in the constructor.

  - Remove redundant fields in the index data. This also changes the
    serialization format, but serialized indexes created with `v4.x.y` are still
    deserialized correctly.

  - Define `exports` entry points in `package.json`, to require MiniSearch as a
    commonjs package or import it as a ES module.

## v4.0.3

  - [fix] Fix regression causing stored fields not being saved in some
    situations.

## v4.0.2

  - [fix] Fix match data on mixed prefix and fuzzy search

## v4.0.1

  - [fix] Fix an issue with scoring, causing a result matching both fuzzy and
    prefix search to be scored higher than an exact match.

  - [breaking change] `SearchableMap` method `fuzzyGet` now returns a `Map`
    instead of an object. This is a breaking change only if you directly use
    `SearchableMap`, not if you use `MiniSearch`, and is considered part of
    version 4.

## v4.0.0

  - [breaking change] The serialization format was changed, to abstract away the
    internal implementation details of the index data structure. This allows for
    present and future optimizations without breaking backward compatibility
    again. Moreover, the new format is simpler, facilitating the job of tools
    that create a serialized MiniSearch index in other languages.

  - [performance] Large performance improvements on indexing (at least 4 time
    faster in the official benchmark) and search, due to changes to the internal
    data structures and the code.

  - [peformance] The fuzzy search algorithm has been updated to work like
    outlined in [this blog post by Steve
    Hanov](http://stevehanov.ca/blog/?id=114), improving its performance by
    several times, especially on large maximum edit distances.

  - [fix] The `weights` search option did not have an effect due to a bug. Now
    it works as documented. Note that, due to this, the relative scoring of
    fuzzy vs. prefix search matches might change compared to previous versions.
    This change also brings a further performance improvement of both fuzzy and
    prefix search.

**Migration notes:**

If you have an index serialized with a previous version of MiniSearch, you will
need to re-create it when you upgrade to MiniSearch `v4`.

Also note that loading a pre-serialized index is _slower_ in `v4` than in
previous versions, but there are much larger performance gains on indexing and
search speed. If you serialized an index on the server-side, it is worth
checking if it is now fast enough for your use case to index on the client side:
it would save you from having to re-serialize the index every time something
changes.

**Acknowledgements:**

Many thanks to [rolftimmermans](https://github.com/rolftimmermans) for
contributing the fixes and outstanding performance improvements that are part of
this release.


## v3.3.0

  - Add `maxFuzzy` search option, to limit the maximum edit distance for fuzzy
    search when using fractional fuzziness

## v3.2.0

  - Add AND_NOT combinator to subtract results of a subquery from another (for
    example to find documents that match one term and not another)

## v3.1.0

  - Add possibility for advanced combination of subqueries as query expression
    trees

## v3.0.4

  - [fix] Keep radix tree property (no node with a single child) after removal
    of an entry

## v3.0.3

  - [fix] Adjust data about field lengths upon document removal

## v3.0.2

  - [fix] `addAllAsync` now allows events to be processed between chunks, avoid
    blocking the UI (by [@grimmen](https://github.com/grimmen))

## v3.0.1

  - [fix] Fix type signature of `removeAll` to allow calling it with no
    arguments. Also, throw a more informative error if called with a falsey
    value. Thanks to [https://github.com/nilclass](@nilclass).

## v3.0.0

  This major version ports the source code to TypeScript. That made it possible
  to improve types and documentation, making sure that both are in sync with the
  actual code. It is mostly backward compatible: JavaScript users should
  experience no breaking change, while TypeScript users _might_ have toadapt
  some types.

  - Port source to [TypeScript](https://www.typescriptlang.org), adding type
    safety
  - Improved types and documentation (now generated with [TypeDoc](http://typedoc.org))
  - [breaking change, fix] TypeScript `SearchOptions` type is not generic
    anymore
  - [breaking change] `SearchableMap` is not a static field of `MiniSearch`
    anymore: it can instead be imported separately as `minisearch/SearchableMap`

## v2.6.2

  - [fix] Improve TypeScript types: default generic document type is `any`, not `object`

## v2.6.1

  - No change from 2.6.0

## v2.6.0

  - Better TypeScript typings using generics, letting the user (optionally)
    specify the document type.

## v2.5.1

  - [fix] Fix document removal when using a custom `extractField` function
    (thanks [@ahri](https://github.com/ahri) for reporting and reproducting)

## v2.5.0

  - Make `idField` extraction customizeable and consistent with other fields,
    using `extractField`

## v2.4.1

  - [fix] Fix issue with the term `constructor` (reported by
    [@scambier](https://github.com/scambier))

  - [fix] Fix issues when a field is named like a default property of JavaScript
    objects

## v2.4.0

  - Convert field value to string before tokenization and indexing. This makes
    a custom field extractor unnecessary for basic cases like integers or simple
    arrays.

## v2.3.1

  - Version `v2.3.1` mistakenly did not contain the commit adding `removeAll`,
    this patch release fixes it.

## v2.3.0

  - Add `removeAll` method, to remove many documents, or all documents, at once.

## v2.2.2

  - Avoid destructuring variables named with an underscore prefix. This plays
    nicer to some common minifier and builder configurations.

  - Performance improvement in `getDefault` (by
    [stalniy](https://github.com/stalniy))

  - Fix the linter setup, to ensure code style consistency

## v2.2.1

  - Add `"sideEffects": false` to `package.json` to allow bundlers to perform
    tree shaking

## v2.2.0

  - [fix] Fix documentation of `SearchableMap.prototype.atPrefix` (by
    [@graphman65](https://github.com/graphman65))
  - Switch to Rollup for bundling (by [stalniy](https://github.com/stalniy)),
    reducing size of build and providing ES6 and ES5 module versions too.

## v2.1.4

  - [fix] Fix document removal in presence of custom per field tokenizer, field
    extractor, or term processor (thanks [@CaptainChaos](https://github.com/CaptainChaos))

## v2.1.3

  - [fix] Fix TypeScript definition for `storeFields` option (by
    [@ryan-codingintrigue](https://github.com/ryan-codingintrigue))

## v2.1.2

  - [fix] Fix TypeScript definition for `fuzzy` option (by
    [@alessandrobardini](https://github.com/alessandrobardini))

## v2.1.1

  - [fix] Fix TypeScript definitions adding `filter` and `storeFields` options
    (by [@emilianox](https://github.com/emilianox))

## v2.1.0

  - [feature] Add support for stored fields

  - [feature] Add filtering of search results and auto suggestions

## v2.0.6

  - Better TypeScript definitions (by [@samuelmeuli](https://github.com/samuelmeuli))

## v2.0.5

  - Add TypeScript definitions for ease of use in TypeScript projects

## v2.0.4

  - [fix] tokenizer behavior with newline characters (by [@samuelmeuli](https://github.com/samuelmeuli))

## v2.0.3

  - Fix small imprecision in documentation

## v2.0.2

  - Add `addAllAsync` method, adding many documents asynchronously and in chunks
    to avoid blocking the main thread

## v2.0.1

  - Throw a more descriptive error when `loadJSON` is called without options

## v2.0.0

This release introduces better defaults. It is considered a major release, as
the default options are slightly different, but the API is not changed.

  - *Breaking change*: default tokenizer splits by Unicode space or punctuation
    (before it was splitting by space, punctuation, or _symbol_). The difference
    is that currency symbols and other non-punctuation symbols will not be
    discarded: "it's 100€" is now tokenized as `["it", "s", "100€"]` instead of
    `["it", "s", "100"]`.

  - *Breaking change*: default term processing does not discard 1-character
    words.

  - *Breaking change*: auto suggestions by default perform prefix search only on
    the last term in the query. So "super cond" will suggest "super
    conductivity", but not "superposition condition".

## v1.3.1

  - Better and more compact regular expression in the default tokenizer,
    separating on Unicode spaces, punctuation, and symbols

## v1.3.0

  - Support for non-latin scripts

## v1.2.1

  - Improve fuzzy search performance (common cases are now ~4x faster, as shown
    by the benchmark)

## v1.2.0

  - Add possibility to configure a custom field extraction function by setting
      the `extractField` option (to support cases like nested fields, non-string
      fields, getter methods, field pre-processing, etc.)

## v1.1.2

  - Add `getDefault` static method to get the default value of configuration options

## v1.1.1

  - Do not minify library when published as NPM package. Run `yarn
    build-minified` (or `npm run build-minified`) to produce a minified build
    with source maps.
  - **Bugfix**: as per specification, `processTerm` is called with only one
    argument upon search (see [#5](https://github.com/lucaong/minisearch/issues/5))

## v1.1.0

  - Add possibility to configure separate index-time and search-time
    tokenization and term processing functions
  - The `processTerm` function can now reject a term by returning a falsy value
  - Upon indexing, the `tokenize` and `processTerm` functions receive the field
    name as the second argument. This makes it possible to process or tokenize
    each field differently.

## v1.0.1

  - Reduce bundle size by optimizing babel preset env options

## v1.0.0

Production-ready release.

Features:

  - Space-optimized index
  - Exact match, prefix match, fuzzy search
  - Auto suggestions
  - Add/remove documents at any time
