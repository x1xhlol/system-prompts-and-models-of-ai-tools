export const cp: (...codePoints: number[]) => string;
export namespace envFlags {
    let literalHyphenIncorrectlyCreatesRange: boolean;
}
export function getNewCurrentFlags(current: any, { enable, disable }: {
    enable: any;
    disable: any;
}): {
    dotAll: boolean;
    ignoreCase: boolean;
};
export function getOrInsert(map: any, key: any, defaultValue: any): any;
/**
@param {keyof Target} target
@param {keyof Target} min
@returns {boolean}
*/
export function isMinTarget(target: "auto" | "ES2025" | "ES2024" | "ES2018", min: "auto" | "ES2025" | "ES2024" | "ES2018"): boolean;
export const r: (template: {
    raw: readonly string[] | ArrayLike<string>;
}, ...substitutions: any[]) => string;
export function throwIfNot(value: any, msg: any): any;
