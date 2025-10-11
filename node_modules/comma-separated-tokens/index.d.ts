/**
 * @typedef Options
 *   Configuration for `stringify`.
 * @property {boolean} [padLeft=true]
 *   Whether to pad a space before a token.
 * @property {boolean} [padRight=false]
 *   Whether to pad a space after a token.
 */
/**
 * @typedef {Options} StringifyOptions
 *   Please use `StringifyOptions` instead.
 */
/**
 * Parse comma-separated tokens to an array.
 *
 * @param {string} value
 *   Comma-separated tokens.
 * @returns {Array<string>}
 *   List of tokens.
 */
export function parse(value: string): Array<string>
/**
 * Serialize an array of strings or numbers to comma-separated tokens.
 *
 * @param {Array<string|number>} values
 *   List of tokens.
 * @param {Options} [options]
 *   Configuration for `stringify` (optional).
 * @returns {string}
 *   Comma-separated tokens.
 */
export function stringify(
  values: Array<string | number>,
  options?: Options | undefined
): string
/**
 * Configuration for `stringify`.
 */
export type Options = {
  /**
   * Whether to pad a space before a token.
   */
  padLeft?: boolean | undefined
  /**
   * Whether to pad a space after a token.
   */
  padRight?: boolean | undefined
}
/**
 * Please use `StringifyOptions` instead.
 */
export type StringifyOptions = Options
