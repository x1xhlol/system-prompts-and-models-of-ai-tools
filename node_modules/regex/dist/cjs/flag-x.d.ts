/**
Remove `(?:)` token separators (most likely added by flag x) in cases where it's safe to do so.
@param {string} expression
@returns {import('./regex.js').PluginResult}
*/
export function clean(expression: string): import("./regex.js").PluginResult;
export function flagXPreprocessor(value: import("./utils.js").InterpolatedValue, runningContext: import("./utils.js").RunningContext, options: Required<import("./utils.js").RegexTagOptions>): {
    transformed: string;
    runningContext: import("./utils.js").RunningContext;
};
