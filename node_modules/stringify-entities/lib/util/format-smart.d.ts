/**
 * Configurable ways to encode a character yielding pretty or small results.
 *
 * @param {number} code
 * @param {number} next
 * @param {FormatSmartOptions} options
 * @returns {string}
 */
export function formatSmart(code: number, next: number, options: FormatSmartOptions): string;
export type FormatSmartOptions = {
    /**
     * Prefer named character references (`&amp;`) where possible.
     */
    useNamedReferences?: boolean;
    /**
     * Prefer the shortest possible reference, if that results in less bytes.
     * **Note**: `useNamedReferences` can be omitted when using `useShortestReferences`.
     */
    useShortestReferences?: boolean;
    /**
     * Whether to omit semicolons when possible.
     * **Note**: This creates what HTML calls “parse errors” but is otherwise still valid HTML — don’t use this except when building a minifier.
     * Omitting semicolons is possible for certain named and numeric references in some cases.
     */
    omitOptionalSemicolons?: boolean;
    /**
     * Create character references which don’t fail in attributes.
     * **Note**: `attribute` only applies when operating dangerously with
     * `omitOptionalSemicolons: true`.
     */
    attribute?: boolean;
};
