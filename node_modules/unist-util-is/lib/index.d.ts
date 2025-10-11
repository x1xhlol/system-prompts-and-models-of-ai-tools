/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 */
/**
 * @template Fn
 * @template Fallback
 * @typedef {Fn extends (value: any) => value is infer Thing ? Thing : Fallback} Predicate
 */
/**
 * @callback Check
 *   Check that an arbitrary value is a node.
 * @param {unknown} this
 *   The given context.
 * @param {unknown} [node]
 *   Anything (typically a node).
 * @param {number | null | undefined} [index]
 *   The node’s position in its parent.
 * @param {Parent | null | undefined} [parent]
 *   The node’s parent.
 * @returns {boolean}
 *   Whether this is a node and passes a test.
 *
 * @typedef {Record<string, unknown> | Node} Props
 *   Object to check for equivalence.
 *
 *   Note: `Node` is included as it is common but is not indexable.
 *
 * @typedef {Array<Props | TestFunction | string> | Props | TestFunction | string | null | undefined} Test
 *   Check for an arbitrary node.
 *
 * @callback TestFunction
 *   Check if a node passes a test.
 * @param {unknown} this
 *   The given context.
 * @param {Node} node
 *   A node.
 * @param {number | undefined} [index]
 *   The node’s position in its parent.
 * @param {Parent | undefined} [parent]
 *   The node’s parent.
 * @returns {boolean | undefined | void}
 *   Whether this node passes the test.
 *
 *   Note: `void` is included until TS sees no return as `undefined`.
 */
/**
 * Check if `node` is a `Node` and whether it passes the given test.
 *
 * @param {unknown} node
 *   Thing to check, typically `Node`.
 * @param {Test} test
 *   A check for a specific node.
 * @param {number | null | undefined} index
 *   The node’s position in its parent.
 * @param {Parent | null | undefined} parent
 *   The node’s parent.
 * @param {unknown} context
 *   Context object (`this`) to pass to `test` functions.
 * @returns {boolean}
 *   Whether `node` is a node and passes a test.
 */
export const is: (<Condition extends string>(
  node: unknown,
  test: Condition,
  index?: number | null | undefined,
  parent?: Parent | null | undefined,
  context?: unknown
) => node is import('unist').Node & {
  type: Condition
}) &
  (<Condition_1 extends Props>(
    node: unknown,
    test: Condition_1,
    index?: number | null | undefined,
    parent?: Parent | null | undefined,
    context?: unknown
  ) => node is import('unist').Node & Condition_1) &
  (<Condition_2 extends TestFunction>(
    node: unknown,
    test: Condition_2,
    index?: number | null | undefined,
    parent?: Parent | null | undefined,
    context?: unknown
  ) => node is import('unist').Node &
    Predicate<Condition_2, import('unist').Node>) &
  ((node?: null | undefined) => false) &
  ((
    node: unknown,
    test?: null | undefined,
    index?: number | null | undefined,
    parent?: Parent | null | undefined,
    context?: unknown
  ) => node is import('unist').Node) &
  ((
    node: unknown,
    test?: Test,
    index?: number | null | undefined,
    parent?: Parent | null | undefined,
    context?: unknown
  ) => boolean)
/**
 * Generate an assertion from a test.
 *
 * Useful if you’re going to test many nodes, for example when creating a
 * utility where something else passes a compatible test.
 *
 * The created function is a bit faster because it expects valid input only:
 * a `node`, `index`, and `parent`.
 *
 * @param {Test} test
 *   *   when nullish, checks if `node` is a `Node`.
 *   *   when `string`, works like passing `(node) => node.type === test`.
 *   *   when `function` checks if function passed the node is true.
 *   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
 *   *   when `array`, checks if any one of the subtests pass.
 * @returns {Check}
 *   An assertion.
 */
export const convert: (<Condition extends string>(
  test: Condition
) => (
  node: unknown,
  index?: number | null | undefined,
  parent?: Parent | null | undefined,
  context?: unknown
) => node is import('unist').Node & {
  type: Condition
}) &
  (<Condition_1 extends Props>(
    test: Condition_1
  ) => (
    node: unknown,
    index?: number | null | undefined,
    parent?: Parent | null | undefined,
    context?: unknown
  ) => node is import('unist').Node & Condition_1) &
  (<Condition_2 extends TestFunction>(
    test: Condition_2
  ) => (
    node: unknown,
    index?: number | null | undefined,
    parent?: Parent | null | undefined,
    context?: unknown
  ) => node is import('unist').Node &
    Predicate<Condition_2, import('unist').Node>) &
  ((
    test?: null | undefined
  ) => (
    node?: unknown,
    index?: number | null | undefined,
    parent?: Parent | null | undefined,
    context?: unknown
  ) => node is import('unist').Node) &
  ((test?: Test) => Check)
export type Node = import('unist').Node
export type Parent = import('unist').Parent
export type Predicate<Fn, Fallback> = Fn extends (
  value: any
) => value is infer Thing
  ? Thing
  : Fallback
/**
 * Check that an arbitrary value is a node.
 */
export type Check = (
  this: unknown,
  node?: unknown,
  index?: number | null | undefined,
  parent?: Parent | null | undefined
) => boolean
/**
 * Object to check for equivalence.
 *
 * Note: `Node` is included as it is common but is not indexable.
 */
export type Props = Record<string, unknown> | Node
/**
 * Check for an arbitrary node.
 */
export type Test =
  | Array<Props | TestFunction | string>
  | Props
  | TestFunction
  | string
  | null
  | undefined
/**
 * Check if a node passes a test.
 */
export type TestFunction = (
  this: unknown,
  node: Node,
  index?: number | undefined,
  parent?: Parent | undefined
) => boolean | undefined | void
