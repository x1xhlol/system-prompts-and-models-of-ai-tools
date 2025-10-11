/**
 * Turn an mdast `html` node into hast (`raw` node in dangerous mode, otherwise
 * nothing).
 *
 * @param {State} state
 *   Info passed around.
 * @param {Html} node
 *   mdast node.
 * @returns {Element | Raw | undefined}
 *   hast node.
 */
export function html(state: State, node: Html): Element | Raw | undefined;
export type Element = import("hast").Element;
export type Html = import("mdast").Html;
export type State = import("../state.js").State;
export type Raw = import("../../index.js").Raw;
