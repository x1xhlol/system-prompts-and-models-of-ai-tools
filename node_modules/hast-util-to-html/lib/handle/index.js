/**
 * @import {Nodes, Parents} from 'hast'
 * @import {State} from '../index.js'
 */

import {zwitch} from 'zwitch'
import {comment} from './comment.js'
import {doctype} from './doctype.js'
import {element} from './element.js'
import {raw} from './raw.js'
import {root} from './root.js'
import {text} from './text.js'

/**
 * @type {(node: Nodes, index: number | undefined, parent: Parents | undefined, state: State) => string}
 */
export const handle = zwitch('type', {
  invalid,
  unknown,
  handlers: {comment, doctype, element, raw, root, text}
})

/**
 * Fail when a non-node is found in the tree.
 *
 * @param {unknown} node
 *   Unknown value.
 * @returns {never}
 *   Never.
 */
function invalid(node) {
  throw new Error('Expected node, not `' + node + '`')
}

/**
 * Fail when a node with an unknown type is found in the tree.
 *
 * @param {unknown} node_
 *  Unknown node.
 * @returns {never}
 *   Never.
 */
function unknown(node_) {
  // `type` is guaranteed by runtime JS.
  const node = /** @type {Nodes} */ (node_)
  throw new Error('Cannot compile unknown node `' + node.type + '`')
}
