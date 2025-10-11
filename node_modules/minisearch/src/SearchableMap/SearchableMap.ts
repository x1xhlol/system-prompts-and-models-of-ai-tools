/* eslint-disable no-labels */
import { TreeIterator, ENTRIES, KEYS, VALUES, LEAF } from './TreeIterator'
import fuzzySearch, { type FuzzyResults } from './fuzzySearch'
import type { RadixTree, Entry, Path } from './types'

/**
 * A class implementing the same interface as a standard JavaScript
 * [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
 * with string keys, but adding support for efficiently searching entries with
 * prefix or fuzzy search. This class is used internally by {@link MiniSearch}
 * as the inverted index data structure. The implementation is a radix tree
 * (compressed prefix tree).
 *
 * Since this class can be of general utility beyond _MiniSearch_, it is
 * exported by the `minisearch` package and can be imported (or required) as
 * `minisearch/SearchableMap`.
 *
 * @typeParam T  The type of the values stored in the map.
 */
export default class SearchableMap<T = any> {
  /**
   * @internal
   */
  _tree: RadixTree<T>

  /**
   * @internal
   */
  _prefix: string

  private _size: number | undefined = undefined

  /**
   * The constructor is normally called without arguments, creating an empty
   * map. In order to create a {@link SearchableMap} from an iterable or from an
   * object, check {@link SearchableMap.from} and {@link
   * SearchableMap.fromObject}.
   *
   * The constructor arguments are for internal use, when creating derived
   * mutable views of a map at a prefix.
   */
  constructor (tree: RadixTree<T> = new Map(), prefix = '') {
    this._tree = tree
    this._prefix = prefix
  }

  /**
   * Creates and returns a mutable view of this {@link SearchableMap},
   * containing only entries that share the given prefix.
   *
   * ### Usage:
   *
   * ```javascript
   * let map = new SearchableMap()
   * map.set("unicorn", 1)
   * map.set("universe", 2)
   * map.set("university", 3)
   * map.set("unique", 4)
   * map.set("hello", 5)
   *
   * let uni = map.atPrefix("uni")
   * uni.get("unique") // => 4
   * uni.get("unicorn") // => 1
   * uni.get("hello") // => undefined
   *
   * let univer = map.atPrefix("univer")
   * univer.get("unique") // => undefined
   * univer.get("universe") // => 2
   * univer.get("university") // => 3
   * ```
   *
   * @param prefix  The prefix
   * @return A {@link SearchableMap} representing a mutable view of the original
   * Map at the given prefix
   */
  atPrefix (prefix: string): SearchableMap<T> {
    if (!prefix.startsWith(this._prefix)) { throw new Error('Mismatched prefix') }

    const [node, path] = trackDown(this._tree, prefix.slice(this._prefix.length))

    if (node === undefined) {
      const [parentNode, key] = last(path)

      for (const k of parentNode!.keys()) {
        if (k !== LEAF && k.startsWith(key)) {
          const node = new Map()
          node.set(k.slice(key.length), parentNode!.get(k)!)
          return new SearchableMap(node, prefix)
        }
      }
    }

    return new SearchableMap<T>(node, prefix)
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear
   */
  clear (): void {
    this._size = undefined
    this._tree.clear()
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete
   * @param key  Key to delete
   */
  delete (key: string): void {
    this._size = undefined
    return remove(this._tree, key)
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries
   * @return An iterator iterating through `[key, value]` entries.
   */
  entries () {
    return new TreeIterator(this, ENTRIES)
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach
   * @param fn  Iteration function
   */
  forEach (fn: (key: string, value: T, map: SearchableMap) => void): void {
    for (const [key, value] of this) {
      fn(key, value, this)
    }
  }

  /**
   * Returns a Map of all the entries that have a key within the given edit
   * distance from the search key. The keys of the returned Map are the matching
   * keys, while the values are two-element arrays where the first element is
   * the value associated to the key, and the second is the edit distance of the
   * key to the search key.
   *
   * ### Usage:
   *
   * ```javascript
   * let map = new SearchableMap()
   * map.set('hello', 'world')
   * map.set('hell', 'yeah')
   * map.set('ciao', 'mondo')
   *
   * // Get all entries that match the key 'hallo' with a maximum edit distance of 2
   * map.fuzzyGet('hallo', 2)
   * // => Map(2) { 'hello' => ['world', 1], 'hell' => ['yeah', 2] }
   *
   * // In the example, the "hello" key has value "world" and edit distance of 1
   * // (change "e" to "a"), the key "hell" has value "yeah" and edit distance of 2
   * // (change "e" to "a", delete "o")
   * ```
   *
   * @param key  The search key
   * @param maxEditDistance  The maximum edit distance (Levenshtein)
   * @return A Map of the matching keys to their value and edit distance
   */
  fuzzyGet (key: string, maxEditDistance: number): FuzzyResults<T> {
    return fuzzySearch<T>(this._tree, key, maxEditDistance)
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get
   * @param key  Key to get
   * @return Value associated to the key, or `undefined` if the key is not
   * found.
   */
  get (key: string): T | undefined {
    const node = lookup<T>(this._tree, key)
    return node !== undefined ? node.get(LEAF) : undefined
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has
   * @param key  Key
   * @return True if the key is in the map, false otherwise
   */
  has (key: string): boolean {
    const node = lookup(this._tree, key)
    return node !== undefined && node.has(LEAF)
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/keys
   * @return An `Iterable` iterating through keys
   */
  keys () {
    return new TreeIterator(this, KEYS)
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set
   * @param key  Key to set
   * @param value  Value to associate to the key
   * @return The {@link SearchableMap} itself, to allow chaining
   */
  set (key: string, value: T): SearchableMap<T> {
    if (typeof key !== 'string') { throw new Error('key must be a string') }
    this._size = undefined
    const node = createPath(this._tree, key)
    node.set(LEAF, value)
    return this
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/size
   */
  get size (): number {
    if (this._size) { return this._size }
    /** @ignore */
    this._size = 0

    const iter = this.entries()
    while (!iter.next().done) this._size! += 1

    return this._size
  }

  /**
   * Updates the value at the given key using the provided function. The function
   * is called with the current value at the key, and its return value is used as
   * the new value to be set.
   *
   * ### Example:
   *
   * ```javascript
   * // Increment the current value by one
   * searchableMap.update('somekey', (currentValue) => currentValue == null ? 0 : currentValue + 1)
   * ```
   *
   * If the value at the given key is or will be an object, it might not require
   * re-assignment. In that case it is better to use `fetch()`, because it is
   * faster.
   *
   * @param key  The key to update
   * @param fn  The function used to compute the new value from the current one
   * @return The {@link SearchableMap} itself, to allow chaining
   */
  update (key: string, fn: (value: T | undefined) => T): SearchableMap<T> {
    if (typeof key !== 'string') { throw new Error('key must be a string') }
    this._size = undefined
    const node = createPath(this._tree, key)
    node.set(LEAF, fn(node.get(LEAF)))
    return this
  }

  /**
   * Fetches the value of the given key. If the value does not exist, calls the
   * given function to create a new value, which is inserted at the given key
   * and subsequently returned.
   *
   * ### Example:
   *
   * ```javascript
   * const map = searchableMap.fetch('somekey', () => new Map())
   * map.set('foo', 'bar')
   * ```
   *
   * @param key  The key to update
   * @param initial  A function that creates a new value if the key does not exist
   * @return The existing or new value at the given key
   */
  fetch (key: string, initial: () => T): T {
    if (typeof key !== 'string') { throw new Error('key must be a string') }
    this._size = undefined
    const node = createPath(this._tree, key)

    let value = node.get(LEAF)
    if (value === undefined) {
      node.set(LEAF, value = initial())
    }

    return value
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/values
   * @return An `Iterable` iterating through values.
   */
  values () {
    return new TreeIterator(this, VALUES)
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/@@iterator
   */
  [Symbol.iterator] () {
    return this.entries()
  }

  /**
   * Creates a {@link SearchableMap} from an `Iterable` of entries
   *
   * @param entries  Entries to be inserted in the {@link SearchableMap}
   * @return A new {@link SearchableMap} with the given entries
   */
  static from<T = any> (entries: Iterable<Entry<T>> | Entry<T>[]) {
    const tree = new SearchableMap()
    for (const [key, value] of entries) {
      tree.set(key, value)
    }
    return tree
  }

  /**
   * Creates a {@link SearchableMap} from the iterable properties of a JavaScript object
   *
   * @param object  Object of entries for the {@link SearchableMap}
   * @return A new {@link SearchableMap} with the given entries
   */
  static fromObject<T = any> (object: { [key: string]: T }) {
    return SearchableMap.from<T>(Object.entries(object))
  }
}

const trackDown = <T = any>(tree: RadixTree<T> | undefined, key: string, path: Path<T> = []): [RadixTree<T> | undefined, Path<T>] => {
  if (key.length === 0 || tree == null) { return [tree, path] }

  for (const k of tree.keys()) {
    if (k !== LEAF && key.startsWith(k)) {
      path.push([tree, k]) // performance: update in place
      return trackDown(tree.get(k)!, key.slice(k.length), path)
    }
  }

  path.push([tree, key]) // performance: update in place
  return trackDown(undefined, '', path)
}

const lookup = <T = any>(tree: RadixTree<T>, key: string): RadixTree<T> | undefined => {
  if (key.length === 0 || tree == null) { return tree }

  for (const k of tree.keys()) {
    if (k !== LEAF && key.startsWith(k)) {
      return lookup(tree.get(k)!, key.slice(k.length))
    }
  }
}

// Create a path in the radix tree for the given key, and returns the deepest
// node. This function is in the hot path for indexing. It avoids unnecessary
// string operations and recursion for performance.
const createPath = <T = any>(node: RadixTree<T>, key: string): RadixTree<T> => {
  const keyLength = key.length

  outer: for (let pos = 0; node && pos < keyLength;) {
    for (const k of node.keys()) {
      // Check whether this key is a candidate: the first characters must match.
      if (k !== LEAF && key[pos] === k[0]) {
        const len = Math.min(keyLength - pos, k.length)

        // Advance offset to the point where key and k no longer match.
        let offset = 1
        while (offset < len && key[pos + offset] === k[offset]) ++offset

        const child = node.get(k)!
        if (offset === k.length) {
          // The existing key is shorter than the key we need to create.
          node = child
        } else {
          // Partial match: we need to insert an intermediate node to contain
          // both the existing subtree and the new node.
          const intermediate = new Map()
          intermediate.set(k.slice(offset), child)
          node.set(key.slice(pos, pos + offset), intermediate)
          node.delete(k)
          node = intermediate
        }

        pos += offset
        continue outer
      }
    }

    // Create a final child node to contain the final suffix of the key.
    const child = new Map()
    node.set(key.slice(pos), child)
    return child
  }

  return node
}

const remove = <T = any>(tree: RadixTree<T>, key: string): void => {
  const [node, path] = trackDown(tree, key)
  if (node === undefined) { return }
  node.delete(LEAF)

  if (node.size === 0) {
    cleanup(path)
  } else if (node.size === 1) {
    const [key, value] = node.entries().next().value!
    merge(path, key as string, value as RadixTree<T>)
  }
}

const cleanup = <T = any>(path: Path<T>): void => {
  if (path.length === 0) { return }

  const [node, key] = last(path)
  node!.delete(key)

  if (node!.size === 0) {
    cleanup(path.slice(0, -1))
  } else if (node!.size === 1) {
    const [key, value] = node!.entries().next().value!
    if (key !== LEAF) {
      merge(path.slice(0, -1), key as string, value as RadixTree<T>)
    }
  }
}

const merge = <T = any>(path: Path<T>, key: string, value: RadixTree<T>): void => {
  if (path.length === 0) { return }

  const [node, nodeKey] = last(path)
  node!.set(nodeKey + key, value)
  node!.delete(nodeKey)
}

const last = <T = any>(array: T[]): T => {
  return array[array.length - 1]
}
