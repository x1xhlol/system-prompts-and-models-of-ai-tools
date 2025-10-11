/**
 * Turn an mdast `emphasis` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {Emphasis} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function emphasis(state: State, node: Emphasis): Element;
export type Element = import("hast").Element;
export type Emphasis = import("mdast").Emphasis;
export type State = import("../state.js").State;
