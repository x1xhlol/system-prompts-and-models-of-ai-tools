/**
 * Info on a property.
 */
export interface Info {
  /**
   * Attribute name for the property that could be used in markup
   * (such as `'aria-describedby'`, `'allowfullscreen'`, `'xml:lang'`,
   * `'for'`, or `'charoff'`).
   */
  attribute: string
  /**
   * The property is *like* a `boolean`
   * (such as `draggable`);
   * these properties have both an on and off state when defined,
   * *and* another state when not defined.
   */
  booleanish: boolean
  /**
   * The property is a `boolean`
   * (such as `hidden`);
   * these properties have an on state when defined and an off state when not
   * defined.
   */
  boolean: boolean
  /**
   * The property is a list separated by spaces or commas
   * (such as `strokeDashArray`).
   */
  commaOrSpaceSeparated: boolean
  /**
   * The property is a list separated by commas
   * (such as `coords`).
   */
  commaSeparated: boolean
  /**
   * The property is defined by a space;
   * this is the case for values in HTML
   * (including data and ARIA),
   * SVG, XML, XMLNS, and XLink;
   * not defined properties can only be found through `find`.
   */
  defined: boolean
  /**
   * When working with the DOM,
   * this property has to be changed as a field on the element,
   * instead of through `setAttribute`
   * (this is true only for `'checked'`, `'multiple'`, `'muted'`, and
   * `'selected'`).
   */
  mustUseProperty: boolean
  /**
   * The property is a `number` (such as `height`).
   */
  number: boolean
  /**
   * The property is *like* a `boolean` (such as `download`);
   * these properties have an on state *and* more states when defined and an
   * off state when not defined.
   */
  overloadedBoolean: boolean
  /**
   * JavaScript-style camel-cased name;
   * based on the DOM but sometimes different
   * (such as `'ariaDescribedBy'`, `'allowFullScreen'`, `'xmlLang'`,
   * `'htmlFor'`, `'charOff'`).
   */
  property: string
  /**
   * The property is a list separated by spaces
   * (such as `className`).
   */
  spaceSeparated: boolean
  /**
   * Space of the property.
   */
  space: Space | undefined
}

/**
 * Schema for a primary space.
 */
export interface Schema {
  /**
   * Object mapping normalized attributes and properties to properly cased
   * properties.
   */
  normal: Record<string, string>
  /**
   * Object mapping properties to info.
   */
  property: Record<string, Info>
  space: Space | undefined
}

/**
 * Space of a property.
 */
export type Space = 'html' | 'svg' | 'xlink' | 'xmlns' | 'xml'

export {find} from './lib/find.js'

export {hastToReact} from './lib/hast-to-react.js'

/**
 * `Schema` for HTML,
 * with info on properties from HTML itself and related embedded spaces
 * (ARIA, XML, XMLNS, XLink).
 */
export const html: Schema

export {normalize} from './lib/normalize.js'

/**
 * `Schema` for SVG,
 * with info on properties from SVG itself and related embedded spaces
 * (ARIA, XML, XMLNS, XLink).
 */
export const svg: Schema
