/**
 * The smallest way to encode a character.
 *
 * @param {number} code
 * @returns {string}
 */
export function formatBasic(code) {
  return '&#x' + code.toString(16).toUpperCase() + ';'
}
