/**
Applies flag v rules when using flag u, for forward compatibility.
Assumes flag u and doesn't worry about syntax errors that are caught by it.
@param {string} expression
@returns {import('./regex.js').PluginResult}
*/
export function backcompatPlugin(expression: string): import("./regex.js").PluginResult;
