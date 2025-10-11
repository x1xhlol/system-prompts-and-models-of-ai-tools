import { createSingletonShorthands, createdBundledHighlighter, guessEmbeddedLanguages, warnDeprecated } from '@shikijs/core';
export * from '@shikijs/core';
import { bundledLanguages } from './langs.mjs';
export { bundledLanguagesAlias, bundledLanguagesBase, bundledLanguagesInfo } from './langs.mjs';
import { bundledThemes } from './themes.mjs';
export { bundledThemesInfo } from './themes.mjs';
export { g as getWasmInlined } from './wasm-dynamic-K7LwWlz7.js';
import { createOnigurumaEngine } from '@shikijs/engine-oniguruma';

const createHighlighter = /* @__PURE__ */ createdBundledHighlighter({
  langs: bundledLanguages,
  themes: bundledThemes,
  engine: () => createOnigurumaEngine(import('shiki/wasm'))
});
const {
  codeToHtml,
  codeToHast,
  codeToTokens,
  codeToTokensBase,
  codeToTokensWithThemes,
  getSingletonHighlighter,
  getLastGrammarState
} = /* @__PURE__ */ createSingletonShorthands(
  createHighlighter,
  { guessEmbeddedLanguages }
);
const getHighlighter = (options) => {
  warnDeprecated("`getHighlighter` is deprecated. Use `createHighlighter` or `getSingletonHighlighter` instead.");
  return createHighlighter(options);
};

export { bundledLanguages, bundledThemes, codeToHast, codeToHtml, codeToTokens, codeToTokensBase, codeToTokensWithThemes, createHighlighter, getHighlighter, getLastGrammarState, getSingletonHighlighter };
