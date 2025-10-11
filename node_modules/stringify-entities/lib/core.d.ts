/**
 * Encode certain characters in `value`.
 *
 * @param {string} value
 * @param {CoreWithFormatOptions} options
 * @returns {string}
 */
export function core(value: string, options: CoreWithFormatOptions): string;
export type CoreOptions = {
    /**
     * Whether to only escape the given subset of characters.
     */
    subset?: ReadonlyArray<string>;
    /**
     * Whether to only escape possibly dangerous characters.
     * Those characters are `"`, `&`, `'`, `<`, `>`, and `` ` ``.
     */
    escapeOnly?: boolean;
};
export type FormatOptions = {
    /**
     *  Format strategy.
     */
    format: (code: number, next: number, options: CoreWithFormatOptions) => string;
};
export type CoreWithFormatOptions = CoreOptions & FormatOptions & import('./util/format-smart.js').FormatSmartOptions;
