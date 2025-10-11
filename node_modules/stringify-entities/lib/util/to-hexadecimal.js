const hexadecimalRegex = /[\dA-Fa-f]/

/**
 * Configurable ways to encode characters as hexadecimal references.
 *
 * @param {number} code
 * @param {number} next
 * @param {boolean|undefined} omit
 * @returns {string}
 */
export function toHexadecimal(code, next, omit) {
  const value = '&#x' + code.toString(16).toUpperCase()
  return omit && next && !hexadecimalRegex.test(String.fromCharCode(next))
    ? value
    : value + ';'
}
