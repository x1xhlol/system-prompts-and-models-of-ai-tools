/**
 * @import {Schema as SchemaType, Space} from 'property-information'
 */

/** @type {SchemaType} */
export class Schema {
  /**
   * @param {SchemaType['property']} property
   *   Property.
   * @param {SchemaType['normal']} normal
   *   Normal.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Schema.
   */
  constructor(property, normal, space) {
    this.normal = normal
    this.property = property

    if (space) {
      this.space = space
    }
  }
}

Schema.prototype.normal = {}
Schema.prototype.property = {}
Schema.prototype.space = undefined
