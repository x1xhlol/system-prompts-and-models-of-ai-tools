export type RegexAst = {
    type: "Regex";
    parent: null;
    pattern: any;
    flags: any;
    options: any;
    _originMap: Map<any, any>;
    _strategy: string | null;
};
/**
@typedef {{
  type: 'Regex';
  parent: null;
  pattern: Object;
  flags: Object;
  options: Object;
  _originMap: Map<Object, Object>;
  _strategy: string?;
}} RegexAst
*/
/**
Transforms an Oniguruma AST in-place to a [Regex+](https://github.com/slevithan/regex) AST.
Assumes target ES2025, expecting the generator to down-convert to the desired JS target version.

Regex+'s syntax and behavior is a strict superset of native JavaScript, so the AST is very close
to representing native ES2025 `RegExp` but with some added features (atomic groups, possessive
quantifiers, recursion). The AST doesn't use some of Regex+'s extended features like flag x or
subroutines because they follow PCRE behavior and work somewhat differently than in Oniguruma. The
AST represents what's needed to precisely reproduce Oniguruma behavior using Regex+.
@param {import('./parse.js').OnigurumaAst} ast
@param {{
  accuracy?: keyof Accuracy;
  asciiWordBoundaries?: boolean;
  avoidSubclass?: boolean;
  bestEffortTarget?: keyof Target;
}} [options]
@returns {RegexAst}
*/
export function transform(ast: import("./parse.js").OnigurumaAst, options?: {
    accuracy?: "default" | "strict";
    asciiWordBoundaries?: boolean;
    avoidSubclass?: boolean;
    bestEffortTarget?: "auto" | "ES2025" | "ES2024" | "ES2018";
}): RegexAst;
