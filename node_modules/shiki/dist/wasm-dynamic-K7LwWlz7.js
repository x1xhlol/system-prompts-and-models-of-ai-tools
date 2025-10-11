import { warnDeprecated } from '@shikijs/core';

const getWasmInlined = async (info) => {
  warnDeprecated('`getWasmInlined` is deprecated. Use `import("shiki/wasm")` instead.');
  return import('shiki/wasm').then((wasm) => wasm.default(info));
};

export { getWasmInlined as g };
