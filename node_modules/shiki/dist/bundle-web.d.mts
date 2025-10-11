import { R as Root } from './types/index.d.mjs';
import * as _shikijs_types from '@shikijs/types';
import { BundledLanguageInfo, DynamicImportLanguageRegistration, HighlighterGeneric, CreateHighlighterFactory } from '@shikijs/types';
import { BundledTheme } from './themes.mjs';
export { bundledThemes, bundledThemesInfo } from './themes.mjs';
export * from '@shikijs/core';
export { g as getWasmInlined } from './types/wasm-dynamic.mjs';
import '@shikijs/core/types';

declare const bundledLanguagesInfo: BundledLanguageInfo[];
declare const bundledLanguagesBase: {
    [k: string]: DynamicImportLanguageRegistration;
};
declare const bundledLanguagesAlias: {
    [k: string]: DynamicImportLanguageRegistration;
};
type BundledLanguage = 'angular-html' | 'angular-ts' | 'astro' | 'bash' | 'blade' | 'c' | 'c++' | 'coffee' | 'coffeescript' | 'cpp' | 'css' | 'glsl' | 'gql' | 'graphql' | 'haml' | 'handlebars' | 'hbs' | 'html' | 'html-derivative' | 'http' | 'imba' | 'jade' | 'java' | 'javascript' | 'jinja' | 'jison' | 'jl' | 'js' | 'json' | 'json5' | 'jsonc' | 'jsonl' | 'jsx' | 'julia' | 'less' | 'lit' | 'markdown' | 'marko' | 'md' | 'mdc' | 'mdx' | 'php' | 'postcss' | 'pug' | 'py' | 'python' | 'r' | 'regex' | 'regexp' | 'sass' | 'scss' | 'sh' | 'shell' | 'shellscript' | 'sql' | 'styl' | 'stylus' | 'svelte' | 'ts' | 'ts-tags' | 'tsx' | 'typescript' | 'vue' | 'vue-html' | 'wasm' | 'wgsl' | 'xml' | 'yaml' | 'yml' | 'zsh';
declare const bundledLanguages: Record<BundledLanguage, DynamicImportLanguageRegistration>;

type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;
/**
 * Initiate a highlighter instance and load the specified languages and themes.
 * Later it can be used synchronously to highlight code.
 *
 * Importing this function will bundle all languages and themes.
 * @see https://shiki.style/guide/bundles#shiki-bundle-web
 *
 * For granular control over the bundle, check:
 * @see https://shiki.style/guide/bundles#fine-grained-bundle
 */
declare const createHighlighter: CreateHighlighterFactory<BundledLanguage, BundledTheme>;
declare const codeToHtml: (code: string, options: _shikijs_types.CodeToHastOptions<BundledLanguage, BundledTheme>) => Promise<string>;
declare const codeToHast: (code: string, options: _shikijs_types.CodeToHastOptions<BundledLanguage, BundledTheme>) => Promise<Root>;
declare const codeToTokensBase: (code: string, options: _shikijs_types.RequireKeys<_shikijs_types.CodeToTokensBaseOptions<BundledLanguage, BundledTheme>, "lang" | "theme">) => Promise<_shikijs_types.ThemedToken[][]>;
declare const codeToTokens: (code: string, options: _shikijs_types.CodeToTokensOptions<BundledLanguage, BundledTheme>) => Promise<_shikijs_types.TokensResult>;
declare const codeToTokensWithThemes: (code: string, options: _shikijs_types.RequireKeys<_shikijs_types.CodeToTokensWithThemesOptions<BundledLanguage, BundledTheme>, "lang" | "themes">) => Promise<_shikijs_types.ThemedTokenWithVariants[][]>;
declare const getSingletonHighlighter: (options?: Partial<_shikijs_types.BundledHighlighterOptions<BundledLanguage, BundledTheme>> | undefined) => Promise<HighlighterGeneric<BundledLanguage, BundledTheme>>;
declare const getLastGrammarState: ((element: _shikijs_types.ThemedToken[][] | Root) => _shikijs_types.GrammarState) | ((code: string, options: _shikijs_types.CodeToTokensBaseOptions<BundledLanguage, BundledTheme>) => Promise<_shikijs_types.GrammarState>);
/**
 * @deprecated Use `createHighlighter` or `getSingletonHighlighter` instead.
 */
declare const getHighlighter: CreateHighlighterFactory<BundledLanguage, BundledTheme>;

export { type BundledLanguage, BundledTheme, type Highlighter, bundledLanguages, bundledLanguagesAlias, bundledLanguagesBase, bundledLanguagesInfo, codeToHast, codeToHtml, codeToTokens, codeToTokensBase, codeToTokensWithThemes, createHighlighter, getHighlighter, getLastGrammarState, getSingletonHighlighter };
