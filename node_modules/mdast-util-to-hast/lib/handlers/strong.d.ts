/**
 * Turn an mdast `strong` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {Strong} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function strong(state: State, node: Strong): Element;
export type Element = import("hast").Element;
export type Strong = import("mdast").Strong;
export type State = import("../state.js").State;
