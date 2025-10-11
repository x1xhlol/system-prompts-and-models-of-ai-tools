/**
 * Serialize hast as HTML.
 *
 * @param {Array<RootContent> | Nodes} tree
 *   Tree to serialize.
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {string}
 *   Serialized HTML.
 */
export function toHtml(tree: Array<RootContent> | Nodes, options?: Options | null | undefined): string;
/**
 * Serialize all children of `parent`.
 *
 * @this {State}
 *   Info passed around about the current state.
 * @param {Parents | undefined} parent
 *   Parent whose children to serialize.
 * @returns {string}
 */
export function all(this: State, parent: Parents | undefined): string;
export type CharacterReferences = Omit<StringifyEntitiesOptions, "attribute" | "escapeOnly" | "subset">;
/**
 * Configuration.
 */
export type Options = {
    /**
     * Do not encode some characters which cause XSS vulnerabilities in older
     * browsers (default: `false`).
     *
     * > ⚠️ **Danger**: only set this if you completely trust the content.
     */
    allowDangerousCharacters?: boolean | null | undefined;
    /**
     * Allow `raw` nodes and insert them as raw HTML (default: `false`).
     *
     * When `false`, `Raw` nodes are encoded.
     *
     * > ⚠️ **Danger**: only set this if you completely trust the content.
     */
    allowDangerousHtml?: boolean | null | undefined;
    /**
     * Do not encode characters which cause parse errors (even though they work),
     * to save bytes (default: `false`).
     *
     * Not used in the SVG space.
     *
     * > 👉 **Note**: intentionally creates parse errors in markup (how parse
     * > errors are handled is well defined, so this works but isn’t pretty).
     */
    allowParseErrors?: boolean | null | undefined;
    /**
     * Use “bogus comments” instead of comments to save byes: `<?charlie>`
     * instead of `<!--charlie-->` (default: `false`).
     *
     * > 👉 **Note**: intentionally creates parse errors in markup (how parse
     * > errors are handled is well defined, so this works but isn’t pretty).
     */
    bogusComments?: boolean | null | undefined;
    /**
     * Configure how to serialize character references (optional).
     */
    characterReferences?: CharacterReferences | null | undefined;
    /**
     * Close SVG elements without any content with slash (`/`) on the opening tag
     * instead of an end tag: `<circle />` instead of `<circle></circle>`
     * (default: `false`).
     *
     * See `tightSelfClosing` to control whether a space is used before the
     * slash.
     *
     * Not used in the HTML space.
     */
    closeEmptyElements?: boolean | null | undefined;
    /**
     * Close self-closing nodes with an extra slash (`/`): `<img />` instead of
     * `<img>` (default: `false`).
     *
     * See `tightSelfClosing` to control whether a space is used before the
     * slash.
     *
     * Not used in the SVG space.
     */
    closeSelfClosing?: boolean | null | undefined;
    /**
     * Collapse empty attributes: get `class` instead of `class=""` (default:
     * `false`).
     *
     * Not used in the SVG space.
     *
     * > 👉 **Note**: boolean attributes (such as `hidden`) are always collapsed.
     */
    collapseEmptyAttributes?: boolean | null | undefined;
    /**
     * Omit optional opening and closing tags (default: `false`).
     *
     * For example, in `<ol><li>one</li><li>two</li></ol>`, both `</li>` closing
     * tags can be omitted.
     * The first because it’s followed by another `li`, the last because it’s
     * followed by nothing.
     *
     * Not used in the SVG space.
     */
    omitOptionalTags?: boolean | null | undefined;
    /**
     * Leave attributes unquoted if that results in less bytes (default: `false`).
     *
     * Not used in the SVG space.
     */
    preferUnquoted?: boolean | null | undefined;
    /**
     * Use the other quote if that results in less bytes (default: `false`).
     */
    quoteSmart?: boolean | null | undefined;
    /**
     * Preferred quote to use (default: `'"'`).
     */
    quote?: Quote | null | undefined;
    /**
     * When an `<svg>` element is found in the HTML space, this package already
     * automatically switches to and from the SVG space when entering and exiting
     * it (default: `'html'`).
     *
     * > 👉 **Note**: hast is not XML.
     * > It supports SVG as embedded in HTML.
     * > It does not support the features available in XML.
     * > Passing SVG might break but fragments of modern SVG should be fine.
     * > Use [`xast`][xast] if you need to support SVG as XML.
     */
    space?: Space | null | undefined;
    /**
     * Join attributes together, without whitespace, if possible: get
     * `class="a b"title="c d"` instead of `class="a b" title="c d"` to save
     * bytes (default: `false`).
     *
     * Not used in the SVG space.
     *
     * > 👉 **Note**: intentionally creates parse errors in markup (how parse
     * > errors are handled is well defined, so this works but isn’t pretty).
     */
    tightAttributes?: boolean | null | undefined;
    /**
     * Join known comma-separated attribute values with just a comma (`,`),
     * instead of padding them on the right as well (`,␠`, where `␠` represents a
     * space) (default: `false`).
     */
    tightCommaSeparatedLists?: boolean | null | undefined;
    /**
     * Drop unneeded spaces in doctypes: `<!doctypehtml>` instead of
     * `<!doctype html>` to save bytes (default: `false`).
     *
     * > 👉 **Note**: intentionally creates parse errors in markup (how parse
     * > errors are handled is well defined, so this works but isn’t pretty).
     */
    tightDoctype?: boolean | null | undefined;
    /**
     * Do not use an extra space when closing self-closing elements: `<img/>`
     * instead of `<img />` (default: `false`).
     *
     * > 👉 **Note**: only used if `closeSelfClosing: true` or
     * > `closeEmptyElements: true`.
     */
    tightSelfClosing?: boolean | null | undefined;
    /**
     * Use a `<!DOCTYPE…` instead of `<!doctype…` (default: `false`).
     *
     * Useless except for XHTML.
     */
    upperDoctype?: boolean | null | undefined;
    /**
     * Tag names of elements to serialize without closing tag (default: `html-void-elements`).
     *
     * Not used in the SVG space.
     *
     * > 👉 **Note**: It’s highly unlikely that you want to pass this, because
     * > hast is not for XML, and HTML will not add more void elements.
     */
    voids?: ReadonlyArray<string> | null | undefined;
};
/**
 * HTML quotes for attribute values.
 */
export type Quote = "\"" | "'";
export type Settings = Omit<Required<{ [key in keyof Options]: Exclude<Options[key], null | undefined>; }>, "space" | "quote">;
/**
 * Namespace.
 */
export type Space = "html" | "svg";
/**
 * Info passed around about the current state.
 */
export type State = {
    /**
     * Serialize the children of a parent node.
     */
    all: (node: Parents | undefined) => string;
    /**
     * Alternative quote.
     */
    alternative: Quote;
    /**
     * Serialize one node.
     */
    one: (node: Nodes, index: number | undefined, parent: Parents | undefined) => string;
    /**
     * Preferred quote.
     */
    quote: Quote;
    /**
     * Current schema.
     */
    schema: Schema;
    /**
     * User configuration.
     */
    settings: Settings;
};
import type { RootContent } from 'hast';
import type { Nodes } from 'hast';
import type { Parents } from 'hast';
import type { Options as StringifyEntitiesOptions } from 'stringify-entities';
import type { Schema } from 'property-information';
//# sourceMappingURL=index.d.ts.map