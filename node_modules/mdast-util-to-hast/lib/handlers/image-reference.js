/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').ElementContent} ElementContent
 * @typedef {import('hast').Properties} Properties
 * @typedef {import('mdast').ImageReference} ImageReference
 * @typedef {import('../state.js').State} State
 */

import {normalizeUri} from 'micromark-util-sanitize-uri'
import {revert} from '../revert.js'

/**
 * Turn an mdast `imageReference` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {ImageReference} node
 *   mdast node.
 * @returns {Array<ElementContent> | ElementContent}
 *   hast node.
 */
export function imageReference(state, node) {
  const id = String(node.identifier).toUpperCase()
  const definition = state.definitionById.get(id)

  if (!definition) {
    return revert(state, node)
  }

  /** @type {Properties} */
  const properties = {src: normalizeUri(definition.url || ''), alt: node.alt}

  if (definition.title !== null && definition.title !== undefined) {
    properties.title = definition.title
  }

  /** @type {Element} */
  const result = {type: 'element', tagName: 'img', properties, children: []}
  state.patch(node, result)
  return state.applyData(node, result)
}
