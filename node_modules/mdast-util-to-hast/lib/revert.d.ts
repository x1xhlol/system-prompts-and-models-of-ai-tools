/**
 * Return the content of a reference without definition as plain text.
 *
 * @param {State} state
 *   Info passed around.
 * @param {Extract<Nodes, Reference>} node
 *   Reference node (image, link).
 * @returns {Array<ElementContent>}
 *   hast content.
 */
export function revert(state: State, node: Extract<Nodes, Reference>): Array<ElementContent>;
export type ElementContent = import("hast").ElementContent;
export type Nodes = import("mdast").Nodes;
export type Reference = import("mdast").Reference;
export type State = import("./state.js").State;
