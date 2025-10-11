/**
 * @import {Nodes, Parents, RootContent} from 'hast'
 * @import {Schema} from 'property-information'
 * @import {Options as StringifyEntitiesOptions} from 'stringify-entities'
 */

/**
 * @typedef {Omit<StringifyEntitiesOptions, 'attribute' | 'escapeOnly' | 'subset'>} CharacterReferences
 *
 * @typedef Options
 *   Configuration.
 * @property {boolean | null | undefined} [allowDangerousCharacters=false]
 *   Do not encode some characters which cause XSS vulnerabilities in older
 *   browsers (default: `false`).
 *
 *   > ⚠️ **Danger**: only set this if you completely trust the content.
 * @property {boolean | null | undefined} [allowDangerousHtml=false]
 *   Allow `raw` nodes and insert them as raw HTML (default: `false`).
 *
 *   When `false`, `Raw` nodes are encoded.
 *
 *   > ⚠️ **Danger**: only set this if you completely trust the content.
 * @property {boolean | null | undefined} [allowParseErrors=false]
 *   Do not encode characters which cause parse errors (even though they work),
 *   to save bytes (default: `false`).
 *
 *   Not used in the SVG space.
 *
 *   > 👉 **Note**: intentionally creates parse errors in markup (how parse
 *   > errors are handled is well defined, so this works but isn’t pretty).
 * @property {boolean | null | undefined} [bogusComments=false]
 *   Use “bogus comments” instead of comments to save byes: `<?charlie>`
 *   instead of `<!--charlie-->` (default: `false`).
 *
 *   > 👉 **Note**: intentionally creates parse errors in markup (how parse
 *   > errors are handled is well defined, so this works but isn’t pretty).
 * @property {CharacterReferences | null | undefined} [characterReferences]
 *   Configure how to serialize character references (optional).
 * @property {boolean | null | undefined} [closeEmptyElements=false]
 *   Close SVG elements without any content with slash (`/`) on the opening tag
 *   instead of an end tag: `<circle />` instead of `<circle></circle>`
 *   (default: `false`).
 *
 *   See `tightSelfClosing` to control whether a space is used before the
 *   slash.
 *
 *   Not used in the HTML space.
 * @property {boolean | null | undefined} [closeSelfClosing=false]
 *   Close self-closing nodes with an extra slash (`/`): `<img />` instead of
 *   `<img>` (default: `false`).
 *
 *   See `tightSelfClosing` to control whether a space is used before the
 *   slash.
 *
 *   Not used in the SVG space.
 * @property {boolean | null | undefined} [collapseEmptyAttributes=false]
 *   Collapse empty attributes: get `class` instead of `class=""` (default:
 *   `false`).
 *
 *   Not used in the SVG space.
 *
 *   > 👉 **Note**: boolean attributes (such as `hidden`) are always collapsed.
 * @property {boolean | null | undefined} [omitOptionalTags=false]
 *   Omit optional opening and closing tags (default: `false`).
 *
 *   For example, in `<ol><li>one</li><li>two</li></ol>`, both `</li>` closing
 *   tags can be omitted.
 *   The first because it’s followed by another `li`, the last because it’s
 *   followed by nothing.
 *
 *   Not used in the SVG space.
 * @property {boolean | null | undefined} [preferUnquoted=false]
 *   Leave attributes unquoted if that results in less bytes (default: `false`).
 *
 *   Not used in the SVG space.
 * @property {boolean | null | undefined} [quoteSmart=false]
 *   Use the other quote if that results in less bytes (default: `false`).
 * @property {Quote | null | undefined} [quote='"']
 *   Preferred quote to use (default: `'"'`).
 * @property {Space | null | undefined} [space='html']
 *   When an `<svg>` element is found in the HTML space, this package already
 *   automatically switches to and from the SVG space when entering and exiting
 *   it (default: `'html'`).
 *
 *   > 👉 **Note**: hast is not XML.
 *   > It supports SVG as embedded in HTML.
 *   > It does not support the features available in XML.
 *   > Passing SVG might break but fragments of modern SVG should be fine.
 *   > Use [`xast`][xast] if you need to support SVG as XML.
 * @property {boolean | null | undefined} [tightAttributes=false]
 *   Join attributes together, without whitespace, if possible: get
 *   `class="a b"title="c d"` instead of `class="a b" title="c d"` to save
 *   bytes (default: `false`).
 *
 *   Not used in the SVG space.
 *
 *   > 👉 **Note**: intentionally creates parse errors in markup (how parse
 *   > errors are handled is well defined, so this works but isn’t pretty).
 * @property {boolean | null | undefined} [tightCommaSeparatedLists=false]
 *   Join known comma-separated attribute values with just a comma (`,`),
 *   instead of padding them on the right as well (`,␠`, where `␠` represents a
 *   space) (default: `false`).
 * @property {boolean | null | undefined} [tightDoctype=false]
 *   Drop unneeded spaces in doctypes: `<!doctypehtml>` instead of
 *   `<!doctype html>` to save bytes (default: `false`).
 *
 *   > 👉 **Note**: intentionally creates parse errors in markup (how parse
 *   > errors are handled is well defined, so this works but isn’t pretty).
 * @property {boolean | null | undefined} [tightSelfClosing=false]
 *   Do not use an extra space when closing self-closing elements: `<img/>`
 *   instead of `<img />` (default: `false`).
 *
 *   > 👉 **Note**: only used if `closeSelfClosing: true` or
 *   > `closeEmptyElements: true`.
 * @property {boolean | null | undefined} [upperDoctype=false]
 *   Use a `<!DOCTYPE…` instead of `<!doctype…` (default: `false`).
 *
 *   Useless except for XHTML.
 * @property {ReadonlyArray<string> | null | undefined} [voids]
 *   Tag names of elements to serialize without closing tag (default: `html-void-elements`).
 *
 *   Not used in the SVG space.
 *
 *   > 👉 **Note**: It’s highly unlikely that you want to pass this, because
 *   > hast is not for XML, and HTML will not add more void elements.
 *
 * @typedef {'"' | "'"} Quote
 *   HTML quotes for attribute values.
 *
 * @typedef {Omit<Required<{[key in keyof Options]: Exclude<Options[key], null | undefined>}>, 'space' | 'quote'>} Settings
 *
 * @typedef {'html' | 'svg'} Space
 *   Namespace.
 *
 * @typedef State
 *   Info passed around about the current state.
 * @property {(node: Parents | undefined) => string} all
 *   Serialize the children of a parent node.
 * @property {Quote} alternative
 *   Alternative quote.
 * @property {(node: Nodes, index: number | undefined, parent: Parents | undefined) => string} one
 *   Serialize one node.
 * @property {Quote} quote
 *   Preferred quote.
 * @property {Schema} schema
 *   Current schema.
 * @property {Settings} settings
 *   User configuration.
 */

import {htmlVoidElements} from 'html-void-elements'
import {html, svg} from 'property-information'
import {handle} from './handle/index.js'

/** @type {Options} */
const emptyOptions = {}

/** @type {CharacterReferences} */
const emptyCharacterReferences = {}

/** @type {Array<never>} */
const emptyChildren = []

/**
 * Serialize hast as HTML.
 *
 * @param {Array<RootContent> | Nodes} tree
 *   Tree to serialize.
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {string}
 *   Serialized HTML.
 */
export function toHtml(tree, options) {
  const options_ = options || emptyOptions
  const quote = options_.quote || '"'
  const alternative = quote === '"' ? "'" : '"'

  if (quote !== '"' && quote !== "'") {
    throw new Error('Invalid quote `' + quote + '`, expected `\'` or `"`')
  }

  /** @type {State} */
  const state = {
    one,
    all,
    settings: {
      omitOptionalTags: options_.omitOptionalTags || false,
      allowParseErrors: options_.allowParseErrors || false,
      allowDangerousCharacters: options_.allowDangerousCharacters || false,
      quoteSmart: options_.quoteSmart || false,
      preferUnquoted: options_.preferUnquoted || false,
      tightAttributes: options_.tightAttributes || false,
      upperDoctype: options_.upperDoctype || false,
      tightDoctype: options_.tightDoctype || false,
      bogusComments: options_.bogusComments || false,
      tightCommaSeparatedLists: options_.tightCommaSeparatedLists || false,
      tightSelfClosing: options_.tightSelfClosing || false,
      collapseEmptyAttributes: options_.collapseEmptyAttributes || false,
      allowDangerousHtml: options_.allowDangerousHtml || false,
      voids: options_.voids || htmlVoidElements,
      characterReferences:
        options_.characterReferences || emptyCharacterReferences,
      closeSelfClosing: options_.closeSelfClosing || false,
      closeEmptyElements: options_.closeEmptyElements || false
    },
    schema: options_.space === 'svg' ? svg : html,
    quote,
    alternative
  }

  return state.one(
    Array.isArray(tree) ? {type: 'root', children: tree} : tree,
    undefined,
    undefined
  )
}

/**
 * Serialize a node.
 *
 * @this {State}
 *   Info passed around about the current state.
 * @param {Nodes} node
 *   Node to handle.
 * @param {number | undefined} index
 *   Index of `node` in `parent.
 * @param {Parents | undefined} parent
 *   Parent of `node`.
 * @returns {string}
 *   Serialized node.
 */
function one(node, index, parent) {
  return handle(node, index, parent, this)
}

/**
 * Serialize all children of `parent`.
 *
 * @this {State}
 *   Info passed around about the current state.
 * @param {Parents | undefined} parent
 *   Parent whose children to serialize.
 * @returns {string}
 */
export function all(parent) {
  /** @type {Array<string>} */
  const results = []
  const children = (parent && parent.children) || emptyChildren
  let index = -1

  while (++index < children.length) {
    results[index] = this.one(children[index], index, parent)
  }

  return results.join('')
}
