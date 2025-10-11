const decimalRegex = /\d/

/**
 * Configurable ways to encode characters as decimal references.
 *
 * @param {number} code
 * @param {number} next
 * @param {boolean|undefined} omit
 * @returns {string}
 */
export function toDecimal(code, next, omit) {
  const value = '&#' + String(code)
  return omit && next && !decimalRegex.test(String.fromCharCode(next))
    ? value
    : value + ';'
}
