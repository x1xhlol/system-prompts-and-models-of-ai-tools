import MarkdownIt from "../index.mjs";
import Token from "../token.mjs";

export default class StateCore {
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
