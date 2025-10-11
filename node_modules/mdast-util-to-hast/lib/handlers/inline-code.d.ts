/**
 * Turn an mdast `inlineCode` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {InlineCode} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function inlineCode(state: State, node: InlineCode): Element;
export type Element = import("hast").Element;
export type Text = import("hast").Text;
export type InlineCode = import("mdast").InlineCode;
export type State = import("../state.js").State;
