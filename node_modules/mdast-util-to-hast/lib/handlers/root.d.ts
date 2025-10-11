/**
 * Turn an mdast `root` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {MdastRoot} node
 *   mdast node.
 * @returns {HastParents}
 *   hast node.
 */
export function root(state: State, node: MdastRoot): HastParents;
export type HastParents = import("hast").Parents;
export type HastRoot = import("hast").Root;
export type MdastRoot = import("mdast").Root;
export type State = import("../state.js").State;
