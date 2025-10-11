/**
 * Turn an mdast `thematicBreak` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {ThematicBreak} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function thematicBreak(state: State, node: ThematicBreak): Element;
export type Element = import("hast").Element;
export type ThematicBreak = import("mdast").ThematicBreak;
export type State = import("../state.js").State;
