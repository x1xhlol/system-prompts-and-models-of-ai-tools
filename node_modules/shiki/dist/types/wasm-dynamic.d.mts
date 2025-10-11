import { WebAssemblyInstantiator } from '@shikijs/core/types';

/**
 * @deprecated Use `import('shiki/wasm')` instead.
 */
declare const getWasmInlined: WebAssemblyInstantiator;

export { getWasmInlined as g };
