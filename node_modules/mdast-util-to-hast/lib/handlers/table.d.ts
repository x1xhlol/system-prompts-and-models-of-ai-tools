/**
 * Turn an mdast `table` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {Table} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function table(state: State, node: Table): Element;
export type Element = import("hast").Element;
export type Table = import("mdast").Table;
export type State = import("../state.js").State;
