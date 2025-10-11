/**
 * Turn an mdast `delete` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {Delete} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function strikethrough(state: State, node: Delete): Element;
export type Element = import("hast").Element;
export type Delete = import("mdast").Delete;
export type State = import("../state.js").State;
