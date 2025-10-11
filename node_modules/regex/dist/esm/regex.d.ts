export type InterpolatedValue = string | RegExp | Pattern | number;
export type PluginData = {
    flags?: string;
    captureTransfers?: Map<number, Array<number>>;
    hiddenCaptures?: Array<number>;
};
export type PluginResult = {
    pattern: string;
    captureTransfers?: Map<number, Array<number>>;
    hiddenCaptures?: Array<number>;
};
export type RawTemplate = TemplateStringsArray | {
    raw: Array<string>;
};
export type RegexTagOptions = {
    flags?: string;
    subclass?: boolean;
    plugins?: Array<(expression: string, data: PluginData) => PluginResult>;
    unicodeSetsPlugin?: ((expression: string, data: PluginData) => PluginResult) | null;
    disable?: {
        x?: boolean;
        n?: boolean;
        v?: boolean;
        atomic?: boolean;
        subroutines?: boolean;
    };
    force?: {
        v?: boolean;
    };
};
export type RegexTag<T> = {
    (template: RawTemplate, ...substitutions: ReadonlyArray<InterpolatedValue>): T;
    (flags?: string): RegexTag<T>;
    (options: RegexTagOptions & {
        subclass?: false;
    }): RegexTag<T>;
    (options: RegexTagOptions & {
        subclass: true;
    }): RegexTag<RegExpSubclass>;
};
export type RegexFromTemplate<T> = {
    (options: RegexTagOptions, template: RawTemplate, ...substitutions: ReadonlyArray<InterpolatedValue>): T;
};
import { pattern } from './pattern.js';
/**
@typedef {string | RegExp | Pattern | number} InterpolatedValue
@typedef {{
  flags?: string;
  captureTransfers?: Map<number, Array<number>>;
  hiddenCaptures?: Array<number>;
}} PluginData
@typedef {{
  pattern: string;
  captureTransfers?: Map<number, Array<number>>;
  hiddenCaptures?: Array<number>;
}} PluginResult
@typedef {TemplateStringsArray | {raw: Array<string>}} RawTemplate
@typedef {{
  flags?: string;
  subclass?: boolean;
  plugins?: Array<(expression: string, data: PluginData) => PluginResult>;
  unicodeSetsPlugin?: ((expression: string, data: PluginData) => PluginResult) | null;
  disable?: {
    x?: boolean;
    n?: boolean;
    v?: boolean;
    atomic?: boolean;
    subroutines?: boolean;
  };
  force?: {
    v?: boolean;
  };
}} RegexTagOptions
*/
/**
@template T
@typedef RegexTag
@type {{
  (template: RawTemplate, ...substitutions: ReadonlyArray<InterpolatedValue>): T;
  (flags?: string): RegexTag<T>;
  (options: RegexTagOptions & {subclass?: false}): RegexTag<T>;
  (options: RegexTagOptions & {subclass: true}): RegexTag<RegExpSubclass>;
}}
*/
/**
Template tag for constructing a regex with extended syntax and context-aware interpolation of
regexes, strings, and patterns.

Can be called in several ways:
1. `` regex`…` `` - Regex pattern as a raw string.
2. `` regex('gi')`…` `` - To specify flags.
3. `` regex({flags: 'gi'})`…` `` - With options.
@type {RegexTag<RegExp>}
*/
export const regex: RegexTag<RegExp>;
/**
Returns the processed expression and flags as strings.
@param {string} expression
@param {RegexTagOptions} [options]
@returns {{
  pattern: string;
  flags: string;
}}
*/
export function rewrite(expression?: string, options?: RegexTagOptions): {
    pattern: string;
    flags: string;
};
import { Pattern } from './pattern.js';
import { RegExpSubclass } from './subclass.js';
export { pattern };
