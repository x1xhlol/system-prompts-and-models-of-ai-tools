/**
 * Serialize a text node.
 *
 * @param {Raw | Text} node
 *   Node to handle.
 * @param {number | undefined} _
 *   Index of `node` in `parent.
 * @param {Parents | undefined} parent
 *   Parent of `node`.
 * @param {State} state
 *   Info passed around about the current state.
 * @returns {string}
 *   Serialized node.
 */
export function text(node: Raw | Text, _: number | undefined, parent: Parents | undefined, state: State): string;
import type { Raw } from 'mdast-util-to-hast';
import type { Text } from 'hast';
import type { Parents } from 'hast';
import type { State } from '../index.js';
//# sourceMappingURL=text.d.ts.map