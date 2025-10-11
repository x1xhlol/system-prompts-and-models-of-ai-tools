/**
Works the same as JavaScript's native `RegExp` constructor in all contexts, but automatically
adjusts subpattern matches and indices (with flag `d`) to account for captures added as part of
emulating extended syntax.
*/
export class RegExpSubclass extends RegExp {
    /**
     @overload
     @param {string} expression
     @param {string} [flags]
     @param {{
     hiddenCaptures?: Array<number>;
     }} [options]
     */
    constructor(expression: string, flags?: string, options?: {
        hiddenCaptures?: Array<number>;
    });
    /**
     @overload
     @param {RegExpSubclass} expression
     @param {string} [flags]
     */
    constructor(expression: RegExpSubclass, flags?: string);
    /**
    @private
    @type {Map<number, {
      hidden: true;
    }>}
    */
    private _captureMap;
}
