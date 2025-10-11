# Oniguruma (鬼車) to ES

“I think \[Oniguruma-To-ES] is very wonderful”<br>
— K. Kosako, creator of Oniguruma

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]

An **[Oniguruma](https://github.com/kkos/oniguruma) to JavaScript regex translator** that runs in the browser and on your server. Use it to:

- Take advantage of Oniguruma's many extended regex features in JavaScript.
- Run regexes written for Oniguruma from JavaScript, such as those used in TextMate grammars (used by VS Code, GitHub, [Shiki](https://shiki.style/), etc.).
- Share regexes across your Ruby<sup>✳︎</sup> or PHP (`mb_ereg`, etc.) and JavaScript code.
- Evaluate the validity of Oniguruma regexes and traverse their ASTs.

Compared to running the Oniguruma C library via WASM bindings using [vscode-oniguruma](https://github.com/microsoft/vscode-oniguruma), this library is **~4% of the size** and its regexes often run much faster since they run as native JavaScript.

> You can further reduce bundle size by precompiling your regexes. In many cases that avoids the need for any runtime dependency. Some regex conversions rely on advanced, subclass-based emulation, in which case the tree-shakable `EmulatedRegExp` class (3.2 kb minzip) is still needed after precompilation.

Oniguruma-To-ES deeply understands the hundreds of large and small differences between Oniguruma and JavaScript regex syntax and behavior, across multiple JavaScript version targets. It's *obsessive* about ensuring that the emulated features it supports have **exactly the same behavior**, even in extreme edge cases. And it's been battle-tested on tens of thousands of real-world Oniguruma regexes used in TextMate grammars.

<sup>✳︎: Ruby 2.0+ uses [Onigmo](https://github.com/k-takata/Onigmo), a fork of Oniguruma with similar syntax and behavior.</sup>

## 🔮 [Try the demo REPL](https://slevithan.github.io/oniguruma-to-es/demo/)

## 📜 Contents

- [Examples](#-examples)
- [Install and use](#️-install-and-use)
- [API](#-api): [`toRegExp`](#toregexp), [`toRegExpDetails`](#toregexpdetails), [`toOnigurumaAst`](#toonigurumaast), [`EmulatedRegExp`](#emulatedregexp)
- [Options](#-options): [`accuracy`](#accuracy), [`avoidSubclass`](#avoidsubclass), [`flags`](#flags), [`global`](#global), [`hasIndices`](#hasindices), [`lazyCompileLength`](#lazycompilelength), [`rules`](#rules), [`target`](#target), [`verbose`](#verbose)
- [Supported features](#-supported-features)
- [Unsupported features](#-unsupported-features)
- [Unicode](#️-unicode)

## 🪧 Examples

```js
import {toRegExp} from 'oniguruma-to-es';

toRegExp(String.raw`(?x)
  (?<n>\d) (?<n>\p{greek}) \k<n>
  ([0a-z&&\h]){,2}
`);
// → /(?<n>\p{Nd})(\p{sc=Greek})(?:\1|\2)(?:[[0a-z]&&\p{AHex}]){0,2}/v
```

Although the example above is fairly straightforward, you can see several translations that might not be obvious. Apart from the `(?x)` free-spacing modifier and the `\h` hex-digit shorthand that aren't available in JavaScript, you can also see that Oniguruma's `\d` is Unicode-based by default, backreferences to duplicate group names match the captured value of any of the groups, `(…)` groups are noncapturing by default if named groups are present, character class intersection doesn't follow JavaScript's requirement of using nested classes for union and ranges, and `{…}` interval quantifiers can use an implicit `0` min. Many advanced features are supported that would produce more complicated transformations.

This next example shows support for Unicode case folding with mixed case-sensitivity. Notice that code points `ſ` ([U+017F](https://codepoints.net/U+017F)) and `K` ([U+212A](https://codepoints.net/U+212A)) are added to the second, case-insensitive range if using a `target` prior to `ES2025`, and that modern JavaScript regex features (like flag groups) are used if supported by the `target`.

```js
toRegExp('[a-z](?i)[a-z]', {target: 'ES2018'});
// → /[a-z][a-zA-ZſK]/u
toRegExp('[a-z](?i)[a-z]', {target: 'ES2025'});
// → /[a-z](?i:[a-z])/v
```

## 🕹️ Install and use

```sh
npm install oniguruma-to-es
```

```js
import {toRegExp} from 'oniguruma-to-es';

const str = '…';
const pattern = '…';
// Works with all string/regexp methods since it returns a native regexp
str.match(toRegExp(pattern));
```

<details>
  <summary>Using a global name (no import)</summary>

```html
<script src="https://cdn.jsdelivr.net/npm/oniguruma-to-es/dist/index.min.js"></script>
<script>
  const {toRegExp} = OnigurumaToEs;
</script>
```
</details>

## 🔑 API

### `toRegExp`

Accepts an Oniguruma pattern and returns an equivalent JavaScript `RegExp`.

> [!TIP]
> Try it in the [demo REPL](https://slevithan.github.io/oniguruma-to-es/demo/).

```ts
function toRegExp(
  pattern: string,
  options?: ToRegExpOptions
): RegExp | EmulatedRegExp;
```

#### Type `ToRegExpOptions`

```ts
type ToRegExpOptions = {
  accuracy?: 'default' | 'strict';
  avoidSubclass?: boolean;
  flags?: string;
  global?: boolean;
  hasIndices?: boolean;
  lazyCompileLength?: number;
  rules?: {
    allowOrphanBackrefs?: boolean;
    asciiWordBoundaries?: boolean;
    captureGroup?: boolean;
    recursionLimit?: number;
    singleline?: boolean;
  };
  target?: 'auto' | 'ES2025' | 'ES2024' | 'ES2018';
  verbose?: boolean;
};
```

See [Options](#-options) for more details.

### `toRegExpDetails`

Accepts an Oniguruma pattern and returns the details needed to construct an equivalent JavaScript `RegExp`.

```ts
function toRegExpDetails(
  pattern: string,
  options?: ToRegExpOptions
): {
  pattern: string;
  flags: string;
  options?: EmulatedRegExpOptions;
};
```

Note that the returned `flags` might also be different than those provided, as a result of the emulation process. The returned `pattern`, `flags`, and `options` properties can be provided as arguments to the `EmulatedRegExp` constructor to produce the same result as `toRegExp`.

If the only keys returned are `pattern` and `flags`, they can optionally be provided to JavaScript's `RegExp` constructor instead. Setting option `avoidSubclass` to `true` ensures that this is always the case (resulting in an error for any patterns that require `EmulatedRegExp`'s additional handling).

### `toOnigurumaAst`

Returns an Oniguruma AST generated from an Oniguruma pattern.

```ts
function toOnigurumaAst(
  pattern: string,
  options?: {
    flags?: string;
    rules?: {
      captureGroup?: boolean;
      singleline?: boolean;
    };
  }
): OnigurumaAst;
```

An error is thrown if the pattern isn't valid in Oniguruma. Unlike `toRegExp` and `toRegExpDetails`, `toOnigurumaAst` doesn't evaluate whether the pattern can be emulated in JavaScript.

### `EmulatedRegExp`

Works the same as JavaScript's native `RegExp` constructor in all contexts, but can be given results from `toRegExpDetails` to produce the same result as `toRegExp`.

```ts
class EmulatedRegExp extends RegExp {
  constructor(pattern: string, flags?: string, options?: EmulatedRegExpOptions);
  constructor(pattern: EmulatedRegExp, flags?: string);
  rawOptions: EmulatedRegExpOptions;
}
```

The `rawOptions` property of `EmulatedRegExp` instances can be used for serialization.

#### Type `EmulatedRegExpOptions`

```ts
type EmulatedRegExpOptions = {
  hiddenCaptures?: Array<number>;
  lazyCompile?: boolean;
  strategy?: string?;
  transfers?: Array<[number, Array<number>]>;
};
```

## 🔩 Options

The following options are shared by functions [`toRegExp`](#toregexp) and [`toRegExpDetails`](#toregexpdetails).

### `accuracy`

One of `'default'` *(default)* or `'strict'`.

Sets the level of emulation rigor/strictness.

- **Default:** Permits a few close approximations in order to support additional features.
- **Strict:** Error if the pattern can't be emulated with identical behavior (even in rare edge cases) for the given `target`.

<details>
  <summary>More details</summary>

Using default `accuracy` adds support for the following features, depending on `target`:

- All targets (`ES2025` and earlier):
  - Enables use of `\X` using a close approximation of a Unicode extended grapheme cluster.
  - Enables combining lookbehind with uncommon uses of `\G` that rely on subclass-based emulation.
- `ES2024` and earlier:
  - Enables use of case-insensitive backreferences to case-sensitive groups.
- `ES2018`:
  - Enables use of POSIX classes `[:graph:]` and `[:print:]` using ASCII-based versions rather than the Unicode versions available for `ES2024` and later. Other POSIX classes are always Unicode-based.
</details>

### `avoidSubclass`

*Default: `false`.*

Disables advanced emulation that relies on returning a `RegExp` subclass. In cases when a subclass would otherwise have been used, this results in one of the following:

- An error is thrown for patterns that are not emulatable without a subclass.
- Some patterns can still be emulated accurately without a subclass, but in this case *subpattern* match details might differ from Oniguruma.
  - This is only relevant if you access the subpattern details of match results in your code (via subpattern array indices, `groups`, and `indices`).

### `flags`

Oniguruma flags; a string with `i`, `m`, `x`, `D`, `S`, `W` in any order (all optional).

Flags can also be specified via modifiers in the pattern.

> [!IMPORTANT]
> Oniguruma and JavaScript both have an `m` flag but with different meanings. Oniguruma's `m` is equivalent to JavaScript's `s` (`dotAll`).

### `global`

*Default: `false`.*

Include JavaScript flag `g` (`global`) in the result.

### `hasIndices`

*Default: `false`.*

Include JavaScript flag `d` (`hasIndices`) in the result.

### `lazyCompileLength`

*Default: `Infinity`. In other words, lazy compilation is off by default.*

Delay regex construction until first use if the transpiled pattern is at least this length.

Although regex construction in JavaScript is fast, it can sometimes be helpful to defer the cost for extremely long patterns. Lazy compilation defers the time JavaScript spends inside the `RegExp` constructor (building the transpiled pattern into a regex object) until the first time the regex is used in a search. The regex object is outwardly identical before and after deferred compilation.

Lazy compilation relies on the `EmulatedRegExp` class.

### `rules`

Advanced options that override standard behavior, error checking, and flags when enabled.

- `allowOrphanBackrefs`: Useful with TextMate grammars that merge backreferences across patterns.
- `asciiWordBoundaries`: Use ASCII-based `\b` and `\B`, which increases search performance of generated regexes.
- `captureGroup`: Allow unnamed captures and numbered calls (backreferences and subroutines) when using named capture.
  - This is Oniguruma option `ONIG_OPTION_CAPTURE_GROUP`; on by default in `vscode-oniguruma`.
- `recursionLimit`: Change the recursion depth limit from Oniguruma's `20` to an integer `2`–`20`.
- `singleline`: `^` as `\A`; `$` as `\Z`. Improves search performance of generated regexes without changing meaning if searching line by line.
  - This is Oniguruma option `ONIG_OPTION_SINGLELINE`.

### `target`

One of `'auto'` *(default)*, `'ES2025'`, `'ES2024'`, or `'ES2018'`.

JavaScript version used for generated regexes. Using `auto` detects the best value based on your environment. Later targets allow faster processing, simpler generated source, and support for additional features.

<details>
  <summary>More details</summary>

- `ES2018`: Uses JS flag `u`.
  - Emulation restrictions: Character class intersection and nested negated character classes are not allowed.
  - Generated regexes might use ES2018 features that require Node.js 10 or a browser version released during 2018 to 2023 (in Safari's case). Minimum requirement for any regex is Node.js 6 or a 2016-era browser.
- `ES2024`: Uses JS flag `v`.
  - No emulation restrictions.
  - Generated regexes require Node.js 20 or any 2023-era browser ([compat table](https://caniuse.com/mdn-javascript_builtins_regexp_unicodesets)).
- `ES2025`: Uses JS flag `v` and allows use of flag groups.
  - Benefits: Faster transpilation, simpler generated source.
  - Generated regexes might use features that require Node.js 23 or a 2024-era browser (except Safari, which lacks support for flag groups).
</details>

### `verbose`

*Default: `false`.*

Disables optimizations that simplify the pattern when it doesn't change the meaning.

## ✅ Supported features

Following are the supported features by target. The official Oniguruma [syntax doc](https://github.com/kkos/oniguruma/blob/master/doc/RE) doesn't cover many of the finer details described here.

> [!NOTE]
> Targets `ES2024` and `ES2025` have the same emulation capabilities. Resulting regexes might have different source and flags, but they match the same strings. See [`target`](#target).

Notice that nearly every feature below has at least subtle differences from JavaScript. Some features listed as unsupported are not emulatable using native JavaScript regexes, but support for others might be added in future versions of this library. Unsupported features throw an error.

<table>
  <tr>
    <th colspan="2">Feature</th>
    <th>Example</th>
    <th>ES2018</th>
    <th>ES2024+</th>
    <th>Subfeatures &amp; JS differences</th>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="8">Flags</th>
    <td colspan="5"><i>Supported in top-level flags and pattern modifiers</i></td>
  </tr>
  <tr valign="top">
    <td>Ignore case</td>
    <td><code>i</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Unicode case folding (same as JS with flag <code>u</code>, <code>v</code>)<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Dot all</td>
    <td><code>m</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Equivalent to JS flag <code>s</code><br>
    </td>
  </tr>
  <tr valign="top">
    <td>Extended</td>
    <td><code>x</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Unicode whitespace ignored<br>
      ✔ Line comments with <code>#</code><br>
      ✔ Whitespace/comments allowed between a token and its quantifier<br>
      ✔ Whitespace/comments between a quantifier and the <code>?</code>/<code>+</code> that makes it lazy/possessive changes it to a quantifier chain<br>
      ✔ Whitespace/comments separate tokens (ex: <code>\1 0</code>)<br>
      ✔ Whitespace and <code>#</code> not ignored in char classes<br>
    </td>
  </tr>
  <tr valign="top">
    <td colspan="5"><i>Currently supported only in top-level flags</i></td>
  </tr>
  <tr valign="top">
    <td>Digit is ASCII</td>
    <td><code>D</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ ASCII <code>\d</code>, <code>\p{Digit}</code>, <code>[[:digit:]]</code><br>
    </td>
  </tr>
  <tr valign="top">
    <td>Space is ASCII</td>
    <td><code>S</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ ASCII <code>\s</code>, <code>\p{Space}</code>, <code>[[:space:]]</code><br>
    </td>
  </tr>
  <tr valign="top">
    <td>Word is ASCII</td>
    <td><code>W</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ ASCII <code>\b</code>, <code>\w</code>, <code>\p{Word}</code>, <code>[[:word:]]</code><br>
    </td>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="2" valign="top">Pattern modifiers</th>
    <td>Group</td>
    <td><code>(?im-x:…)</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Unicode case folding for <code>i</code><br>
      ✔ Allows enabling and disabling the same flag (priority: disable)<br>
      ✔ Allows lone or multiple <code>-</code><br>
    </td>
  </tr>
  <tr valign="top">
    <td>Directive</td>
    <td><code>(?im-x)</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Continues until end of pattern or group (spanning alternatives)<br>
    </td>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="9">Characters</th>
    <td>Literal</td>
    <td><code>E</code>, <code>!</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Code point based matching (same as JS with flag <code>u</code>, <code>v</code>)<br>
      ✔ Standalone <code>]</code>, <code>{</code>, <code>}</code> don't require escaping<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Identity escape</td>
    <td><code>\E</code>, <code>\!</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Different set than JS<br>
      ✔ Allows multibyte chars<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Escaped metachar</td>
    <td><code>\\</code>, <code>\.</cpde></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Same as JS<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Control code escape</td>
    <td><code>\t</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ The JS set plus <code>\a</code>, <code>\e</code><br>
    </td>
  </tr>
  <tr valign="top">
    <td><code>\xNN</code></td>
    <td><code>\x7F</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Allows 1 hex digit<br>
      ✔ Above <code>7F</code>, is UTF-8 encoded byte (≠ JS)<br>
      ✔ Error for invalid encoded bytes<br>
    </td>
  </tr>
  <tr valign="top">
    <td><code>\uNNNN</code></td>
    <td><code>\uFFFF</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Same as JS with flag <code>u</code>, <code>v</code><br>
    </td>
  </tr>
  <tr valign="top">
    <td><code>\x{…}</code></td>
    <td><code>\x{A}</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Allows leading 0s up to 8 total hex digits<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Escaped num</td>
    <td><code>\20</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Can be backref, error, null, octal, identity escape, or any of these combined with literal digits, based on complex rules that differ from JS<br>
      ✔ Always handles escaped single digit 1-9 outside char class as backref<br>
      ✔ Allows null with 1-3 0s<br>
      ✔ Error for octal > <code>177</code><br>
    </td>
  </tr>
  <tr valign="top">
    <td>Caret notation</td>
    <td><code>\cA</code>, <code>\C-A</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ With A-Za-z (JS: only <code>\c</code> form)<br>
    </td>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="8">Character sets</th>
    <td>Digit</td>
    <td><code>\d</code>, <code>\D</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Unicode by default (≠ JS)<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Hex digit</td>
    <td><code>\h</code>, <code>\H</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ ASCII<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Whitespace</td>
    <td><code>\s</code>, <code>\S</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Unicode by default<br>
      ✔ No JS adjustments to Unicode set (−<code>\uFEFF</code>, +<code>\x85</code>)<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Word</td>
    <td><code>\w</code>, <code>\W</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Unicode by default (≠ JS)<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Dot</td>
    <td><code>.</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Excludes only <code>\n</code> (≠ JS)<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Any</td>
    <td><code>\O</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Any char (with any flags)<br>
      ✔ Identity escape in char class<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Not newline</td>
    <td><code>\N</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Identity escape in char class<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Unicode property</td>
    <td>
      <code>\p{L}</code>,<br>
      <code>\P{L}</code>
    </td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Binary properties<br>
      ✔ Categories<br>
      ✔ Scripts<br>
      ✔ Aliases<br>
      ✔ POSIX properties<br>
      ✔ Invert with <code>\p{^…}</code>, <code>\P{^…}</code><br>
      ✔ Insignificant spaces, hyphens, underscores, and casing in names<br>
      ✔ <code>\p</code>, <code>\P</code> without <code>{</code> is an identity escape<br>
      ✔ Error for key prefixes<br>
      ✔ Error for props of strings<br>
      ❌ Blocks (wontfix<sup>[1]</sup>)<br>
    </td>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="2">Variable-length sets</th>
    <td>Newline</td>
    <td><code>\R</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Matched atomically<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Grapheme</td>
    <td><code>\X</code></td>
    <td align="middle">☑️</td>
    <td align="middle">☑️</td>
    <td>
      ● Uses a close approximation<br>
      ✔ Matched atomically<br>
    </td>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="6">Character classes</th>
    <td>Base</td>
    <td><code>[…]</code>, <code>[^…]</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Unescaped <code>-</code> outside of range is literal in some contexts (different than JS rules in any mode)<br>
      ✔ Error for unescaped <code>[</code> that doesn't form nested class<br>
      ✔ Leading unescaped <code>]</code> OK<br>
      ✔ Fewer chars require escaping than JS<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Empty</td>
    <td><code>[]</code>, <code>[^]</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Error<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Range</td>
    <td><code>[a-z]</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Same as JS with flag <code>u</code>, <code>v</code><br>
      ✔ Allows <code>\x{…}</code> above <code>10FFFF</code> at end of range to mean last valid code point<br>
    </td>
  </tr>
  <tr valign="top">
    <td>POSIX class</td>
    <td>
      <code>[[:word:]]</code>,<br>
      <code>[[:^word:]]</code>
    </td>
    <td align="middle">☑️<sup>[2]</sup></td>
    <td align="middle">✅</td>
    <td>
      ✔ All use Unicode definitions<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Nested class</td>
    <td><code>[…[…]]</code></td>
    <td align="middle">☑️<sup>[3]</sup></td>
    <td align="middle">✅</td>
    <td>
      ✔ Same as JS with flag <code>v</code><br>
    </td>
  </tr>
  <tr valign="top">
    <td>Intersection</td>
    <td><code>[…&amp;&amp;…]</code></td>
    <td align="middle">❌</td>
    <td align="middle">✅</td>
    <td>
      ✔ Doesn't require nested classes for intersection of union and ranges<br>
      ✔ Allows empty segments<br>
    </td>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="6">Assertions</th>
    <td>Line start, end</td>
    <td><code>^</code>, <code>$</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Always "multiline"<br>
      ✔ Only <code>\n</code> as newline<br>
      ✔ <code>^</code> doesn't match after string-terminating <code>\n</code><br>
    </td>
  </tr>
  <tr valign="top">
    <td>String start, end</td>
    <td><code>\A</code>, <code>\z</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Same as JS <code>^</code> <code>$</code> without JS flag <code>m</code><br>
    </td>
  </tr>
  <tr valign="top">
    <td>String end or before terminating newline</td>
    <td><code>\Z</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Only <code>\n</code> as newline<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Search start</td>
    <td><code>\G</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Matches at start of match attempt (not end of prev match; advances after 0-length match)<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Lookaround</td>
    <td>
      <code>(?=…)</code>,<br>
      <code>(?!…)</code>,<br>
      <code>(?&lt;=…)</code>,<br>
      <code>(?&lt;!…)</code>
    </td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Allows variable-length quantifiers and alternation within lookbehind<br>
      ✔ Lookahead invalid within lookbehind<br>
      ✔ Capturing groups invalid within negative lookbehind<br>
      ✔ Negative lookbehind invalid within positive lookbehind<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Word boundary</td>
    <td><code>\b</code>, <code>\B</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Unicode based (≠ JS)<br>
    </td>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="3">Quantifiers</th>
    <td>Greedy, lazy</td>
    <td><code>*</code>, <code>+?</code>, <code>{2,}</code>, etc.</td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Includes all JS forms<br>
      ✔ Adds <code>{,n}</code> for min 0<br>
      ✔ Explicit bounds have upper limit of 100,000 (unlimited in JS)<br>
      ✔ Error with assertions (same as JS with flag <code>u</code>, <code>v</code>) and directives<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Possessive</td>
    <td><code>?+</code>, <code>*+</code>, <code>++</code>, <code>{3,2}</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ <code>+</code> suffix doesn't make <code>{…}</code> quantifiers possessive (creates a quantifier chain)<br>
      ✔ Reversed <code>{…}</code> ranges are possessive<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Chained</td>
    <td><code>**</code>, <code>??+*</code>, <code>{2,3}+</code>, etc.</td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Further repeats the preceding repetition<br>
    </td>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="4">Groups</th>
    <td>Noncapturing</td>
    <td><code>(?:…)</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Same as JS<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Atomic</td>
    <td><code>(?>…)</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Supported<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Capturing</td>
    <td><code>(…)</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Is noncapturing if named capture present<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Named capturing</td>
    <td>
      <code>(?&lt;a>…)</code>,<br>
      <code>(?'a'…)</code>
    </td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Duplicate names allowed (including within the same alternation path) unless directly referenced by a subroutine<br>
      ✔ Error for names invalid in Oniguruma (more permissive than JS)<br>
    </td>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="4">Backreferences</th>
    <td>Numbered</td>
    <td><code>\1</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Error if named capture used<br>
      ✔ Refs the most recent of a capture/subroutine set<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Enclosed numbered, relative</td>
    <td>
      <code>\k&lt;1></code>,<br>
      <code>\k'1'</code>,<br>
      <code>\k&lt;-1></code>,<br>
      <code>\k'-1'</code>
    </td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Error if named capture used<br>
      ✔ Allows leading 0s<br>
      ✔ Refs the most recent of a capture/subroutine set<br>
      ✔ <code>\k</code> without <code>&lt;</code> <code>'</code> is an identity escape<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Named</td>
    <td>
      <code>\k&lt;a></code>,<br>
      <code>\k'a'</code>
    </td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ For duplicate group names, rematch any of their matches (multiplex)<br>
      ✔ Refs the most recent of a capture/subroutine set (no multiplex)<br>
      ✔ Combination of multiplex and most recent of capture/subroutine set if duplicate name is indirectly created by a subroutine<br>
      ✔ Error for <code>-</code>/<code>+</code> in backref names, though valid in group names<br>
    </td>
  </tr>
  <tr valign="top">
    <td colspan="2">To nonparticipating groups</td>
    <td align="middle">☑️</td>
    <td align="middle">☑️</td>
    <td>
      ✔ Error if group to the right<sup>[4]</sup><br>
      ✔ Duplicate names (and subroutines) to the right not included in multiplex<br>
      ✔ Fail to match (or don't include in multiplex) ancestor groups and groups in preceding alternation paths<br>
      ❌ Some rare cases are indeterminable at compile time and use the JS behavior of matching an empty string<br>
    </td>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="2">Subroutines</th>
    <td>Numbered, relative</td>
    <td>
      <code>\g&lt;1></code>,<br>
      <code>\g'1'</code>,<br>
      <code>\g&lt;-1></code>,<br>
      <code>\g'-1'</code>,<br>
      <code>\g&lt;+1></code>,<br>
      <code>\g'+1'</code>
    </td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Error if named capture used<br>
      ✔ Allows leading 0s<br>
      <br>
      <i>All subroutines (incl. named):</i><br>
      ✔ Allowed before reffed group<br>
      ✔ Can be nested (any depth)<br>
      ✔ Reuses flags from the reffed group (ignores local flags)<br>
      ✔ Replaces most recent captured values (for backrefs)<br>
      ✔ <code>\g</code> without <code>&lt;</code> <code>'</code> is an identity escape<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Named</td>
    <td>
      <code>\g&lt;a></code>,<br>
      <code>\g'a'</code>
    </td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ● Same behavior as numbered<br>
      ✔ Error if reffed group uses duplicate name<br>
    </td>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="2">Recursion</th>
    <td>Full pattern</td>
    <td>
      <code>\g&lt;0></code>,<br>
      <code>\g'0'</code>
    </td>
    <td align="middle">☑️<sup>[5]</sup></td>
    <td align="middle">☑️<sup>[5]</sup></td>
    <td>
      ✔ 20-level depth limit<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Numbered, relative, named</td>
    <td>
      <code>(…\g&lt;1>?…)</code>,<br>
      <code>(…\g&lt;-1>?…)</code>,<br>
      <code>(?&lt;a>…\g&lt;a>?…)</code>, etc.
    </td>
    <td align="middle">☑️<sup>[5]</sup></td>
    <td align="middle">☑️<sup>[5]</sup></td>
    <td>
      ✔ 20-level depth limit<br>
    </td>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="6">Other</th>
    <td>Comment group</td>
    <td><code>(?#…)</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Allows escaping <code>\)</code>, <code>\\</code><br>
      ✔ Comments allowed between a token and its quantifier<br>
      ✔ Comments between a quantifier and the <code>?</code>/<code>+</code> that makes it lazy/possessive changes it to a quantifier chain<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Alternation</td>
    <td><code>…|…</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Same as JS<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Absent repeater<sup>[6]</sup></td>
    <td><code>(?~…)</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Supported<br>
    </td>
  </tr>
  <tr valign="top">
    <td>Keep</td>
    <td><code>\K</code></td>
    <td align="middle">☑️</td>
    <td align="middle">☑️</td>
    <td>
      ● Supported at top level if no top-level alternation is used<br>
    </td>
  </tr>
  <tr valign="top">
    <td colspan="2">JS features unknown to Oniguruma are handled using Oniguruma syntax</td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ <code>\u{…}</code> is an error<br>
      ✔ <code>[\q{…}]</code> matches <code>q</code>, etc.<br>
      ✔ <code>[a--b]</code> includes the invalid reversed range <code>a</code> to <code>-</code><br>
    </td>
  </tr>
  <tr valign="top">
    <td colspan="2">Invalid Oniguruma syntax</td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Error<br>
    </td>
  </tr>

  <tr valign="top">
    <th align="left" rowspan="2">Compile-time options</th>
    <td colspan="2"><code>ONIG_OPTION_CAPTURE_GROUP</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ Unnamed captures and numbered calls allowed when using named capture<br>
    </td>
  </tr>
  <tr valign="top">
    <td colspan="2"><code>ONIG_OPTION_SINGLELINE</code></td>
    <td align="middle">✅</td>
    <td align="middle">✅</td>
    <td>
      ✔ <code>^</code> → <code>\A</code><br>
      ✔ <code>$</code> → <code>\Z</code><br>
    </td>
  </tr>
</table>

The table above doesn't include all aspects that Oniguruma-To-ES emulates (including error handling, subpattern details on match results, most aspects that work the same as in JavaScript, and many aspects of non-JavaScript features that work the same in the other regex flavors that support them). Where applicable, Oniguruma-To-ES follows the latest version of Oniguruma (currently 6.9.10).

### Footnotes

1. Unicode blocks (which in Oniguruma are specified with an `In` prefix) are easily emulatable but their character data would significantly increase library weight. They're also rarely used, fundamentally flawed, and arguably unuseful given the availability of Unicode scripts and other properties.
2. With target `ES2018`, the specific POSIX classes `[:graph:]` and `[:print:]` use ASCII-based versions rather than the Unicode versions available for target `ES2024` and later, and they result in an error if using strict `accuracy`.
3. Target `ES2018` doesn't support nested *negated* character classes.
4. It's not an error for *numbered* backreferences to come before their referenced group in Oniguruma, but an error is the best path for Oniguruma-To-ES because ① most placements are mistakes and can never match (based on the Oniguruma behavior for backreferences to nonparticipating groups), ② erroring matches the behavior of named backreferences, and ③ the edge cases where they're matchable rely on rules for backreference resetting within quantified groups that are different in JavaScript and aren't emulatable. Note that it's not a backreference in the first place if using `\10` or higher and not as many capturing groups are defined to the left (it's an octal or identity escape).
5. Oniguruma's recursion depth limit is `20`. Oniguruma-To-ES uses the same limit by default but allows customizing it via the `rules.recursionLimit` option. Two rare uses of recursion aren't yet supported: overlapping recursions, and use of backreferences when a recursed subpattern contains captures. Patterns that would trigger an infinite recursion error in Oniguruma might find a match in Oniguruma-To-ES (since recursion is bounded), but future versions will detect this and error at transpilation time.
6. Other absent function types (which start with `(?~|` and are extremely rare) aren't yet supported. Note that absent functions behave differently in Oniguruma and Onigmo.

## ❌ Unsupported features

The following throw errors since they aren't yet supported. They're all extremely rare.

- Supportable:
  - Rarely-used character specifiers: Non-A-Za-z with `\cx`, `\C-x`; meta `\M-x`, `\M-\C-x`; bracketed octals `\o{…}`; octal UTF-8 encoded bytes (≥ `\200`).
  - Code point sequences: `\x{H H …}`, `\o{O O …}`.
  - Grapheme boundaries: `\y`, `\Y`.
  - Flags `P` (POSIX is ASCII) and `y{g}`/`y{w}` (grapheme boundary modes).
  - Whole-pattern modifier: Don't capture group `(?C)`.
  - Named callout: `(*FAIL)`.
- Supportable for some uses:
  - Conditionals: `(?(…)…)`, etc.
  - Whole-pattern modifiers: Ignore-case is ASCII `(?I)`, find longest `(?L)`.
  - Named callout pair: `(*SKIP)(*FAIL)`.
- Not supportable:
  - Other callouts: `(?{…})`, `(*…)`, etc.

See also the [supported features](#-supported-features) table (above) which describes some additional rarely-used sub-features that aren't yet supported.

Contributions that add support for unsupported features are welcome.

### Coverage

When considering the list above, keep in mind that some Oniguruma features are so exotic that they aren't used in *any* public code on GitHub. **Oniguruma-To-ES supports ~99.99% of real-world Oniguruma regexes**, based on a sample of 54,487 regexes used in 219 TextMate grammars. Of the unsupported features listed above, conditionals were used in three regexes, *overlapping* recursions were used in three regexes, and other unsupported features weren't used at all.

<a name="unicode"></a>
## ㊗️ Unicode

Oniguruma-To-ES fully supports mixed case-sensitivity (ex: `(?i)a(?-i)a`) and handles the Unicode edge cases regardless of JavaScript [target](#target).

Oniguruma-To-ES focuses on being lightweight to make it better for use in browsers. This is partly achieved by not including heavyweight Unicode character data, which imposes a few minor/rare restrictions:

- Character class intersection and nested negated character classes are unsupported with target `ES2018`. Use target `ES2024` (supported by Node.js 20 and 2023-era browsers) or later if you need support for these features.
- With targets before `ES2025`, a handful of Unicode properties that target a specific character case (ex: `\p{Lower}`) can't be used case-insensitively in patterns that contain other characters with a specific case that are used case-sensitively.
  - In other words, almost every usage is fine, including `A\p{Lower}`, `(?i)A\p{Lower}`, `(?i:A)\p{Lower}`, `(?i)A(?-i)\p{Lower}`, and `\w(?i)\p{Lower}`, but not `A(?i)\p{Lower}`.
  - Using these properties case-insensitively is basically never done intentionally, so you're unlikely to encounter this error unless it's catching a mistake.
- Oniguruma-To-ES uses the version of Unicode supported natively by your JavaScript environment. Using Unicode properties via `\p{…}` that were added in a later version of Unicode than the environment supports results in a runtime error. This is an extreme edge case since modern JavaScript environments support recent versions of Unicode.

## 👀 Similar projects

[JsRegex](https://github.com/jaynetics/js_regex) transpiles Onigmo regexes to JavaScript (Onigmo is a fork of Oniguruma with similar syntax and behavior). It's written in Ruby and relies on the [Regexp::Parser](https://github.com/ammar/regexp_parser) Ruby gem, which means regexes must be pre-transpiled on the server to use them in JavaScript. Note that JsRegex doesn't always translate edge case behavior differences or accurately reproduce subpattern results.

## 🏷️ About

Oniguruma-To-ES was created by [Steven Levithan](https://github.com/slevithan) and [contributors](https://github.com/slevithan/oniguruma-to-es/graphs/contributors).

If you want to support this project, I'd love your help by contributing improvements, sharing it with others, or [sponsoring](https://github.com/sponsors/slevithan) ongoing development.

MIT License.

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/oniguruma-to-es?color=78C372
[npm-version-href]: https://npmjs.com/package/oniguruma-to-es
[npm-downloads-src]: https://img.shields.io/npm/dm/oniguruma-to-es?color=78C372
[npm-downloads-href]: https://npmjs.com/package/oniguruma-to-es
[bundle-src]: https://img.shields.io/bundlejs/size/oniguruma-to-es?color=78C372&label=minzip
[bundle-href]: https://bundlejs.com/?q=oniguruma-to-es&treeshake=[*]
