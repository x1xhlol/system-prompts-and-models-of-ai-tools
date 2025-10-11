class Pattern {
  #value;
  /** @param {string} value */
  constructor(value) {
    this.#value = value;
  }
  /** @returns {string} */
  toString() {
    return String(this.#value);
  }
}

/**
Returns a value that can be interpolated into a `regex` template string without having its special
characters escaped.

Can be called as a function or template tag:
- `pattern(value)` - String or value coerced to string.
- `` pattern`…` `` - Same as ``pattern(String.raw`…`)``.

@overload
@param {string | number} value
@returns {Pattern}

@overload
@param {TemplateStringsArray} template
@param {...string} substitutions
@returns {Pattern}
*/
function pattern(first, ...substitutions) {
  if (Array.isArray(first?.raw)) {
    return new Pattern(
      // Intersperse raw template strings and substitutions
      first.raw.flatMap((raw, i) => i < first.raw.length - 1 ? [raw, substitutions[i]] : raw).join('')
    );
  } else if (!substitutions.length) {
    return new Pattern(first === undefined ? '' : first);
  }
  throw new Error(`Unexpected arguments: ${JSON.stringify([first, ...substitutions])}`);
}

export {
  Pattern,
  pattern,
};
