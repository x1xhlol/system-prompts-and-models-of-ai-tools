export class Pattern {
    /** @param {string} value */
    constructor(value: string);
    /** @returns {string} */
    toString(): string;
    #private;
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
export function pattern(value: string | number): Pattern;
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
export function pattern(template: TemplateStringsArray, ...substitutions: string[]): Pattern;
