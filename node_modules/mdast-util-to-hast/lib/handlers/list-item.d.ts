/**
 * Turn an mdast `listItem` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {ListItem} node
 *   mdast node.
 * @param {Parents | undefined} parent
 *   Parent of `node`.
 * @returns {Element}
 *   hast node.
 */
export function listItem(state: State, node: ListItem, parent: Parents | undefined): Element;
export type Element = import("hast").Element;
export type ElementContent = import("hast").ElementContent;
export type Properties = import("hast").Properties;
export type ListItem = import("mdast").ListItem;
export type Parents = import("mdast").Parents;
export type State = import("../state.js").State;
