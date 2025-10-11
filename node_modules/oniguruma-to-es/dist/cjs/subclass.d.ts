export type EmulatedRegExpOptions = {
    hiddenCaptures?: Array<number>;
    lazyCompile?: boolean;
    strategy?: string | null;
    transfers?: Array<[number, Array<number>]>;
};
/**
@typedef {{
  hiddenCaptures?: Array<number>;
  lazyCompile?: boolean;
  strategy?: string?;
  transfers?: Array<[number, Array<number>]>;
}} EmulatedRegExpOptions
*/
/**
Works the same as JavaScript's native `RegExp` constructor in all contexts, but can be given
results from `toRegExpDetails` to produce the same result as `toRegExp`.
*/
export class EmulatedRegExp extends RegExp {
    /**
     @overload
     @param {string} pattern
     @param {string} [flags]
     @param {EmulatedRegExpOptions} [options]
     */
    constructor(pattern: string, flags?: string, options?: EmulatedRegExpOptions);
    /**
     @overload
     @param {EmulatedRegExp} pattern
     @param {string} [flags]
     */
    constructor(pattern: EmulatedRegExp, flags?: string);
    /**
    Can be used to serialize the instance.
    @type {EmulatedRegExpOptions}
    */
    rawOptions: EmulatedRegExpOptions;
    #private;
}
