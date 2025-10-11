import LinkifyIt = require("linkify-it");
import mdurl = require("mdurl");
// import ucmicro = require("uc.micro");

// lib/token.mjs

declare class Token {
    /**
     * Create new token and fill passed properties.
     */
    constructor(type: string, tag: string, nesting: MarkdownIt.Token.Nesting);

    /**
     * Type of the token, e.g. "paragraph_open"
     */
    type: string;

    /**
     * HTML tag name, e.g. "p"
     */
    tag: string;

    /**
     * HTML attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
     */
    attrs: Array<[string, string]> | null;

    /**
     * Source map info. Format: `[ line_begin, line_end ]`
     */
    map: [number, number] | null;

    /**
     * Level change (number in {-1, 0, 1} set), where:
     *
     * -  `1` means the tag is opening
     * -  `0` means the tag is self-closing
     * - `-1` means the tag is closing
     */
    nesting: MarkdownIt.Token.Nesting;

    /**
     * Nesting level, the same as `state.level`
     */
    level: number;

    /**
     * An array of child nodes (inline and img tokens)
     */
    children: Token[] | null;

    /**
     * In a case of self-closing tag (code, html, fence, etc.),
     * it has contents of this tag.
     */
    content: string;

    /**
     * '*' or '_' for emphasis, fence string for fence, etc.
     */
    markup: string;

    /**
     * - Info string for "fence" tokens
     * - The value "auto" for autolink "link_open" and "link_close" tokens
     * - The string value of the item marker for ordered-list "list_item_open" tokens
     */
    info: string;

    /**
     * A place for plugins to store an arbitrary data
     */
    meta: any;

    /**
     * True for block-level tokens, false for inline tokens.
     * Used in renderer to calculate line breaks
     */
    block: boolean;

    /**
     * If it's true, ignore this element when rendering. Used for tight lists
     * to hide paragraphs.
     */
    hidden: boolean;

    /**
     * Search attribute index by name.
     */
    attrIndex(name: string): number;

    /**
     * Add `[ name, value ]` attribute to list. Init attrs if necessary
     */
    attrPush(attrData: [string, string]): void;

    /**
     * Set `name` attribute to `value`. Override old value if exists.
     */
    attrSet(name: string, value: string): void;

    /**
     * Get the value of attribute `name`, or null if it does not exist.
     */
    attrGet(name: string): string | null;

    /**
     * Join value to existing attribute via space. Or create new attribute if not
     * exists. Useful to operate with token classes.
     */
    attrJoin(name: string, value: string): void;
}

type Token_ = Token;

// lib/renderer.mjs

declare class Renderer {
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
    rules: MarkdownIt.Renderer.RenderRuleRecord;

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
    renderToken(tokens: Token[], idx: number, options: MarkdownIt.Options): string;

    /**
     * The same as {@link Renderer.render}, but for single token of `inline` type.
     *
     * @param tokens list of block tokens to render
     * @param options params of parser instance
     * @param env additional data from parsed input (references, for example)
     */
    renderInline(tokens: Token[], options: MarkdownIt.Options, env: any): string;

    /**
     * Special kludge for image `alt` attributes to conform CommonMark spec.
     * Don't try to use it! Spec requires to show `alt` content with stripped markup,
     * instead of simple escaping.
     *
     * @param tokens list of block tokens to render
     * @param options params of parser instance
     * @param env additional data from parsed input (references, for example)
     */
    renderInlineAsText(tokens: Token[], options: MarkdownIt.Options, env: any): string;

    /**
     * Takes token stream and generates HTML. Probably, you will never need to call
     * this method directly.
     *
     * @param tokens list of block tokens to render
     * @param options params of parser instance
     * @param env additional data from parsed input (references, for example)
     */
    render(tokens: Token[], options: MarkdownIt.Options, env: any): string;
}

type Renderer_ = Renderer;

// lib/ruler.mjs

/**
 * Helper class, used by {@link MarkdownIt#core}, {@link MarkdownIt#block} and
 * {@link MarkdownIt#inline} to manage sequences of functions (rules):
 *
 * - keep rules in defined order
 * - assign the name to each rule
 * - enable/disable rules
 * - add/replace rules
 * - allow assign rules to additional named chains (in the same)
 * - caching lists of active rules
 *
 * You will not need use this class directly until write plugins. For simple
 * rules control use {@link MarkdownIt.disable}, {@link MarkdownIt.enable} and
 * {@link MarkdownIt.use}.
 */
declare class Ruler<T> {
    constructor();

    /**
     * Replace rule by name with new function & options. Throws error if name not
     * found.
     *
     * ##### Example
     *
     * Replace existing typographer replacement rule with new one:
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * md.core.ruler.at('replacements', function replace(state) {
     *   //...
     * });
     * ```
     *
     * @param name rule name to replace.
     * @param fn new rule function.
     * @param options new rule options (not mandatory).
     */
    at(name: string, fn: T, options?: MarkdownIt.Ruler.RuleOptions): void;

    /**
     * Add new rule to chain before one with given name.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
     *   //...
     * });
     * ```
     *
     * @see {@link Ruler.after}, {@link Ruler.push}
     *
     * @param beforeName new rule will be added before this one.
     * @param ruleName name of added rule.
     * @param fn rule function.
     * @param options rule options (not mandatory).
     */
    before(beforeName: string, ruleName: string, fn: T, options?: MarkdownIt.Ruler.RuleOptions): void;

    /**
     * Add new rule to chain after one with given name.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * md.inline.ruler.after('text', 'my_rule', function replace(state) {
     *   //...
     * });
     * ```
     *
     * @see {@link Ruler.before}, {@link Ruler.push}
     *
     * @param afterName new rule will be added after this one.
     * @param ruleName name of added rule.
     * @param fn rule function.
     * @param options rule options (not mandatory).
     */
    after(afterName: string, ruleName: string, fn: T, options?: MarkdownIt.Ruler.RuleOptions): void;

    /**
     * Push new rule to the end of chain.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * md.core.ruler.push('my_rule', function replace(state) {
     *   //...
     * });
     * ```
     *
     * @see {@link Ruler.before}, {@link Ruler.after}
     *
     * @param ruleName name of added rule.
     * @param fn rule function.
     * @param options rule options (not mandatory).
     */
    push(ruleName: string, fn: T, options?: MarkdownIt.Ruler.RuleOptions): void;

    /**
     * Enable rules with given names. If any rule name not found - throw Error.
     * Errors can be disabled by second param.
     *
     * Returns list of found rule names (if no exception happened).
     *
     * @see {@link Ruler.disable}, {@link Ruler.enableOnly}
     *
     * @param list list of rule names to enable.
     * @param ignoreInvalid set `true` to ignore errors when rule not found.
     */
    enable(list: string | string[], ignoreInvalid?: boolean): string[];

    /**
     * Enable rules with given names, and disable everything else. If any rule name
     * not found - throw Error. Errors can be disabled by second param.
     *
     * @see {@link Ruler.disable}, {@link Ruler.enable}
     *
     * @param list list of rule names to enable (whitelist).
     * @param ignoreInvalid set `true` to ignore errors when rule not found.
     */
    enableOnly(list: string | string[], ignoreInvalid?: boolean): void;

    /**
     * Disable rules with given names. If any rule name not found - throw Error.
     * Errors can be disabled by second param.
     *
     * Returns list of found rule names (if no exception happened).
     *
     * @see {@link Ruler.enable}, {@link Ruler.enableOnly}
     *
     * @param list list of rule names to disable.
     * @param ignoreInvalid set `true` to ignore errors when rule not found.
     */
    disable(list: string | string[], ignoreInvalid?: boolean): string[];

    /**
     * Return array of active functions (rules) for given chain name. It analyzes
     * rules configuration, compiles caches if not exists and returns result.
     *
     * Default chain name is `''` (empty string). It can't be skipped. That's
     * done intentionally, to keep signature monomorphic for high speed.
     */
    getRules(chainName: string): T[];
}

type Ruler_<T> = Ruler<T>;

// lib/rules_core/state_core.mjs

declare class StateCore {
    constructor(src: string, md: MarkdownIt, env: any);

    src: string;
    env: any;
    tokens: Token[];
    inlineMode: boolean;

    /**
     * link to parser instance
     */
    md: MarkdownIt;

    Token: typeof Token;
}

type StateCore_ = StateCore;

// lib/rules_block/state_block.mjs

declare class StateBlock {
    constructor(src: string, md: MarkdownIt, env: any, tokens: Token[]);

    src: string;

    /**
     * link to parser instance
     */
    md: MarkdownIt;

    env: any;

    //
    // Internal state vartiables
    //

    tokens: Token[];

    /**
     * line begin offsets for fast jumps
     */
    bMarks: number[];
    /**
     * line end offsets for fast jumps
     */
    eMarks: number[];
    /**
     * offsets of the first non-space characters (tabs not expanded)
     */
    tShift: number[];
    /**
     * indents for each line (tabs expanded)
     */
    sCount: number[];

    /**
     * An amount of virtual spaces (tabs expanded) between beginning
     * of each line (bMarks) and real beginning of that line.
     *
     * It exists only as a hack because blockquotes override bMarks
     * losing information in the process.
     *
     * It's used only when expanding tabs, you can think about it as
     * an initial tab length, e.g. bsCount=21 applied to string `\t123`
     * means first tab should be expanded to 4-21%4 === 3 spaces.
     */
    bsCount: number[];

    // block parser variables

    /**
     * required block content indent (for example, if we are
     * inside a list, it would be positioned after list marker)
     */
    blkIndent: number;
    /**
     * line index in src
     */
    line: number;
    /**
     * lines count
     */
    lineMax: number;
    /**
     * loose/tight mode for lists
     */
    tight: boolean;
    /**
     * indent of the current dd block (-1 if there isn't any)
     */
    ddIndent: number;
    /**
     * indent of the current list block (-1 if there isn't any)
     */
    listIndent: number;

    /**
     * used in lists to determine if they interrupt a paragraph
     */
    parentType: MarkdownIt.StateBlock.ParentType;

    level: number;

    /**
     * Push new token to "stream".
     */
    push(type: string, tag: string, nesting: MarkdownIt.Token.Nesting): Token;

    isEmpty(line: number): boolean;

    skipEmptyLines(from: number): number;

    /**
     * Skip spaces from given position.
     */
    skipSpaces(pos: number): number;

    /**
     * Skip spaces from given position in reverse.
     */
    skipSpacesBack(pos: number, min: number): number;

    /**
     * Skip char codes from given position
     */
    skipChars(pos: number, code: number): number;

    /**
     * Skip char codes reverse from given position - 1
     */
    skipCharsBack(pos: number, code: number, min: number): number;

    /**
     * cut lines range from source.
     */
    getLines(begin: number, end: number, indent: number, keepLastLF: boolean): string;

    Token: typeof Token;
}

type StateBlock_ = StateBlock;

// lib/rules_inline/state_inline.mjs

declare class StateInline {
    constructor(src: string, md: MarkdownIt, env: any, outTokens: Token[]);

    src: string;
    env: any;
    md: MarkdownIt;
    tokens: Token[];
    tokens_meta: Array<MarkdownIt.StateInline.TokenMeta | null>;

    pos: number;
    posMax: number;
    level: number;
    pending: string;
    pendingLevel: number;

    /**
     * Stores { start: end } pairs. Useful for backtrack
     * optimization of pairs parse (emphasis, strikes).
     */
    cache: any;

    /**
     * List of emphasis-like delimiters for current tag
     */
    delimiters: MarkdownIt.StateInline.Delimiter[];

    // Stack of delimiter lists for upper level tags
    // _prev_delimiters: StateInline.Delimiter[][];

    /**
     * Flush pending text
     */
    pushPending(): Token;

    /**
     * Push new token to "stream".
     * If pending text exists - flush it as text token
     */
    push(type: string, tag: string, nesting: MarkdownIt.Token.Nesting): Token;

    /**
     * Scan a sequence of emphasis-like markers, and determine whether
     * it can start an emphasis sequence or end an emphasis sequence.
     *
     * @param start position to scan from (it should point at a valid marker)
     * @param canSplitWord determine if these markers can be found inside a word
     */
    scanDelims(start: number, canSplitWord: boolean): MarkdownIt.StateInline.Scanned;

    Token: typeof Token;
}

type StateInline_ = StateInline;

// lib/parser_core.mjs

declare class Core {
    /**
     * {@link Ruler} instance. Keep configuration of core rules.
     */
    ruler: Ruler<MarkdownIt.Core.RuleCore>;

    /**
     * Executes core chain rules.
     */
    process(state: StateCore): void;

    State: typeof StateCore;
}

type Core_ = Core;

// lib/parser_block.mjs

declare class ParserBlock {
    /**
     * {@link Ruler} instance. Keep configuration of block rules.
     */
    ruler: Ruler<MarkdownIt.ParserBlock.RuleBlock>;

    /**
     * Generate tokens for input range
     */
    tokenize(state: StateBlock, startLine: number, endLine: number): void;

    /**
     * Process input string and push block tokens into `outTokens`
     */
    parse(str: string, md: MarkdownIt, env: any, outTokens: Token[]): void;

    State: typeof StateBlock;
}

type ParserBlock_ = ParserBlock;

// lib/parser_inline.mjs

declare class ParserInline {
    /**
     * {@link Ruler} instance. Keep configuration of inline rules.
     */
    ruler: Ruler<MarkdownIt.ParserInline.RuleInline>;

    /**
     * {@link Ruler} instance. Second ruler used for post-processing
     * (e.g. in emphasis-like rules).
     */
    ruler2: Ruler<MarkdownIt.ParserInline.RuleInline2>;

    /**
     * Skip single token by running all rules in validation mode;
     * returns `true` if any rule reported success
     */
    skipToken(state: StateInline): void;

    /**
     * Generate tokens for input range
     */
    tokenize(state: StateInline): void;

    /**
     * Process input string and push inline tokens into `outTokens`
     */
    parse(str: string, md: MarkdownIt, env: any, outTokens: Token[]): void;

    State: typeof StateInline;
}

type ParserInline_ = ParserInline;

declare namespace MarkdownIt {
    // lib/common/utils.mjs

    interface Utils {
        lib: {
            mdurl: typeof mdurl;
            ucmicro: any;
        };

        /**
         * Merge objects
         */
        assign(obj: any, ...from: any[]): any;

        isString(obj: any): obj is string;

        has(obj: any, key: keyof any): boolean;

        unescapeMd(str: string): string;

        unescapeAll(str: string): string;

        isValidEntityCode(c: number): boolean;

        fromCodePoint(c: number): string;

        escapeHtml(str: string): string;

        /**
         * Remove element from array and put another array at those position.
         * Useful for some operations with tokens
         */
        arrayReplaceAt<T>(src: T[], pos: number, newElements: T[]): T[];

        isSpace(code: number): boolean;

        /**
         * Zs (unicode class) || [\t\f\v\r\n]
         */
        isWhiteSpace(code: number): boolean;

        /**
         * Markdown ASCII punctuation characters.
         *
         * !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
         *
         * Don't confuse with unicode punctuation !!! It lacks some chars in ascii range.
         *
         * @see http://spec.commonmark.org/0.15/#ascii-punctuation-character
         */
        isMdAsciiPunct(code: number): boolean;

        /**
         * Currently without astral characters support.
         */
        isPunctChar(ch: string): boolean;

        escapeRE(str: string): string;

        /**
         * Helper to unify [reference labels].
         */
        normalizeReference(str: string): string;
    }

    // lib/helpers/index.mjs

    interface ParseLinkDestinationResult {
        ok: boolean;
        pos: number;
        str: string;
    }

    interface ParseLinkTitleResult {
        /**
         * if `true`, this is a valid link title
         */
        ok: boolean;
        /**
         * if `true`, this link can be continued on the next line
         */
        can_continue: boolean;
        /**
         * if `ok`, it's the position of the first character after the closing marker
         */
        pos: number;
        /**
         * if `ok`, it's the unescaped title
         */
        str: string;
        /**
         * expected closing marker character code
         */
        marker: number;
    }

    interface Helpers {
        // lib/helpers/parse_link_label.mjs

        parseLinkLabel(state: StateInline, start: number, disableNested?: boolean): number;

        // lib/helpers/parse_link_destination.mjs

        parseLinkDestination(str: string, start: number, max: number): ParseLinkDestinationResult;

        // lib/helpers/parse_link_title.mjs

        parseLinkTitle(
            str: string,
            start: number,
            max: number,
            prev_state?: ParseLinkTitleResult,
        ): ParseLinkTitleResult;
    }

    /**
     * MarkdownIt provides named presets as a convenience to quickly
     * enable/disable active syntax rules and options for common use cases.
     *
     * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.js) -
     *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
     * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.js) -
     *   similar to GFM, used when no preset name given. Enables all available rules,
     *   but still without html, typographer & autolinker.
     * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.js) -
     *   all rules disabled. Useful to quickly setup your config via `.enable()`.
     *   For example, when you need only `bold` and `italic` markup and nothing else.
     */
    type PresetName = "default" | "zero" | "commonmark";

    interface Options {
        /**
         * Set `true` to enable HTML tags in source. Be careful!
         * That's not safe! You may need external sanitizer to protect output from XSS.
         * It's better to extend features via plugins, instead of enabling HTML.
         * @default false
         */
        html?: boolean | undefined;

        /**
         * Set `true` to add '/' when closing single tags
         * (`<br />`). This is needed only for full CommonMark compatibility. In real
         * world you will need HTML output.
         * @default false
         */
        xhtmlOut?: boolean | undefined;

        /**
         * Set `true` to convert `\n` in paragraphs into `<br>`.
         * @default false
         */
        breaks?: boolean | undefined;

        /**
         * CSS language class prefix for fenced blocks.
         * Can be useful for external highlighters.
         * @default 'language-'
         */
        langPrefix?: string | undefined;

        /**
         * Set `true` to autoconvert URL-like text to links.
         * @default false
         */
        linkify?: boolean | undefined;

        /**
         * Set `true` to enable [some language-neutral replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js) +
         * quotes beautification (smartquotes).
         * @default false
         */
        typographer?: boolean | undefined;

        /**
         * Double + single quotes replacement
         * pairs, when typographer enabled and smartquotes on. For example, you can
         * use `'«»„“'` for Russian, `'„“‚‘'` for German, and
         * `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (including nbsp).
         * @default '“”‘’'
         */
        quotes?: string | string[];

        /**
         * Highlighter function for fenced code blocks.
         * Highlighter `function (str, lang, attrs)` should return escaped HTML. It can
         * also return empty string if the source was not changed and should be escaped
         * externally. If result starts with <pre... internal wrapper is skipped.
         * @default null
         */
        highlight?: ((str: string, lang: string, attrs: string) => string) | null | undefined;
    }

    // lib/token.mjs

    type Token = Token_;
    namespace Token {
        type Nesting = 1 | 0 | -1;
    }

    // lib/renderer.mjs

    type Renderer = Renderer_;
    namespace Renderer {
        type RenderRule = (tokens: Token[], idx: number, options: Options, env: any, self: Renderer) => string;

        interface RenderRuleRecord {
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
    }

    // lib/ruler.mjs

    type Ruler<T> = Ruler_<T>;
    namespace Ruler {
        interface RuleOptions {
            /**
             * array with names of "alternate" chains.
             */
            alt: string[];
        }
    }

    // lib/rules_core/state_core.mjs

    type StateCore = StateCore_;

    // lib/rules_block/state_block.mjs

    type StateBlock = StateBlock_;
    namespace StateBlock {
        type ParentType = "blockquote" | "list" | "root" | "paragraph" | "reference";
    }

    // lib/rules_inline/state_inline.mjs

    type StateInline = StateInline_;
    namespace StateInline {
        interface Scanned {
            can_open: boolean;
            can_close: boolean;
            length: number;
        }

        interface Delimiter {
            marker: number;
            length: number;
            token: number;
            end: number;
            open: boolean;
            close: boolean;
        }

        interface TokenMeta {
            delimiters: Delimiter[];
        }
    }

    // lib/parser_core.mjs

    type Core = Core_;
    namespace Core {
        type RuleCore = (state: StateCore) => void;
    }

    // lib/parser_block.mjs

    type ParserBlock = ParserBlock_;
    namespace ParserBlock {
        type RuleBlock = (state: StateBlock, startLine: number, endLine: number, silent: boolean) => boolean;
    }

    // lib/parser_inline.mjs

    type ParserInline = ParserInline_;
    namespace ParserInline {
        type RuleInline = (state: StateInline, silent: boolean) => boolean;
        type RuleInline2 = (state: StateInline) => boolean;
    }

    type PluginSimple = (md: MarkdownIt) => void;
    type PluginWithOptions<T = any> = (md: MarkdownIt, options?: T) => void;
    type PluginWithParams = (md: MarkdownIt, ...params: any[]) => void;
}

interface MarkdownItConstructor {
    new(): MarkdownIt;
    new(presetName: MarkdownIt.PresetName, options?: MarkdownIt.Options): MarkdownIt;
    new(options: MarkdownIt.Options): MarkdownIt;
    (): MarkdownIt;
    (presetName: MarkdownIt.PresetName, options?: MarkdownIt.Options): MarkdownIt;
    (options: MarkdownIt.Options): MarkdownIt;
}

interface MarkdownIt {
    /**
     * Instance of {@link ParserInline}. You may need it to add new rules when
     * writing plugins. For simple rules control use {@link MarkdownIt.disable} and
     * {@link MarkdownIt.enable}.
     */
    readonly inline: ParserInline;

    /**
     * Instance of {@link ParserBlock}. You may need it to add new rules when
     * writing plugins. For simple rules control use {@link MarkdownIt.disable} and
     * {@link MarkdownIt.enable}.
     */
    readonly block: ParserBlock;

    /**
     * Instance of {@link Core} chain executor. You may need it to add new rules when
     * writing plugins. For simple rules control use {@link MarkdownIt.disable} and
     * {@link MarkdownIt.enable}.
     */
    readonly core: Core;

    /**
     * Instance of {@link Renderer}. Use it to modify output look. Or to add rendering
     * rules for new token types, generated by plugins.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * function myToken(tokens, idx, options, env, self) {
     *   //...
     *   return result;
     * };
     *
     * md.renderer.rules['my_token'] = myToken
     * ```
     *
     * See {@link Renderer} docs and [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js).
     */
    readonly renderer: Renderer;

    /**
     * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
     * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/linkify.js)
     * rule.
     */
    readonly linkify: LinkifyIt;

    /**
     * Link validation function. CommonMark allows too much in links. By default
     * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
     * except some embedded image types.
     *
     * You can change this behaviour:
     *
     * ```javascript
     * var md = require('markdown-it')();
     * // enable everything
     * md.validateLink = function () { return true; }
     * ```
     */
    validateLink(url: string): boolean;

    /**
     * Function used to encode link url to a machine-readable format,
     * which includes url-encoding, punycode, etc.
     */
    normalizeLink(url: string): string;

    /**
     * Function used to decode link url to a human-readable format`
     */
    normalizeLinkText(url: string): string;

    readonly utils: MarkdownIt.Utils;

    readonly helpers: MarkdownIt.Helpers;

    readonly options: MarkdownIt.Options;

    /**
     * *chainable*
     *
     * Set parser options (in the same format as in constructor). Probably, you
     * will never need it, but you can change options after constructor call.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')()
     *             .set({ html: true, breaks: true })
     *             .set({ typographer: true });
     * ```
     *
     * __Note:__ To achieve the best possible performance, don't modify a
     * `markdown-it` instance options on the fly. If you need multiple configurations
     * it's best to create multiple instances and initialize each with separate
     * config.
     */
    set(options: MarkdownIt.Options): this;

    /**
     * *chainable*, *internal*
     *
     * Batch load of all options and compenent settings. This is internal method,
     * and you probably will not need it. But if you with - see available presets
     * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/lib/presets)
     *
     * We strongly recommend to use presets instead of direct config loads. That
     * will give better compatibility with next versions.
     */
    configure(presets: MarkdownIt.PresetName): this;

    /**
     * *chainable*
     *
     * Enable list or rules. It will automatically find appropriate components,
     * containing rules with given names. If rule not found, and `ignoreInvalid`
     * not set - throws exception.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')()
     *             .enable(['sub', 'sup'])
     *             .disable('smartquotes');
     * ```
     *
     * @param list rule name or list of rule names to enable
     * @param ignoreInvalid set `true` to ignore errors when rule not found.
     */
    enable(list: string | string[], ignoreInvalid?: boolean): this;

    /**
     * *chainable*
     *
     * The same as {@link MarkdownIt.enable}, but turn specified rules off.
     *
     * @param list rule name or list of rule names to disable.
     * @param ignoreInvalid set `true` to ignore errors when rule not found.
     */
    disable(list: string | string[], ignoreInvalid?: boolean): this;

    /**
     * *chainable*
     *
     * Load specified plugin with given params into current parser instance.
     * It's just a sugar to call `plugin(md, params)` with curring.
     *
     * ##### Example
     *
     * ```javascript
     * var iterator = require('markdown-it-for-inline');
     * var md = require('markdown-it')()
     *             .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
     *               tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
     *             });
     * ```
     */
    use(plugin: MarkdownIt.PluginSimple): this;
    use<T = any>(plugin: MarkdownIt.PluginWithOptions<T>, options?: T): this;
    use(plugin: MarkdownIt.PluginWithParams, ...params: any[]): this;

    /**
     * *internal*
     *
     * Parse input string and returns list of block tokens (special token type
     * "inline" will contain list of inline tokens). You should not call this
     * method directly, until you write custom renderer (for example, to produce
     * AST).
     *
     * `env` is used to pass data between "distributed" rules and return additional
     * metadata like reference info, needed for the renderer. It also can be used to
     * inject data in specific cases. Usually, you will be ok to pass `{}`,
     * and then pass updated object to renderer.
     *
     * @param src source string
     * @param env environment sandbox
     */
    parse(src: string, env: any): Token[];

    /**
     * Render markdown string into html. It does all magic for you :).
     *
     * `env` can be used to inject additional metadata (`{}` by default).
     * But you will not need it with high probability. See also comment
     * in {@link MarkdownIt.parse}.
     *
     * @param src source string
     * @param env environment sandbox
     */
    render(src: string, env?: any): string;

    /**
     * *internal*
     *
     * The same as {@link MarkdownIt.parse} but skip all block rules. It returns the
     * block tokens list with the single `inline` element, containing parsed inline
     * tokens in `children` property. Also updates `env` object.
     *
     * @param src source string
     * @param env environment sandbox
     */
    parseInline(src: string, env: any): Token[];

    /**
     * Similar to {@link MarkdownIt.render} but for single paragraph content. Result
     * will NOT be wrapped into `<p>` tags.
     *
     * @param src source string
     * @param env environment sandbox
     */
    renderInline(src: string, env?: any): string;
}

/**
 * Main parser/renderer class.
 *
 * ##### Usage
 *
 * ```javascript
 * // node.js, "classic" way:
 * var MarkdownIt = require('markdown-it'),
 *     md = new MarkdownIt();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // node.js, the same, but with sugar:
 * var md = require('markdown-it')();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // browser without AMD, added to "window" on script load
 * // Note, there are no dash.
 * var md = window.markdownit();
 * var result = md.render('# markdown-it rulezz!');
 * ```
 *
 * Single line rendering, without paragraph wrap:
 *
 * ```javascript
 * var md = require('markdown-it')();
 * var result = md.renderInline('__markdown-it__ rulezz!');
 * ```
 *
 * ##### Example
 *
 * ```javascript
 * // commonmark mode
 * var md = require('markdown-it')('commonmark');
 *
 * // default mode
 * var md = require('markdown-it')();
 *
 * // enable everything
 * var md = require('markdown-it')({
 *   html: true,
 *   linkify: true,
 *   typographer: true
 * });
 * ```
 *
 * ##### Syntax highlighting
 *
 * ```js
 * var hljs = require('highlight.js') // https://highlightjs.org/
 *
 * var md = require('markdown-it')({
 *   highlight: function (str, lang) {
 *     if (lang && hljs.getLanguage(lang)) {
 *       try {
 *         return hljs.highlight(lang, str, true).value;
 *       } catch (__) {}
 *     }
 *
 *     return ''; // use external default escaping
 *   }
 * });
 * ```
 *
 * Or with full wrapper override (if you need assign class to `<pre>`):
 *
 * ```javascript
 * var hljs = require('highlight.js') // https://highlightjs.org/
 *
 * // Actual default values
 * var md = require('markdown-it')({
 *   highlight: function (str, lang) {
 *     if (lang && hljs.getLanguage(lang)) {
 *       try {
 *         return '<pre class="hljs"><code>' +
 *                hljs.highlight(lang, str, true).value +
 *                '</code></pre>';
 *       } catch (__) {}
 *     }
 *
 *     return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
 *   }
 * });
 * ```
 */
declare const MarkdownIt: MarkdownItConstructor;

export = MarkdownIt;
