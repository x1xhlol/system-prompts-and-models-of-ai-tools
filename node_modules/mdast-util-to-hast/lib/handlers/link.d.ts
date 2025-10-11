/**
 * Turn an mdast `link` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {Link} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function link(state: State, node: Link): Element;
export type Element = import("hast").Element;
export type Properties = import("hast").Properties;
export type Link = import("mdast").Link;
export type State = import("../state.js").State;
