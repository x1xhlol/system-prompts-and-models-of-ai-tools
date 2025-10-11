/**
 * @import {Info as InfoType} from 'property-information'
 */

/** @type {InfoType} */
export class Info {
  /**
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @returns
   *   Info.
   */
  constructor(property, attribute) {
    this.attribute = attribute
    this.property = property
  }
}

Info.prototype.attribute = ''
Info.prototype.booleanish = false
Info.prototype.boolean = false
Info.prototype.commaOrSpaceSeparated = false
Info.prototype.commaSeparated = false
Info.prototype.defined = false
Info.prototype.mustUseProperty = false
Info.prototype.number = false
Info.prototype.overloadedBoolean = false
Info.prototype.property = ''
Info.prototype.spaceSeparated = false
Info.prototype.space = undefined
