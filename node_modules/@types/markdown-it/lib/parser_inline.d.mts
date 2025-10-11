import MarkdownIt from "./index.mjs";
import Ruler from "./ruler.mjs";
import StateInline from "./rules_inline/state_inline.mjs";
import Token from "./token.mjs";

export type RuleInline = (state: StateInline, silent: boolean) => boolean;
export type RuleInline2 = (state: StateInline) => boolean;

export default class ParserInline {
    /**
     * {@link Ruler} instance. Keep configuration of inline rules.
     */
    ruler: Ruler<RuleInline>;

    /**
     * {@link Ruler} instance. Second ruler used for post-processing
     * (e.g. in emphasis-like rules).
     */
    ruler2: Ruler<RuleInline2>;

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
