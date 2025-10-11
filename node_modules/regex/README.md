<div align="center">
  <a href="https://github.com/slevithan/regex#readme">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/slevithan/regex@5.0.1/media/regex-logo-dark.svg">
      <img alt="regex logo" height="180" src="https://cdn.jsdelivr.net/gh/slevithan/regex@5.0.1/media/regex-logo.svg">
    </picture>
  </a>
  <br><br>

  [![npm version][npm-version-src]][npm-version-href]
  [![npm downloads][npm-downloads-src]][npm-downloads-href]
  [![bundle][bundle-src]][bundle-href]
</div>

Regex+ (aka `regex`, based on its package and tag name) is a template tag that extends JavaScript regular expressions with key features that make regexes more powerful and dramatically more readable. It returns native `RegExp` instances that run with native performance, and can exceed the performance of regex literals you'd write yourself. It's also lightweight, supports all ES2025 regex features, has built-in types, and can be used as a [Babel plugin](https://github.com/slevithan/babel-plugin-transform-regex) to avoid any runtime dependencies or user runtime cost.

Highlights include support for insignificant whitespace and comments, atomic groups and possessive quantifiers (that can help you avoid [ReDoS](https://en.wikipedia.org/wiki/ReDoS)), subroutines and subroutine definition groups (that enable powerful subpattern composition), and context-aware interpolation of regexes, escaped strings, and partial patterns.

With the Regex+ library, JavaScript steps up as one of the best regex flavors alongside PCRE and Perl, possibly surpassing C++, Java, .NET, Python, and Ruby.

<details>
  <summary><b>Table of contents</b></summary>

- [Features](#-features)
- [Install and use](#️-install-and-use)
- [Examples](#-examples)
- [Context](#-context)
- [Extended regex syntax](#-extended-regex-syntax)
  - [Atomic groups](#atomic-groups)
  - [Possessive quantifiers](#possessive-quantifiers)
  - [Subroutines](#subroutines)
  - [Subroutine definition groups](#subroutine-definition-groups)
  - [Recursion](#recursion)
- [Flags](#-flags)
  - [Implicit flags](#implicit-flags)
  - [Flag <kbd>v</kbd>](#flag-v)
  - [Flag <kbd>x</kbd>](#flag-x)
  - [Flag <kbd>n</kbd>](#flag-n)
- [Interpolation](#-interpolation)
  - [`RegExp` instances](#interpolating-regexes)
  - [Escaped strings](#interpolating-escaped-strings)
  - [Partial patterns](#interpolating-partial-patterns)
  - [Interpolation principles](#interpolation-principles)
  - [Interpolation contexts](#interpolation-contexts)
- [Options](#-options)
  - [Returning a string](#returning-a-string)
- [Performance](#-performance)
- [Compatibility](#-compatibility)
- [FAQ](#-faq)
</details>

## 💎 Features

**A modern regex baseline** so you don't need to continually opt-in to best practices.

- Always-on flag <kbd>v</kbd> gives you the best level of Unicode support and strict errors.
- New flags:
  - Always-on flag <kbd>x</kbd> allows you to freely add whitespace and comments to your regexes.
  - Always-on flag <kbd>n</kbd> (*named capture only* mode) improves regex readability and efficiency.
- No unreadable escaped backslashes `\\\\` since it's a raw string template tag.

**Extended regex syntax**.

- Atomic groups and possessive quantifiers can dramatically improve performance and prevent ReDoS.
- Subroutines and definition groups enable powerful composition, improving readability and maintainability.
- Recursive matching via an official plugin.
- Custom syntax plugins supported.

**Context-aware and safe interpolation** of regexes, strings, and partial patterns.

- Interpolated strings have their special characters escaped.
- Interpolated regexes locally preserve the meaning of their own flags (or their absense), and their numbered backreferences are adjusted to work within the overall pattern.

## 🕹️ Install and use

```sh
npm install regex
```

```js
import {regex} from 'regex';

// Works with all string/regexp methods since it returns a native regexp
const str = 'abc';
regex`\w`.test(str); // → true
str.match(regex('g')`\w`); // → ['a', 'b', 'c']
```

<details>
  <summary>In browsers</summary>

ESM:

```html
<script type="module">
  import {regex} from 'https://esm.run/regex';
  // …
</script>
```

Using a global name:

```html
<script src="https://cdn.jsdelivr.net/npm/regex/dist/regex.min.js"></script>
<script>
  const {regex} = Regex;
  // …
</script>
```
</details>

## 🪧 Examples

```js
import {regex, pattern} from 'regex';

// Subroutines and subroutine definition group
const record = regex`
  ^ Admitted: \g<date> \n
    Released: \g<date> $

  (?(DEFINE)
    (?<date>  \g<year>-\g<month>-\g<day>)
    (?<year>  \d{4})
    (?<month> \d{2})
    (?<day>   \d{2})
  )
`;

// Atomic group: Avoids ReDoS from the nested, overlapping quantifier
const words = regex`^(?>\w+\s?)+$`;

// Context-aware interpolation
const re = regex('m')`
  # Only the inner regex is case insensitive (flag i)
  # Also, the outer regex's flag m is not applied to it
  ${/^a.b$/i}
  |
  # Strings are escaped and repeated as complete units
  ^ ${'a.b'}+ $
  |
  # This string is contextually sandboxed but not escaped
  ${pattern('^ a.b $')}
`;

// Numbered backreferences in interpolated regexes are adjusted
const double = /(.)\1/;
regex`^ (?<first>.) ${double} ${double} $`;
// → /^(?<first>.)(.)\2(.)\3$/v
```

See also the following examples of using subroutine definition groups to refactor regexes for readability and maintainability:

- [IP address regex](https://x.com/slevithan/status/1828112006353953055).
- [Date time regex](https://bsky.app/profile/slev.life/post/3lgc6ullyvk2x).

## ❓ Context

Due to years of legacy and backward compatibility, regular expression syntax in JavaScript is a bit of a mess. There are four different sets of incompatible syntax and behavior rules that might apply to your regexes depending on the flags and features you use. The differences are just plain hard to fully grok and can easily create subtle bugs.

<details>
  <summary>See the four parsing modes</summary>

1. Unicode-unaware (legacy) mode is the default and can easily and silently create Unicode-related bugs.
2. Named capture mode changes the meaning of `\k` when a named capture appears anywhere in a regex.
3. Unicode mode with flag <kbd>u</kbd> adds strict errors (for unreserved escapes, octal escapes, quantified lookahead, etc.), switches to code point matching (changing the potential handling of the dot, negated sets like `\W`, character class ranges, and quantifiers), changes flag <kbd>i</kbd> to apply Unicode case-folding, and adds support for new syntax.
4. UnicodeSets mode with flag <kbd>v</kbd> (an upgrade to <kbd>u</kbd>) incompatibly changes escaping rules within character classes, fixes case-insensitive matching for `\p` and `\P` within negated `[^…]`, and adds support for new features/syntax.
</details>

Additionally, JavaScript regex syntax is hard to write and even harder to read and refactor. But it doesn't have to be that way! With a few key features — raw multiline strings, insignificant whitespace, comments, subroutines, subroutine definition groups, interpolation, and *named capture only* mode — even long and complex regexes can be beautiful, grammatical, and intuitive.

Regex+ adds all of these features and returns native `RegExp` instances. It always uses flag <kbd>v</kbd> (already a best practice for new regexes) so you never forget to turn it on and don't have to worry about the differences in other parsing modes (in environments without native <kbd>v</kbd>, flag <kbd>u</kbd> is automatically used instead while applying <kbd>v</kbd>'s escaping rules so your regexes are forward and backward compatible). It also supports atomic groups and possessive quantifiers to help you avoid catastrophic backtracking, and it gives you best-in-class, context-aware interpolation of `RegExp` instances, escaped strings, and partial patterns.

## 🦾 Extended regex syntax

Historically, JavaScript regexes were not as powerful or readable as other major regex flavors like Java, .NET, PCRE, Perl, Python, and Ruby. With recent advancements and the Regex+ library, those days are over. Modern JavaScript regexes have [significantly improved](https://github.com/slevithan/awesome-regex#javascript-regex-evolution), adding lookbehind, named capture, Unicode properties, set subtraction and intersection, etc. The extended syntax and implicit flags provided by Regex+ add the key remaining pieces needed to stand alongside or surpass other major flavors.

### Atomic groups

Atomic groups are noncapturing groups with special behavior, and are written as `(?>…)`. After matching the contents of an atomic group, the regex engine automatically throws away all backtracking positions remembered by any tokens within the group. Atomic groups are most commonly used to improve performance, and are a much needed feature that Regex+ brings to native JavaScript regular expressions.

Example:

```js
regex`^(?>\w+\s?)+$`
```

This matches strings that contain word characters separated by spaces, with the final space being optional. Thanks to the atomic group, it instantly fails to find a match if given a long list of words that end with something not allowed, like `'A target string that takes a long time or can even hang your browser!'`.

Try running this without the atomic group (as `/^(?:\w+\s?)+$/`) and, due to the exponential backtracking triggered by the many ways to divide the work of the inner and outer `+` quantifiers, it will either take a *very* long time, hang your browser/server, or throw an internal error after a delay. This is called *[catastrophic backtracking](https://www.regular-expressions.info/catastrophic.html)* or *[ReDoS](https://en.wikipedia.org/wiki/ReDoS)*, and it has taken down major services like [Cloudflare](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019) and [Stack Overflow](https://stackstatus.tumblr.com/post/147710624694/outage-postmortem-july-20-2016). Regex+ and atomic groups to the rescue!

<details>
  <summary>👉 <b>Learn more with examples</b></summary>

Consider `` regex`(?>a+)ab` `` vs `` regex`(?:a+)ab` ``. The former (with an atomic group) doesn't match `'aaaab'`, but the latter does. The former doesn't match because:

- The regex engine starts by using the greedy `a+` within the atomic group to match all the `a`s in the target string.
- Then, when it tries to match the additional `a` outside the group, it fails (the next character in the target string is a `b`), so the regex engine backtracks.
- But because it can't backtrack into the atomic group to make the `+` give up its last matched `a`, there are no additional options to try and the overall match attempt fails.

For a more useful example, consider how this can affect lazy (non-greedy) quantifiers. Let's say you want to match `<b>…</b>` tags that are followed by `!`. You might try this:

```js
const re = regex('gis')`<b>.*?</b>!`;

// This is OK
'<b>Hi</b>! <b>Bye</b>.'.match(re);
// → ['<b>Hi</b>!']

// But not this
'<b>Hi</b>. <b>Bye</b>!'.match(re);
// → ['<b>Hi</b>. <b>Bye</b>!'] 👎
```

What happened with the second string was that, when an `!` wasn't found immediately following the first `</b>`, the regex engine backtracked and expanded the lazy `.*?` to match an additional character (in this case, the `<` of the `</b>` tag) and then continued onward, all the way to just before the `</b>!` at the end.

You can prevent this by wrapping the lazily quantified token and its following delimiter in an atomic group, as follows:

```js
const re = regex('gis')`<b>(?>.*?</b>)!`;

'<b>Hi</b>. <b>Bye</b>!'.match(re);
// → ['<b>Bye</b>!'] 👍
```

Now, after the regex engine finds the first `</b>` and exits the atomic group, it can no longer backtrack into the group and change what the `.*?` already matched. As a result, the match attempt fails at the beginning of this example string. The regex engine then moves on and starts over at subsequent positions in the string, eventually finding `<b>Bye</b>!`. Success.
</details>

> [!NOTE]
> Atomic groups are supported in many other regex flavors. There's a [proposal](https://github.com/tc39/proposal-regexp-atomic-operators) to add them to JavaScript.

### Possessive quantifiers

Possessive quantifiers are created by adding `+` to a quantifier, and they're similar to greedy quantifiers except they don't allow backtracking. Although greedy quantifiers start out by matching as much as possible, if the remainder of the regex doesn't find a match, the regex engine will backtrack and try all permutations of how many times the quantifier should repeat. Possessive quantifiers prevent the regex engine from doing this.

> Possessive quantifiers are syntactic sugar for [atomic groups](#atomic-groups) when their contents are a single repeated item (which could be a token, character class, or group).

Like atomic groups, possessive quantifiers are mostly useful for performance and preventing ReDoS, but they can also be used to eliminate certain matches. For example, `` regex`a++.` `` matches one or more `a` followed by a character other than `a`. Unlike `/a+./`, it won't match a sequence of only `a` characters like `'aaa'`. The possessive `++` doesn't give back any of the `a`s it matched, so in this case there's nothing left for the following `.` to match.

Here's how possessive quantifier syntax compares to the greedy and lazy quantifiers that JavaScript supports natively:

| | Greedy | Lazy | Possessive |
| :- | :-: | :-: | :-: |
| <b>Repeat</b> | As many times as possible,<br>giving back as needed | As few times as possible,<br>expanding as needed | As many times as possible,<br>without giving back
| Zero or one | `?` | `??` | `?+` |
| Zero or more | `*` | `*?` | `*+` |
| One or more | `+` | `+?` | `++` |
| *N* or more | `{2,}` | `{2,}?` | `{2,}+` |
| Between *N* and *M* | `{0,5}` | `{0,5}?` | `{0,5}+` |

> Fixed repetition quantifiers behave the same whether they're greedy `{2}`, lazy `{2}?`, or possessive `{2}+`.

> [!NOTE]
> Possessive quantifiers are supported in many other regex flavors. There's a [proposal](https://github.com/tc39/proposal-regexp-atomic-operators) to add them to JavaScript.

### Subroutines

Subroutines are written as `\g<name>` (where *name* refers to a named group), and they treat the referenced group as an independent subpattern that they try to match at the current position. This enables subpattern composition and reuse, which improves readability and maintainability.

The following example illustrates how subroutines and backreferences differ:

```js
// A backreference with \k<name>
regex`(?<prefix>sens|respons)e\ and\ \k<prefix>ibility`
/* Matches:
- 'sense and sensibility'
- 'response and responsibility' */

// A subroutine with \g<name>
regex`(?<prefix>sens|respons)e\ and\ \g<prefix>ibility`
/* Matches:
- 'sense and sensibility'
- 'sense and responsibility'
- 'response and sensibility'
- 'response and responsibility' */
```

Subroutines go beyond the composition benefits of [interpolation](#-interpolation). Apart from the obvious difference that they don't require variables to be defined outside of the regex, they also don't simply insert the referenced subpattern.

1. They can reference groups that themselves contain subroutines, chained to any depth.
2. Any capturing groups that are set during the subroutine call revert to their previous values afterwards.
3. They don't create named captures that are visible outside of the subroutine, so using subroutines doesn't lead to "duplicate capture group name" errors.

To illustrate points 2 and 3, consider:

```js
regex`
  (?<double> (?<char>.)\k<char>)
  \g<double>
  \k<double>
`
```

The backreference `\k<double>` matches whatever was matched by capturing group `(?<double>…)`, regardless of what was matched in between by the subroutine `\g<double>`. For example, this regex matches `'xx!!xx'`, but not `'xx!!!!'`.

<details>
  <summary>👉 <b>Show more details</b></summary>

- Subroutines can appear before the groups they reference.
- If there are [duplicate capture names](https://github.com/tc39/proposal-duplicate-named-capturing-groups), subroutines refer to the first instance of the given group (matching the behavior of PCRE and Perl).
- Although subroutines can be chained to any depth, a descriptive error is thrown if they're used recursively. Support for recursion can be added via a plugin (see [*Recursion*](#recursion)).
- Like backreferences, subroutines can't be used *within* character classes.
- As with all extended syntax in `regex`, subroutines are applied after interpolation, giving them maximal flexibility.
</details>

<details>
  <summary>👉 <b>Show how to define subpatterns for use by reference only</b></summary>

The following regex matches an IPv4 address such as "192.168.12.123":

```js
const ipv4 = regex`
  \b \g<byte> (\. \g<byte>){3} \b

  # Define the 'byte' subpattern
  (?<byte> 25[0-5] | 2[0-4]\d | 1\d\d | [1-9]?\d){0}
`;
```

Above, the `{0}` quantifier at the end of the `(?<byte>…)` group allows *defining* the group without *matching* it at that position. The subpattern within it can then be used by reference elsewhere within the pattern.

This next regex matches a record with multiple date fields, and captures each value:

```js
const re = regex`
  ^ Admitted:\ (?<admitted> \g<date>) \n
    Released:\ (?<released> \g<date>) $

  # Define subpatterns
  ( (?<date>  \g<year>-\g<month>-\g<day>)
    (?<year>  \d{4})
    (?<month> \d{2})
    (?<day>   \d{2})
  ){0}
`;
```

Here, the `{0}` quantifier at the end once again prevents matching its group at that position, while enabling all of the named groups within it to be used by reference.

When using a regex to find matches (e.g. via the string `matchAll` method), named groups defined this way appear on each match's `groups` object with the value `undefined` (which is the value for any capturing group that didn't participate in a match). See the next section [*Subroutine definition groups*](#subroutine-definition-groups) for a way to prevent such groups from appearing on the `groups` object.
</details>

> [!NOTE]
> Subroutines are based on the feature in PCRE and Perl. PCRE allows several syntax options including the `\g<name>` used by Regex+, whereas Perl uses `(?&name)`. Ruby also supports subroutines (and uses the `\g<name>` syntax), but it has behavior differences related to capturing and backreferences that arguably make its subroutines less useful.

### Subroutine definition groups

The syntax `(?(DEFINE)…)` can be used at the end of a regex to define subpatterns for use by reference only. When combined with [subroutines](#subroutines), this enables writing regexes in a grammatical way that can significantly improve readability and maintainability.

> Named groups defined within subroutine definition groups don't appear on the `groups` object of matches.

Example:

```js
const re = regex`
  ^ Admitted:\ (?<admitted> \g<date>) \n
    Released:\ (?<released> \g<date>) $

  (?(DEFINE)
    (?<date>  \g<year>-\g<month>-\g<day>)
    (?<year>  \d{4})
    (?<month> \d{2})
    (?<day>   \d{2})
  )
`;
const record = 'Admitted: 2024-01-01\nReleased: 2024-01-03';
const match = re.exec(record);
console.log(match.groups);
/* → {
  admitted: '2024-01-01',
  released: '2024-01-03'
} */
```

> [!NOTE]
> Subroutine definition groups are based on the feature in PCRE and Perl. However, Regex+ supports a stricter version since it limits their placement, quantity, and the top-level syntax that can be used within them.

<details>
  <summary>👉 <b>Show more details</b></summary>

- **Quantity:** Only one definition group is allowed per regex, but it can contain any number of named groups and those groups can appear in any order.
- **Placement:** Apart from trailing whitespace and comments (allowed by implicit flag <kbd>x</kbd>), definition groups must appear at the end of their pattern.
- **Contents:** At the top level of definition groups, only named groups, whitespace, and comments are allowed.
- **Duplicate names:** All named groups within definition groups must use unique names.
- **Casing:** The word `DEFINE` must appear in uppercase.
</details>

### Recursion

The official Regex+ plugin [regex-recursion](https://github.com/slevithan/regex-recursion) enables the syntax `(?R)` and `\g<name>` to match recursive/balanced patterns up to a specified max depth (2–100).

## 🚩 Flags

Flags are added like this:

```js
regex('gm')`^.+`
```

`RegExp` instances interpolated into the pattern preserve their own flags locally (see [*Interpolating regexes*](#interpolating-regexes)).

### Implicit flags

Flag <kbd>v</kbd> and emulated flags <kbd>x</kbd> and <kbd>n</kbd> are always on when using `regex`, giving your regexes a modern baseline syntax and avoiding the need to continually opt-in to their superior modes.

> For special situations such as when using Regex+ within other tools, implicit flags can be disabled. See: [*Options*](#-options).

### Flag `v`

JavaScript's native flag <kbd>v</kbd> gives you the best level of Unicode support, strict errors, and all the latest regex features like character class set operations and properties of strings (see [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/unicodeSets)). It's always on when using `regex`, which helps avoid numerous Unicode-related bugs, and means there's only one way to parse a regex instead of [four](#-context) (so you only need to remember one set of regex syntax and behavior).

Flag <kbd>v</kbd> is applied to the full pattern after interpolation happens.

> In environments without native support for flag <kbd>v</kbd>, flag <kbd>u</kbd> is automatically used instead while applying <kbd>v</kbd>'s escaping rules so your regexes are forward and backward compatible.

### Flag `x`

Emulated flag <kbd>x</kbd> makes whitespace insignificant and adds support for line comments (starting with `#`), allowing you to freely format your regexes for readability. It's always implicitly on, though it doesn't extend into interpolated `RegExp` instances (to avoid changing their meaning).

Example:

```js
const re = regex`
  # Match a date in YYYY-MM-DD format
  (?<year>  \d{4}) - # Year part
  (?<month> \d{2}) - # Month part
  (?<day>   \d{2})   # Day part

  # Escape whitespace and hashes to match them literally
  \    # space char
  \x20 # space char
  \#   # hash char
  \s   # any whitespace char

  # Since embedded strings are always matched literally, you can also match
  # whitespace by embedding it as a string
  ${' '}+

  # Patterns are directly embedded, so they use free spacing
  ${pattern`\d + | [a - z]`}

  # Interpolated regexes use their own flags, so they preserve their whitespace
  ${/^Fat cat$/m}
`;
```

> [!NOTE]
> Flag <kbd>x</kbd> is based on the JavaScript [proposal](https://github.com/tc39/proposal-regexp-x-mode) for it as well as support in many other regex flavors. Note that the rules for whitespace *within character classes* are inconsistent across regex flavors, so Regex+ follows the JavaScript proposal and the flag <kbd>xx</kbd> option from Perl and PCRE.

<details>
  <summary>👉 <b>Show more details</b></summary>

- Within a character class, `#` is not a special character. It matches a literal `#` and doesn't start a comment. Additionally, the only insignificant whitespace characters within character classes are <kbd>space</kbd> and <kbd>tab</kbd>.
- Outside of character classes, insignificant whitespace includes all Unicode characters matched natively by `\s`.
- Whitespace and comments still separate tokens, so they aren't *ignored*. This is important with e.g. `\0 1`, which matches a null character followed by a literal `1`, rather than throwing as the invalid token `\01` would. Conversely, things like `\x 0A` and `(? :` are errors because the whitespace splits a valid node into incomplete parts.
- Quantifiers that follow whitespace or comments apply to the preceeding token, so `x +` is equivalent to `x+`.
- Whitespace is not insignificant within most enclosed tokens like `\p{…}` and `\u{…}`. The exception is `[\q{…}]`.
- Line comments with `#` do not extend into or beyond interpolation, so interpolation effectively acts as a terminating newline for the comment.
</details>

### Flag `n`

Emulated flag <kbd>n</kbd> gives you *named capture only* mode, which turns unnamed groups `(…)` into noncapturing groups. It's always implicitly on, though it doesn't extend into interpolated `RegExp` instances (to avoid changing their meaning).

Requiring the syntactically clumsy `(?:…)` where you could just use `(…)` hurts readability and encourages adding unneeded captures (which hurt efficiency and refactoring). Flag <kbd>n</kbd> fixes this, making your regexes more readable.

Example:

```js
// Doesn't capture
regex`\b(ab|cd)\b`
// Use standard (?<name>…) to capture as `name`
```

> [!NOTE]
> Flag <kbd>n</kbd> is based on .NET, C++, Oniguruma, PCRE, Perl, and XRegExp. Most of these share the flag letter <kbd>n</kbd>, but the option is variously called *explicit capture*, *no auto capture*, *don't capture group*, or *nosubs*. In Regex+, flag <kbd>n</kbd> also prevents using numbered backreferences to named groups, which follows the behavior of C++ and the default handling of Oniguruma and Ruby. Referring to named groups by number is a footgun, and the way that named groups are numbered is inconsistent across regex flavors.

## 🧩 Interpolation

### Interpolating regexes

The meaning of flags (or their absense) on interpolated regexes is preserved. For example, with flag <kbd>i</kbd> (`ignoreCase`):

```js
regex`hello-${/world/i}`
// Matches 'hello-WORLD' but not 'HELLO-WORLD'

regex('i')`hello-${/world/}`
// Matches 'HELLO-world' but not 'HELLO-WORLD'
```

This is also true for other flags that can change how an inner regex is matched: `m` (`multiline`) and `s` (`dotAll`).

> As with all interpolation in `regex`, embedded regexes are sandboxed and treated as complete units. For example, a following quantifier repeats the entire embedded regex rather than just its last token, and top-level alternation in the embedded regex will not break out to affect the meaning of the outer regex. Numbered backreferences within embedded regexes are adjusted to work within the overall pattern.

<details>
  <summary>👉 <b>Show more details</b></summary>

- Regexes can't be interpolated inside character classes (so `` regex`[${/./}]` `` is an error) because the syntax context doesn't match. See [*Interpolating partial patterns*](#interpolating-partial-patterns) for a way to safely embed regex syntax (rather than `RegExp` instances) in character classes and other edge-case locations with different context.
- To change the flags used by an interpolated regex, use the built-in capability of `RegExp` to copy a regex while providing new flags. E.g. `new RegExp(/./, 's')`.
</details>

### Interpolating escaped strings

The `regex` tag escapes special characters in interpolated strings (and values coerced to strings). This escaping is done in a context-aware and safe way that prevents changing the meaning or error status of characters outside the interpolated string.

> As with all interpolation in `regex`, escaped strings are sandboxed and treated as complete units. For example, a following quantifier repeats the entire escaped string rather than just its last character. And if interpolating into a character class, the escaped string is treated as a flag-<kbd>v</kbd>-mode nested union if it contains more than one character node.

As a result, `regex` is a safe and context-aware alternative to JavaScript proposal [`RegExp.escape`](https://github.com/tc39/proposal-regex-escaping).

```js
// Instead of
RegExp.escape(str)
// You can say
regex`${str}`.source

// Instead of
new RegExp(`^(?:${RegExp.escape(str)})+$`)
// You can say
regex`^${str}+$`

// Instead of
new RegExp(`[a-${RegExp.escape(str)}]`, 'u') // Flag u/v required to avoid bugs
// You can say
regex`[a-${str}]`
// Given the context at the end of a range, throws if more than one char in str

// Instead of
new RegExp(`[\\w--[${RegExp.escape(str)}]]`, 'v') // Set subtraction
// You can say
regex`[\w--${str}]`
```

Some examples of where context awareness comes into play:

- A `~` is not escaped at the top level, but it must be escaped within character classes if it's immediately preceded or followed by another `~` (in or outside of the interpolation) which would turn it into a reserved UnicodeSets double punctuator.
- Leading digits must be escaped if they're preceded by a numbered backreference or `\0`, else `RegExp` throws (or in Unicode-unaware mode they might turn into octal escapes).
- Letters `A`-`Z` and `a`-`z` must be escaped if preceded by uncompleted token `\c`, else they'll convert what should be an error into a valid token that probably doesn't match what you expect.
- You can't escape your way out of protecting against a preceding unescaped `\`. Doing nothing could turn e.g. `w` into `\w` and introduce a bug, but then escaping the first character wouldn't prevent the `\` from mangling it, and if you escaped the preceding `\` elsewhere in your code you'd change its meaning.

These and other issues (including the effects of current and potential future flags like <kbd>x</kbd>) make escaping without context unsafe to use at arbitrary positions in a regex, or at least complicated to get right. The existing popular regex escaping libraries don't even attempt to handle these kinds of issues.

`regex` solves all of this via context awareness. So instead of remembering anything above, you should just switch to always safely escaping regex syntax via `regex`.

### Interpolating partial patterns

As an alternative to interpolating `RegExp` instances, you might sometimes want to interpolate partial regex patterns as strings. Some example use cases:

- Adding a pattern inside a character class (not allowed for `RegExp` instances since their top-level syntax context doesn't match).
- When you don't want the pattern to specify its own, local flags.
- Composing a dynamic number of strings escaped via `regex` interpolation.
- Dynamically adding backreferences without their corresponding captures (which wouldn't be valid as a standalone `RegExp`).

For all of these cases, you can `import {pattern} from 'regex'` and then interpolate `pattern(str)` to avoid escaping special characters in the string or creating an intermediary `RegExp` instance. You can also use `` pattern`…` `` as a tag, as shorthand for ``pattern(String.raw`…`)``.

Apart from edge cases, `pattern` just embeds the provided string or other value directly. But because it handles the edge cases, patterns can safely be interpolated anywhere in a regex without worrying about their meaning being changed by (or making unintended changes in meaning to) the surrounding expression.

> As with all interpolation in `regex`, patterns are sandboxed and treated as complete units. This is relevant e.g. if a pattern is followed by a quantifier, if it contains top-level alternation, or if it's bordered by a character class range, subtraction, or intersection operator.

If you want to understand the handling of interpolated patterns more deeply, let's look at some edge cases…

<details>
  <summary>👉 <b>Show some edge cases</b></summary>

First, let's consider:

```js
regex`[${pattern`^`}a]`
regex`[a${pattern`^`}]`
```

Although `[^…]` is a negated character class, `^` *within* a class doesn't need to be escaped, even with the strict escaping rules of flags <kbd>u</kbd> and <kbd>v</kbd>.

Both of these examples therefore match a literal `^` or `a`. The interpolated patterns don't change the meaning of the surrounding character class. However, note that the `^` is not simply escaped, as it would be with `` regex`[${'^'}a]` ``. You can see this by the fact that embedding `` pattern`^^` `` in a character class correctly leads to an "invalid set operation" error due to the use of a reserved double-punctuator.

> If you wanted to dynamically choose whether to negate a character class, you could put the whole character class inside the pattern.

Moving on, the following lines all throw because otherwise the embedded patterns would break out of their interpolation sandboxes and change the meaning of surrounding syntax:

```js
regex`(${pattern(')')})`
regex`[${pattern(']')}]`
regex`[${pattern('a\\')}]]`
```

But these are fine since they don't break out:

```js
regex`(${pattern('()')})`
regex`[\w--${pattern('[_]')}]`
regex`[${pattern('\\\\')}]`
```

Patterns can be embedded within any token scope:

```js
// Not using `pattern` for values that are not escaped anyway, but the behavior
// would be the same if you did
regex`.{1,${6}}`
regex`\p{${'Letter'}}`
regex`\u{${'000A'}}`
regex`(?<${'name'}>…)\k<${'name'}>`
regex`[a-${'z'}]`
regex`[\w--${'_'}]`
```

But again, changing the meaning or error status of characters outside the interpolation is an error:

```js
// Not using `pattern` for values that are not escaped anyway
/* 1.*/ regex`\u${'000A'}`
/* 2.*/ regex`\u{${pattern`A}`}`
/* 3.*/ regex`(${pattern`?:`}…)`
```

These last examples are all errors due to the corresponding reasons below:

1. This is an uncompleted `\u` token (which is an error) followed by the tokens `0`, `0`, `0`, `A`. That's because the interpolation doesn't happen within an enclosed `\u{…}` context.
2. The unescaped `}` within the interpolated pattern is not allowed to break out of its sandbox.
3. The group opening `(` can't be quantified with `?`.

> Characters outside the interpolation such as a preceding, unescaped `\` or an escaped number also can't change the meaning of tokens inside the embedded pattern.

And since interpolated values are handled as complete units, consider the following:

```js
// This works fine
regex`[\0-${pattern`\cZ`}]`

// But this is an error since you can't create a range from 'a' to the set 'de'
regex`[a-${'de'}]`
// It's the same as if you tried to use /[a-[de]]/v

// Instead, use either of
regex`[a-${'d'}${'e'}]`
regex`[a-${'d'}e]`
// These are equivalent to /[a-de]/ or /[[a-d][e]]/v
```
</details>

> Implementation note: `pattern` returns an object with a custom `toString` that simply returns `String(value)`.

> Patterns are not intended as an intermediate regex type. You can think of `pattern` as a directive to the `regex` tag: treat this string as a partial pattern rather than a string to be matched literally.

### Interpolation principles

The above descriptions of interpolation might feel complex. But there are three simple rules that guide the behavior in all cases:

1. Interpolation never changes the meaning or error status of characters outside of the interpolation, and vice versa.
2. Interpolated values are always aware of the context of where they're embedded.
3. When relevant, interpolated values are always treated as complete units.

> Examples where rule #3 is relevant: With following quantifiers, if they contain top-level alternation or numbered backreferences, or if they're placed in a character class range or set operation.

### Interpolation contexts

<table>
  <tr>
    <th>Context</th>
    <th>Example</th>
    <th>String / coerced</th>
    <th>Pattern</th>
    <th>RegExp</th>
  </tr>
  <tr valign="top">
    <td>Default</td>
    <td><code>regex`${'^.+'}`</code></td>
    <td>•&nbsp;Sandboxed <br> •&nbsp;Atomized <br> •&nbsp;Escaped</td>
    <td>•&nbsp;Sandboxed <br> •&nbsp;Atomized</td>
    <td>•&nbsp;Sandboxed <br> •&nbsp;Atomized <br> •&nbsp;Backrefs adjusted <br> •&nbsp;Flags localized</td>
  </tr>
  <tr valign="top">
    <td>Character class: <code>[…]</code>, <code>[^…]</code>, <code>[[…]]</code>, etc.</td>
    <td><code>regex`[${'a-z'}]`</code></td>
    <td>•&nbsp;Sandboxed <br> •&nbsp;Atomized <br> •&nbsp;Escaped</td>
    <td>•&nbsp;Sandboxed <br> •&nbsp;Atomized</td>
    <td><i>Error</i></td>
  </tr>
  <tr valign="top">
    <td>Interval quantifier: <code>{…}</code></td>
    <td><code>regex`.{1,${5}}`</code></td>
    <td rowspan="3">•&nbsp;Sandboxed <br> •&nbsp;Escaped</td>
    <td rowspan="3">•&nbsp;Sandboxed</td>
    <td rowspan="3"><i>Error</i></td>
  </tr>
  <tr valign="top">
    <td>Enclosed token: <code>\p{…}</code>, <code>\P{…}</code>, <code>\u{…}</code>, <code>[\q{…}]</code></td>
    <td><code>regex`\u{${'A0'}}`</code></td>
  </tr>
  <tr valign="top">
    <td>Group name: <code>(?<…>)</code>, <code>\k<…></code>, <code>\g<…></code></td>
    <td><code>regex`…\k<${'a'}>`</code></td>
  </tr>
</table>

<details>
  <summary>👉 <b>Show more details</b></summary>

- *Atomized* means that the value is treated as a complete unit; it isn't related to the *atomic groups* feature. For example, in default context, `${foo}*` matches any number of `foo`; not just its last token. In character class context, subtraction and intersection operators apply to the entire atom.
- *Sandboxed* means that the value can't change the meaning or error status of characters outside of the interpolation, and vice versa.
- Character classes have a sub-context on the borders of ranges. Only one character node (e.g. `a` or `\u0061`) can be interpolated at these positions.
- Numbers interpolated into an enclosed `\u{…}` context are converted to hexadecimal.
- The implementation details vary for how `regex` accomplishes sandboxing and atomization, based on the details of the specific pattern. But the concepts should always hold up.
</details>

## 🔩 Options

Typically, `regex` is used as follows:

```js
regex`…` // Without flags
regex('gi')`…` // With flags
```

However, several options are available that can be provided via an options object in place of the flags argument. These options aren't usually needed, and are primarily intended for use within other tools.

Following are the available options and their default values:

```js
regex({
  flags: '',
  subclass: false,
  plugins: [],
  unicodeSetsPlugin: <function>,
  disable: {
    x: false,
    n: false,
    v: false,
    atomic: false,
    subroutines: false,
  },
  force: {
    v: false,
  },
})`…`;
```

<details>
  <summary>👉 <b>Show details for each option</b></summary>

**`flags`** — For providing flags when using an options object.

**`subclass`** — When `true`, the resulting regex is constructed using a `RegExp` subclass that avoids edge case issues with numbered backreferences. Without subclassing, submatches referenced *by number* from outside of the regex (e.g. in replacement strings) might reference the wrong values, because `regex`'s emulation of extended syntax might add unnamed captures to generated regex source that can affect group numbering.

Context: `regex`'s implicit flag <kbd>n</kbd> (*named capture only* mode) means that all captures have names, so normally there's no need to reference submatches by number. In fact, flag <kbd>n</kbd> *prevents* you from doing so within the regex. And even in edge cases (such as when interpolating `RegExp` instances with numbered backreferences, or when flag <kbd>n</kbd> is explicitly disabled), any numbered backreferences within the regex are automatically adjusted to work correctly. However, issues can arise if you reference submatches by number (instead of their group names) from outside of the regex. Setting `subclass: true` resolves this, since the subclass knows about captures that are added only to emulate extended syntax, and automatically adjusts match results in all contexts.

> This option isn't enabled by default because it would prevent Regex+'s Babel plugin from emitting regex literals. It also has a tiny performance cost, and is rarely needed. The primary use case is tools that use `regex` internally with flag <kbd>n</kbd> disabled.

**`plugins`** — An array of functions. Plugins are called in order, after applying emulated flags and interpolation, but before the built-in plugins for extended syntax. This means that plugins can output extended syntax like atomic groups and subroutines. Plugins are expected to return an object with a string property `pattern`, and are called with two arguments:

1. The pattern, as processed so far by preceding plugins, etc.
2. An object with a `flags` property that includes the native (non-emulated) flags that will be used by the regex.

The final result after running all plugins is provided to the `RegExp` constructor.

> The tiny [regex-utilities](https://github.com/slevithan/regex-utilities) library is intended for use in plugins, and can make it easier to work with regex syntax.

**`unicodeSetsPlugin`** — A plugin function that's used when flag <kbd>v</kbd> isn't supported natively, or when implicit flag <kbd>v</kbd> is disabled. The default value is a built-in function that provides basic backward compatibility by applying flag <kbd>v</kbd>'s escaping rules and throwing on use of <kbd>v</kbd>-only syntax (nested character classes, set subtraction/intersection, etc.).

- Setting `unicodeSetsPlugin` to `null` prevents `regex` from applying flag <kbd>v</kbd>'s escaping rules. This can be useful in combination with option `disable: {v: true}` for tools that want to use `regex`'s extended syntax and/or flags but need to accept input with flag <kbd>u</kbd>'s escaping rules.
- Regex+ is not primarily a backward compatibility library, so in order to remain lightweight, it doesn't transpile flag <kbd>v</kbd>'s new features out of the box. By replacing the default function, you can add backward compatible support for these features. See also: [*Compatibility*](#-compatibility).
- This plugin runs last, which means it's possible to wrap an existing library (e.g. [regexpu-core](https://github.com/mathiasbynens/regexpu-core), used by Babel to [transpile <kbd>v</kbd>](https://babel.dev/docs/babel-plugin-transform-unicode-sets-regex)), without the library needing to understand `regex`'s extended syntax.

**`disable`** — A set of options that can be individually disabled by setting their values to `true`.

- **`x`** — Disables implicit, emulated [flag <kbd>x</kbd>](#flag-x).
- **`n`** — Disables implicit, emulated [flag <kbd>n</kbd>](#flag-n). Note that, although it's safe to use unnamed captures and numbered backreferences within a regex when flag <kbd>n</kbd> is disabled, referencing submatches by number from *outside* a regex (e.g. in replacement strings) can result in incorrect values because extended syntax might add additional unnamed captures to generated regex source. It's therefore recommended to enable the `subclass` option when disabling `n`.
- **`v`** — Disables implicit [flag <kbd>v</kbd>](#flag-v) even when it's supported natively, resulting in flag <kbd>u</kbd> being added instead (in combination with the `unicodeSetsPlugin`).
- **`atomic`** — Disables [atomic groups](#atomic-groups) and [possessive quantifiers](#possessive-quantifiers), resulting in a syntax error if they're used.
- **`subroutines`** — Disables [subroutines](#subroutines) and [subroutine definition groups](#subroutine-definition-groups), resulting in a syntax error if they're used.

**`force`** — Options that, if set to `true`, override default settings (as well as options set on the `disable` object).

- **`v`** — Forces the use of flag <kbd>v</kbd> even when it's not supported natively (resulting in an error).
</details>

### Returning a string

Function `rewrite` returns an object with properties `pattern` and `flags` as strings, rather than returning a `RegExp` instance. This can be useful when you want to apply postprocessing to the output.

```js
import {rewrite} from 'regex';
rewrite('^ (ab | cd)', {flags: 'm'});
// → {pattern: '^(?:ab|cd)', flags: 'mv'}
```

`rewrite` shares all of `regex`'s options (described above) except `subclass`. Providing the resulting `pattern` and `flags` to the `RegExp` constructor produces the same result as using the `regex` tag.

> Since `rewrite` isn't a template tag, it doesn't provide context-aware interpolation and doesn't automatically handle input as a raw string (you need to escape your backslashes).

## ⚡ Performance

`regex` transpiles its input to native `RegExp` instances. Therefore regexes created by `regex` perform equally as fast as native regexes. The use of `regex` can also be transpiled via a [Babel plugin](https://github.com/slevithan/babel-plugin-transform-regex), avoiding the tiny overhead of transpiling at runtime.

For regexes that rely on or have the potential to trigger heavy backtracking, you can dramatically improve beyond native performance via `regex`'s [atomic groups](#atomic-groups) and [possessive quantifiers](#possessive-quantifiers).

## 🪶 Compatibility

`regex` uses flag <kbd>v</kbd> (`unicodeSets`) when it's supported natively. Flag <kbd>v</kbd> is supported by Node.js 20 and 2023-era browsers ([compat table](https://caniuse.com/mdn-javascript_builtins_regexp_unicodesets)). When <kbd>v</kbd> isn't available, flag <kbd>u</kbd> is automatically used instead while enforcing <kbd>v</kbd>'s escaping rules, which extends support to Node.js 14 and 2020-era browsers or earlier. The exception is Safari, which is supported starting with v16.4 (released 2023-03-27).

The following edge cases rely on modern JavaScript features:

- To ensure atomization, `regex` uses nested character classes (which require flag <kbd>v</kbd>) when interpolating more than one token at a time *inside character classes*. A descriptive error is thrown when this isn't supported, which you can avoid by not interpolating multi-token patterns/strings into character classes. There's also an easy workaround: put the whole character class in a `pattern` and interpolate a string into the pattern.
- Using an interpolated `RegExp` instance with a different value for flag <kbd>i</kbd> than its outer regex relies on [pattern modifiers](https://github.com/tc39/proposal-regexp-modifiers), an ES2025 feature available in Node.js 23, Chrome/Edge 125, Firefox 132, and Opera 111. A descriptive error is thrown in environments without support, which you can avoid by aligning the use of flag <kbd>i</kbd> on inner and outer regexes. Local-only application of other flags doesn't rely on this feature.

## 🙋 FAQ

<details name="faq">
  <summary><b>How are you comparing regex flavors?</b></summary>

The claim that JavaScript with the Regex+ library is among the best regex flavors is based on a holistic view. Following are some of the aspects considered:

1. **Performance:** An important aspect, but not the main one since mature regex implementations are generally pretty fast. JavaScript is strong on regex performance (at least considering V8's Irregexp engine and JavaScriptCore), but it uses a backtracking engine that's missing any syntax for backtracking control — a major limitation that makes ReDoS vulnerability more common. `regex` adds atomic groups to native JavaScript regexes, which is a solution to this problem and therefore can dramatically improve performance.
2. **Support for advanced features** that handle common or important use cases: Here, JavaScript stepped up its game with ES2018 and ES2024. JavaScript is now best in class for some features like lookbehind (with it's infinite-length support) and Unicode properties (with multicharacter "properties of strings", set subtraction and intersection, and script extensions). These features are either not supported or not as robust in many other flavors.
3. **Ability to write readable and maintainable patterns:** Here, native JavaScript has long been the worst of the major flavors, since it lacks the <kbd>x</kbd> (extended) flag that allows insignificant whitespace and comments. `regex` not only adds <kbd>x</kbd> (and turns it on by default), but it additionally adds regex subroutines and subroutine definition groups (matched only by PCRE and Perl, although some other flavors have inferior versions) which enable powerful subpattern composition and reuse. And it includes context-aware interpolation of `RegExp` instances, escaped strings, and partial patterns, all of which can also help with composition and readability.
</details>

<details name="faq">
  <summary><b>Can <code>regex</code> be called as a function instead of using it with backticks?</b></summary>

Yes, but you might not need to. If you want to use `regex` with dynamic input, you can interpolate a `pattern` call as the full expression. For example:

```js
import {regex, pattern} from 'regex';
const str = '…';
const re = regex('g')`${pattern(str)}`;
```

If you prefer to call `regex` as a function (rather than using it as a template tag), that requires explicitly providing the raw template strings array, as follows:

```js
import {regex} from 'regex';
const str = '…';
const re = regex('g')({raw: [str]});
```
</details>

<details name="faq">
  <summary><b>Why are flags added via <code>regex('g')`…`</code> rather than <code>regex`/…/g`</code>?</b></summary>

The alternative syntax isn't used because it has several disadvantages:

- It doesn't match the `RegExp` constructor's syntax.
- It doesn't match regex literal syntax either, since there are no multiline regex literals (and they're not planned for the future), plus regex literals don't allow unescaped `/` outside of character classes.
- Flags-up-front can be more readable, especially with long or multiline regexes that make flags easy to miss when they're at the end. And since some flags change the meaning of regex syntax, it can help to read them first.
- It would most likely be incompatible if a standardized regex template tag was added to the JavaScript language in the future. To date, TC39 discussions about a standardized tag for regexes have not favored the `` `/…/g` `` format.
</details>

## 🏷️ About

Regex+ was created by [Steven Levithan](https://github.com/slevithan) and [contributors](https://github.com/slevithan/regex/graphs/contributors). Inspiration included [PCRE](https://github.com/PCRE2Project/pcre2), [XRegExp](https://github.com/slevithan/xregexp), and [regexp-make-js](https://github.com/mikesamuel/regexp-make-js).

If you want to support this project, I'd love your help by contributing improvements, sharing it with others, or [sponsoring](https://github.com/sponsors/slevithan) ongoing development.

© 2024–present. MIT License.

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/regex?color=78C372
[npm-version-href]: https://npmjs.com/package/regex
[npm-downloads-src]: https://img.shields.io/npm/dm/regex?color=78C372
[npm-downloads-href]: https://npmjs.com/package/regex
[bundle-src]: https://img.shields.io/bundlejs/size/regex?color=78C372&label=minzip
[bundle-href]: https://bundlejs.com/?q=regex&treeshake=[*]
