/**
 * Turn an mdast `break` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {Break} node
 *   mdast node.
 * @returns {Array<Element | Text>}
 *   hast element content.
 */
export function hardBreak(state: State, node: Break): Array<Element | Text>;
export type Element = import("hast").Element;
export type Text = import("hast").Text;
export type Break = import("mdast").Break;
export type State = import("../state.js").State;
