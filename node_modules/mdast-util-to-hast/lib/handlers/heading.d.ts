/**
 * Turn an mdast `heading` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {Heading} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function heading(state: State, node: Heading): Element;
export type Element = import("hast").Element;
export type Heading = import("mdast").Heading;
export type State = import("../state.js").State;
