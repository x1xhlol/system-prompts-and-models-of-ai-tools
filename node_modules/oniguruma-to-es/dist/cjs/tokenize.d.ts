export type Token = {
    type: "Alternator" | "Assertion" | "Backreference" | "Character" | "CharacterClassClose" | "CharacterClassHyphen" | "CharacterClassIntersector" | "CharacterClassOpen" | "CharacterSet" | "Directive" | "GroupClose" | "GroupOpen" | "Subroutine" | "Quantifier" | "VariableLengthCharacterSet" | "EscapedNumber";
    raw: string;
    [key: string]: string | number | boolean;
};
export type TokenizerResult = {
    tokens: Array<Token>;
    flags: {
        dotAll: boolean;
        extended: boolean;
        ignoreCase: boolean;
    };
    rules: {
        captureGroup: boolean;
        singleline: boolean;
    };
};
/**
@typedef {{
  type: keyof TokenTypes;
  raw: string;
  [key: string]: string | number | boolean;
}} Token
@typedef {{
  tokens: Array<Token>;
  flags: {
    dotAll: boolean;
    extended: boolean;
    ignoreCase: boolean;
  };
  rules: {
    captureGroup: boolean;
    singleline: boolean;
  };
}} TokenizerResult
*/
/**
@param {string} pattern Oniguruma pattern.
@param {string} [flags] Oniguruma flags.
@param {{
  captureGroup?: boolean;
  singleline?: boolean;
}} [rules] Oniguruma compile-time options.
@returns {TokenizerResult}
*/
export function tokenize(pattern: string, flags?: string, rules?: {
    captureGroup?: boolean;
    singleline?: boolean;
}): TokenizerResult;
export namespace TokenCharacterSetKinds {
    let any: string;
    let digit: string;
    let dot: string;
    let hex: string;
    let non_newline: string;
    let posix: string;
    let property: string;
    let space: string;
    let word: string;
}
export namespace TokenDirectiveKinds {
    let flags: string;
    let keep: string;
}
export namespace TokenGroupKinds {
    let absent_repeater: string;
    let atomic: string;
    let capturing: string;
    let group: string;
    let lookahead: string;
    let lookbehind: string;
}
export namespace TokenTypes {
    let Alternator: "Alternator";
    let Assertion: "Assertion";
    let Backreference: "Backreference";
    let Character: "Character";
    let CharacterClassClose: "CharacterClassClose";
    let CharacterClassHyphen: "CharacterClassHyphen";
    let CharacterClassIntersector: "CharacterClassIntersector";
    let CharacterClassOpen: "CharacterClassOpen";
    let CharacterSet: "CharacterSet";
    let Directive: "Directive";
    let GroupClose: "GroupClose";
    let GroupOpen: "GroupOpen";
    let Subroutine: "Subroutine";
    let Quantifier: "Quantifier";
    let VariableLengthCharacterSet: "VariableLengthCharacterSet";
    let EscapedNumber: "EscapedNumber";
}
