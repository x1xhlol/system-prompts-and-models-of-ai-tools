import { createSingletonShorthands, createdBundledHighlighter, guessEmbeddedLanguages, warnDeprecated } from '@shikijs/core';
export * from '@shikijs/core';
import { bundledThemes } from './themes.mjs';
export { bundledThemesInfo } from './themes.mjs';
export { g as getWasmInlined } from './wasm-dynamic-K7LwWlz7.js';
import { createOnigurumaEngine } from '@shikijs/engine-oniguruma';

const bundledLanguagesInfo = [
  {
    "id": "angular-html",
    "name": "Angular HTML",
    "import": () => import('@shikijs/langs/angular-html')
  },
  {
    "id": "angular-ts",
    "name": "Angular TypeScript",
    "import": () => import('@shikijs/langs/angular-ts')
  },
  {
    "id": "astro",
    "name": "Astro",
    "import": () => import('@shikijs/langs/astro')
  },
  {
    "id": "blade",
    "name": "Blade",
    "import": () => import('@shikijs/langs/blade')
  },
  {
    "id": "c",
    "name": "C",
    "import": () => import('@shikijs/langs/c')
  },
  {
    "id": "coffee",
    "name": "CoffeeScript",
    "aliases": [
      "coffeescript"
    ],
    "import": () => import('@shikijs/langs/coffee')
  },
  {
    "id": "cpp",
    "name": "C++",
    "aliases": [
      "c++"
    ],
    "import": () => import('@shikijs/langs/cpp')
  },
  {
    "id": "css",
    "name": "CSS",
    "import": () => import('@shikijs/langs/css')
  },
  {
    "id": "glsl",
    "name": "GLSL",
    "import": () => import('@shikijs/langs/glsl')
  },
  {
    "id": "graphql",
    "name": "GraphQL",
    "aliases": [
      "gql"
    ],
    "import": () => import('@shikijs/langs/graphql')
  },
  {
    "id": "haml",
    "name": "Ruby Haml",
    "import": () => import('@shikijs/langs/haml')
  },
  {
    "id": "handlebars",
    "name": "Handlebars",
    "aliases": [
      "hbs"
    ],
    "import": () => import('@shikijs/langs/handlebars')
  },
  {
    "id": "html",
    "name": "HTML",
    "import": () => import('@shikijs/langs/html')
  },
  {
    "id": "html-derivative",
    "name": "HTML (Derivative)",
    "import": () => import('@shikijs/langs/html-derivative')
  },
  {
    "id": "http",
    "name": "HTTP",
    "import": () => import('@shikijs/langs/http')
  },
  {
    "id": "imba",
    "name": "Imba",
    "import": () => import('@shikijs/langs/imba')
  },
  {
    "id": "java",
    "name": "Java",
    "import": () => import('@shikijs/langs/java')
  },
  {
    "id": "javascript",
    "name": "JavaScript",
    "aliases": [
      "js"
    ],
    "import": () => import('@shikijs/langs/javascript')
  },
  {
    "id": "jinja",
    "name": "Jinja",
    "import": () => import('@shikijs/langs/jinja')
  },
  {
    "id": "jison",
    "name": "Jison",
    "import": () => import('@shikijs/langs/jison')
  },
  {
    "id": "json",
    "name": "JSON",
    "import": () => import('@shikijs/langs/json')
  },
  {
    "id": "json5",
    "name": "JSON5",
    "import": () => import('@shikijs/langs/json5')
  },
  {
    "id": "jsonc",
    "name": "JSON with Comments",
    "import": () => import('@shikijs/langs/jsonc')
  },
  {
    "id": "jsonl",
    "name": "JSON Lines",
    "import": () => import('@shikijs/langs/jsonl')
  },
  {
    "id": "jsx",
    "name": "JSX",
    "import": () => import('@shikijs/langs/jsx')
  },
  {
    "id": "julia",
    "name": "Julia",
    "aliases": [
      "jl"
    ],
    "import": () => import('@shikijs/langs/julia')
  },
  {
    "id": "less",
    "name": "Less",
    "import": () => import('@shikijs/langs/less')
  },
  {
    "id": "markdown",
    "name": "Markdown",
    "aliases": [
      "md"
    ],
    "import": () => import('@shikijs/langs/markdown')
  },
  {
    "id": "marko",
    "name": "Marko",
    "import": () => import('@shikijs/langs/marko')
  },
  {
    "id": "mdc",
    "name": "MDC",
    "import": () => import('@shikijs/langs/mdc')
  },
  {
    "id": "mdx",
    "name": "MDX",
    "import": () => import('@shikijs/langs/mdx')
  },
  {
    "id": "php",
    "name": "PHP",
    "import": () => import('@shikijs/langs/php')
  },
  {
    "id": "postcss",
    "name": "PostCSS",
    "import": () => import('@shikijs/langs/postcss')
  },
  {
    "id": "pug",
    "name": "Pug",
    "aliases": [
      "jade"
    ],
    "import": () => import('@shikijs/langs/pug')
  },
  {
    "id": "python",
    "name": "Python",
    "aliases": [
      "py"
    ],
    "import": () => import('@shikijs/langs/python')
  },
  {
    "id": "r",
    "name": "R",
    "import": () => import('@shikijs/langs/r')
  },
  {
    "id": "regexp",
    "name": "RegExp",
    "aliases": [
      "regex"
    ],
    "import": () => import('@shikijs/langs/regexp')
  },
  {
    "id": "sass",
    "name": "Sass",
    "import": () => import('@shikijs/langs/sass')
  },
  {
    "id": "scss",
    "name": "SCSS",
    "import": () => import('@shikijs/langs/scss')
  },
  {
    "id": "shellscript",
    "name": "Shell",
    "aliases": [
      "bash",
      "sh",
      "shell",
      "zsh"
    ],
    "import": () => import('@shikijs/langs/shellscript')
  },
  {
    "id": "sql",
    "name": "SQL",
    "import": () => import('@shikijs/langs/sql')
  },
  {
    "id": "stylus",
    "name": "Stylus",
    "aliases": [
      "styl"
    ],
    "import": () => import('@shikijs/langs/stylus')
  },
  {
    "id": "svelte",
    "name": "Svelte",
    "import": () => import('@shikijs/langs/svelte')
  },
  {
    "id": "ts-tags",
    "name": "TypeScript with Tags",
    "aliases": [
      "lit"
    ],
    "import": () => import('@shikijs/langs/ts-tags')
  },
  {
    "id": "tsx",
    "name": "TSX",
    "import": () => import('@shikijs/langs/tsx')
  },
  {
    "id": "typescript",
    "name": "TypeScript",
    "aliases": [
      "ts"
    ],
    "import": () => import('@shikijs/langs/typescript')
  },
  {
    "id": "vue",
    "name": "Vue",
    "import": () => import('@shikijs/langs/vue')
  },
  {
    "id": "vue-html",
    "name": "Vue HTML",
    "import": () => import('@shikijs/langs/vue-html')
  },
  {
    "id": "wasm",
    "name": "WebAssembly",
    "import": () => import('@shikijs/langs/wasm')
  },
  {
    "id": "wgsl",
    "name": "WGSL",
    "import": () => import('@shikijs/langs/wgsl')
  },
  {
    "id": "xml",
    "name": "XML",
    "import": () => import('@shikijs/langs/xml')
  },
  {
    "id": "yaml",
    "name": "YAML",
    "aliases": [
      "yml"
    ],
    "import": () => import('@shikijs/langs/yaml')
  }
];
const bundledLanguagesBase = Object.fromEntries(bundledLanguagesInfo.map((i) => [i.id, i.import]));
const bundledLanguagesAlias = Object.fromEntries(bundledLanguagesInfo.flatMap((i) => i.aliases?.map((a) => [a, i.import]) || []));
const bundledLanguages = {
  ...bundledLanguagesBase,
  ...bundledLanguagesAlias
};

const createHighlighter = /* @__PURE__ */ createdBundledHighlighter({
  langs: bundledLanguages,
  themes: bundledThemes,
  engine: () => createOnigurumaEngine(import('shiki/wasm'))
});
const {
  codeToHtml,
  codeToHast,
  codeToTokensBase,
  codeToTokens,
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

export { bundledLanguages, bundledLanguagesAlias, bundledLanguagesBase, bundledLanguagesInfo, bundledThemes, codeToHast, codeToHtml, codeToTokens, codeToTokensBase, codeToTokensWithThemes, createHighlighter, getHighlighter, getLastGrammarState, getSingletonHighlighter };
