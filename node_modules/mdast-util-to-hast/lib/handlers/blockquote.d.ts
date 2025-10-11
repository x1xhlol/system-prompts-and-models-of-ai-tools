/**
 * Turn an mdast `blockquote` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {Blockquote} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function blockquote(state: State, node: Blockquote): Element;
export type Element = import("hast").Element;
export type Blockquote = import("mdast").Blockquote;
export type State = import("../state.js").State;
