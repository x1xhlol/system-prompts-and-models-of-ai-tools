import { R as Root } from './types/index.d.mjs';
import * as _shikijs_types from '@shikijs/types';
import { HighlighterGeneric, CreateHighlighterFactory } from '@shikijs/types';
import { BundledLanguage } from './langs.mjs';
export { bundledLanguages, bundledLanguagesAlias, bundledLanguagesBase, bundledLanguagesInfo } from './langs.mjs';
import { BundledTheme } from './themes.mjs';
export { bundledThemes, bundledThemesInfo } from './themes.mjs';
export * from '@shikijs/core';
export { g as getWasmInlined } from './types/wasm-dynamic.mjs';
import '@shikijs/core/types';

type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;
/**
 * Initiate a highlighter instance and load the specified languages and themes.
 * Later it can be used synchronously to highlight code.
 *
 * Importing this function will bundle all languages and themes.
 * @see https://shiki.style/guide/bundles#shiki-bundle-full
 *
 * For granular control over the bundle, check:
 * @see https://shiki.style/guide/bundles#fine-grained-bundle
 */
declare const createHighlighter: CreateHighlighterFactory<BundledLanguage, BundledTheme>;
declare const codeToHtml: (code: string, options: _shikijs_types.CodeToHastOptions<BundledLanguage, BundledTheme>) => Promise<string>;
declare const codeToHast: (code: string, options: _shikijs_types.CodeToHastOptions<BundledLanguage, BundledTheme>) => Promise<Root>;
declare const codeToTokens: (code: string, options: _shikijs_types.CodeToTokensOptions<BundledLanguage, BundledTheme>) => Promise<_shikijs_types.TokensResult>;
declare const codeToTokensBase: (code: string, options: _shikijs_types.RequireKeys<_shikijs_types.CodeToTokensBaseOptions<BundledLanguage, BundledTheme>, "lang" | "theme">) => Promise<_shikijs_types.ThemedToken[][]>;
declare const codeToTokensWithThemes: (code: string, options: _shikijs_types.RequireKeys<_shikijs_types.CodeToTokensWithThemesOptions<BundledLanguage, BundledTheme>, "lang" | "themes">) => Promise<_shikijs_types.ThemedTokenWithVariants[][]>;
declare const getSingletonHighlighter: (options?: Partial<_shikijs_types.BundledHighlighterOptions<BundledLanguage, BundledTheme>> | undefined) => Promise<HighlighterGeneric<BundledLanguage, BundledTheme>>;
declare const getLastGrammarState: ((element: _shikijs_types.ThemedToken[][] | Root) => _shikijs_types.GrammarState) | ((code: string, options: _shikijs_types.CodeToTokensBaseOptions<BundledLanguage, BundledTheme>) => Promise<_shikijs_types.GrammarState>);
/**
 * @deprecated Use `createHighlighter` or `getSingletonHighlighter` instead.
 */
declare const getHighlighter: CreateHighlighterFactory<BundledLanguage, BundledTheme>;

export { BundledLanguage, BundledTheme, type Highlighter, codeToHast, codeToHtml, codeToTokens, codeToTokensBase, codeToTokensWithThemes, createHighlighter, getHighlighter, getLastGrammarState, getSingletonHighlighter };
