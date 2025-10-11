import { Element, Root } from 'hast';
import { OnigScanner, OnigString, IGrammar, IRawGrammar, IRawTheme, IRawThemeSetting, StateStack, FontStyle } from '@shikijs/vscode-textmate';
export { IRawGrammar as RawGrammar, IRawTheme as RawTheme, IRawThemeSetting as RawThemeSetting } from '@shikijs/vscode-textmate';

type Awaitable<T> = T | Promise<T>;
type MaybeGetter<T> = Awaitable<MaybeModule<T>> | (() => Awaitable<MaybeModule<T>>);
type MaybeModule<T> = T | {
    default: T;
};
type MaybeArray<T> = T | T[];
type RequireKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
interface Nothing {
}
/**
 * type StringLiteralUnion<'foo'> = 'foo' | string
 * This has auto completion whereas `'foo' | string` doesn't
 * Adapted from https://github.com/microsoft/TypeScript/issues/29729
 */
type StringLiteralUnion<T extends U, U = string> = T | (U & Nothing);

interface PatternScanner extends OnigScanner {
}
interface RegexEngineString extends OnigString {
}
/**
 * Engine for RegExp matching and scanning.
 */
interface RegexEngine {
    createScanner: (patterns: (string | RegExp)[]) => PatternScanner;
    createString: (s: string) => RegexEngineString;
}
interface WebAssemblyInstantiator {
    (importObject: Record<string, Record<string, WebAssembly.ImportValue>> | undefined): Promise<WebAssemblyInstance>;
}
type WebAssemblyInstance = WebAssembly.WebAssemblyInstantiatedSource | WebAssembly.Instance | WebAssembly.Instance['exports'];
type OnigurumaLoadOptions = {
    instantiator: WebAssemblyInstantiator;
} | {
    default: WebAssemblyInstantiator;
} | {
    data: ArrayBufferView | ArrayBuffer | Response;
};
type LoadWasmOptionsPlain = OnigurumaLoadOptions | WebAssemblyInstantiator | ArrayBufferView | ArrayBuffer | Response;
type LoadWasmOptions = Awaitable<LoadWasmOptionsPlain> | (() => Awaitable<LoadWasmOptionsPlain>);

interface Grammar extends IGrammar {
    name: string;
}

type PlainTextLanguage = 'text' | 'plaintext' | 'txt';
type AnsiLanguage = 'ansi';
type SpecialLanguage = PlainTextLanguage | AnsiLanguage;
type LanguageInput = MaybeGetter<MaybeArray<LanguageRegistration>>;
type ResolveBundleKey<T extends string> = [T] extends [never] ? string : T;
interface LanguageRegistration extends IRawGrammar {
    name: string;
    scopeName: string;
    displayName?: string;
    aliases?: string[];
    /**
     * A list of languages the current language embeds.
     * If manually specifying languages to load, make sure to load the embedded
     * languages for each parent language.
     */
    embeddedLangs?: string[];
    /**
     * A list of languages that embed the current language.
     * Unlike `embeddedLangs`, the embedded languages will not be loaded automatically.
     */
    embeddedLangsLazy?: string[];
    balancedBracketSelectors?: string[];
    unbalancedBracketSelectors?: string[];
    foldingStopMarker?: string;
    foldingStartMarker?: string;
    /**
     * Inject this language to other scopes.
     * Same as `injectTo` in VSCode's `contributes.grammars`.
     *
     * @see https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide#injection-grammars
     */
    injectTo?: string[];
}
interface BundledLanguageInfo {
    id: string;
    name: string;
    import: DynamicImportLanguageRegistration;
    aliases?: string[];
}
type DynamicImportLanguageRegistration = () => Promise<{
    default: LanguageRegistration[];
}>;

interface DecorationOptions {
    /**
     * Custom decorations to wrap highlighted tokens with.
     */
    decorations?: DecorationItem[];
}
interface DecorationItem {
    /**
     * Start offset or position of the decoration.
     */
    start: OffsetOrPosition;
    /**
     * End offset or position of the decoration.
     */
    end: OffsetOrPosition;
    /**
     * Tag name of the element to create.
     * @default 'span'
     */
    tagName?: string;
    /**
     * Properties of the element to create.
     */
    properties?: Element['properties'];
    /**
     * A custom function to transform the element after it has been created.
     */
    transform?: (element: Element, type: DecorationTransformType) => Element | void;
    /**
     * By default when the decoration contains only one token, the decoration will be applied to the token.
     *
     * Set to `true` to always wrap the token with a new element
     *
     * @default false
     */
    alwaysWrap?: boolean;
}
interface ResolvedDecorationItem extends Omit<DecorationItem, 'start' | 'end'> {
    start: ResolvedPosition;
    end: ResolvedPosition;
}
type DecorationTransformType = 'wrapper' | 'line' | 'token';
interface Position {
    line: number;
    character: number;
}
type Offset = number;
type OffsetOrPosition = Position | Offset;
interface ResolvedPosition extends Position {
    offset: Offset;
}

type SpecialTheme = 'none';
type ThemeInput = MaybeGetter<ThemeRegistrationAny>;
interface ThemeRegistrationRaw extends IRawTheme, Partial<Omit<ThemeRegistration, 'name' | 'settings'>> {
}
interface ThemeRegistration extends Partial<ThemeRegistrationResolved> {
}
interface ThemeRegistrationResolved extends IRawTheme {
    /**
     * Theme name
     */
    name: string;
    /**
     * Display name
     *
     * @field shiki custom property
     */
    displayName?: string;
    /**
     * Light/dark theme
     *
     * @field shiki custom property
     */
    type: 'light' | 'dark';
    /**
     * Token rules
     */
    settings: IRawThemeSetting[];
    /**
     * Same as `settings`, will use as fallback if `settings` is not present.
     */
    tokenColors?: IRawThemeSetting[];
    /**
     * Default foreground color
     *
     * @field shiki custom property
     */
    fg: string;
    /**
     * Background color
     *
     * @field shiki custom property
     */
    bg: string;
    /**
     * A map of color names to new color values.
     *
     * The color key starts with '#' and should be lowercased.
     *
     * @field shiki custom property
     */
    colorReplacements?: Record<string, string>;
    /**
     * Color map of VS Code options
     *
     * Will be used by shiki on `lang: 'ansi'` to find ANSI colors, and to find the default foreground/background colors.
     */
    colors?: Record<string, string>;
    /**
     * JSON schema path
     *
     * @field not used by shiki
     */
    $schema?: string;
    /**
     * Enable semantic highlighting
     *
     * @field not used by shiki
     */
    semanticHighlighting?: boolean;
    /**
     * Tokens for semantic highlighting
     *
     * @field not used by shiki
     */
    semanticTokenColors?: Record<string, string>;
}
type ThemeRegistrationAny = ThemeRegistrationRaw | ThemeRegistration | ThemeRegistrationResolved;
type DynamicImportThemeRegistration = () => Promise<{
    default: ThemeRegistration;
}>;
interface BundledThemeInfo {
    id: string;
    displayName: string;
    type: 'light' | 'dark';
    import: DynamicImportThemeRegistration;
}

/**
 * GrammarState is a special reference object that holds the state of a grammar.
 *
 * It's used to highlight code snippets that are part of the target language.
 */
interface GrammarState {
    readonly lang: string;
    readonly theme: string;
    readonly themes: string[];
    /**
     * @internal
     */
    getInternalStack: (theme?: string) => StateStack | undefined;
    getScopes: (theme?: string) => string[] | undefined;
    /**
     * @deprecated Use `getScopes` instead.
     */
    get scopes(): string[];
}
interface CodeToTokensBaseOptions<Languages extends string = string, Themes extends string = string> extends TokenizeWithThemeOptions {
    lang?: Languages | SpecialLanguage;
    theme?: Themes | ThemeRegistrationAny | SpecialTheme;
}
type CodeToTokensOptions<Languages extends string = string, Themes extends string = string> = Omit<CodeToTokensBaseOptions<Languages, Themes>, 'theme'> & CodeOptionsThemes<Themes>;
interface CodeToTokensWithThemesOptions<Languages = string, Themes = string> extends TokenizeWithThemeOptions {
    lang?: Languages | SpecialLanguage;
    /**
     * A map of color names to themes.
     *
     * `light` and `dark` are required, and arbitrary color names can be added.
     *
     * @example
     * ```ts
     * themes: {
     *   light: 'vitesse-light',
     *   dark: 'vitesse-dark',
     *   soft: 'nord',
     *   // custom colors
     * }
     * ```
     */
    themes: Partial<Record<string, Themes | ThemeRegistrationAny | SpecialTheme>>;
}
interface ThemedTokenScopeExplanation {
    scopeName: string;
    themeMatches?: IRawThemeSetting[];
}
interface ThemedTokenExplanation {
    content: string;
    scopes: ThemedTokenScopeExplanation[];
}
/**
 * A single token with color, and optionally with explanation.
 *
 * For example:
 *
 * ```json
 * {
 *   "content": "shiki",
 *   "color": "#D8DEE9",
 *   "explanation": [
 *     {
 *       "content": "shiki",
 *       "scopes": [
 *         {
 *           "scopeName": "source.js",
 *           "themeMatches": []
 *         },
 *         {
 *           "scopeName": "meta.objectliteral.js",
 *           "themeMatches": []
 *         },
 *         {
 *           "scopeName": "meta.object.member.js",
 *           "themeMatches": []
 *         },
 *         {
 *           "scopeName": "meta.array.literal.js",
 *           "themeMatches": []
 *         },
 *         {
 *           "scopeName": "variable.other.object.js",
 *           "themeMatches": [
 *             {
 *               "name": "Variable",
 *               "scope": "variable.other",
 *               "settings": {
 *                 "foreground": "#D8DEE9"
 *               }
 *             },
 *             {
 *               "name": "[JavaScript] Variable Other Object",
 *               "scope": "source.js variable.other.object",
 *               "settings": {
 *                 "foreground": "#D8DEE9"
 *               }
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
interface ThemedToken extends TokenStyles, TokenBase {
}
interface TokenBase {
    /**
     * The content of the token
     */
    content: string;
    /**
     * The start offset of the token, relative to the input code. 0-indexed.
     */
    offset: number;
    /**
     * Explanation of
     *
     * - token text's matching scopes
     * - reason that token text is given a color (one matching scope matches a rule (scope -> color) in the theme)
     */
    explanation?: ThemedTokenExplanation[];
}
interface TokenStyles {
    /**
     * 6 or 8 digit hex code representation of the token's color
     */
    color?: string;
    /**
     * 6 or 8 digit hex code representation of the token's background color
     */
    bgColor?: string;
    /**
     * Font style of token. Can be None/Italic/Bold/Underline
     */
    fontStyle?: FontStyle;
    /**
     * Override with custom inline style for HTML renderer.
     * When specified, `color` and `fontStyle` will be ignored.
     * Prefer use object style for merging with other styles.
     */
    htmlStyle?: string | Record<string, string>;
    /**
     * Extra HTML attributes for the token.
     */
    htmlAttrs?: Record<string, string>;
}
interface ThemedTokenWithVariants extends TokenBase {
    /**
     * An object of color name to token styles
     */
    variants: Record<string, TokenStyles>;
}
interface TokenizeWithThemeOptions {
    /**
     * Include explanation of why a token is given a color.
     *
     * You can optionally pass `scopeName` to only include explanation for scopes,
     * which is more performant than full explanation.
     *
     * @default false
     */
    includeExplanation?: boolean | 'scopeName';
    /**
     * A map of color names to new color values.
     *
     * The color key starts with '#' and should be lowercased.
     *
     * This will be merged with theme's `colorReplacements` if any.
     */
    colorReplacements?: Record<string, string | Record<string, string>>;
    /**
     * Lines above this length will not be tokenized for performance reasons.
     *
     * @default 0 (no limit)
     */
    tokenizeMaxLineLength?: number;
    /**
     * Time limit in milliseconds for tokenizing a single line.
     *
     * @default 500 (0.5s)
     */
    tokenizeTimeLimit?: number;
    /**
     * Represent the state of the grammar, allowing to continue tokenizing from a intermediate grammar state.
     *
     * You can get the grammar state from `getLastGrammarState`.
     */
    grammarState?: GrammarState;
    /**
     * The code context of the grammar.
     * Consider it a prepended code to the input code, that only participate the grammar inference but not presented in the final output.
     *
     * This will be ignored if `grammarState` is provided.
     */
    grammarContextCode?: string;
}
/**
 * Result of `codeToTokens`, an object with 2D array of tokens and meta info like background and foreground color.
 */
interface TokensResult {
    /**
     * 2D array of tokens, first dimension is lines, second dimension is tokens in a line.
     */
    tokens: ThemedToken[][];
    /**
     * Foreground color of the code.
     */
    fg?: string;
    /**
     * Background color of the code.
     */
    bg?: string;
    /**
     * A string representation of themes applied to the token.
     */
    themeName?: string;
    /**
     * Custom style string to be applied to the root `<pre>` element.
     * When specified, `fg` and `bg` will be ignored.
     */
    rootStyle?: string;
    /**
     * The last grammar state of the code snippet.
     */
    grammarState?: GrammarState;
}

interface TransformerOptions {
    /**
     * Transformers for the Shiki pipeline.
     */
    transformers?: ShikiTransformer[];
}
interface ShikiTransformerContextMeta {
}
/**
 * Common transformer context for all transformers hooks
 */
interface ShikiTransformerContextCommon {
    meta: ShikiTransformerContextMeta;
    options: CodeToHastOptions;
    codeToHast: (code: string, options: CodeToHastOptions) => Root;
    codeToTokens: (code: string, options: CodeToTokensOptions) => TokensResult;
}
interface ShikiTransformerContextSource extends ShikiTransformerContextCommon {
    readonly source: string;
}
/**
 * Transformer context for HAST related hooks
 */
interface ShikiTransformerContext extends ShikiTransformerContextSource {
    readonly tokens: ThemedToken[][];
    readonly root: Root;
    readonly pre: Element;
    readonly code: Element;
    readonly lines: Element[];
    readonly structure: CodeToHastOptions['structure'];
    /**
     * Utility to append class to a hast node
     *
     * If the `property.class` is a string, it will be splitted by space and converted to an array.
     */
    addClassToHast: (hast: Element, className: string | string[]) => Element;
}
interface ShikiTransformer {
    /**
     * Name of the transformer
     */
    name?: string;
    /**
     * Transform the raw input code before passing to the highlighter.
     */
    preprocess?: (this: ShikiTransformerContextCommon, code: string, options: CodeToHastOptions) => string | void;
    /**
     * Transform the full tokens list before converting to HAST.
     * Return a new tokens list will replace the original one.
     */
    tokens?: (this: ShikiTransformerContextSource, tokens: ThemedToken[][]) => ThemedToken[][] | void;
    /**
     * Transform the entire generated HAST tree. Return a new Node will replace the original one.
     */
    root?: (this: ShikiTransformerContext, hast: Root) => Root | void;
    /**
     * Transform the `<pre>` element. Return a new Node will replace the original one.
     */
    pre?: (this: ShikiTransformerContext, hast: Element) => Element | void;
    /**
     * Transform the `<code>` element. Return a new Node will replace the original one.
     */
    code?: (this: ShikiTransformerContext, hast: Element) => Element | void;
    /**
     * Transform each line `<span class="line">` element.
     *
     * @param hast
     * @param line 1-based line number
     */
    line?: (this: ShikiTransformerContext, hast: Element, line: number) => Element | void;
    /**
     * Transform each token `<span>` element.
     */
    span?: (this: ShikiTransformerContext, hast: Element, line: number, col: number, lineElement: Element, token: ThemedToken) => Element | void;
    /**
     * Transform the generated HTML string before returning.
     * This hook will only be called with `codeToHtml`.
     */
    postprocess?: (this: ShikiTransformerContextCommon, html: string, options: CodeToHastOptions) => string | void;
}

interface HighlighterCoreOptions<Sync extends boolean = false> {
    /**
     * Custom RegExp engine.
     */
    engine: Sync extends true ? RegexEngine : Awaitable<RegexEngine>;
    /**
     * Theme names, or theme registration objects to be loaded upfront.
     */
    themes?: Sync extends true ? MaybeArray<ThemeRegistrationAny>[] : ThemeInput[];
    /**
     * Language names, or language registration objects to be loaded upfront.
     */
    langs?: Sync extends true ? MaybeArray<LanguageRegistration>[] : LanguageInput[];
    /**
     * Alias of languages
     * @example { 'my-lang': 'javascript' }
     */
    langAlias?: Record<string, string>;
    /**
     * Emit console warnings to alert users of potential issues.
     * @default true
     */
    warnings?: boolean;
    /**
     * Load wasm file from a custom path or using a custom function.
     *
     * @deprecated Use `engine: createOnigurumaEngine(loadWasm)` instead.
     */
    loadWasm?: Sync extends true ? never : LoadWasmOptions;
}
interface BundledHighlighterOptions<L extends string, T extends string> extends Pick<HighlighterCoreOptions, 'warnings'> {
    /**
     * Custom RegExp engine.
     */
    engine?: Awaitable<RegexEngine>;
    /**
     * Theme registation
     *
     * @default []
     */
    themes: (ThemeInput | StringLiteralUnion<T> | SpecialTheme)[];
    /**
     * Language registation
     *
     * @default []
     */
    langs: (LanguageInput | StringLiteralUnion<L> | SpecialLanguage)[];
    /**
     * Alias of languages
     * @example { 'my-lang': 'javascript' }
     */
    langAlias?: Record<string, StringLiteralUnion<L>>;
}
interface CodeOptionsSingleTheme<Themes extends string = string> {
    theme: ThemeRegistrationAny | StringLiteralUnion<Themes>;
}
interface CodeOptionsMultipleThemes<Themes extends string = string> {
    /**
     * A map of color names to themes.
     * This allows you to specify multiple themes for the generated code.
     *
     * ```ts
     * highlighter.codeToHtml(code, {
     *   lang: 'js',
     *   themes: {
     *     light: 'vitesse-light',
     *     dark: 'vitesse-dark',
     *   }
     * })
     * ```
     *
     * Will generate:
     *
     * ```html
     * <span style="color:#111;--shiki-dark:#fff;">code</span>
     * ```
     *
     * @see https://github.com/shikijs/shiki#lightdark-dual-themes
     */
    themes: Partial<Record<string, ThemeRegistrationAny | StringLiteralUnion<Themes>>>;
    /**
     * The default theme applied to the code (via inline `color` style).
     * The rest of the themes are applied via CSS variables, and toggled by CSS overrides.
     *
     * For example, if `defaultColor` is `light`, then `light` theme is applied to the code,
     * and the `dark` theme and other custom themes are applied via CSS variables:
     *
     * ```html
     * <span style="color:#{light};--shiki-dark:#{dark};--shiki-custom:#{custom};">code</span>
     * ```
     *
     * When set to `false`, no default styles will be applied, and totally up to users to apply the styles:
     *
     * ```html
     * <span style="--shiki-light:#{light};--shiki-dark:#{dark};--shiki-custom:#{custom};">code</span>
     * ```
     *
     *
     * @default 'light'
     */
    defaultColor?: StringLiteralUnion<'light' | 'dark'> | false;
    /**
     * Prefix of CSS variables used to store the color of the other theme.
     *
     * @default '--shiki-'
     */
    cssVariablePrefix?: string;
}
type CodeOptionsThemes<Themes extends string = string> = CodeOptionsSingleTheme<Themes> | CodeOptionsMultipleThemes<Themes>;
type CodeToHastOptions<Languages extends string = string, Themes extends string = string> = CodeToHastOptionsCommon<Languages> & CodeOptionsThemes<Themes> & CodeOptionsMeta;
interface CodeToHastOptionsCommon<Languages extends string = string> extends TransformerOptions, DecorationOptions, Pick<TokenizeWithThemeOptions, 'colorReplacements' | 'tokenizeMaxLineLength' | 'tokenizeTimeLimit' | 'grammarState' | 'grammarContextCode'> {
    lang: StringLiteralUnion<Languages | SpecialLanguage>;
    /**
     * Merge whitespace tokens to saving extra `<span>`.
     *
     * When set to true, it will merge whitespace tokens with the next token.
     * When set to false, it keep the output as-is.
     * When set to `never`, it will force to separate leading and trailing spaces from tokens.
     *
     * @default true
     */
    mergeWhitespaces?: boolean | 'never';
    /**
     * The structure of the generated HAST and HTML.
     *
     * - `classic`: The classic structure with `<pre>` and `<code>` elements, each line wrapped with a `<span class="line">` element.
     * - `inline`: All tokens are rendered as `<span>`, line breaks are rendered as `<br>`. No `<pre>` or `<code>` elements. Default forground and background colors are not applied.
     *
     * @default 'classic'
     */
    structure?: 'classic' | 'inline';
    /**
     * Tab index of the root `<pre>` element.
     *
     * Set to `false` to disable tab index.
     *
     * @default 0
     */
    tabindex?: number | string | false;
}
interface CodeOptionsMeta {
    /**
     * Meta data passed to Shiki, usually used by plugin integrations to pass the code block header.
     *
     * Key values in meta will be serialized to the attributes of the root `<pre>` element.
     *
     * Keys starting with `_` will be ignored.
     *
     * A special key `__raw` key will be used to pass the raw code block header (if the integration supports it).
     */
    meta?: {
        /**
         * Raw string of the code block header.
         */
        __raw?: string;
        [key: string]: any;
    };
}
interface CodeToHastRenderOptionsCommon extends TransformerOptions, Omit<TokensResult, 'tokens'> {
    lang?: string;
    langId?: string;
}
type CodeToHastRenderOptions = CodeToHastRenderOptionsCommon & CodeToHastOptions;

/**
 * Type of object that can be bound to a grammar state
 */
type GrammarStateMapKey = Root | ThemedToken[][];
/**
 * Internal context of Shiki, core textmate logic
 */
interface ShikiInternal<BundledLangKeys extends string = never, BundledThemeKeys extends string = never> {
    /**
     * Load a theme to the highlighter, so later it can be used synchronously.
     */
    loadTheme: (...themes: (ThemeInput | BundledThemeKeys | SpecialTheme)[]) => Promise<void>;
    /**
     * Load a theme registration synchronously.
     */
    loadThemeSync: (...themes: MaybeArray<ThemeRegistrationAny>[]) => void;
    /**
     * Load a language to the highlighter, so later it can be used synchronously.
     */
    loadLanguage: (...langs: (LanguageInput | BundledLangKeys | SpecialLanguage)[]) => Promise<void>;
    /**
     * Load a language registration synchronously.
     */
    loadLanguageSync: (...langs: MaybeArray<LanguageRegistration>[]) => void;
    /**
     * Get the registered theme object
     */
    getTheme: (name: string | ThemeRegistrationAny) => ThemeRegistrationResolved;
    /**
     * Get the registered language object
     */
    getLanguage: (name: string | LanguageRegistration) => Grammar;
    /**
     * Set the current theme and get the resolved theme object and color map.
     * @internal
     */
    setTheme: (themeName: string | ThemeRegistrationAny) => {
        theme: ThemeRegistrationResolved;
        colorMap: string[];
    };
    /**
     * Get the names of loaded languages
     *
     * Special-handled languages like `text`, `plain` and `ansi` are not included.
     */
    getLoadedLanguages: () => string[];
    /**
     * Get the names of loaded themes
     *
     * Special-handled themes like `none` are not included.
     */
    getLoadedThemes: () => string[];
    /**
     * Dispose the internal registry and release resources
     */
    dispose: () => void;
    /**
     * Dispose the internal registry and release resources
     */
    [Symbol.dispose]: () => void;
}
/**
 * Generic instance interface of Shiki
 */
interface HighlighterGeneric<BundledLangKeys extends string, BundledThemeKeys extends string> extends ShikiInternal<BundledLangKeys, BundledThemeKeys> {
    /**
     * Get highlighted code in HTML string
     */
    codeToHtml: (code: string, options: CodeToHastOptions<ResolveBundleKey<BundledLangKeys>, ResolveBundleKey<BundledThemeKeys>>) => string;
    /**
     * Get highlighted code in HAST.
     * @see https://github.com/syntax-tree/hast
     */
    codeToHast: (code: string, options: CodeToHastOptions<ResolveBundleKey<BundledLangKeys>, ResolveBundleKey<BundledThemeKeys>>) => Root;
    /**
     * Get highlighted code in tokens. Uses `codeToTokensWithThemes` or `codeToTokensBase` based on the options.
     */
    codeToTokens: (code: string, options: CodeToTokensOptions<ResolveBundleKey<BundledLangKeys>, ResolveBundleKey<BundledThemeKeys>>) => TokensResult;
    /**
     * Get highlighted code in tokens with a single theme.
     * @returns A 2D array of tokens, first dimension is lines, second dimension is tokens in a line.
     */
    codeToTokensBase: (code: string, options: CodeToTokensBaseOptions<ResolveBundleKey<BundledLangKeys>, ResolveBundleKey<BundledThemeKeys>>) => ThemedToken[][];
    /**
     * Get highlighted code in tokens with multiple themes.
     *
     * Different from `codeToTokensBase`, each token will have a `variants` property consisting of an object of color name to token styles.
     *
     * @returns A 2D array of tokens, first dimension is lines, second dimension is tokens in a line.
     */
    codeToTokensWithThemes: (code: string, options: CodeToTokensWithThemesOptions<ResolveBundleKey<BundledLangKeys>, ResolveBundleKey<BundledThemeKeys>>) => ThemedTokenWithVariants[][];
    /**
     * Get the last grammar state of a code snippet.
     * You can pass the grammar state to `codeToTokens` as `grammarState` to continue tokenizing from an intermediate state.
     */
    getLastGrammarState: {
        (element: GrammarStateMapKey, options?: never): GrammarState | undefined;
        (code: string, options: CodeToTokensBaseOptions<ResolveBundleKey<BundledLangKeys>, ResolveBundleKey<BundledThemeKeys>>): GrammarState;
    };
    /**
     * Get internal context object
     * @internal
     * @deprecated
     */
    getInternalContext: () => ShikiInternal;
    /**
     * Get bundled languages object
     */
    getBundledLanguages: () => Record<BundledLangKeys, LanguageInput>;
    /**
     * Get bundled themes object
     */
    getBundledThemes: () => Record<BundledThemeKeys, ThemeInput>;
}
/**
 * The fine-grained core Shiki highlighter instance.
 */
type HighlighterCore = HighlighterGeneric<never, never>;
/**
 * Options for creating a bundled highlighter.
 */
interface CreatedBundledHighlighterOptions<BundledLangs extends string, BundledThemes extends string> {
    langs: Record<BundledLangs, LanguageInput>;
    themes: Record<BundledThemes, ThemeInput>;
    engine: () => Awaitable<RegexEngine>;
}

type CreateHighlighterFactory<L extends string, T extends string> = (options: BundledHighlighterOptions<L, T>) => Promise<HighlighterGeneric<L, T>>;

declare class ShikiError extends Error {
    constructor(message: string);
}

export { type AnsiLanguage, type Awaitable, type BundledHighlighterOptions, type BundledLanguageInfo, type BundledThemeInfo, type CodeOptionsMeta, type CodeOptionsMultipleThemes, type CodeOptionsSingleTheme, type CodeOptionsThemes, type CodeToHastOptions, type CodeToHastOptionsCommon, type CodeToHastRenderOptions, type CodeToHastRenderOptionsCommon, type CodeToTokensBaseOptions, type CodeToTokensOptions, type CodeToTokensWithThemesOptions, type CreateHighlighterFactory, type CreatedBundledHighlighterOptions, type DecorationItem, type DecorationOptions, type DecorationTransformType, type DynamicImportLanguageRegistration, type DynamicImportThemeRegistration, type Grammar, type GrammarState, type GrammarStateMapKey, type HighlighterCore, type HighlighterCoreOptions, type HighlighterGeneric, type LanguageInput, type LanguageRegistration, type LoadWasmOptions, type LoadWasmOptionsPlain, type MaybeArray, type MaybeGetter, type MaybeModule, type Offset, type OffsetOrPosition, type OnigurumaLoadOptions, type PatternScanner, type PlainTextLanguage, type Position, type RegexEngine, type RegexEngineString, type RequireKeys, type ResolveBundleKey, type ResolvedDecorationItem, type ResolvedPosition, ShikiError, type ShikiInternal, type ShikiTransformer, type ShikiTransformerContext, type ShikiTransformerContextCommon, type ShikiTransformerContextMeta, type ShikiTransformerContextSource, type SpecialLanguage, type SpecialTheme, type StringLiteralUnion, type ThemeInput, type ThemeRegistration, type ThemeRegistrationAny, type ThemeRegistrationRaw, type ThemeRegistrationResolved, type ThemedToken, type ThemedTokenExplanation, type ThemedTokenScopeExplanation, type ThemedTokenWithVariants, type TokenBase, type TokenStyles, type TokenizeWithThemeOptions, type TokensResult, type TransformerOptions, type WebAssemblyInstance, type WebAssemblyInstantiator };
