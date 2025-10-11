/**
 * Find applicable siblings in a direction.
 *
 * @template {Parents} Parent
 *   Parent type.
 * @param {Parent | undefined} parent
 *   Parent.
 * @param {number | undefined} index
 *   Index of child in `parent`.
 * @param {boolean | undefined} [includeWhitespace=false]
 *   Whether to include whitespace (default: `false`).
 * @returns {Parent extends {children: Array<infer Child>} ? Child | undefined : never}
 *   Child of parent.
 */
export function siblingAfter<Parent extends Parents>(parent: Parent | undefined, index: number | undefined, includeWhitespace?: boolean | undefined): Parent extends {
    children: Array<infer Child>;
} ? Child | undefined : never;
/**
 * Find applicable siblings in a direction.
 *
 * @template {Parents} Parent
 *   Parent type.
 * @param {Parent | undefined} parent
 *   Parent.
 * @param {number | undefined} index
 *   Index of child in `parent`.
 * @param {boolean | undefined} [includeWhitespace=false]
 *   Whether to include whitespace (default: `false`).
 * @returns {Parent extends {children: Array<infer Child>} ? Child | undefined : never}
 *   Child of parent.
 */
export function siblingBefore<Parent extends Parents>(parent: Parent | undefined, index: number | undefined, includeWhitespace?: boolean | undefined): Parent extends {
    children: Array<infer Child>;
} ? Child | undefined : never;
import type { Parents } from 'hast';
//# sourceMappingURL=siblings.d.ts.map