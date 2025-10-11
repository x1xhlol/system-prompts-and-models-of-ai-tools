/**
 * Turn an mdast `tableCell` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {TableCell} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function tableCell(state: State, node: TableCell): Element;
export type Element = import("hast").Element;
export type TableCell = import("mdast").TableCell;
export type State = import("../state.js").State;
