/**
 * Turn an mdast `text` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {MdastText} node
 *   mdast node.
 * @returns {HastElement | HastText}
 *   hast node.
 */
export function text(state: State, node: MdastText): HastElement | HastText;
export type HastElement = import("hast").Element;
export type HastText = import("hast").Text;
export type MdastText = import("mdast").Text;
export type State = import("../state.js").State;
