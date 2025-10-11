/**
 * Create `state` from an mdast tree.
 *
 * @param {MdastNodes} tree
 *   mdast node to transform.
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {State}
 *   `state` function.
 */
export function createState(tree: MdastNodes, options?: Options | null | undefined): State;
/**
 * Wrap `nodes` with line endings between each node.
 *
 * @template {HastRootContent} Type
 *   Node type.
 * @param {Array<Type>} nodes
 *   List of nodes to wrap.
 * @param {boolean | undefined} [loose=false]
 *   Whether to add line endings at start and end (default: `false`).
 * @returns {Array<HastText | Type>}
 *   Wrapped nodes.
 */
export function wrap<Type extends HastRootContent>(nodes: Array<Type>, loose?: boolean | undefined): Array<HastText | Type>;
export type HastElement = import("hast").Element;
export type HastElementContent = import("hast").ElementContent;
export type HastNodes = import("hast").Nodes;
export type HastProperties = import("hast").Properties;
export type HastRootContent = import("hast").RootContent;
export type HastText = import("hast").Text;
export type MdastDefinition = import("mdast").Definition;
export type MdastFootnoteDefinition = import("mdast").FootnoteDefinition;
export type MdastNodes = import("mdast").Nodes;
export type MdastParents = import("mdast").Parents;
export type VFile = import("vfile").VFile;
export type FootnoteBackContentTemplate = import("./footer.js").FootnoteBackContentTemplate;
export type FootnoteBackLabelTemplate = import("./footer.js").FootnoteBackLabelTemplate;
/**
 * Handle a node.
 */
export type Handler = (state: State, node: any, parent: MdastParents | undefined) => Array<HastElementContent> | HastElementContent | undefined;
/**
 * Handle nodes.
 */
export type Handlers = Partial<Record<MdastNodes["type"], Handler>>;
/**
 * Configuration (optional).
 */
export type Options = {
    /**
     * Whether to persist raw HTML in markdown in the hast tree (default:
     * `false`).
     */
    allowDangerousHtml?: boolean | null | undefined;
    /**
     * Prefix to use before the `id` property on footnotes to prevent them from
     * *clobbering* (default: `'user-content-'`).
     *
     * Pass `''` for trusted markdown and when you are careful with
     * polyfilling.
     * You could pass a different prefix.
     *
     * DOM clobbering is this:
     *
     * ```html
     * <p id="x"></p>
     * <script>alert(x) // `x` now refers to the `p#x` DOM element</script>
     * ```
     *
     * The above example shows that elements are made available by browsers, by
     * their ID, on the `window` object.
     * This is a security risk because you might be expecting some other variable
     * at that place.
     * It can also break polyfills.
     * Using a prefix solves these problems.
     */
    clobberPrefix?: string | null | undefined;
    /**
     * Corresponding virtual file representing the input document (optional).
     */
    file?: VFile | null | undefined;
    /**
     * Content of the backreference back to references (default: `defaultFootnoteBackContent`).
     *
     * The default value is:
     *
     * ```js
     * function defaultFootnoteBackContent(_, rereferenceIndex) {
     * const result = [{type: 'text', value: '↩'}]
     *
     * if (rereferenceIndex > 1) {
     * result.push({
     * type: 'element',
     * tagName: 'sup',
     * properties: {},
     * children: [{type: 'text', value: String(rereferenceIndex)}]
     * })
     * }
     *
     * return result
     * }
     * ```
     *
     * This content is used in the `a` element of each backreference (the `↩`
     * links).
     */
    footnoteBackContent?: FootnoteBackContentTemplate | string | null | undefined;
    /**
     * Label to describe the backreference back to references (default:
     * `defaultFootnoteBackLabel`).
     *
     * The default value is:
     *
     * ```js
     * function defaultFootnoteBackLabel(referenceIndex, rereferenceIndex) {
     * return (
     * 'Back to reference ' +
     * (referenceIndex + 1) +
     * (rereferenceIndex > 1 ? '-' + rereferenceIndex : '')
     * )
     * }
     * ```
     *
     * Change it when the markdown is not in English.
     *
     * This label is used in the `ariaLabel` property on each backreference
     * (the `↩` links).
     * It affects users of assistive technology.
     */
    footnoteBackLabel?: FootnoteBackLabelTemplate | string | null | undefined;
    /**
     * Textual label to use for the footnotes section (default: `'Footnotes'`).
     *
     * Change it when the markdown is not in English.
     *
     * This label is typically hidden visually (assuming a `sr-only` CSS class
     * is defined that does that) and so affects screen readers only.
     * If you do have such a class, but want to show this section to everyone,
     * pass different properties with the `footnoteLabelProperties` option.
     */
    footnoteLabel?: string | null | undefined;
    /**
     * Properties to use on the footnote label (default: `{className:
     * ['sr-only']}`).
     *
     * Change it to show the label and add other properties.
     *
     * This label is typically hidden visually (assuming an `sr-only` CSS class
     * is defined that does that) and so affects screen readers only.
     * If you do have such a class, but want to show this section to everyone,
     * pass an empty string.
     * You can also add different properties.
     *
     * > **Note**: `id: 'footnote-label'` is always added, because footnote
     * > calls use it with `aria-describedby` to provide an accessible label.
     */
    footnoteLabelProperties?: HastProperties | null | undefined;
    /**
     * HTML tag name to use for the footnote label element (default: `'h2'`).
     *
     * Change it to match your document structure.
     *
     * This label is typically hidden visually (assuming a `sr-only` CSS class
     * is defined that does that) and so affects screen readers only.
     * If you do have such a class, but want to show this section to everyone,
     * pass different properties with the `footnoteLabelProperties` option.
     */
    footnoteLabelTagName?: string | null | undefined;
    /**
     * Extra handlers for nodes (optional).
     */
    handlers?: Handlers | null | undefined;
    /**
     * List of custom mdast node types to pass through (keep) in hast (note that
     * the node itself is passed, but eventual children are transformed)
     * (optional).
     */
    passThrough?: Array<MdastNodes["type"]> | null | undefined;
    /**
     * Handler for all unknown nodes (optional).
     */
    unknownHandler?: Handler | null | undefined;
};
/**
 * Info passed around.
 */
export type State = {
    /**
     *   Transform the children of an mdast parent to hast.
     */
    all: (node: MdastNodes) => Array<HastElementContent>;
    /**
     *   Honor the `data` of `from`, and generate an element instead of `node`.
     */
    applyData: <Type extends HastNodes>(from: MdastNodes, to: Type) => HastElement | Type;
    /**
     *   Definitions by their identifier.
     */
    definitionById: Map<string, MdastDefinition>;
    /**
     *   Footnote definitions by their identifier.
     */
    footnoteById: Map<string, MdastFootnoteDefinition>;
    /**
     *   Counts for how often the same footnote was called.
     */
    footnoteCounts: Map<string, number>;
    /**
     *   Identifiers of order when footnote calls first appear in tree order.
     */
    footnoteOrder: Array<string>;
    /**
     *   Applied handlers.
     */
    handlers: Handlers;
    /**
     *   Transform an mdast node to hast.
     */
    one: (node: MdastNodes, parent: MdastParents | undefined) => Array<HastElementContent> | HastElementContent | undefined;
    /**
     *   Configuration.
     */
    options: Options;
    /**
     *   Copy a node’s positional info.
     */
    patch: (from: MdastNodes, node: HastNodes) => undefined;
    /**
     *   Wrap `nodes` with line endings between each node, adds initial/final line endings when `loose`.
     */
    wrap: <Type extends HastRootContent>(nodes: Array<Type>, loose?: boolean | undefined) => Array<HastText | Type>;
};
