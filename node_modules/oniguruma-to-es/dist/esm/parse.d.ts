export type OnigurumaAst = {
    type: "Regex";
    parent: null;
    pattern: any;
    flags: any;
};
export namespace AstAbsentFunctionKinds {
    let repeater: string;
}
export namespace AstAssertionKinds {
    let line_end: string;
    let line_start: string;
    let lookahead: string;
    let lookbehind: string;
    let search_start: string;
    let string_end: string;
    let string_end_newline: string;
    let string_start: string;
    let word_boundary: string;
}
export const AstCharacterSetKinds: {
    any: string;
    digit: string;
    dot: string;
    hex: string;
    non_newline: string;
    posix: string;
    property: string;
    space: string;
    word: string;
};
export const AstDirectiveKinds: {
    flags: string;
    keep: string;
};
export namespace AstTypes {
    let AbsentFunction: string;
    let Alternative: string;
    let Assertion: string;
    let Backreference: string;
    let CapturingGroup: string;
    let Character: string;
    let CharacterClass: string;
    let CharacterClassIntersection: string;
    let CharacterClassRange: string;
    let CharacterSet: string;
    let Directive: string;
    let Flags: string;
    let Group: string;
    let Pattern: string;
    let Quantifier: string;
    let Regex: string;
    let Subroutine: string;
    let VariableLengthCharacterSet: string;
    let Recursion: string;
}
export namespace AstVariableLengthCharacterSetKinds {
    let grapheme: string;
    let newline: string;
}
export function createAbsentFunction(kind: any): {
    type: string;
    kind: any;
    alternatives: {
        type: string;
        elements: any[];
    }[];
};
export function createAlternative(): {
    type: string;
    elements: any[];
};
export function createAssertion(kind: any, options: any): {
    negate: boolean;
    type: string;
    kind: any;
};
export function createBackreference(ref: any, options: any): {
    ref: any;
    orphan: true;
    type: string;
};
export function createCapturingGroup(number: any, name: any): {
    alternatives: {
        type: string;
        elements: any[];
    }[];
    name: any;
    type: string;
    number: any;
};
export function createCharacter(charCode: any, options: any): {
    type: string;
    value: any;
};
export function createCharacterClass(options: any): any;
export function createCharacterClassIntersection(): any;
export function createCharacterClassRange(min: any, max: any): {
    type: string;
    min: any;
    max: any;
};
export function createCharacterSet(kind: any, { negate }: {
    negate: any;
}): {
    type: string;
    kind: any;
};
export function createFlags({ ignoreCase, dotAll, extended, digitIsAscii, spaceIsAscii, wordIsAscii }: {
    ignoreCase: any;
    dotAll: any;
    extended: any;
    digitIsAscii: any;
    spaceIsAscii: any;
    wordIsAscii: any;
}): {
    type: string;
    ignoreCase: any;
    dotAll: any;
    extended: any;
    digitIsAscii: any;
    spaceIsAscii: any;
    wordIsAscii: any;
};
export function createGroup(options: any): {
    alternatives: {
        type: string;
        elements: any[];
    }[];
    flags: any;
    atomic: any;
    type: string;
};
export function createLookaround(options: any): {
    type: string;
    kind: string;
    negate: any;
    alternatives: {
        type: string;
        elements: any[];
    }[];
};
export function createPattern(): {
    type: string;
    alternatives: {
        type: string;
        elements: any[];
    }[];
};
export function createQuantifier(element: any, min: any, max: any, greedy?: boolean, possessive?: boolean): {
    type: string;
    min: any;
    max: any;
    greedy: boolean;
    possessive: boolean;
    element: any;
};
export function createRegex(pattern: any, flags: any): {
    type: string;
    pattern: any;
    flags: any;
};
export function createSubroutine(ref: any): {
    type: string;
    ref: any;
};
export function createUnicodeProperty(value: any, options: any): {
    type: string;
    kind: string;
    value: any;
    negate: any;
};
export function createVariableLengthCharacterSet(kind: any): {
    type: string;
    kind: any;
};
/**
@typedef {{
  type: 'Regex';
  parent: null;
  pattern: Object;
  flags: Object;
}} OnigurumaAst
*/
/**
@param {import('./tokenize.js').TokenizerResult} tokenizerResult
@param {{
  skipBackrefValidation?: boolean;
  skipPropertyNameValidation?: boolean;
  verbose?: boolean;
}} [options]
@returns {OnigurumaAst}
*/
export function parse({ tokens, flags, rules }: import("./tokenize.js").TokenizerResult, options?: {
    skipBackrefValidation?: boolean;
    skipPropertyNameValidation?: boolean;
    verbose?: boolean;
}): OnigurumaAst;
