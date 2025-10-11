export interface ParseLinkTitleResult {
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

export default function parseLinkTitle(
    str: string,
    start: number,
    max: number,
    prev_state?: ParseLinkTitleResult,
): ParseLinkTitleResult;
