import * as mdurl from "mdurl";
// import * as ucmicro from "uc.micro";

export const lib: {
    mdurl: typeof mdurl;
    ucmicro: any;
};

/**
 * Merge objects
 */
export function assign(obj: any, ...from: any[]): any;

export function isString(obj: any): obj is string;

export function has(obj: any, key: keyof any): boolean;

export function unescapeMd(str: string): string;

export function unescapeAll(str: string): string;

export function isValidEntityCode(c: number): boolean;

export function fromCodePoint(c: number): string;

export function escapeHtml(str: string): string;

/**
 * Remove element from array and put another array at those position.
 * Useful for some operations with tokens
 */
export function arrayReplaceAt<T>(src: T[], pos: number, newElements: T[]): T[];

export function isSpace(code: number): boolean;

/**
 * Zs (unicode class) || [\t\f\v\r\n]
 */
export function isWhiteSpace(code: number): boolean;

/**
 * Markdown ASCII punctuation characters.
 *
 * !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
 *
 * Don't confuse with unicode punctuation !!! It lacks some chars in ascii range.
 *
 * @see http://spec.commonmark.org/0.15/#ascii-punctuation-character
 */
export function isMdAsciiPunct(code: number): boolean;

/**
 * Currently without astral characters support.
 */
export function isPunctChar(ch: string): boolean;

export function escapeRE(str: string): string;

/**
 * Helper to unify [reference labels].
 */
export function normalizeReference(str: string): string;
