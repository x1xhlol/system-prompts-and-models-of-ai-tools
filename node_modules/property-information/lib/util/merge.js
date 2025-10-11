/**
 * @import {Info, Space} from 'property-information'
 */

import {Schema} from './schema.js'

/**
 * @param {ReadonlyArray<Schema>} definitions
 *   Definitions.
 * @param {Space | undefined} [space]
 *   Space.
 * @returns {Schema}
 *   Schema.
 */
export function merge(definitions, space) {
  /** @type {Record<string, Info>} */
  const property = {}
  /** @type {Record<string, string>} */
  const normal = {}

  for (const definition of definitions) {
    Object.assign(property, definition.property)
    Object.assign(normal, definition.normal)
  }

  return new Schema(property, normal, space)
}
