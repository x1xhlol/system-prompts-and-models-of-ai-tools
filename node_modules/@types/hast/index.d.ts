import type { Data as UnistData, Literal as UnistLiteral, Node as UnistNode, Parent as UnistParent } from "unist";

// ## Interfaces

/**
 * Info associated with hast nodes by the ecosystem.
 *
 * This space is guaranteed to never be specified by unist or hast.
 * But you can use it in utilities and plugins to store data.
 *
 * This type can be augmented to register custom data.
 * For example:
 *
 * ```ts
 * declare module 'hast' {
 *   interface Data {
 *     // `someNode.data.myId` is typed as `number | undefined`
 *     myId?: number | undefined
 *   }
 * }
 * ```
 */
export interface Data extends UnistData {}

/**
 * Info associated with an element.
 */
export interface Properties {
    [PropertyName: string]: boolean | number | string | null | undefined | Array<string | number>;
}

// ## Content maps

/**
 * Union of registered hast nodes that can occur in {@link Element}.
 *
 * To register mote custom hast nodes, add them to {@link ElementContentMap}.
 * They will be automatically added here.
 */
export type ElementContent = ElementContentMap[keyof ElementContentMap];

/**
 * Registry of all hast nodes that can occur as children of {@link Element}.
 *
 * For a union of all {@link Element} children, see {@link ElementContent}.
 */
export interface ElementContentMap {
    comment: Comment;
    element: Element;
    text: Text;
}

/**
 * Union of registered hast nodes that can occur in {@link Root}.
 *
 * To register custom hast nodes, add them to {@link RootContentMap}.
 * They will be automatically added here.
 */
export type RootContent = RootContentMap[keyof RootContentMap];

/**
 * Registry of all hast nodes that can occur as children of {@link Root}.
 *
 * > 👉 **Note**: {@link Root} does not need to be an entire document.
 * > it can also be a fragment.
 *
 * For a union of all {@link Root} children, see {@link RootContent}.
 */
export interface RootContentMap {
    comment: Comment;
    doctype: Doctype;
    element: Element;
    text: Text;
}

// ### Special content types

/**
 * Union of registered hast nodes that can occur in {@link Root}.
 *
 * @deprecated Use {@link RootContent} instead.
 */
export type Content = RootContent;

/**
 * Union of registered hast literals.
 *
 * To register custom hast nodes, add them to {@link RootContentMap} and other
 * places where relevant.
 * They will be automatically added here.
 */
export type Literals = Extract<Nodes, UnistLiteral>;

/**
 * Union of registered hast nodes.
 *
 * To register custom hast nodes, add them to {@link RootContentMap} and other
 * places where relevant.
 * They will be automatically added here.
 */
export type Nodes = Root | RootContent;

/**
 * Union of registered hast parents.
 *
 * To register custom hast nodes, add them to {@link RootContentMap} and other
 * places where relevant.
 * They will be automatically added here.
 */
export type Parents = Extract<Nodes, UnistParent>;

// ## Abstract nodes

/**
 * Abstract hast node.
 *
 * This interface is supposed to be extended.
 * If you can use {@link Literal} or {@link Parent}, you should.
 * But for example in HTML, a `Doctype` is neither literal nor parent, but
 * still a node.
 *
 * To register custom hast nodes, add them to {@link RootContentMap} and other
 * places where relevant (such as {@link ElementContentMap}).
 *
 * For a union of all registered hast nodes, see {@link Nodes}.
 */
export interface Node extends UnistNode {
    /**
     * Info from the ecosystem.
     */
    data?: Data | undefined;
}

/**
 * Abstract hast node that contains the smallest possible value.
 *
 * This interface is supposed to be extended if you make custom hast nodes.
 *
 * For a union of all registered hast literals, see {@link Literals}.
 */
export interface Literal extends Node {
    /**
     * Plain-text value.
     */
    value: string;
}

/**
 * Abstract hast node that contains other hast nodes (*children*).
 *
 * This interface is supposed to be extended if you make custom hast nodes.
 *
 * For a union of all registered hast parents, see {@link Parents}.
 */
export interface Parent extends Node {
    /**
     * List of children.
     */
    children: RootContent[];
}

// ## Concrete nodes

/**
 * HTML comment.
 */
export interface Comment extends Literal {
    /**
     * Node type of HTML comments in hast.
     */
    type: "comment";
    /**
     * Data associated with the comment.
     */
    data?: CommentData | undefined;
}

/**
 * Info associated with hast comments by the ecosystem.
 */
export interface CommentData extends Data {}

/**
 * HTML document type.
 */
export interface Doctype extends UnistNode {
    /**
     * Node type of HTML document types in hast.
     */
    type: "doctype";
    /**
     * Data associated with the doctype.
     */
    data?: DoctypeData | undefined;
}

/**
 * Info associated with hast doctypes by the ecosystem.
 */
export interface DoctypeData extends Data {}

/**
 * HTML element.
 */
export interface Element extends Parent {
    /**
     * Node type of elements.
     */
    type: "element";
    /**
     * Tag name (such as `'body'`) of the element.
     */
    tagName: string;
    /**
     * Info associated with the element.
     */
    properties: Properties;
    /**
     * Children of element.
     */
    children: ElementContent[];
    /**
     * When the `tagName` field is `'template'`, a `content` field can be
     * present.
     */
    content?: Root | undefined;
    /**
     * Data associated with the element.
     */
    data?: ElementData | undefined;
}

/**
 * Info associated with hast elements by the ecosystem.
 */
export interface ElementData extends Data {}

/**
 * Document fragment or a whole document.
 *
 * Should be used as the root of a tree and must not be used as a child.
 *
 * Can also be used as the value for the content field on a `'template'` element.
 */
export interface Root extends Parent {
    /**
     * Node type of hast root.
     */
    type: "root";
    /**
     * Children of root.
     */
    children: RootContent[];
    /**
     * Data associated with the hast root.
     */
    data?: RootData | undefined;
}

/**
 * Info associated with hast root nodes by the ecosystem.
 */
export interface RootData extends Data {}

/**
 * HTML character data (plain text).
 */
export interface Text extends Literal {
    /**
     * Node type of HTML character data (plain text) in hast.
     */
    type: "text";
    /**
     * Data associated with the text.
     */
    data?: TextData | undefined;
}

/**
 * Info associated with hast texts by the ecosystem.
 */
export interface TextData extends Data {}
