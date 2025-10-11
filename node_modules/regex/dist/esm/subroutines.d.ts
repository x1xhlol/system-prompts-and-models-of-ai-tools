export type NamedCapturingGroupsMap = Map<string, {
    isUnique: boolean;
    contents?: string;
    groupNum?: number;
    numCaptures?: number;
}>;
/**
@param {string} expression
@param {import('./regex.js').PluginData} [data]
@returns {import('./regex.js').PluginResult}
*/
export function subroutines(expression: string, data?: import("./regex.js").PluginData): import("./regex.js").PluginResult;
