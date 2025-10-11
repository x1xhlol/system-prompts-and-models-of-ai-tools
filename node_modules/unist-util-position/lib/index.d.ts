/**
 * Get the positional info of `node`.
 *
 * @param {Node | NodeLike | null | undefined} [node]
 *   Node.
 * @returns {Position | undefined}
 *   Position.
 */
export function position(
  node?: Node | NodeLike | null | undefined
): Position | undefined
/**
 * Get the point info of `node` at a bound side.
 *
 * @param {Node | NodeLike | null | undefined} [node]
 * @returns {Point | undefined}
 */
export function pointEnd(
  node?: Node | NodeLike | null | undefined
): Point | undefined
/**
 * Get the point info of `node` at a bound side.
 *
 * @param {Node | NodeLike | null | undefined} [node]
 * @returns {Point | undefined}
 */
export function pointStart(
  node?: Node | NodeLike | null | undefined
): Point | undefined
export type Node = import('unist').Node
export type Point = import('unist').Point
export type Position = import('unist').Position
export type NodeLike = {
  type: string
  position?: PositionLike | null | undefined
}
export type PositionLike = {
  start?: PointLike | null | undefined
  end?: PointLike | null | undefined
}
export type PointLike = {
  line?: number | null | undefined
  column?: number | null | undefined
  offset?: number | null | undefined
}
