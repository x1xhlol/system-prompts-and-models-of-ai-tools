import type {Data, ElementContent, Literal, Properties} from 'hast'

// Expose types.
export type {
  FootnoteBackContentTemplate,
  FootnoteBackLabelTemplate
} from './lib/footer.js'
export type {Handler, Handlers, Options, State} from './lib/state.js'

// Expose JS API.
export {handlers as defaultHandlers} from './lib/handlers/index.js'
export {
  defaultFootnoteBackContent,
  defaultFootnoteBackLabel
} from './lib/footer.js'
export {toHast} from './lib/index.js'

/**
 * Raw string of HTML embedded into HTML AST.
 */
export interface Raw extends Literal {
  /**
   * Node type of raw.
   */
  type: 'raw'

  /**
   * Data associated with the hast raw.
   */
  data?: RawData | undefined
}

/**
 * Info associated with hast raw nodes by the ecosystem.
 */
export interface RawData extends Data {}

// Register nodes in content.
declare module 'hast' {
  interface ElementData {
    /**
     * Custom info relating to the node, if `<code>` in `<pre>`.
     *
     * Defined by `mdast-util-to-hast` (`remark-rehype`).
     */
    meta?: string | null | undefined
  }

  interface ElementContentMap {
    /**
     * Raw string of HTML embedded into HTML AST.
     */
    raw: Raw
  }

  interface RootContentMap {
    /**
     * Raw string of HTML embedded into HTML AST.
     */
    raw: Raw
  }
}

// Register data on mdast.
declare module 'mdast' {
  interface Data {
    /**
     * Field supported by `mdast-util-to-hast` to signal that a node should
     * result in something with these children.
     *
     * When this is defined, when a parent is created, these children will
     * be used.
     */
    hChildren?: ElementContent[] | undefined

    /**
     * Field supported by `mdast-util-to-hast` to signal that a node should
     * result in a particular element, instead of its default behavior.
     *
     * When this is defined, an element with the given tag name is created.
     * For example, when setting `hName` to `'b'`, a `<b>` element is created.
     */
    hName?: string | undefined

    /**
     * Field supported by `mdast-util-to-hast` to signal that a node should
     * result in an element with these properties.
     *
     * When this is defined, when an element is created, these properties will
     * be used.
     */
    hProperties?: Properties | undefined
  }
}
