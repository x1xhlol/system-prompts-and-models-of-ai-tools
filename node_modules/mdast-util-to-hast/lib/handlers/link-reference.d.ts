/**
 * Turn an mdast `linkReference` node into hast.
 *
 * @param {State} state
 *   Info passed around.
 * @param {LinkReference} node
 *   mdast node.
 * @returns {Array<ElementContent> | ElementContent}
 *   hast node.
 */
export function linkReference(state: State, node: LinkReference): Array<ElementContent> | ElementContent;
export type Element = import("hast").Element;
export type ElementContent = import("hast").ElementContent;
export type Properties = import("hast").Properties;
export type LinkReference = import("mdast").LinkReference;
export type State = import("../state.js").State;
