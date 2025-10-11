declare const ruleIdSymbol: unique symbol;
type RuleId = {
    __brand: typeof ruleIdSymbol;
};
declare const endRuleId = -1;
interface IRuleRegistry {
    getRule(ruleId: RuleId): Rule;
    registerRule<T extends Rule>(factory: (id: RuleId) => T): T;
}
interface IGrammarRegistry {
    getExternalGrammar(scopeName: string, repository: IRawRepository): IRawGrammar | null | undefined;
}
interface IRuleFactoryHelper extends IRuleRegistry, IGrammarRegistry {
}
declare abstract class Rule {
    readonly $location: ILocation | undefined;
    readonly id: RuleId;
    private readonly _nameIsCapturing;
    private readonly _name;
    private readonly _contentNameIsCapturing;
    private readonly _contentName;
    constructor($location: ILocation | undefined, id: RuleId, name: string | null | undefined, contentName: string | null | undefined);
    abstract dispose(): void;
    get debugName(): string;
    getName(lineText: string | null, captureIndices: IOnigCaptureIndex[] | null): string | null;
    getContentName(lineText: string, captureIndices: IOnigCaptureIndex[]): string | null;
    abstract collectPatterns(grammar: IRuleRegistry, out: RegExpSourceList): void;
    abstract compile(grammar: IRuleRegistry & IOnigLib, endRegexSource: RegExpString | null): CompiledRule;
    abstract compileAG(grammar: IRuleRegistry & IOnigLib, endRegexSource: RegExpString | null, allowA: boolean, allowG: boolean): CompiledRule;
}
declare class RegExpSource<TRuleId = RuleId | typeof endRuleId> {
    source: RegExpString;
    readonly ruleId: TRuleId;
    hasAnchor: boolean;
    readonly hasBackReferences: boolean;
    private _anchorCache;
    constructor(regExpSource: RegExpString, ruleId: TRuleId);
    clone(): RegExpSource<TRuleId>;
    setSource(newSource: RegExpString): void;
    resolveBackReferences(lineText: string, captureIndices: IOnigCaptureIndex[]): string;
    private _buildAnchorCache;
    resolveAnchors(allowA: boolean, allowG: boolean): RegExpString;
}
declare class RegExpSourceList<TRuleId = RuleId | typeof endRuleId> {
    private readonly _items;
    private _hasAnchors;
    private _cached;
    private _anchorCache;
    constructor();
    dispose(): void;
    private _disposeCaches;
    push(item: RegExpSource<TRuleId>): void;
    unshift(item: RegExpSource<TRuleId>): void;
    length(): number;
    setSource(index: number, newSource: RegExpString): void;
    compile(onigLib: IOnigLib): CompiledRule<TRuleId>;
    compileAG(onigLib: IOnigLib, allowA: boolean, allowG: boolean): CompiledRule<TRuleId>;
    private _resolveAnchors;
}
declare class CompiledRule<TRuleId = RuleId | typeof endRuleId> {
    private readonly regExps;
    private readonly rules;
    private readonly scanner;
    constructor(onigLib: IOnigLib, regExps: RegExpString[], rules: TRuleId[]);
    dispose(): void;
    toString(): string;
    findNextMatchSync(string: string | OnigString, startPosition: number, options: OrMask<FindOption>): IFindNextMatchResult<TRuleId> | null;
}
interface IFindNextMatchResult<TRuleId = RuleId | typeof endRuleId> {
    ruleId: TRuleId;
    captureIndices: IOnigCaptureIndex[];
}

interface IRawGrammar extends ILocatable {
    repository: IRawRepository;
    readonly scopeName: ScopeName;
    readonly patterns: IRawRule[];
    readonly injections?: {
        [expression: string]: IRawRule;
    };
    readonly injectionSelector?: string;
    readonly fileTypes?: string[];
    readonly name?: string;
    readonly firstLineMatch?: string;
}
/**
 * Allowed values:
 * * Scope Name, e.g. `source.ts`
 * * Top level scope reference, e.g. `source.ts#entity.name.class`
 * * Relative scope reference, e.g. `#entity.name.class`
 * * self, e.g. `$self`
 * * base, e.g. `$base`
 */
type IncludeString = string;
type RegExpString = string | RegExp;
interface IRawRepositoryMap {
    [name: string]: IRawRule;
}
type IRawRepository = IRawRepositoryMap & ILocatable;
interface IRawRule extends ILocatable {
    id?: RuleId;
    readonly include?: IncludeString;
    readonly name?: ScopeName;
    readonly contentName?: ScopeName;
    readonly match?: RegExpString;
    readonly captures?: IRawCaptures;
    readonly begin?: RegExpString;
    readonly beginCaptures?: IRawCaptures;
    readonly end?: RegExpString;
    readonly endCaptures?: IRawCaptures;
    readonly while?: RegExpString;
    readonly whileCaptures?: IRawCaptures;
    readonly patterns?: IRawRule[];
    readonly repository?: IRawRepository;
    readonly applyEndPatternLast?: boolean;
}
type IRawCaptures = IRawCapturesMap & ILocatable;
interface IRawCapturesMap {
    [captureId: string]: IRawRule;
}
interface ILocation {
    readonly filename: string;
    readonly line: number;
    readonly char: number;
}
interface ILocatable {
    readonly $vscodeTextmateLocation?: ILocation;
}

interface IOnigLib {
    createOnigScanner(sources: RegExpString[]): OnigScanner;
    createOnigString(str: string): OnigString;
}
interface IOnigCaptureIndex {
    start: number;
    end: number;
    length: number;
}
interface IOnigMatch {
    index: number;
    captureIndices: IOnigCaptureIndex[];
}
declare const enum FindOption {
    None = 0,
    /**
     * equivalent of ONIG_OPTION_NOT_BEGIN_STRING: (str) isn't considered as begin of string (* fail \A)
     */
    NotBeginString = 1,
    /**
     * equivalent of ONIG_OPTION_NOT_END_STRING: (end) isn't considered as end of string (* fail \z, \Z)
     */
    NotEndString = 2,
    /**
     * equivalent of ONIG_OPTION_NOT_BEGIN_POSITION: (start) isn't considered as start position of search (* fail \G)
     */
    NotBeginPosition = 4,
    /**
     * used for debugging purposes.
     */
    DebugCall = 8
}
interface OnigScanner {
    findNextMatchSync(string: string | OnigString, startPosition: number, options: OrMask<FindOption>): IOnigMatch | null;
    dispose?(): void;
}
interface OnigString {
    readonly content: string;
    dispose?(): void;
}
declare function disposeOnigString(str: OnigString): void;

/**
 * A union of given const enum values.
*/
type OrMask<T extends number> = number;

declare class Theme {
    private readonly _colorMap;
    private readonly _defaults;
    private readonly _root;
    static createFromRawTheme(source: IRawTheme | undefined, colorMap?: string[]): Theme;
    static createFromParsedTheme(source: ParsedThemeRule[], colorMap?: string[]): Theme;
    private readonly _cachedMatchRoot;
    constructor(_colorMap: ColorMap, _defaults: StyleAttributes, _root: ThemeTrieElement);
    getColorMap(): string[];
    getDefaults(): StyleAttributes;
    match(scopePath: ScopeStack | null): StyleAttributes | null;
}
/**
 * Identifiers with a binary dot operator.
 * Examples: `baz` or `foo.bar`
*/
type ScopeName = string;
/**
 * An expression language of ScopeNames with a binary space (to indicate nesting) operator.
 * Examples: `foo.bar boo.baz`
*/
type ScopePath = string;
/**
 * An expression language of ScopePathStr with a binary comma (to indicate alternatives) operator.
 * Examples: `foo.bar boo.baz,quick quack`
*/
type ScopePattern = string;
/**
 * A TextMate theme.
 */
interface IRawTheme {
    readonly name?: string;
    readonly settings: IRawThemeSetting[];
}
/**
 * A single theme setting.
 */
interface IRawThemeSetting {
    readonly name?: string;
    readonly scope?: ScopePattern | ScopePattern[];
    readonly settings: {
        readonly fontStyle?: string;
        readonly foreground?: string;
        readonly background?: string;
    };
}
declare class ScopeStack {
    readonly parent: ScopeStack | null;
    readonly scopeName: ScopeName;
    static push(path: ScopeStack | null, scopeNames: ScopeName[]): ScopeStack | null;
    static from(first: ScopeName, ...segments: ScopeName[]): ScopeStack;
    static from(...segments: ScopeName[]): ScopeStack | null;
    constructor(parent: ScopeStack | null, scopeName: ScopeName);
    push(scopeName: ScopeName): ScopeStack;
    getSegments(): ScopeName[];
    toString(): string;
    extends(other: ScopeStack): boolean;
    getExtensionIfDefined(base: ScopeStack | null): string[] | undefined;
}
declare class StyleAttributes {
    readonly fontStyle: OrMask<FontStyle>;
    readonly foregroundId: number;
    readonly backgroundId: number;
    constructor(fontStyle: OrMask<FontStyle>, foregroundId: number, backgroundId: number);
}
declare class ParsedThemeRule {
    readonly scope: ScopeName;
    readonly parentScopes: ScopeName[] | null;
    readonly index: number;
    readonly fontStyle: OrMask<FontStyle>;
    readonly foreground: string | null;
    readonly background: string | null;
    constructor(scope: ScopeName, parentScopes: ScopeName[] | null, index: number, fontStyle: OrMask<FontStyle>, foreground: string | null, background: string | null);
}
declare const enum FontStyle {
    NotSet = -1,
    None = 0,
    Italic = 1,
    Bold = 2,
    Underline = 4,
    Strikethrough = 8
}
declare class ColorMap {
    private readonly _isFrozen;
    private _lastColorId;
    private _id2color;
    private _color2id;
    constructor(_colorMap?: string[]);
    getId(color: string | null): number;
    getColorMap(): string[];
}
declare class ThemeTrieElementRule {
    scopeDepth: number;
    parentScopes: readonly ScopeName[];
    fontStyle: number;
    foreground: number;
    background: number;
    constructor(scopeDepth: number, parentScopes: readonly ScopeName[] | null, fontStyle: number, foreground: number, background: number);
    clone(): ThemeTrieElementRule;
    static cloneArr(arr: ThemeTrieElementRule[]): ThemeTrieElementRule[];
    acceptOverwrite(scopeDepth: number, fontStyle: number, foreground: number, background: number): void;
}
interface ITrieChildrenMap {
    [segment: string]: ThemeTrieElement;
}
declare class ThemeTrieElement {
    private readonly _mainRule;
    private readonly _children;
    private readonly _rulesWithParentScopes;
    constructor(_mainRule: ThemeTrieElementRule, rulesWithParentScopes?: ThemeTrieElementRule[], _children?: ITrieChildrenMap);
    private static _cmpBySpecificity;
    match(scope: ScopeName): ThemeTrieElementRule[];
    insert(scopeDepth: number, scope: ScopeName, parentScopes: ScopeName[] | null, fontStyle: number, foreground: number, background: number): void;
    private _doInsertHere;
}

type EncodedTokenAttributes = number;
declare class EncodedTokenMetadata {
    static toBinaryStr(encodedTokenAttributes: EncodedTokenAttributes): string;
    static print(encodedTokenAttributes: EncodedTokenAttributes): void;
    static getLanguageId(encodedTokenAttributes: EncodedTokenAttributes): number;
    static getTokenType(encodedTokenAttributes: EncodedTokenAttributes): StandardTokenType;
    static containsBalancedBrackets(encodedTokenAttributes: EncodedTokenAttributes): boolean;
    static getFontStyle(encodedTokenAttributes: EncodedTokenAttributes): number;
    static getForeground(encodedTokenAttributes: EncodedTokenAttributes): number;
    static getBackground(encodedTokenAttributes: EncodedTokenAttributes): number;
    /**
     * Updates the fields in `metadata`.
     * A value of `0`, `NotSet` or `null` indicates that the corresponding field should be left as is.
     */
    static set(encodedTokenAttributes: EncodedTokenAttributes, languageId: number | 0, tokenType: OptionalStandardTokenType | OptionalStandardTokenType.NotSet, containsBalancedBrackets: boolean | null, fontStyle: FontStyle | FontStyle.NotSet, foreground: number | 0, background: number | 0): number;
}
declare const enum StandardTokenType {
    Other = 0,
    Comment = 1,
    String = 2,
    RegEx = 3
}
declare const enum OptionalStandardTokenType {
    Other = 0,
    Comment = 1,
    String = 2,
    RegEx = 3,
    NotSet = 8
}

interface Matcher<T> {
    (matcherInput: T): boolean;
}

declare class BasicScopeAttributes {
    readonly languageId: number;
    readonly tokenType: OptionalStandardTokenType;
    constructor(languageId: number, tokenType: OptionalStandardTokenType);
}

interface IThemeProvider {
    themeMatch(scopePath: ScopeStack): StyleAttributes | null;
    getDefaults(): StyleAttributes;
}
interface IGrammarRepository {
    lookup(scopeName: ScopeName): IRawGrammar | undefined;
    injections(scopeName: ScopeName): ScopeName[];
}
interface Injection {
    readonly debugSelector: string;
    readonly matcher: Matcher<string[]>;
    readonly priority: -1 | 0 | 1;
    readonly ruleId: RuleId;
    readonly grammar: IRawGrammar;
}
declare class Grammar implements IGrammar, IRuleFactoryHelper, IOnigLib {
    private readonly _rootScopeName;
    private readonly balancedBracketSelectors;
    private readonly _onigLib;
    private _rootId;
    private _lastRuleId;
    private readonly _ruleId2desc;
    private readonly _includedGrammars;
    private readonly _grammarRepository;
    private readonly _grammar;
    private _injections;
    private readonly _basicScopeAttributesProvider;
    private readonly _tokenTypeMatchers;
    get themeProvider(): IThemeProvider;
    constructor(_rootScopeName: ScopeName, grammar: IRawGrammar, initialLanguage: number, embeddedLanguages: IEmbeddedLanguagesMap | null, tokenTypes: ITokenTypeMap | null, balancedBracketSelectors: BalancedBracketSelectors | null, grammarRepository: IGrammarRepository & IThemeProvider, _onigLib: IOnigLib);
    dispose(): void;
    createOnigScanner(sources: RegExpString[]): OnigScanner;
    createOnigString(sources: string): OnigString;
    getMetadataForScope(scope: string): BasicScopeAttributes;
    private _collectInjections;
    getInjections(): Injection[];
    registerRule<T extends Rule>(factory: (id: RuleId) => T): T;
    getRule(ruleId: RuleId): Rule;
    getExternalGrammar(scopeName: string, repository?: IRawRepository): IRawGrammar | undefined;
    tokenizeLine(lineText: string, prevState: StateStackImpl | null, timeLimit?: number): ITokenizeLineResult;
    tokenizeLine2(lineText: string, prevState: StateStackImpl | null, timeLimit?: number): ITokenizeLineResult2;
    private _tokenize;
}
declare class AttributedScopeStack {
    readonly parent: AttributedScopeStack | null;
    readonly scopePath: ScopeStack;
    readonly tokenAttributes: EncodedTokenAttributes;
    static fromExtension(namesScopeList: AttributedScopeStack | null, contentNameScopesList: AttributedScopeStackFrame[]): AttributedScopeStack | null;
    static createRoot(scopeName: ScopeName, tokenAttributes: EncodedTokenAttributes): AttributedScopeStack;
    static createRootAndLookUpScopeName(scopeName: ScopeName, tokenAttributes: EncodedTokenAttributes, grammar: Grammar): AttributedScopeStack;
    get scopeName(): ScopeName;
    /**
     * Invariant:
     * ```
     * if (parent && !scopePath.extends(parent.scopePath)) {
     * 	throw new Error();
     * }
     * ```
     */
    private constructor();
    toString(): string;
    equals(other: AttributedScopeStack): boolean;
    static equals(a: AttributedScopeStack | null, b: AttributedScopeStack | null): boolean;
    private static mergeAttributes;
    pushAttributed(scopePath: ScopePath | null, grammar: Grammar): AttributedScopeStack;
    private static _pushAttributed;
    getScopeNames(): string[];
    getExtensionIfDefined(base: AttributedScopeStack | null): AttributedScopeStackFrame[] | undefined;
}
interface AttributedScopeStackFrame {
    encodedTokenAttributes: number;
    scopeNames: string[];
}
/**
 * Represents a "pushed" state on the stack (as a linked list element).
 */
declare class StateStackImpl implements StateStack {
    /**
     * The previous state on the stack (or null for the root state).
     */
    readonly parent: StateStackImpl | null;
    /**
     * The state (rule) that this element represents.
     */
    private readonly ruleId;
    /**
     * The state has entered and captured \n. This means that the next line should have an anchorPosition of 0.
     */
    readonly beginRuleCapturedEOL: boolean;
    /**
     * The "pop" (end) condition for this state in case that it was dynamically generated through captured text.
     */
    readonly endRule: string | null;
    /**
     * The list of scopes containing the "name" for this state.
     */
    readonly nameScopesList: AttributedScopeStack | null;
    /**
     * The list of scopes containing the "contentName" (besides "name") for this state.
     * This list **must** contain as an element `scopeName`.
     */
    readonly contentNameScopesList: AttributedScopeStack | null;
    _stackElementBrand: void;
    static NULL: StateStackImpl;
    /**
     * The position on the current line where this state was pushed.
     * This is relevant only while tokenizing a line, to detect endless loops.
     * Its value is meaningless across lines.
     */
    private _enterPos;
    /**
     * The captured anchor position when this stack element was pushed.
     * This is relevant only while tokenizing a line, to restore the anchor position when popping.
     * Its value is meaningless across lines.
     */
    private _anchorPos;
    /**
     * The depth of the stack.
     */
    readonly depth: number;
    /**
     * Invariant:
     * ```
     * if (contentNameScopesList !== nameScopesList && contentNameScopesList?.parent !== nameScopesList) {
     * 	throw new Error();
     * }
     * if (this.parent && !nameScopesList.extends(this.parent.contentNameScopesList)) {
     * 	throw new Error();
     * }
     * ```
     */
    constructor(
    /**
     * The previous state on the stack (or null for the root state).
     */
    parent: StateStackImpl | null, 
    /**
     * The state (rule) that this element represents.
     */
    ruleId: RuleId, enterPos: number, anchorPos: number, 
    /**
     * The state has entered and captured \n. This means that the next line should have an anchorPosition of 0.
     */
    beginRuleCapturedEOL: boolean, 
    /**
     * The "pop" (end) condition for this state in case that it was dynamically generated through captured text.
     */
    endRule: string | null, 
    /**
     * The list of scopes containing the "name" for this state.
     */
    nameScopesList: AttributedScopeStack | null, 
    /**
     * The list of scopes containing the "contentName" (besides "name") for this state.
     * This list **must** contain as an element `scopeName`.
     */
    contentNameScopesList: AttributedScopeStack | null);
    equals(other: StateStackImpl): boolean;
    private static _equals;
    /**
     * A structural equals check. Does not take into account `scopes`.
     */
    private static _structuralEquals;
    clone(): StateStackImpl;
    private static _reset;
    reset(): void;
    pop(): StateStackImpl | null;
    safePop(): StateStackImpl;
    push(ruleId: RuleId, enterPos: number, anchorPos: number, beginRuleCapturedEOL: boolean, endRule: string | null, nameScopesList: AttributedScopeStack | null, contentNameScopesList: AttributedScopeStack | null): StateStackImpl;
    getEnterPos(): number;
    getAnchorPos(): number;
    getRule(grammar: IRuleRegistry): Rule;
    toString(): string;
    private _writeString;
    withContentNameScopesList(contentNameScopeStack: AttributedScopeStack): StateStackImpl;
    withEndRule(endRule: string): StateStackImpl;
    hasSameRuleAs(other: StateStackImpl): boolean;
    toStateStackFrame(): StateStackFrame;
    static pushFrame(self: StateStackImpl | null, frame: StateStackFrame): StateStackImpl;
}
interface StateStackFrame {
    ruleId: number;
    enterPos?: number;
    anchorPos?: number;
    beginRuleCapturedEOL: boolean;
    endRule: string | null;
    nameScopesList: AttributedScopeStackFrame[];
    /**
     * on top of nameScopesList
     */
    contentNameScopesList: AttributedScopeStackFrame[];
}
declare class BalancedBracketSelectors {
    private readonly balancedBracketScopes;
    private readonly unbalancedBracketScopes;
    private allowAny;
    constructor(balancedBracketScopes: string[], unbalancedBracketScopes: string[]);
    get matchesAlways(): boolean;
    get matchesNever(): boolean;
    match(scopes: string[]): boolean;
}

declare class SyncRegistry implements IGrammarRepository, IThemeProvider {
    private readonly _onigLib;
    readonly _grammars: Map<string, Grammar>;
    readonly _rawGrammars: Map<string, IRawGrammar>;
    readonly _injectionGrammars: Map<string, string[]>;
    _theme: Theme;
    constructor(theme: Theme, _onigLib: IOnigLib);
    dispose(): void;
    setTheme(theme: Theme): void;
    getColorMap(): string[];
    /**
     * Add `grammar` to registry and return a list of referenced scope names
     */
    addGrammar(grammar: IRawGrammar, injectionScopeNames?: ScopeName[]): void;
    /**
     * Lookup a raw grammar.
     */
    lookup(scopeName: ScopeName): IRawGrammar | undefined;
    /**
     * Returns the injections for the given grammar
     */
    injections(targetScope: ScopeName): ScopeName[];
    /**
     * Get the default theme settings
     */
    getDefaults(): StyleAttributes;
    /**
     * Match a scope in the theme.
     */
    themeMatch(scopePath: ScopeStack): StyleAttributes | null;
    /**
     * Lookup a grammar.
     */
    grammarForScopeName(scopeName: ScopeName, initialLanguage: number, embeddedLanguages: IEmbeddedLanguagesMap | null, tokenTypes: ITokenTypeMap | null, balancedBracketSelectors: BalancedBracketSelectors | null): IGrammar | null;
}

interface StackDiff {
    readonly pops: number;
    readonly newFrames: StateStackFrame[];
}

/**
 * A registry helper that can locate grammar file paths given scope names.
 */
interface RegistryOptions {
    onigLib: IOnigLib;
    theme?: IRawTheme;
    colorMap?: string[];
    loadGrammar(scopeName: ScopeName): IRawGrammar | undefined | null;
    getInjections?(scopeName: ScopeName): ScopeName[] | undefined;
}
/**
 * A map from scope name to a language id. Please do not use language id 0.
 */
interface IEmbeddedLanguagesMap {
    [scopeName: string]: number;
}
/**
 * A map from selectors to token types.
 */
interface ITokenTypeMap {
    [selector: string]: StandardTokenType;
}
interface IGrammarConfiguration {
    embeddedLanguages?: IEmbeddedLanguagesMap;
    tokenTypes?: ITokenTypeMap;
    balancedBracketSelectors?: string[];
    unbalancedBracketSelectors?: string[];
}
/**
 * The registry that will hold all grammars.
 */
declare class Registry {
    readonly _options: RegistryOptions;
    readonly _syncRegistry: SyncRegistry;
    readonly _ensureGrammarCache: Map<string, boolean>;
    constructor(options: RegistryOptions);
    dispose(): void;
    /**
     * Change the theme. Once called, no previous `ruleStack` should be used anymore.
     */
    setTheme(theme: IRawTheme, colorMap?: string[]): void;
    /**
     * Returns a lookup array for color ids.
     */
    getColorMap(): string[];
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     * Please do not use language id 0.
     */
    loadGrammarWithEmbeddedLanguages(initialScopeName: ScopeName, initialLanguage: number, embeddedLanguages: IEmbeddedLanguagesMap): IGrammar | null;
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     * Please do not use language id 0.
     */
    loadGrammarWithConfiguration(initialScopeName: ScopeName, initialLanguage: number, configuration: IGrammarConfiguration): IGrammar | null;
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     */
    loadGrammar(initialScopeName: ScopeName): IGrammar | null;
    private _loadGrammar;
    private _loadSingleGrammar;
    private _doLoadSingleGrammar;
    /**
     * Adds a rawGrammar.
     */
    addGrammar(rawGrammar: IRawGrammar, injections?: string[], initialLanguage?: number, embeddedLanguages?: IEmbeddedLanguagesMap | null): IGrammar;
    /**
     * Get the grammar for `scopeName`. The grammar must first be created via `loadGrammar` or `addGrammar`.
     */
    private _grammarForScopeName;
}
/**
 * A grammar
 */
interface IGrammar {
    /**
     * Tokenize `lineText` using previous line state `prevState`.
     */
    tokenizeLine(lineText: string, prevState: StateStack | null, timeLimit?: number): ITokenizeLineResult;
    /**
     * Tokenize `lineText` using previous line state `prevState`.
     * The result contains the tokens in binary format, resolved with the following information:
     *  - language
     *  - token type (regex, string, comment, other)
     *  - font style
     *  - foreground color
     *  - background color
     * e.g. for getting the languageId: `(metadata & MetadataConsts.LANGUAGEID_MASK) >>> MetadataConsts.LANGUAGEID_OFFSET`
     */
    tokenizeLine2(lineText: string, prevState: StateStack | null, timeLimit?: number): ITokenizeLineResult2;
}
interface ITokenizeLineResult {
    readonly tokens: IToken[];
    /**
     * The `prevState` to be passed on to the next line tokenization.
     */
    readonly ruleStack: StateStack;
    /**
     * Did tokenization stop early due to reaching the time limit.
     */
    readonly stoppedEarly: boolean;
}
interface ITokenizeLineResult2 {
    /**
     * The tokens in binary format. Each token occupies two array indices. For token i:
     *  - at offset 2*i => startIndex
     *  - at offset 2*i + 1 => metadata
     *
     */
    readonly tokens: Uint32Array;
    /**
     * The `prevState` to be passed on to the next line tokenization.
     */
    readonly ruleStack: StateStack;
    /**
     * Did tokenization stop early due to reaching the time limit.
     */
    readonly stoppedEarly: boolean;
}
interface IToken {
    startIndex: number;
    readonly endIndex: number;
    readonly scopes: string[];
}
/**
 * **IMPORTANT** - Immutable!
 */
interface StateStack {
    _stackElementBrand: void;
    readonly depth: number;
    clone(): StateStack;
    equals(other: StateStack): boolean;
}
declare const INITIAL: StateStack;

export { EncodedTokenMetadata, FindOption, FontStyle, type IEmbeddedLanguagesMap, type IGrammar, type IGrammarConfiguration, INITIAL, type IOnigCaptureIndex, type IOnigLib, type IOnigMatch, type IRawGrammar, type IRawTheme, type IRawThemeSetting, type IToken, type ITokenTypeMap, type ITokenizeLineResult, type ITokenizeLineResult2, type OnigScanner, type OnigString, Registry, type RegistryOptions, type StackDiff, type StateStack, StateStackImpl, Theme, disposeOnigString };
