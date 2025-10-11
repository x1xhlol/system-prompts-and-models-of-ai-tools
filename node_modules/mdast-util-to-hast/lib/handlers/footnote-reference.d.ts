/**
 * Turn an mdast `footnoteReference` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {FootnoteReference} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function footnoteReference(state: State, node: FootnoteReference): Element;
export type Element = import("hast").Element;
export type FootnoteReference = import("mdast").FootnoteReference;
export type State = import("../state.js").State;
