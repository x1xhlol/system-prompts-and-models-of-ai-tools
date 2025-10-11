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

export type { LoadWasmOptions as L, RegexEngine as R, WebAssemblyInstantiator as W };
