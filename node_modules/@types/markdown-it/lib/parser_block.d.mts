import MarkdownIt from "./index.mjs";
import Ruler from "./ruler.mjs";
import StateBlock from "./rules_block/state_block.mjs";
import Token from "./token.mjs";

export type RuleBlock = (state: StateBlock, startLine: number, endLine: number, silent: boolean) => boolean;

export default class ParserBlock {
    /**
     * {@link Ruler} instance. Keep configuration of block rules.
     */
    ruler: Ruler<RuleBlock>;

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
