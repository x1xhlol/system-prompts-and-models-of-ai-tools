/**
Apply transformations for atomic groups: `(?>…)`.
@param {string} expression
@param {import('./regex.js').PluginData} [data]
@returns {Required<import('./regex.js').PluginResult>}
*/
export function atomic(expression: string, data?: import("./regex.js").PluginData): Required<import("./regex.js").PluginResult>;
/**
Transform posessive quantifiers into atomic groups. The posessessive quantifiers are:
`?+`, `*+`, `++`, `{N}+`, `{N,}+`, `{N,N}+`.
This follows Java, PCRE, Perl, and Python.
Possessive quantifiers in Oniguruma and Onigmo are only: `?+`, `*+`, `++`.
@param {string} expression
@returns {import('./regex.js').PluginResult}
*/
export function possessive(expression: string): import("./regex.js").PluginResult;
