/**
 * Turn an mdast `paragraph` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {Paragraph} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function paragraph(state: State, node: Paragraph): Element;
export type Element = import("hast").Element;
export type Paragraph = import("mdast").Paragraph;
export type State = import("../state.js").State;
