# regex-recursion

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]

This is an official plugin for [Regex+](https://github.com/slevithan/regex) that adds support for recursive matching up to a specified max depth *N*, where *N* can be between 2 and 100. Generated regexes are native JavaScript `RegExp` instances.

> [!NOTE]
> Regex flavors vary on whether they offer infinite or fixed-depth recursion. For example, recursion in Oniguruma uses a depth limit of 20, and doesn't allow changing this.

Recursive matching is added to a regex via one of the following (the recursion depth limit is provided in place of *`N`*):

- `(?R=N)` — Recursively match the entire regex at this position.
- `\g<name&R=N>` or `\g<number&R=N>` — Recursively match the contents of the group referenced by name or number at this position.
  - The `\g` subroutine must be *within* the referenced group.

Multiple uses of recursion within the same pattern are allowed if they are non-overlapping. Named captures and backreferences are supported within recursion, and are independent per depth level. So e.g. `groups.name` on a match object is the value captured by group `name` at the top level of the recursion stack.

## Install and use

```sh
npm install regex regex-recursion
```

```js
import {regex} from 'regex';
import {recursion} from 'regex-recursion';

const re = regex({plugins: [recursion]})`…`;
```

<details>
  <summary>Using a global name (no import)</summary>

```html
<script src="https://cdn.jsdelivr.net/npm/regex@6.0.1/dist/regex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/regex-recursion@6.0.2/dist/regex-recursion.min.js"></script>
<script>
  const {regex} = Regex;
  const {recursion} = Regex.plugins;

  const re = regex({plugins: [recursion]})`…`;
</script>
```
</details>

## Examples

### Match an equal number of two different subpatterns

#### Anywhere within a string

```js
// Matches sequences of up to 20 'a' chars followed by the same number of 'b'
const re = regex({plugins: [recursion]})`a(?R=20)?b`;
re.exec('test aaaaaabbb')[0];
// → 'aaabbb'
```

#### As the entire string

Use `\g<name&R=N>` to recursively match just the specified group.

```js
const re = regex({plugins: [recursion]})`
  ^ (?<r> a \g<r&R=20>? b) $
`;
re.test('aaabbb'); // → true
re.test('aaabb'); // → false
```

### Match balanced parentheses

```js
// Matches all balanced parentheses up to depth 20
const parens = regex({flags: 'g', plugins: [recursion]})`
  \( ([^\(\)] | (?R=20))* \)
`;

'test ) (balanced ((parens))) () ((a)) ( (b)'.match(parens);
/* → [
  '(balanced ((parens)))',
  '()',
  '((a))',
  '(b)'
] */
```

Following is an alternative that matches the same strings, but adds a nested quantifier. It then uses an atomic group to prevent this nested quantifier from creating the potential for [catastrophic backtracking](https://www.regular-expressions.info/catastrophic.html). Since the example above doesn't need a nested quantifier, this is not an improvement but merely an alternative that shows how to deal with the general problem of nested quantifiers with multiple ways to divide matches of the same strings.

```js
const parens = regex({flags: 'g', plugins: [recursion]})`
  \( ((?> [^\(\)]+) | (?R=20))* \)
`;

// Or with a possessive quantifier
const parens = regex({flags: 'g', plugins: [recursion]})`
  \( ([^\(\)]++ | (?R=20))* \)
`;
```

The first example above matches sequences of non-parentheses in one step with the nested `+` quantifier, and avoids backtracking into these sequences by wrapping it with an atomic group `(?>…)`. Given that what the nested quantifier `+` matches overlaps with what the outer group can match with its `*` quantifier, the atomic group is important here. It avoids exponential backtracking when matching long strings with unbalanced parentheses.

In cases where you're you're repeating a single token within an atomic group, possessive quantifiers provide syntax sugar.

Atomic groups and possessive quantifiers are provided by the base Regex+ library.

### Match palindromes

#### Match palindromes anywhere within a string

```js
const palindromes = regex({flags: 'gi', plugins: [recursion]})`
  (?<char> \w)
  # Recurse, or match a lone unbalanced char in the middle
  ((?R=15) | \w?)
  \k<char>
`;

'Racecar, ABBA, and redivided'.match(palindromes);
// → ['Racecar', 'ABBA', 'edivide']
```

Palindromes are sequences that read the same backwards as forwards. In the example above, the max length of matched palindromes is 31. That's because it sets the max recursion depth to 15 with `(?R=15)`. So, depth 15 × 2 chars (left + right) for each depth level + 1 optional unbalanced char in the middle = 31. To match longer palindromes, the max recursion depth can be increased to a max of 100, which would enable matching palindromes up to 201 characters long.

#### Match palindromes as complete words

```js
const palindromeWords = regex({flags: 'gi', plugins: [recursion]})`
  \b
  (?<palindrome>
    (?<char> \w)
    (\g<palindrome&R=15> | \w?)
    \k<char>
  )
  \b
`;

'Racecar, ABBA, and redivided'.match(palindromeWords);
// → ['Racecar', 'ABBA']
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/regex-recursion?color=78C372
[npm-version-href]: https://npmjs.com/package/regex-recursion
[npm-downloads-src]: https://img.shields.io/npm/dm/regex-recursion?color=78C372
[npm-downloads-href]: https://npmjs.com/package/regex-recursion
[bundle-src]: https://img.shields.io/bundlejs/size/regex-recursion?color=78C372&label=minzip
[bundle-href]: https://bundlejs.com/?q=regex-recursion&treeshake=[*]
