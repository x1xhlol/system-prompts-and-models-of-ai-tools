export { Highlighter, codeToHast, codeToHtml, codeToTokens, codeToTokensBase, codeToTokensWithThemes, createHighlighter, getHighlighter, getLastGrammarState, getSingletonHighlighter } from './bundle-full.mjs';
export { BuiltinLanguage, BuiltinTheme } from './types.mjs';
export { createJavaScriptRegexEngine, defaultJavaScriptRegexConstructor } from '@shikijs/engine-javascript';
export { g as getWasmInlined } from './types/wasm-dynamic.mjs';
export * from '@shikijs/core';
export { BundledLanguage, bundledLanguages, bundledLanguagesAlias, bundledLanguagesBase, bundledLanguagesInfo } from './langs.mjs';
export { BundledTheme, bundledThemes, bundledThemesInfo } from './themes.mjs';
import './types/index.d.mjs';
import '@shikijs/types';
import '@shikijs/core/types';

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

/**
 * A union of given const enum values.
*/
type OrMask<T extends number> = number;

type Awaitable<T> = T | Promise<T>;

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

declare function loadWasm(options: LoadWasmOptions): Promise<void>;
declare function createOnigurumaEngine(options?: LoadWasmOptions | null): Promise<RegexEngine>;

export { createOnigurumaEngine, loadWasm };
