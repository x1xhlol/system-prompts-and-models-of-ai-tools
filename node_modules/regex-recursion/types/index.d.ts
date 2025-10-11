/**
@param {string} pattern
@param {{
  flags?: string;
  captureTransfers?: Map<number, Array<number>>;
  hiddenCaptures?: Array<number>;
  mode?: 'plugin' | 'external';
}} [data]
@returns {{
  pattern: string;
  captureTransfers: Map<number, Array<number>>;
  hiddenCaptures: Array<number>;
}}
*/
export function recursion(pattern: string, data?: {
    flags?: string;
    captureTransfers?: Map<number, Array<number>>;
    hiddenCaptures?: Array<number>;
    mode?: "plugin" | "external";
}): {
    pattern: string;
    captureTransfers: Map<number, Array<number>>;
    hiddenCaptures: Array<number>;
};
