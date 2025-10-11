import { L as LoadWasmOptions, R as RegexEngine } from './chunk-index.d.mjs';

declare function loadWasm(options: LoadWasmOptions): Promise<void>;

/**
 * Set the default wasm loader for `loadWasm`.
 * @internal
 */
declare function setDefaultWasmLoader(_loader: LoadWasmOptions): void;
/**
 * @internal
 */
declare function getDefaultWasmLoader(): LoadWasmOptions | undefined;
declare function createOnigurumaEngine(options?: LoadWasmOptions | null): Promise<RegexEngine>;
/**
 * @deprecated Use `createOnigurumaEngine` instead.
 */
declare function createWasmOnigEngine(options?: LoadWasmOptions | null): Promise<RegexEngine>;

export { createOnigurumaEngine, createWasmOnigEngine, getDefaultWasmLoader, loadWasm, setDefaultWasmLoader };
