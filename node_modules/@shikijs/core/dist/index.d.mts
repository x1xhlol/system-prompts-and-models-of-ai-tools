import { CreatedBundledHighlighterOptions, CreateHighlighterFactory, LanguageInput, ThemeInput, HighlighterCoreOptions, CodeToHastOptions, CodeToTokensOptions, TokensResult, RequireKeys, CodeToTokensBaseOptions, ThemedToken, CodeToTokensWithThemesOptions, ThemedTokenWithVariants, BundledHighlighterOptions, HighlighterGeneric, GrammarState, Awaitable, HighlighterCore, ShikiInternal, RegexEngine, LoadWasmOptions, ShikiTransformerContextCommon, CodeToHastRenderOptions, ShikiTransformerContextSource, ThemeRegistrationResolved, TokenizeWithThemeOptions, Grammar, ThemeRegistrationAny, ThemeRegistration, ShikiTransformer, MaybeArray, MaybeGetter, PlainTextLanguage, SpecialLanguage, SpecialTheme, Position, TokenStyles } from '@shikijs/types';
export * from '@shikijs/types';
import { Root, Element } from 'hast';
import { JavaScriptRegexEngineOptions } from '@shikijs/engine-javascript';
export { FontStyle, EncodedTokenMetadata as StackElementMetadata } from '@shikijs/vscode-textmate';
export { toHtml as hastToHtml } from 'hast-util-to-html';

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

export { type CreateSingletonShorthandsOptions, type CssVariablesThemeOptions, type ShorthandsBundle, addClassToHast, applyColorReplacements, codeToHast, codeToHtml, codeToTokens, codeToTokensBase, codeToTokensWithThemes, createCssVariablesTheme, createHighlighterCore, createHighlighterCoreSync, createJavaScriptRegexEngine, createOnigurumaEngine, createPositionConverter, createShikiInternal, createShikiInternalSync, createSingletonShorthands, createWasmOnigEngine, createdBundledHighlighter, defaultJavaScriptRegexConstructor, enableDeprecationWarnings, flatTokenVariants, getHighlighterCore, getShikiInternal, getSingletonHighlighterCore, getTokenStyleObject, guessEmbeddedLanguages, isNoneTheme, isPlainLang, isSpecialLang, isSpecialTheme, loadWasm, makeSingletonHighlighter, makeSingletonHighlighterCore, normalizeGetter, normalizeTheme, resolveColorReplacements, splitLines, splitToken, splitTokens, stringifyTokenStyle, toArray, tokenizeAnsiWithTheme, tokenizeWithTheme, tokensToHast, transformerDecorations, warnDeprecated };
