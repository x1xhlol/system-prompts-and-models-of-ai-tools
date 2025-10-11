/**
 * Serialize a raw node.
 *
 * @param {Raw} node
 *   Node to handle.
 * @param {number | undefined} index
 *   Index of `node` in `parent.
 * @param {Parents | undefined} parent
 *   Parent of `node`.
 * @param {State} state
 *   Info passed around about the current state.
 * @returns {string}
 *   Serialized node.
 */
export function raw(node: Raw, index: number | undefined, parent: Parents | undefined, state: State): string;
import type { Raw } from 'mdast-util-to-hast';
import type { Parents } from 'hast';
import type { State } from '../index.js';
//# sourceMappingURL=raw.d.ts.map