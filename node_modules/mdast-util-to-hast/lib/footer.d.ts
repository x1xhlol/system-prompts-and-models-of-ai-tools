/**
 * Generate the default content that GitHub uses on backreferences.
 *
 * @param {number} _
 *   Index of the definition in the order that they are first referenced,
 *   0-indexed.
 * @param {number} rereferenceIndex
 *   Index of calls to the same definition, 0-indexed.
 * @returns {Array<ElementContent>}
 *   Content.
 */
export function defaultFootnoteBackContent(_: number, rereferenceIndex: number): Array<ElementContent>;
/**
 * Generate the default label that GitHub uses on backreferences.
 *
 * @param {number} referenceIndex
 *   Index of the definition in the order that they are first referenced,
 *   0-indexed.
 * @param {number} rereferenceIndex
 *   Index of calls to the same definition, 0-indexed.
 * @returns {string}
 *   Label.
 */
export function defaultFootnoteBackLabel(referenceIndex: number, rereferenceIndex: number): string;
/**
 * Generate a hast footer for called footnote definitions.
 *
 * @param {State} state
 *   Info passed around.
 * @returns {Element | undefined}
 *   `section` element or `undefined`.
 */
export function footer(state: State): Element | undefined;
export type Element = import("hast").Element;
export type ElementContent = import("hast").ElementContent;
export type State = import("./state.js").State;
/**
 * Generate content for the backreference dynamically.
 *
 * For the following markdown:
 *
 * ```markdown
 * Alpha[^micromark], bravo[^micromark], and charlie[^remark].
 *
 * [^remark]: things about remark
 * [^micromark]: things about micromark
 * ```
 *
 * This function will be called with:
 *
 * *  `0` and `0` for the backreference from `things about micromark` to
 *  `alpha`, as it is the first used definition, and the first call to it
 * *  `0` and `1` for the backreference from `things about micromark` to
 *  `bravo`, as it is the first used definition, and the second call to it
 * *  `1` and `0` for the backreference from `things about remark` to
 *  `charlie`, as it is the second used definition
 */
export type FootnoteBackContentTemplate = (referenceIndex: number, rereferenceIndex: number) => Array<ElementContent> | ElementContent | string;
/**
 * Generate a back label dynamically.
 *
 * For the following markdown:
 *
 * ```markdown
 * Alpha[^micromark], bravo[^micromark], and charlie[^remark].
 *
 * [^remark]: things about remark
 * [^micromark]: things about micromark
 * ```
 *
 * This function will be called with:
 *
 * *  `0` and `0` for the backreference from `things about micromark` to
 *  `alpha`, as it is the first used definition, and the first call to it
 * *  `0` and `1` for the backreference from `things about micromark` to
 *  `bravo`, as it is the first used definition, and the second call to it
 * *  `1` and `0` for the backreference from `things about remark` to
 *  `charlie`, as it is the second used definition
 */
export type FootnoteBackLabelTemplate = (referenceIndex: number, rereferenceIndex: number) => string;
