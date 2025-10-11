const characterReferences = {'"': 'quot', '&': 'amp', '<': 'lt', '>': 'gt'}

/**
 * Encode only the dangerous HTML characters.
 *
 * This ensures that certain characters which have special meaning in HTML are
 * dealt with.
 * Technically, we can skip `>` and `"` in many cases, but CM includes them.
 *
 * @param {string} value
 *   Value to encode.
 * @returns {string}
 *   Encoded value.
 */
export function encode(value) {
  return value.replace(/["&<>]/g, replace)

  /**
   * @param {string} value
   *   Value to replace.
   * @returns {string}
   *   Encoded value.
   */
  function replace(value) {
    return (
      '&' +
      characterReferences[
        /** @type {keyof typeof characterReferences} */ (value)
      ] +
      ';'
    )
  }
}
