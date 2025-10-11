/**
 * Turn an mdast `tableRow` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {TableRow} node
 *   mdast node.
 * @param {Parents | undefined} parent
 *   Parent of `node`.
 * @returns {Element}
 *   hast node.
 */
export function tableRow(state: State, node: TableRow, parent: Parents | undefined): Element;
export type Element = import("hast").Element;
export type ElementContent = import("hast").ElementContent;
export type Properties = import("hast").Properties;
export type Parents = import("mdast").Parents;
export type TableRow = import("mdast").TableRow;
export type State = import("../state.js").State;
