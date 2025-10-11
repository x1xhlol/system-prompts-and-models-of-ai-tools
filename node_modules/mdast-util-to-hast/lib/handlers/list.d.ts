/**
 * Turn an mdast `list` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {List} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function list(state: State, node: List): Element;
export type Element = import("hast").Element;
export type Properties = import("hast").Properties;
export type List = import("mdast").List;
export type State = import("../state.js").State;
