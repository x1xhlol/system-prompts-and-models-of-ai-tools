import { HighlighterGeneric, Awaitable, CodeToHastOptions, CodeToTokensOptions, TokensResult, RequireKeys, CodeToTokensBaseOptions, ThemedToken, CodeToTokensWithThemesOptions, ThemedTokenWithVariants, BundledHighlighterOptions, GrammarState, ShikiInternal, ShikiTransformerContextCommon, ThemeRegistration, HighlighterCoreOptions, HighlighterCore, RegexEngine, LoadWasmOptions, Position, CreateHighlighterFactory, CreatedBundledHighlighterOptions, LanguageInput, ThemeInput, TokenStyles, PlainTextLanguage, SpecialLanguage, SpecialTheme, MaybeGetter, ThemeRegistrationAny, ThemeRegistrationResolved, TokenizeWithThemeOptions, MaybeArray, Grammar, CodeToHastRenderOptions, ShikiTransformerContextSource, ShikiTransformer } from '@shikijs/types';
export * from '@shikijs/types';
import { a as RootContent, N as Nodes, R as Root, E as Element } from './types/index.d.mjs';
import { JavaScriptRegexEngineOptions } from '@shikijs/engine-javascript';
export { FontStyle, EncodedTokenMetadata as StackElementMetadata } from './textmate.mjs';

type FormatSmartOptions = {
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

type CoreOptions = {
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

type Options$2 = CoreOptions & FormatSmartOptions;

type Options$1 = Options$2;

/**
 * Serialize hast as HTML.
 *
 * @param {Array<RootContent> | Nodes} tree
 *   Tree to serialize.
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {string}
 *   Serialized HTML.
 */
declare function toHtml(tree: Array<RootContent> | Nodes, options?: Options | null | undefined): string;
type CharacterReferences = Omit<Options$1, "attribute" | "escapeOnly" | "subset">;
/**
 * Configuration.
 */
type Options = {
    /**
     * Do not encode some characters which cause XSS vulnerabilities in older
     * browsers (default: `false`).
     *
     * > ⚠️ **Danger**: only set this if you completely trust the content.
     */
    allowDangerousCharacters?: boolean | null | undefined;
    /**
     * Allow `raw` nodes and insert them as raw HTML (default: `false`).
     *
     * When `false`, `Raw` nodes are encoded.
     *
     * > ⚠️ **Danger**: only set this if you completely trust the content.
     */
    allowDangerousHtml?: boolean | null | undefined;
    /**
     * Do not encode characters which cause parse errors (even though they work),
     * to save bytes (default: `false`).
     *
     * Not used in the SVG space.
     *
     * > 👉 **Note**: intentionally creates parse errors in markup (how parse
     * > errors are handled is well defined, so this works but isn’t pretty).
     */
    allowParseErrors?: boolean | null | undefined;
    /**
     * Use “bogus comments” instead of comments to save byes: `<?charlie>`
     * instead of `<!--charlie-->` (default: `false`).
     *
     * > 👉 **Note**: intentionally creates parse errors in markup (how parse
     * > errors are handled is well defined, so this works but isn’t pretty).
     */
    bogusComments?: boolean | null | undefined;
    /**
     * Configure how to serialize character references (optional).
     */
    characterReferences?: CharacterReferences | null | undefined;
    /**
     * Close SVG elements without any content with slash (`/`) on the opening tag
     * instead of an end tag: `<circle />` instead of `<circle></circle>`
     * (default: `false`).
     *
     * See `tightSelfClosing` to control whether a space is used before the
     * slash.
     *
     * Not used in the HTML space.
     */
    closeEmptyElements?: boolean | null | undefined;
    /**
     * Close self-closing nodes with an extra slash (`/`): `<img />` instead of
     * `<img>` (default: `false`).
     *
     * See `tightSelfClosing` to control whether a space is used before the
     * slash.
     *
     * Not used in the SVG space.
     */
    closeSelfClosing?: boolean | null | undefined;
    /**
     * Collapse empty attributes: get `class` instead of `class=""` (default:
     * `false`).
     *
     * Not used in the SVG space.
     *
     * > 👉 **Note**: boolean attributes (such as `hidden`) are always collapsed.
     */
    collapseEmptyAttributes?: boolean | null | undefined;
    /**
     * Omit optional opening and closing tags (default: `false`).
     *
     * For example, in `<ol><li>one</li><li>two</li></ol>`, both `</li>` closing
     * tags can be omitted.
     * The first because it’s followed by another `li`, the last because it’s
     * followed by nothing.
     *
     * Not used in the SVG space.
     */
    omitOptionalTags?: boolean | null | undefined;
    /**
     * Leave attributes unquoted if that results in less bytes (default: `false`).
     *
     * Not used in the SVG space.
     */
    preferUnquoted?: boolean | null | undefined;
    /**
     * Use the other quote if that results in less bytes (default: `false`).
     */
    quoteSmart?: boolean | null | undefined;
    /**
     * Preferred quote to use (default: `'"'`).
     */
    quote?: Quote | null | undefined;
    /**
     * When an `<svg>` element is found in the HTML space, this package already
     * automatically switches to and from the SVG space when entering and exiting
     * it (default: `'html'`).
     *
     * > 👉 **Note**: hast is not XML.
     * > It supports SVG as embedded in HTML.
     * > It does not support the features available in XML.
     * > Passing SVG might break but fragments of modern SVG should be fine.
     * > Use [`xast`][xast] if you need to support SVG as XML.
     */
    space?: Space | null | undefined;
    /**
     * Join attributes together, without whitespace, if possible: get
     * `class="a b"title="c d"` instead of `class="a b" title="c d"` to save
     * bytes (default: `false`).
     *
     * Not used in the SVG space.
     *
     * > 👉 **Note**: intentionally creates parse errors in markup (how parse
     * > errors are handled is well defined, so this works but isn’t pretty).
     */
    tightAttributes?: boolean | null | undefined;
    /**
     * Join known comma-separated attribute values with just a comma (`,`),
     * instead of padding them on the right as well (`,␠`, where `␠` represents a
     * space) (default: `false`).
     */
    tightCommaSeparatedLists?: boolean | null | undefined;
    /**
     * Drop unneeded spaces in doctypes: `<!doctypehtml>` instead of
     * `<!doctype html>` to save bytes (default: `false`).
     *
     * > 👉 **Note**: intentionally creates parse errors in markup (how parse
     * > errors are handled is well defined, so this works but isn’t pretty).
     */
    tightDoctype?: boolean | null | undefined;
    /**
     * Do not use an extra space when closing self-closing elements: `<img/>`
     * instead of `<img />` (default: `false`).
     *
     * > 👉 **Note**: only used if `closeSelfClosing: true` or
     * > `closeEmptyElements: true`.
     */
    tightSelfClosing?: boolean | null | undefined;
    /**
     * Use a `<!DOCTYPE…` instead of `<!doctype…` (default: `false`).
     *
     * Useless except for XHTML.
     */
    upperDoctype?: boolean | null | undefined;
    /**
     * Tag names of elements to serialize without closing tag (default: `html-void-elements`).
     *
     * Not used in the SVG space.
     *
     * > 👉 **Note**: It’s highly unlikely that you want to pass this, because
     * > hast is not for XML, and HTML will not add more void elements.
     */
    voids?: ReadonlyArray<string> | null | undefined;
};
/**
 * HTML quotes for attribute values.
 */
type Quote = "\"" | "'";
/**
 * Namespace.
 */
type Space = "html" | "svg";

/**
 * Create a `createHighlighter` function with bundled themes, languages, and engine.
 *
 * @example
 * ```ts
 * const createHighlighter = createdBundledHighlighter({
 *   langs: {
 *     typescript: () => import('@shikijs/langs/typescript'),
 *     // ...
 *   },
 *   themes: {
 *     nord: () => import('@shikijs/themes/nord'),
 *     // ...
 *   },
 *   engine: () => createOnigurumaEngine(), // or createJavaScriptRegexEngine()
 * })
 * ```
 *
 * @param options
 */
declare function createdBundledHighlighter<BundledLangs extends string, BundledThemes extends string>(options: CreatedBundledHighlighterOptions<BundledLangs, BundledThemes>): CreateHighlighterFactory<BundledLangs, BundledThemes>;
/**
 * Create a `createHighlighter` function with bundled themes and languages.
 *
 * @deprecated Use `createdBundledHighlighter({ langs, themes, engine })` signature instead.
 */
declare function createdBundledHighlighter<BundledLangs extends string, BundledThemes extends string>(bundledLanguages: Record<BundledLangs, LanguageInput>, bundledThemes: Record<BundledThemes, ThemeInput>, loadWasm: HighlighterCoreOptions['loadWasm']): CreateHighlighterFactory<BundledLangs, BundledThemes>;
interface ShorthandsBundle<L extends string, T extends string> {
    /**
     * Shorthand for `codeToHtml` with auto-loaded theme and language.
     * A singleton highlighter it maintained internally.
     *
     * Differences from `highlighter.codeToHtml()`, this function is async.
     */
    codeToHtml: (code: string, options: CodeToHastOptions<L, T>) => Promise<string>;
    /**
     * Shorthand for `codeToHtml` with auto-loaded theme and language.
     * A singleton highlighter it maintained internally.
     *
     * Differences from `highlighter.codeToHtml()`, this function is async.
     */
    codeToHast: (code: string, options: CodeToHastOptions<L, T>) => Promise<Root>;
    /**
     * Shorthand for `codeToTokens` with auto-loaded theme and language.
     * A singleton highlighter it maintained internally.
     *
     * Differences from `highlighter.codeToTokens()`, this function is async.
     */
    codeToTokens: (code: string, options: CodeToTokensOptions<L, T>) => Promise<TokensResult>;
    /**
     * Shorthand for `codeToTokensBase` with auto-loaded theme and language.
     * A singleton highlighter it maintained internally.
     *
     * Differences from `highlighter.codeToTokensBase()`, this function is async.
     */
    codeToTokensBase: (code: string, options: RequireKeys<CodeToTokensBaseOptions<L, T>, 'theme' | 'lang'>) => Promise<ThemedToken[][]>;
    /**
     * Shorthand for `codeToTokensWithThemes` with auto-loaded theme and language.
     * A singleton highlighter it maintained internally.
     *
     * Differences from `highlighter.codeToTokensWithThemes()`, this function is async.
     */
    codeToTokensWithThemes: (code: string, options: RequireKeys<CodeToTokensWithThemesOptions<L, T>, 'themes' | 'lang'>) => Promise<ThemedTokenWithVariants[][]>;
    /**
     * Get the singleton highlighter.
     */
    getSingletonHighlighter: (options?: Partial<BundledHighlighterOptions<L, T>>) => Promise<HighlighterGeneric<L, T>>;
    /**
     * Shorthand for `getLastGrammarState` with auto-loaded theme and language.
     * A singleton highlighter it maintained internally.
     */
    getLastGrammarState: ((element: ThemedToken[][] | Root) => GrammarState) | ((code: string, options: CodeToTokensBaseOptions<L, T>) => Promise<GrammarState>);
}
declare function makeSingletonHighlighter<L extends string, T extends string>(createHighlighter: CreateHighlighterFactory<L, T>): (options?: Partial<BundledHighlighterOptions<L, T>>) => Promise<HighlighterGeneric<L, T>>;
interface CreateSingletonShorthandsOptions<L extends string, T extends string> {
    /**
     * A custom function to guess embedded languages to be loaded.
     */
    guessEmbeddedLanguages?: (code: string, lang: string | undefined, highlighter: HighlighterGeneric<L, T>) => Awaitable<string[] | undefined>;
}
declare function createSingletonShorthands<L extends string, T extends string>(createHighlighter: CreateHighlighterFactory<L, T>, config?: CreateSingletonShorthandsOptions<L, T>): ShorthandsBundle<L, T>;

/**
 * Create a Shiki core highlighter instance, with no languages or themes bundled.
 * Wasm and each language and theme must be loaded manually.
 *
 * @see http://shiki.style/guide/bundles#fine-grained-bundle
 */
declare function createHighlighterCore(options: HighlighterCoreOptions<false>): Promise<HighlighterCore>;
/**
 * Create a Shiki core highlighter instance, with no languages or themes bundled.
 * Wasm and each language and theme must be loaded manually.
 *
 * Synchronous version of `createHighlighterCore`, which requires to provide the engine and all themes and languages upfront.
 *
 * @see http://shiki.style/guide/bundles#fine-grained-bundle
 */
declare function createHighlighterCoreSync(options: HighlighterCoreOptions<true>): HighlighterCore;
declare function makeSingletonHighlighterCore(createHighlighter: typeof createHighlighterCore): (options: HighlighterCoreOptions) => Promise<HighlighterCore>;
declare const getSingletonHighlighterCore: (options: HighlighterCoreOptions) => Promise<HighlighterCore>;
/**
 * @deprecated Use `createHighlighterCore` or `getSingletonHighlighterCore` instead.
 */
declare function getHighlighterCore(options: HighlighterCoreOptions): Promise<HighlighterCore>;

/**
 * Get the minimal shiki context for rendering.
 */
declare function createShikiInternal(options: HighlighterCoreOptions): Promise<ShikiInternal>;
/**
 * @deprecated Use `createShikiInternal` instead.
 */
declare function getShikiInternal(options: HighlighterCoreOptions): Promise<ShikiInternal>;

/**
 * Get the minimal shiki context for rendering.
 *
 * Synchronous version of `createShikiInternal`, which requires to provide the engine and all themes and languages upfront.
 */
declare function createShikiInternalSync(options: HighlighterCoreOptions<true>): ShikiInternal;

/**
 * @deprecated Import `createJavaScriptRegexEngine` from `@shikijs/engine-javascript` or `shiki/engine/javascript` instead.
 */
declare function createJavaScriptRegexEngine(options?: JavaScriptRegexEngineOptions): RegexEngine;
/**
 * @deprecated Import `defaultJavaScriptRegexConstructor` from `@shikijs/engine-javascript` or `shiki/engine/javascript` instead.
 */
declare function defaultJavaScriptRegexConstructor(pattern: string): RegExp;

/**
 * @deprecated Import `createOnigurumaEngine` from `@shikijs/engine-oniguruma` or `shiki/engine/oniguruma` instead.
 */
declare function createOnigurumaEngine(options?: LoadWasmOptions | null): Promise<RegexEngine>;
/**
 * @deprecated Import `createOnigurumaEngine` from `@shikijs/engine-oniguruma` or `shiki/engine/oniguruma` instead.
 */
declare function createWasmOnigEngine(options?: LoadWasmOptions | null): Promise<RegexEngine>;
/**
 * @deprecated Import `loadWasm` from `@shikijs/engine-oniguruma` or `shiki/engine/oniguruma` instead.
 */
declare function loadWasm(options: LoadWasmOptions): Promise<void>;

declare function codeToHast(internal: ShikiInternal, code: string, options: CodeToHastOptions, transformerContext?: ShikiTransformerContextCommon): Root;
declare function tokensToHast(tokens: ThemedToken[][], options: CodeToHastRenderOptions, transformerContext: ShikiTransformerContextSource, grammarState?: GrammarState | undefined): Root;

/**
 * Get highlighted code in HTML.
 */
declare function codeToHtml(internal: ShikiInternal, code: string, options: CodeToHastOptions): string;

/**
 * High-level code-to-tokens API.
 *
 * It will use `codeToTokensWithThemes` or `codeToTokensBase` based on the options.
 */
declare function codeToTokens(internal: ShikiInternal, code: string, options: CodeToTokensOptions): TokensResult;

declare function tokenizeAnsiWithTheme(theme: ThemeRegistrationResolved, fileContents: string, options?: TokenizeWithThemeOptions): ThemedToken[][];

/**
 * Code to tokens, with a simple theme.
 */
declare function codeToTokensBase(internal: ShikiInternal, code: string, options?: CodeToTokensBaseOptions): ThemedToken[][];
declare function tokenizeWithTheme(code: string, grammar: Grammar, theme: ThemeRegistrationResolved, colorMap: string[], options: TokenizeWithThemeOptions): ThemedToken[][];

/**
 * Get tokens with multiple themes
 */
declare function codeToTokensWithThemes(internal: ShikiInternal, code: string, options: CodeToTokensWithThemesOptions): ThemedTokenWithVariants[][];

/**
 * Normalize a textmate theme to shiki theme
 */
declare function normalizeTheme(rawTheme: ThemeRegistrationAny): ThemeRegistrationResolved;

interface CssVariablesThemeOptions {
    /**
     * Theme name. Need to unique if multiple css variables themes are created
     *
     * @default 'css-variables'
     */
    name?: string;
    /**
     * Prefix for css variables
     *
     * @default '--shiki-'
     */
    variablePrefix?: string;
    /**
     * Default value for css variables, the key is without the prefix
     *
     * @example `{ 'token-comment': '#888' }` will generate `var(--shiki-token-comment, #888)` for comments
     */
    variableDefaults?: Record<string, string>;
    /**
     * Enable font style
     *
     * @default true
     */
    fontStyle?: boolean;
}
/**
 * A factory function to create a css-variable-based theme
 *
 * @see https://shiki.style/guide/theme-colors#css-variables-theme
 */
declare function createCssVariablesTheme(options?: CssVariablesThemeOptions): ThemeRegistration;

/**
 * A built-in transformer to add decorations to the highlighted code.
 */
declare function transformerDecorations(): ShikiTransformer;

declare function resolveColorReplacements(theme: ThemeRegistrationAny | string, options?: TokenizeWithThemeOptions): Record<string, string | undefined>;
declare function applyColorReplacements(color: string, replacements?: Record<string, string | undefined>): string;
declare function applyColorReplacements(color?: string | undefined, replacements?: Record<string, string | undefined>): string | undefined;

declare function toArray<T>(x: MaybeArray<T>): T[];
/**
 * Normalize a getter to a promise.
 */
declare function normalizeGetter<T>(p: MaybeGetter<T>): Promise<T>;
/**
 * Check if the language is plaintext that is ignored by Shiki.
 *
 * Hard-coded plain text languages: `plaintext`, `txt`, `text`, `plain`.
 */
declare function isPlainLang(lang: string | null | undefined): lang is PlainTextLanguage;
/**
 * Check if the language is specially handled or bypassed by Shiki.
 *
 * Hard-coded languages: `ansi` and plaintexts like `plaintext`, `txt`, `text`, `plain`.
 */
declare function isSpecialLang(lang: any): lang is SpecialLanguage;
/**
 * Check if the theme is specially handled or bypassed by Shiki.
 *
 * Hard-coded themes: `none`.
 */
declare function isNoneTheme(theme: string | ThemeInput | null | undefined): theme is 'none';
/**
 * Check if the theme is specially handled or bypassed by Shiki.
 *
 * Hard-coded themes: `none`.
 */
declare function isSpecialTheme(theme: string | ThemeInput | null | undefined): theme is SpecialTheme;

/**
 * Utility to append class to a hast node
 *
 * If the `property.class` is a string, it will be splitted by space and converted to an array.
 */
declare function addClassToHast(node: Element, className: string | string[]): Element;

/**
 * Split a string into lines, each line preserves the line ending.
 */
declare function splitLines(code: string, preserveEnding?: boolean): [string, number][];
/**
 * Creates a converter between index and position in a code block.
 *
 * Overflow/underflow are unchecked.
 */
declare function createPositionConverter(code: string): {
    lines: string[];
    indexToPos: (index: number) => Position;
    posToIndex: (line: number, character: number) => number;
};
/**
 * Guess embedded languages from given code and highlighter.
 *
 * When highlighter is provided, only bundled languages will be included.
 */
declare function guessEmbeddedLanguages(code: string, _lang: string | undefined, highlighter?: HighlighterGeneric<any, any>): string[];

/**
 * Split a token into multiple tokens by given offsets.
 *
 * The offsets are relative to the token, and should be sorted.
 */
declare function splitToken<T extends Pick<ThemedToken, 'content' | 'offset'>>(token: T, offsets: number[]): T[];
/**
 * Split 2D tokens array by given breakpoints.
 */
declare function splitTokens<T extends Pick<ThemedToken, 'content' | 'offset'>>(tokens: T[][], breakpoints: number[] | Set<number>): T[][];
declare function flatTokenVariants(merged: ThemedTokenWithVariants, variantsOrder: string[], cssVariablePrefix: string, defaultColor: string | boolean): ThemedToken;
declare function getTokenStyleObject(token: TokenStyles): Record<string, string>;
declare function stringifyTokenStyle(token: string | Record<string, string>): string;

type DeprecationTarget = 3;
/**
 * Enable runtime warning for deprecated APIs, for the future versions of Shiki.
 *
 * You can pass a major version to only warn for deprecations that will be removed in that version.
 *
 * By default, deprecation warning is set to 3 since Shiki v2.0.0
 */
declare function enableDeprecationWarnings(emitDeprecation?: DeprecationTarget | boolean, emitError?: boolean): void;
/**
 * @internal
 */
declare function warnDeprecated(message: string, version?: DeprecationTarget): void;

export { type CreateSingletonShorthandsOptions, type CssVariablesThemeOptions, type ShorthandsBundle, addClassToHast, applyColorReplacements, codeToHast, codeToHtml, codeToTokens, codeToTokensBase, codeToTokensWithThemes, createCssVariablesTheme, createHighlighterCore, createHighlighterCoreSync, createJavaScriptRegexEngine, createOnigurumaEngine, createPositionConverter, createShikiInternal, createShikiInternalSync, createSingletonShorthands, createWasmOnigEngine, createdBundledHighlighter, defaultJavaScriptRegexConstructor, enableDeprecationWarnings, flatTokenVariants, getHighlighterCore, getShikiInternal, getSingletonHighlighterCore, getTokenStyleObject, guessEmbeddedLanguages, toHtml as hastToHtml, isNoneTheme, isPlainLang, isSpecialLang, isSpecialTheme, loadWasm, makeSingletonHighlighter, makeSingletonHighlighterCore, normalizeGetter, normalizeTheme, resolveColorReplacements, splitLines, splitToken, splitTokens, stringifyTokenStyle, toArray, tokenizeAnsiWithTheme, tokenizeWithTheme, tokensToHast, transformerDecorations, warnDeprecated };
