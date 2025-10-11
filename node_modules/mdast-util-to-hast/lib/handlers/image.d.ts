/**
 * Turn an mdast `image` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {Image} node
 *   mdast node.
 * @returns {Element}
 *   hast node.
 */
export function image(state: State, node: Image): Element;
export type Element = import("hast").Element;
export type Properties = import("hast").Properties;
export type Image = import("mdast").Image;
export type State = import("../state.js").State;
