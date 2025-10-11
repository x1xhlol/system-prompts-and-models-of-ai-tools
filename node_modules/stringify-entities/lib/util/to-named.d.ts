/**
 * Configurable ways to encode characters as named references.
 *
 * @param {number} code
 * @param {number} next
 * @param {boolean|undefined} omit
 * @param {boolean|undefined} attribute
 * @returns {string}
 */
export function toNamed(code: number, next: number, omit: boolean | undefined, attribute: boolean | undefined): string;
