import { Options } from "./index.mjs";
import Token from "./token.mjs";

export type RenderRule = (tokens: Token[], idx: number, options: Options, env: any, self: Renderer) => string;

export interface RenderRuleRecord {
    [type: string]: RenderRule | undefined;
    code_inline?: RenderRule | undefined;
    code_block?: RenderRule | undefined;
    fence?: RenderRule | undefined;
    image?: RenderRule | undefined;
    hardbreak?: RenderRule | undefined;
    softbreak?: RenderRule | undefined;
    text?: RenderRule | undefined;
    html_block?: RenderRule | undefined;
    html_inline?: RenderRule | undefined;
}

export default class Renderer {
    /**
     * Creates new {@link Renderer} instance and fill {@link Renderer#rules} with defaults.
     */
    constructor();

    /**
     * Contains render rules for tokens. Can be updated and extended.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * md.renderer.rules.strong_open  = function () { return '<b>'; };
     * md.renderer.rules.strong_close = function () { return '</b>'; };
     *
     * var result = md.renderInline(...);
     * ```
     *
     * Each rule is called as independent static function with fixed signature:
     *
     * ```javascript
     * function my_token_render(tokens, idx, options, env, renderer) {
     *   // ...
     *   return renderedHTML;
     * }
     * ```
     *
     * @see https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.mjs
     */
    rules: RenderRuleRecord;

    /**
     * Render token attributes to string.
     */
    renderAttrs(token: Token): string;

    /**
     * Default token renderer. Can be overriden by custom function
     * in {@link Renderer#rules}.
     *
     * @param tokens list of tokens
     * @param idx token index to render
     * @param options params of parser instance
     */
    renderToken(tokens: Token[], idx: number, options: Options): string;

    /**
     * The same as {@link Renderer.render}, but for single token of `inline` type.
     *
     * @param tokens list of block tokens to render
     * @param options params of parser instance
     * @param env additional data from parsed input (references, for example)
     */
    renderInline(tokens: Token[], options: Options, env: any): string;

    /**
     * Special kludge for image `alt` attributes to conform CommonMark spec.
     * Don't try to use it! Spec requires to show `alt` content with stripped markup,
     * instead of simple escaping.
     *
     * @param tokens list of block tokens to render
     * @param options params of parser instance
     * @param env additional data from parsed input (references, for example)
     */
    renderInlineAsText(tokens: Token[], options: Options, env: any): string;

    /**
     * Takes token stream and generates HTML. Probably, you will never need to call
     * this method directly.
     *
     * @param tokens list of block tokens to render
     * @param options params of parser instance
     * @param env additional data from parsed input (references, for example)
     */
    render(tokens: Token[], options: Options, env: any): string;
}
