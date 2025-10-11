import MarkdownIt from "../index.mjs";
import Token, { Nesting } from "../token.mjs";

export interface Scanned {
    can_open: boolean;
    can_close: boolean;
    length: number;
}

export interface Delimiter {
    marker: number;
    length: number;
    token: number;
    end: number;
    open: boolean;
    close: boolean;
}

export interface TokenMeta {
    delimiters: Delimiter[];
}

export default class StateInline {
    constructor(src: string, md: MarkdownIt, env: any, outTokens: Token[]);

    src: string;
    env: any;
    md: MarkdownIt;
    tokens: Token[];
    tokens_meta: Array<TokenMeta | null>;

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
    delimiters: Delimiter[];

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
    push(type: string, tag: string, nesting: Nesting): Token;

    /**
     * Scan a sequence of emphasis-like markers, and determine whether
     * it can start an emphasis sequence or end an emphasis sequence.
     *
     * @param start position to scan from (it should point at a valid marker)
     * @param canSplitWord determine if these markers can be found inside a word
     */
    scanDelims(start: number, canSplitWord: boolean): Scanned;

    Token: typeof Token;
}
