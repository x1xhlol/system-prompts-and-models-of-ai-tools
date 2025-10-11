/**
 * Turn an mdast `code` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {Code} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function code(state: State, node: Code): Element;
export type Element = import("hast").Element;
export type Properties = import("hast").Properties;
export type Code = import("mdast").Code;
export type State = import("../state.js").State;
