import { J as JavaScriptScanner } from './shared/engine-javascript.hzpS1_41.mjs';

function createJavaScriptRawEngine() {
  const options = {
    cache: /* @__PURE__ */ new Map(),
    regexConstructor: () => {
      throw new Error("JavaScriptRawEngine: only support precompiled grammar");
    }
  };
  return {
    createScanner(patterns) {
      return new JavaScriptScanner(patterns, options);
    },
    createString(s) {
      return {
        content: s
      };
    }
  };
}

export { createJavaScriptRawEngine };
