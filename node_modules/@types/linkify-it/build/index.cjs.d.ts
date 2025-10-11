/**
 * Match result. Single element of array, returned by {@link LinkifyIt#match}.
 */
declare class Match {
    constructor(self: LinkifyIt, shift: number);

    /**
     * First position of matched string.
     */
    index: number;
    /**
     * Next position after matched string.
     */
    lastIndex: number;
    /**
     * Matched string.
     */
    raw: string;
    /**
     * Prefix (protocol) for matched string.
     */
    schema: string;
    /**
     * Normalized text of matched string.
     */
    text: string;
    /**
     * Normalized url of matched string.
     */
    url: string;
}

type Match_ = Match;

declare namespace LinkifyIt {
    type Validate = (text: string, pos: number, self: LinkifyIt) => number | boolean;

    interface FullRule {
        validate: string | RegExp | Validate;
        normalize?: ((match: Match) => void) | undefined;
    }

    type Rule = string | FullRule;

    /**
     * An object, where each key/value describes protocol/rule:
     *
     * - __key__ - link prefix (usually, protocol name with `:` at the end, `skype:`
     *   for example). `linkify-it` makes sure that prefix is not preceded with
     *   alphanumeric char and symbols. Only whitespaces and punctuation allowed.
     * - __value__ - rule to check tail after link prefix
     *   - _String_ - just alias to existing rule
     *   - _Object_
     *     - _validate_ - validator function (should return matched length on success),
     *       or `RegExp`.
     *     - _normalize_ - optional function to normalize text & url of matched result
     *       (for example, for `@twitter` mentions).
     */
    interface SchemaRules {
        [schema: string]: Rule;
    }

    interface Options {
        /**
         * recognize URL-s without `http(s):` prefix. Default `true`.
         */
        fuzzyLink?: boolean | undefined;
        /**
         *  allow IPs in fuzzy links above. Can conflict with some texts
         *  like version numbers. Default `false`.
         */
        fuzzyIP?: boolean | undefined;
        /**
         * recognize emails without `mailto:` prefix. Default `true`.
         */
        fuzzyEmail?: boolean | undefined;
    }

    type Match = Match_;
}

declare class LinkifyIt {
    /**
     * new LinkifyIt(schemas, options)
     * - schemas (Object): Optional. Additional schemas to validate (prefix/validator)
     * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
     *
     * Creates new linkifier instance with optional additional schemas.
     * Can be called without `new` keyword for convenience.
     *
     * By default understands:
     *
     * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
     * - "fuzzy" links and emails (example.com, foo@bar.com).
     */
    constructor(schemas?: LinkifyIt.SchemaRules | LinkifyIt.Options, options?: LinkifyIt.Options);

    // Use overloads to provide contextual typing to `FullRule.normalize`, which is ambiguous with string.normalize
    /**
     * Add new rule definition. See constructor description for details.
     *
     * @param schema rule name (fixed pattern prefix)
     * @param definition schema definition
     */
    add(schema: string, definition: string): this;
    add(schema: string, definition: LinkifyIt.FullRule | null): this;

    /**
     * Set recognition options for links without schema.
     */
    set(options: LinkifyIt.Options): this;

    /**
     * Searches linkifiable pattern and returns `true` on success or `false` on fail.
     */
    test(text: string): boolean;

    /**
     * Very quick check, that can give false positives. Returns true if link MAY BE
     * can exists. Can be used for speed optimization, when you need to check that
     * link NOT exists.
     */
    pretest(text: string): boolean;

    /**
     * Similar to {@link LinkifyIt#test} but checks only specific protocol tail exactly
     * at given position. Returns length of found pattern (0 on fail).
     *
     * @param text text to scan
     * @param schema rule (schema) name
     * @param pos text offset to check from
     */
    testSchemaAt(text: string, schema: string, pos: number): number;

    /**
     * Returns array of found link descriptions or `null` on fail. We strongly
     * recommend to use {@link LinkifyIt#test} first, for best speed.
     */
    match(text: string): LinkifyIt.Match[] | null;

    /**
     * Returns fully-formed (not fuzzy) link if it starts at the beginning
     * of the string, and null otherwise.
     */
    matchAtStart(text: string): LinkifyIt.Match | null;

    /**
     * Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
     * to avoid false positives. By default this algorythm used:
     *
     * - hostname with any 2-letter root zones are ok.
     * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
     *   are ok.
     * - encoded (`xn--...`) root zones are ok.
     *
     * If list is replaced, then exact match for 2-chars root zones will be checked.
     *
     * @param list list of tlds
     * @param keepOld merge with current list if `true` (`false` by default)
     */
    tlds(list: string | string[], keepOld?: boolean): this;

    /**
     * Default normalizer (if schema does not define it's own).
     */
    normalize(match: LinkifyIt.Match): void;

    /**
     * Override to modify basic RegExp-s.
     */
    onCompile(): void;

    re: {
        [key: string]: RegExp;
    };
}

export = LinkifyIt;
