/**
Generates a Regex+ compatible `pattern`, `flags`, and `options` from a Regex+ AST.
@param {import('./transform.js').RegexAst} ast
@param {import('.').ToRegExpOptions} [options]
@returns {{
  pattern: string;
  flags: string;
  options: Object;
  _captureTransfers: Map<number, Array<number>>;
  _hiddenCaptures: Array<number>;
}}
*/
export function generate(ast: import("./transform.js").RegexAst, options?: import(".").ToRegExpOptions): {
    pattern: string;
    flags: string;
    options: any;
    _captureTransfers: Map<number, Array<number>>;
    _hiddenCaptures: Array<number>;
};
