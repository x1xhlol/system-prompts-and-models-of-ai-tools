/**
 * Encode special characters in `value`.
 *
 * @param {string} value
 *   Value to encode.
 * @param {Options} [options]
 *   Configuration.
 * @returns {string}
 *   Encoded value.
 */
export function stringifyEntities(value: string, options?: Options | undefined): string;
/**
 * Encode special characters in `value` as hexadecimals.
 *
 * @param {string} value
 *   Value to encode.
 * @param {LightOptions} [options]
 *   Configuration.
 * @returns {string}
 *   Encoded value.
 */
export function stringifyEntitiesLight(value: string, options?: import("./core.js").CoreOptions | undefined): string;
export type Options = import('./core.js').CoreOptions & import('./util/format-smart.js').FormatSmartOptions;
export type LightOptions = import('./core.js').CoreOptions;
