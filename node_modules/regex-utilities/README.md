# regex-utilities

[![build status](https://github.com/slevithan/regex-utilities/workflows/CI/badge.svg)](https://github.com/slevithan/regex-utilities/actions)
[![npm](https://img.shields.io/npm/v/regex-utilities)](https://www.npmjs.com/package/regex-utilities)
[![bundle size](https://deno.bundlejs.com/badge?q=regex-utilities&treeshake=[*])](https://bundlejs.com/?q=regex-utilities&treeshake=[*])

Tiny utilities that the [regex](https://github.com/slevithan/regex) library makes available for reuse in its plugins. Useful for parsing and processing regular expression syntax in a lightweight way, when you don't need a full regex AST.

## Constants

### `Context`

Frozen object with the following properties for tracking regex syntax context:

- `DEFAULT` - Base context.
- `CHAR_CLASS` - Character class context.

## Functions

For all of the following functions, argument `expression` is the target string, and `needle` is the regex pattern to search for.

- Argument `expression` (the string being searched through) is assumed to be a flag-`v`-mode regex pattern string. In other words, nested character classes within it are supported when determining the context for a match.
- Argument `needle` (the regex pattern being searched for) is provided as a string, and is applied with flags `su`.
- If argument `context` is not provided, matches are allowed in all contexts. In other words, inside and outside of character classes.

### `replaceUnescaped`

*Arguments: `expression, needle, replacement, [context]`*

Replaces all unescaped instances of a regex pattern in the given context, using a replacement string or function.

<details>
  <summary>Examples with a replacement string</summary>

```js
const str = '.\\.\\\\.[[\\.].].';
replaceUnescaped(str, '\\.', '@');
// → '@\\.\\\\@[[\\.]@]@'
replaceUnescaped(str, '\\.', '@', Context.DEFAULT);
// → '@\\.\\\\@[[\\.].]@'
replaceUnescaped(str, '\\.', '@', Context.CHAR_CLASS);
// → '.\\.\\\\.[[\\.]@].'
```
</details>

Details for the `replacement` argument:

- If a string is provided, it's used literally without special handling for backreferences, etc.
- If a function is provided, it receives two arguments:
  1. The match object (which includes `groups`, `index`, etc.).
  2. An object with extended details (`context` and `negated`) about where the match was found.

### `execUnescaped`

*Arguments: `expression, needle, [pos = 0], [context]`*

Returns a match object for the first unescaped instance of a regex pattern in the given context, or `null`.

### `hasUnescaped`

*Arguments: `expression, needle, [context]`*

Checks whether an unescaped instance of a regex pattern appears in the given context.

### `forEachUnescaped`

*Arguments: `expression, needle, callback, [context]`*

Runs a function for each unescaped match of a regex pattern in the given context. The function receives two arguments:

1. The match object (which includes `groups`, `index`, etc.).
2. An object with extended details (`context` and `negated`) about where the match was found.

### `getGroupContents`

*Arguments: `expression, contentsStartPos`*

Extracts the full contents of a group (subpattern) from the given expression, accounting for escaped characters, nested groups, and character classes. The group is identified by the position where its contents start (the string index just after the group's opening delimiter). Returns the rest of the string if the group is unclosed.
