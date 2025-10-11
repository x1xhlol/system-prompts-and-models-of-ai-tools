export namespace minpath {
    export { basename };
    export { dirname };
    export { extname };
    export { join };
    export let sep: string;
}
/**
 * Get the basename from a path.
 *
 * @param {string} path
 *   File path.
 * @param {string | null | undefined} [extname]
 *   Extension to strip.
 * @returns {string}
 *   Stem or basename.
 */
declare function basename(path: string, extname?: string | null | undefined): string;
/**
 * Get the dirname from a path.
 *
 * @param {string} path
 *   File path.
 * @returns {string}
 *   File path.
 */
declare function dirname(path: string): string;
/**
 * Get an extname from a path.
 *
 * @param {string} path
 *   File path.
 * @returns {string}
 *   Extname.
 */
declare function extname(path: string): string;
/**
 * Join segments from a path.
 *
 * @param {Array<string>} segments
 *   Path segments.
 * @returns {string}
 *   File path.
 */
declare function join(...segments: Array<string>): string;
export {};
//# sourceMappingURL=minpath.browser.d.ts.map