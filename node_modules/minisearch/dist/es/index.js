/** @ignore */
const ENTRIES = 'ENTRIES';
/** @ignore */
const KEYS = 'KEYS';
/** @ignore */
const VALUES = 'VALUES';
/** @ignore */
const LEAF = '';
/**
 * @private
 */
class TreeIterator {
    constructor(set, type) {
        const node = set._tree;
        const keys = Array.from(node.keys());
        this.set = set;
        this._type = type;
        this._path = keys.length > 0 ? [{ node, keys }] : [];
    }
    next() {
        const value = this.dive();
        this.backtrack();
        return value;
    }
    dive() {
        if (this._path.length === 0) {
            return { done: true, value: undefined };
        }
        const { node, keys } = last$1(this._path);
        if (last$1(keys) === LEAF) {
            return { done: false, value: this.result() };
        }
        const child = node.get(last$1(keys));
        this._path.push({ node: child, keys: Array.from(child.keys()) });
        return this.dive();
    }
    backtrack() {
        if (this._path.length === 0) {
            return;
        }
        const keys = last$1(this._path).keys;
        keys.pop();
        if (keys.length > 0) {
            return;
        }
        this._path.pop();
        this.backtrack();
    }
    key() {
        return this.set._prefix + this._path
            .map(({ keys }) => last$1(keys))
            .filter(key => key !== LEAF)
            .join('');
    }
    value() {
        return last$1(this._path).node.get(LEAF);
    }
    result() {
        switch (this._type) {
            case VALUES: return this.value();
            case KEYS: return this.key();
            default: return [this.key(), this.value()];
        }
    }
    [Symbol.iterator]() {
        return this;
    }
}
const last$1 = (array) => {
    return array[array.length - 1];
};

/* eslint-disable no-labels */
/**
 * @ignore
 */
const fuzzySearch = (node, query, maxDistance) => {
    const results = new Map();
    if (query === undefined)
        return results;
    // Number of columns in the Levenshtein matrix.
    const n = query.length + 1;
    // Matching terms can never be longer than N + maxDistance.
    const m = n + maxDistance;
    // Fill first matrix row and column with numbers: 0 1 2 3 ...
    const matrix = new Uint8Array(m * n).fill(maxDistance + 1);
    for (let j = 0; j < n; ++j)
        matrix[j] = j;
    for (let i = 1; i < m; ++i)
        matrix[i * n] = i;
    recurse(node, query, maxDistance, results, matrix, 1, n, '');
    return results;
};
// Modified version of http://stevehanov.ca/blog/?id=114
// This builds a Levenshtein matrix for a given query and continuously updates
// it for nodes in the radix tree that fall within the given maximum edit
// distance. Keeping the same matrix around is beneficial especially for larger
// edit distances.
//
//           k   a   t   e   <-- query
//       0   1   2   3   4
//   c   1   1   2   3   4
//   a   2   2   1   2   3
//   t   3   3   2   1  [2]  <-- edit distance
//   ^
//   ^ term in radix tree, rows are added and removed as needed
const recurse = (node, query, maxDistance, results, matrix, m, n, prefix) => {
    const offset = m * n;
    key: for (const key of node.keys()) {
        if (key === LEAF) {
            // We've reached a leaf node. Check if the edit distance acceptable and
            // store the result if it is.
            const distance = matrix[offset - 1];
            if (distance <= maxDistance) {
                results.set(prefix, [node.get(key), distance]);
            }
        }
        else {
            // Iterate over all characters in the key. Update the Levenshtein matrix
            // and check if the minimum distance in the last row is still within the
            // maximum edit distance. If it is, we can recurse over all child nodes.
            let i = m;
            for (let pos = 0; pos < key.length; ++pos, ++i) {
                const char = key[pos];
                const thisRowOffset = n * i;
                const prevRowOffset = thisRowOffset - n;
                // Set the first column based on the previous row, and initialize the
                // minimum distance in the current row.
                let minDistance = matrix[thisRowOffset];
                const jmin = Math.max(0, i - maxDistance - 1);
                const jmax = Math.min(n - 1, i + maxDistance);
                // Iterate over remaining columns (characters in the query).
                for (let j = jmin; j < jmax; ++j) {
                    const different = char !== query[j];
                    // It might make sense to only read the matrix positions used for
                    // deletion/insertion if the characters are different. But we want to
                    // avoid conditional reads for performance reasons.
                    const rpl = matrix[prevRowOffset + j] + +different;
                    const del = matrix[prevRowOffset + j + 1] + 1;
                    const ins = matrix[thisRowOffset + j] + 1;
                    const dist = matrix[thisRowOffset + j + 1] = Math.min(rpl, del, ins);
                    if (dist < minDistance)
                        minDistance = dist;
                }
                // Because distance will never decrease, we can stop. There will be no
                // matching child nodes.
                if (minDistance > maxDistance) {
                    continue key;
                }
            }
            recurse(node.get(key), query, maxDistance, results, matrix, i, n, prefix + key);
        }
    }
};

/* eslint-disable no-labels */
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
class SearchableMap {
    /**
     * The constructor is normally called without arguments, creating an empty
     * map. In order to create a {@link SearchableMap} from an iterable or from an
     * object, check {@link SearchableMap.from} and {@link
     * SearchableMap.fromObject}.
     *
     * The constructor arguments are for internal use, when creating derived
     * mutable views of a map at a prefix.
     */
    constructor(tree = new Map(), prefix = '') {
        this._size = undefined;
        this._tree = tree;
        this._prefix = prefix;
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
    atPrefix(prefix) {
        if (!prefix.startsWith(this._prefix)) {
            throw new Error('Mismatched prefix');
        }
        const [node, path] = trackDown(this._tree, prefix.slice(this._prefix.length));
        if (node === undefined) {
            const [parentNode, key] = last(path);
            for (const k of parentNode.keys()) {
                if (k !== LEAF && k.startsWith(key)) {
                    const node = new Map();
                    node.set(k.slice(key.length), parentNode.get(k));
                    return new SearchableMap(node, prefix);
                }
            }
        }
        return new SearchableMap(node, prefix);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear
     */
    clear() {
        this._size = undefined;
        this._tree.clear();
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete
     * @param key  Key to delete
     */
    delete(key) {
        this._size = undefined;
        return remove(this._tree, key);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries
     * @return An iterator iterating through `[key, value]` entries.
     */
    entries() {
        return new TreeIterator(this, ENTRIES);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach
     * @param fn  Iteration function
     */
    forEach(fn) {
        for (const [key, value] of this) {
            fn(key, value, this);
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
    fuzzyGet(key, maxEditDistance) {
        return fuzzySearch(this._tree, key, maxEditDistance);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get
     * @param key  Key to get
     * @return Value associated to the key, or `undefined` if the key is not
     * found.
     */
    get(key) {
        const node = lookup(this._tree, key);
        return node !== undefined ? node.get(LEAF) : undefined;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has
     * @param key  Key
     * @return True if the key is in the map, false otherwise
     */
    has(key) {
        const node = lookup(this._tree, key);
        return node !== undefined && node.has(LEAF);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/keys
     * @return An `Iterable` iterating through keys
     */
    keys() {
        return new TreeIterator(this, KEYS);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set
     * @param key  Key to set
     * @param value  Value to associate to the key
     * @return The {@link SearchableMap} itself, to allow chaining
     */
    set(key, value) {
        if (typeof key !== 'string') {
            throw new Error('key must be a string');
        }
        this._size = undefined;
        const node = createPath(this._tree, key);
        node.set(LEAF, value);
        return this;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/size
     */
    get size() {
        if (this._size) {
            return this._size;
        }
        /** @ignore */
        this._size = 0;
        const iter = this.entries();
        while (!iter.next().done)
            this._size += 1;
        return this._size;
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
    update(key, fn) {
        if (typeof key !== 'string') {
            throw new Error('key must be a string');
        }
        this._size = undefined;
        const node = createPath(this._tree, key);
        node.set(LEAF, fn(node.get(LEAF)));
        return this;
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
    fetch(key, initial) {
        if (typeof key !== 'string') {
            throw new Error('key must be a string');
        }
        this._size = undefined;
        const node = createPath(this._tree, key);
        let value = node.get(LEAF);
        if (value === undefined) {
            node.set(LEAF, value = initial());
        }
        return value;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/values
     * @return An `Iterable` iterating through values.
     */
    values() {
        return new TreeIterator(this, VALUES);
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/@@iterator
     */
    [Symbol.iterator]() {
        return this.entries();
    }
    /**
     * Creates a {@link SearchableMap} from an `Iterable` of entries
     *
     * @param entries  Entries to be inserted in the {@link SearchableMap}
     * @return A new {@link SearchableMap} with the given entries
     */
    static from(entries) {
        const tree = new SearchableMap();
        for (const [key, value] of entries) {
            tree.set(key, value);
        }
        return tree;
    }
    /**
     * Creates a {@link SearchableMap} from the iterable properties of a JavaScript object
     *
     * @param object  Object of entries for the {@link SearchableMap}
     * @return A new {@link SearchableMap} with the given entries
     */
    static fromObject(object) {
        return SearchableMap.from(Object.entries(object));
    }
}
const trackDown = (tree, key, path = []) => {
    if (key.length === 0 || tree == null) {
        return [tree, path];
    }
    for (const k of tree.keys()) {
        if (k !== LEAF && key.startsWith(k)) {
            path.push([tree, k]); // performance: update in place
            return trackDown(tree.get(k), key.slice(k.length), path);
        }
    }
    path.push([tree, key]); // performance: update in place
    return trackDown(undefined, '', path);
};
const lookup = (tree, key) => {
    if (key.length === 0 || tree == null) {
        return tree;
    }
    for (const k of tree.keys()) {
        if (k !== LEAF && key.startsWith(k)) {
            return lookup(tree.get(k), key.slice(k.length));
        }
    }
};
// Create a path in the radix tree for the given key, and returns the deepest
// node. This function is in the hot path for indexing. It avoids unnecessary
// string operations and recursion for performance.
const createPath = (node, key) => {
    const keyLength = key.length;
    outer: for (let pos = 0; node && pos < keyLength;) {
        for (const k of node.keys()) {
            // Check whether this key is a candidate: the first characters must match.
            if (k !== LEAF && key[pos] === k[0]) {
                const len = Math.min(keyLength - pos, k.length);
                // Advance offset to the point where key and k no longer match.
                let offset = 1;
                while (offset < len && key[pos + offset] === k[offset])
                    ++offset;
                const child = node.get(k);
                if (offset === k.length) {
                    // The existing key is shorter than the key we need to create.
                    node = child;
                }
                else {
                    // Partial match: we need to insert an intermediate node to contain
                    // both the existing subtree and the new node.
                    const intermediate = new Map();
                    intermediate.set(k.slice(offset), child);
                    node.set(key.slice(pos, pos + offset), intermediate);
                    node.delete(k);
                    node = intermediate;
                }
                pos += offset;
                continue outer;
            }
        }
        // Create a final child node to contain the final suffix of the key.
        const child = new Map();
        node.set(key.slice(pos), child);
        return child;
    }
    return node;
};
const remove = (tree, key) => {
    const [node, path] = trackDown(tree, key);
    if (node === undefined) {
        return;
    }
    node.delete(LEAF);
    if (node.size === 0) {
        cleanup(path);
    }
    else if (node.size === 1) {
        const [key, value] = node.entries().next().value;
        merge(path, key, value);
    }
};
const cleanup = (path) => {
    if (path.length === 0) {
        return;
    }
    const [node, key] = last(path);
    node.delete(key);
    if (node.size === 0) {
        cleanup(path.slice(0, -1));
    }
    else if (node.size === 1) {
        const [key, value] = node.entries().next().value;
        if (key !== LEAF) {
            merge(path.slice(0, -1), key, value);
        }
    }
};
const merge = (path, key, value) => {
    if (path.length === 0) {
        return;
    }
    const [node, nodeKey] = last(path);
    node.set(nodeKey + key, value);
    node.delete(nodeKey);
};
const last = (array) => {
    return array[array.length - 1];
};

const OR = 'or';
const AND = 'and';
const AND_NOT = 'and_not';
/**
 * {@link MiniSearch} is the main entrypoint class, implementing a full-text
 * search engine in memory.
 *
 * @typeParam T  The type of the documents being indexed.
 *
 * ### Basic example:
 *
 * ```javascript
 * const documents = [
 *   {
 *     id: 1,
 *     title: 'Moby Dick',
 *     text: 'Call me Ishmael. Some years ago...',
 *     category: 'fiction'
 *   },
 *   {
 *     id: 2,
 *     title: 'Zen and the Art of Motorcycle Maintenance',
 *     text: 'I can see by my watch...',
 *     category: 'fiction'
 *   },
 *   {
 *     id: 3,
 *     title: 'Neuromancer',
 *     text: 'The sky above the port was...',
 *     category: 'fiction'
 *   },
 *   {
 *     id: 4,
 *     title: 'Zen and the Art of Archery',
 *     text: 'At first sight it must seem...',
 *     category: 'non-fiction'
 *   },
 *   // ...and more
 * ]
 *
 * // Create a search engine that indexes the 'title' and 'text' fields for
 * // full-text search. Search results will include 'title' and 'category' (plus the
 * // id field, that is always stored and returned)
 * const miniSearch = new MiniSearch({
 *   fields: ['title', 'text'],
 *   storeFields: ['title', 'category']
 * })
 *
 * // Add documents to the index
 * miniSearch.addAll(documents)
 *
 * // Search for documents:
 * let results = miniSearch.search('zen art motorcycle')
 * // => [
 * //   { id: 2, title: 'Zen and the Art of Motorcycle Maintenance', category: 'fiction', score: 2.77258 },
 * //   { id: 4, title: 'Zen and the Art of Archery', category: 'non-fiction', score: 1.38629 }
 * // ]
 * ```
 */
class MiniSearch {
    /**
     * @param options  Configuration options
     *
     * ### Examples:
     *
     * ```javascript
     * // Create a search engine that indexes the 'title' and 'text' fields of your
     * // documents:
     * const miniSearch = new MiniSearch({ fields: ['title', 'text'] })
     * ```
     *
     * ### ID Field:
     *
     * ```javascript
     * // Your documents are assumed to include a unique 'id' field, but if you want
     * // to use a different field for document identification, you can set the
     * // 'idField' option:
     * const miniSearch = new MiniSearch({ idField: 'key', fields: ['title', 'text'] })
     * ```
     *
     * ### Options and defaults:
     *
     * ```javascript
     * // The full set of options (here with their default value) is:
     * const miniSearch = new MiniSearch({
     *   // idField: field that uniquely identifies a document
     *   idField: 'id',
     *
     *   // extractField: function used to get the value of a field in a document.
     *   // By default, it assumes the document is a flat object with field names as
     *   // property keys and field values as string property values, but custom logic
     *   // can be implemented by setting this option to a custom extractor function.
     *   extractField: (document, fieldName) => document[fieldName],
     *
     *   // tokenize: function used to split fields into individual terms. By
     *   // default, it is also used to tokenize search queries, unless a specific
     *   // `tokenize` search option is supplied. When tokenizing an indexed field,
     *   // the field name is passed as the second argument.
     *   tokenize: (string, _fieldName) => string.split(SPACE_OR_PUNCTUATION),
     *
     *   // processTerm: function used to process each tokenized term before
     *   // indexing. It can be used for stemming and normalization. Return a falsy
     *   // value in order to discard a term. By default, it is also used to process
     *   // search queries, unless a specific `processTerm` option is supplied as a
     *   // search option. When processing a term from a indexed field, the field
     *   // name is passed as the second argument.
     *   processTerm: (term, _fieldName) => term.toLowerCase(),
     *
     *   // searchOptions: default search options, see the `search` method for
     *   // details
     *   searchOptions: undefined,
     *
     *   // fields: document fields to be indexed. Mandatory, but not set by default
     *   fields: undefined
     *
     *   // storeFields: document fields to be stored and returned as part of the
     *   // search results.
     *   storeFields: []
     * })
     * ```
     */
    constructor(options) {
        if ((options === null || options === void 0 ? void 0 : options.fields) == null) {
            throw new Error('MiniSearch: option "fields" must be provided');
        }
        const autoVacuum = (options.autoVacuum == null || options.autoVacuum === true) ? defaultAutoVacuumOptions : options.autoVacuum;
        this._options = {
            ...defaultOptions,
            ...options,
            autoVacuum,
            searchOptions: { ...defaultSearchOptions, ...(options.searchOptions || {}) },
            autoSuggestOptions: { ...defaultAutoSuggestOptions, ...(options.autoSuggestOptions || {}) }
        };
        this._index = new SearchableMap();
        this._documentCount = 0;
        this._documentIds = new Map();
        this._idToShortId = new Map();
        // Fields are defined during initialization, don't change, are few in
        // number, rarely need iterating over, and have string keys. Therefore in
        // this case an object is a better candidate than a Map to store the mapping
        // from field key to ID.
        this._fieldIds = {};
        this._fieldLength = new Map();
        this._avgFieldLength = [];
        this._nextId = 0;
        this._storedFields = new Map();
        this._dirtCount = 0;
        this._currentVacuum = null;
        this._enqueuedVacuum = null;
        this._enqueuedVacuumConditions = defaultVacuumConditions;
        this.addFields(this._options.fields);
    }
    /**
     * Adds a document to the index
     *
     * @param document  The document to be indexed
     */
    add(document) {
        const { extractField, stringifyField, tokenize, processTerm, fields, idField } = this._options;
        const id = extractField(document, idField);
        if (id == null) {
            throw new Error(`MiniSearch: document does not have ID field "${idField}"`);
        }
        if (this._idToShortId.has(id)) {
            throw new Error(`MiniSearch: duplicate ID ${id}`);
        }
        const shortDocumentId = this.addDocumentId(id);
        this.saveStoredFields(shortDocumentId, document);
        for (const field of fields) {
            const fieldValue = extractField(document, field);
            if (fieldValue == null)
                continue;
            const tokens = tokenize(stringifyField(fieldValue, field), field);
            const fieldId = this._fieldIds[field];
            const uniqueTerms = new Set(tokens).size;
            this.addFieldLength(shortDocumentId, fieldId, this._documentCount - 1, uniqueTerms);
            for (const term of tokens) {
                const processedTerm = processTerm(term, field);
                if (Array.isArray(processedTerm)) {
                    for (const t of processedTerm) {
                        this.addTerm(fieldId, shortDocumentId, t);
                    }
                }
                else if (processedTerm) {
                    this.addTerm(fieldId, shortDocumentId, processedTerm);
                }
            }
        }
    }
    /**
     * Adds all the given documents to the index
     *
     * @param documents  An array of documents to be indexed
     */
    addAll(documents) {
        for (const document of documents)
            this.add(document);
    }
    /**
     * Adds all the given documents to the index asynchronously.
     *
     * Returns a promise that resolves (to `undefined`) when the indexing is done.
     * This method is useful when index many documents, to avoid blocking the main
     * thread. The indexing is performed asynchronously and in chunks.
     *
     * @param documents  An array of documents to be indexed
     * @param options  Configuration options
     * @return A promise resolving to `undefined` when the indexing is done
     */
    addAllAsync(documents, options = {}) {
        const { chunkSize = 10 } = options;
        const acc = { chunk: [], promise: Promise.resolve() };
        const { chunk, promise } = documents.reduce(({ chunk, promise }, document, i) => {
            chunk.push(document);
            if ((i + 1) % chunkSize === 0) {
                return {
                    chunk: [],
                    promise: promise
                        .then(() => new Promise(resolve => setTimeout(resolve, 0)))
                        .then(() => this.addAll(chunk))
                };
            }
            else {
                return { chunk, promise };
            }
        }, acc);
        return promise.then(() => this.addAll(chunk));
    }
    /**
     * Removes the given document from the index.
     *
     * The document to remove must NOT have changed between indexing and removal,
     * otherwise the index will be corrupted.
     *
     * This method requires passing the full document to be removed (not just the
     * ID), and immediately removes the document from the inverted index, allowing
     * memory to be released. A convenient alternative is {@link
     * MiniSearch#discard}, which needs only the document ID, and has the same
     * visible effect, but delays cleaning up the index until the next vacuuming.
     *
     * @param document  The document to be removed
     */
    remove(document) {
        const { tokenize, processTerm, extractField, stringifyField, fields, idField } = this._options;
        const id = extractField(document, idField);
        if (id == null) {
            throw new Error(`MiniSearch: document does not have ID field "${idField}"`);
        }
        const shortId = this._idToShortId.get(id);
        if (shortId == null) {
            throw new Error(`MiniSearch: cannot remove document with ID ${id}: it is not in the index`);
        }
        for (const field of fields) {
            const fieldValue = extractField(document, field);
            if (fieldValue == null)
                continue;
            const tokens = tokenize(stringifyField(fieldValue, field), field);
            const fieldId = this._fieldIds[field];
            const uniqueTerms = new Set(tokens).size;
            this.removeFieldLength(shortId, fieldId, this._documentCount, uniqueTerms);
            for (const term of tokens) {
                const processedTerm = processTerm(term, field);
                if (Array.isArray(processedTerm)) {
                    for (const t of processedTerm) {
                        this.removeTerm(fieldId, shortId, t);
                    }
                }
                else if (processedTerm) {
                    this.removeTerm(fieldId, shortId, processedTerm);
                }
            }
        }
        this._storedFields.delete(shortId);
        this._documentIds.delete(shortId);
        this._idToShortId.delete(id);
        this._fieldLength.delete(shortId);
        this._documentCount -= 1;
    }
    /**
     * Removes all the given documents from the index. If called with no arguments,
     * it removes _all_ documents from the index.
     *
     * @param documents  The documents to be removed. If this argument is omitted,
     * all documents are removed. Note that, for removing all documents, it is
     * more efficient to call this method with no arguments than to pass all
     * documents.
     */
    removeAll(documents) {
        if (documents) {
            for (const document of documents)
                this.remove(document);
        }
        else if (arguments.length > 0) {
            throw new Error('Expected documents to be present. Omit the argument to remove all documents.');
        }
        else {
            this._index = new SearchableMap();
            this._documentCount = 0;
            this._documentIds = new Map();
            this._idToShortId = new Map();
            this._fieldLength = new Map();
            this._avgFieldLength = [];
            this._storedFields = new Map();
            this._nextId = 0;
        }
    }
    /**
     * Discards the document with the given ID, so it won't appear in search results
     *
     * It has the same visible effect of {@link MiniSearch.remove} (both cause the
     * document to stop appearing in searches), but a different effect on the
     * internal data structures:
     *
     *   - {@link MiniSearch#remove} requires passing the full document to be
     *   removed as argument, and removes it from the inverted index immediately.
     *
     *   - {@link MiniSearch#discard} instead only needs the document ID, and
     *   works by marking the current version of the document as discarded, so it
     *   is immediately ignored by searches. This is faster and more convenient
     *   than {@link MiniSearch#remove}, but the index is not immediately
     *   modified. To take care of that, vacuuming is performed after a certain
     *   number of documents are discarded, cleaning up the index and allowing
     *   memory to be released.
     *
     * After discarding a document, it is possible to re-add a new version, and
     * only the new version will appear in searches. In other words, discarding
     * and re-adding a document works exactly like removing and re-adding it. The
     * {@link MiniSearch.replace} method can also be used to replace a document
     * with a new version.
     *
     * #### Details about vacuuming
     *
     * Repetite calls to this method would leave obsolete document references in
     * the index, invisible to searches. Two mechanisms take care of cleaning up:
     * clean up during search, and vacuuming.
     *
     *   - Upon search, whenever a discarded ID is found (and ignored for the
     *   results), references to the discarded document are removed from the
     *   inverted index entries for the search terms. This ensures that subsequent
     *   searches for the same terms do not need to skip these obsolete references
     *   again.
     *
     *   - In addition, vacuuming is performed automatically by default (see the
     *   `autoVacuum` field in {@link Options}) after a certain number of
     *   documents are discarded. Vacuuming traverses all terms in the index,
     *   cleaning up all references to discarded documents. Vacuuming can also be
     *   triggered manually by calling {@link MiniSearch#vacuum}.
     *
     * @param id  The ID of the document to be discarded
     */
    discard(id) {
        const shortId = this._idToShortId.get(id);
        if (shortId == null) {
            throw new Error(`MiniSearch: cannot discard document with ID ${id}: it is not in the index`);
        }
        this._idToShortId.delete(id);
        this._documentIds.delete(shortId);
        this._storedFields.delete(shortId);
        (this._fieldLength.get(shortId) || []).forEach((fieldLength, fieldId) => {
            this.removeFieldLength(shortId, fieldId, this._documentCount, fieldLength);
        });
        this._fieldLength.delete(shortId);
        this._documentCount -= 1;
        this._dirtCount += 1;
        this.maybeAutoVacuum();
    }
    maybeAutoVacuum() {
        if (this._options.autoVacuum === false) {
            return;
        }
        const { minDirtFactor, minDirtCount, batchSize, batchWait } = this._options.autoVacuum;
        this.conditionalVacuum({ batchSize, batchWait }, { minDirtCount, minDirtFactor });
    }
    /**
     * Discards the documents with the given IDs, so they won't appear in search
     * results
     *
     * It is equivalent to calling {@link MiniSearch#discard} for all the given
     * IDs, but with the optimization of triggering at most one automatic
     * vacuuming at the end.
     *
     * Note: to remove all documents from the index, it is faster and more
     * convenient to call {@link MiniSearch.removeAll} with no argument, instead
     * of passing all IDs to this method.
     */
    discardAll(ids) {
        const autoVacuum = this._options.autoVacuum;
        try {
            this._options.autoVacuum = false;
            for (const id of ids) {
                this.discard(id);
            }
        }
        finally {
            this._options.autoVacuum = autoVacuum;
        }
        this.maybeAutoVacuum();
    }
    /**
     * It replaces an existing document with the given updated version
     *
     * It works by discarding the current version and adding the updated one, so
     * it is functionally equivalent to calling {@link MiniSearch#discard}
     * followed by {@link MiniSearch#add}. The ID of the updated document should
     * be the same as the original one.
     *
     * Since it uses {@link MiniSearch#discard} internally, this method relies on
     * vacuuming to clean up obsolete document references from the index, allowing
     * memory to be released (see {@link MiniSearch#discard}).
     *
     * @param updatedDocument  The updated document to replace the old version
     * with
     */
    replace(updatedDocument) {
        const { idField, extractField } = this._options;
        const id = extractField(updatedDocument, idField);
        this.discard(id);
        this.add(updatedDocument);
    }
    /**
     * Triggers a manual vacuuming, cleaning up references to discarded documents
     * from the inverted index
     *
     * Vacuuming is only useful for applications that use the {@link
     * MiniSearch#discard} or {@link MiniSearch#replace} methods.
     *
     * By default, vacuuming is performed automatically when needed (controlled by
     * the `autoVacuum` field in {@link Options}), so there is usually no need to
     * call this method, unless one wants to make sure to perform vacuuming at a
     * specific moment.
     *
     * Vacuuming traverses all terms in the inverted index in batches, and cleans
     * up references to discarded documents from the posting list, allowing memory
     * to be released.
     *
     * The method takes an optional object as argument with the following keys:
     *
     *   - `batchSize`: the size of each batch (1000 by default)
     *
     *   - `batchWait`: the number of milliseconds to wait between batches (10 by
     *   default)
     *
     * On large indexes, vacuuming could have a non-negligible cost: batching
     * avoids blocking the thread for long, diluting this cost so that it is not
     * negatively affecting the application. Nonetheless, this method should only
     * be called when necessary, and relying on automatic vacuuming is usually
     * better.
     *
     * It returns a promise that resolves (to undefined) when the clean up is
     * completed. If vacuuming is already ongoing at the time this method is
     * called, a new one is enqueued immediately after the ongoing one, and a
     * corresponding promise is returned. However, no more than one vacuuming is
     * enqueued on top of the ongoing one, even if this method is called more
     * times (enqueuing multiple ones would be useless).
     *
     * @param options  Configuration options for the batch size and delay. See
     * {@link VacuumOptions}.
     */
    vacuum(options = {}) {
        return this.conditionalVacuum(options);
    }
    conditionalVacuum(options, conditions) {
        // If a vacuum is already ongoing, schedule another as soon as it finishes,
        // unless there's already one enqueued. If one was already enqueued, do not
        // enqueue another on top, but make sure that the conditions are the
        // broadest.
        if (this._currentVacuum) {
            this._enqueuedVacuumConditions = this._enqueuedVacuumConditions && conditions;
            if (this._enqueuedVacuum != null) {
                return this._enqueuedVacuum;
            }
            this._enqueuedVacuum = this._currentVacuum.then(() => {
                const conditions = this._enqueuedVacuumConditions;
                this._enqueuedVacuumConditions = defaultVacuumConditions;
                return this.performVacuuming(options, conditions);
            });
            return this._enqueuedVacuum;
        }
        if (this.vacuumConditionsMet(conditions) === false) {
            return Promise.resolve();
        }
        this._currentVacuum = this.performVacuuming(options);
        return this._currentVacuum;
    }
    async performVacuuming(options, conditions) {
        const initialDirtCount = this._dirtCount;
        if (this.vacuumConditionsMet(conditions)) {
            const batchSize = options.batchSize || defaultVacuumOptions.batchSize;
            const batchWait = options.batchWait || defaultVacuumOptions.batchWait;
            let i = 1;
            for (const [term, fieldsData] of this._index) {
                for (const [fieldId, fieldIndex] of fieldsData) {
                    for (const [shortId] of fieldIndex) {
                        if (this._documentIds.has(shortId)) {
                            continue;
                        }
                        if (fieldIndex.size <= 1) {
                            fieldsData.delete(fieldId);
                        }
                        else {
                            fieldIndex.delete(shortId);
                        }
                    }
                }
                if (this._index.get(term).size === 0) {
                    this._index.delete(term);
                }
                if (i % batchSize === 0) {
                    await new Promise((resolve) => setTimeout(resolve, batchWait));
                }
                i += 1;
            }
            this._dirtCount -= initialDirtCount;
        }
        // Make the next lines always async, so they execute after this function returns
        await null;
        this._currentVacuum = this._enqueuedVacuum;
        this._enqueuedVacuum = null;
    }
    vacuumConditionsMet(conditions) {
        if (conditions == null) {
            return true;
        }
        let { minDirtCount, minDirtFactor } = conditions;
        minDirtCount = minDirtCount || defaultAutoVacuumOptions.minDirtCount;
        minDirtFactor = minDirtFactor || defaultAutoVacuumOptions.minDirtFactor;
        return this.dirtCount >= minDirtCount && this.dirtFactor >= minDirtFactor;
    }
    /**
     * Is `true` if a vacuuming operation is ongoing, `false` otherwise
     */
    get isVacuuming() {
        return this._currentVacuum != null;
    }
    /**
     * The number of documents discarded since the most recent vacuuming
     */
    get dirtCount() {
        return this._dirtCount;
    }
    /**
     * A number between 0 and 1 giving an indication about the proportion of
     * documents that are discarded, and can therefore be cleaned up by vacuuming.
     * A value close to 0 means that the index is relatively clean, while a higher
     * value means that the index is relatively dirty, and vacuuming could release
     * memory.
     */
    get dirtFactor() {
        return this._dirtCount / (1 + this._documentCount + this._dirtCount);
    }
    /**
     * Returns `true` if a document with the given ID is present in the index and
     * available for search, `false` otherwise
     *
     * @param id  The document ID
     */
    has(id) {
        return this._idToShortId.has(id);
    }
    /**
     * Returns the stored fields (as configured in the `storeFields` constructor
     * option) for the given document ID. Returns `undefined` if the document is
     * not present in the index.
     *
     * @param id  The document ID
     */
    getStoredFields(id) {
        const shortId = this._idToShortId.get(id);
        if (shortId == null) {
            return undefined;
        }
        return this._storedFields.get(shortId);
    }
    /**
     * Search for documents matching the given search query.
     *
     * The result is a list of scored document IDs matching the query, sorted by
     * descending score, and each including data about which terms were matched and
     * in which fields.
     *
     * ### Basic usage:
     *
     * ```javascript
     * // Search for "zen art motorcycle" with default options: terms have to match
     * // exactly, and individual terms are joined with OR
     * miniSearch.search('zen art motorcycle')
     * // => [ { id: 2, score: 2.77258, match: { ... } }, { id: 4, score: 1.38629, match: { ... } } ]
     * ```
     *
     * ### Restrict search to specific fields:
     *
     * ```javascript
     * // Search only in the 'title' field
     * miniSearch.search('zen', { fields: ['title'] })
     * ```
     *
     * ### Field boosting:
     *
     * ```javascript
     * // Boost a field
     * miniSearch.search('zen', { boost: { title: 2 } })
     * ```
     *
     * ### Prefix search:
     *
     * ```javascript
     * // Search for "moto" with prefix search (it will match documents
     * // containing terms that start with "moto" or "neuro")
     * miniSearch.search('moto neuro', { prefix: true })
     * ```
     *
     * ### Fuzzy search:
     *
     * ```javascript
     * // Search for "ismael" with fuzzy search (it will match documents containing
     * // terms similar to "ismael", with a maximum edit distance of 0.2 term.length
     * // (rounded to nearest integer)
     * miniSearch.search('ismael', { fuzzy: 0.2 })
     * ```
     *
     * ### Combining strategies:
     *
     * ```javascript
     * // Mix of exact match, prefix search, and fuzzy search
     * miniSearch.search('ismael mob', {
     *  prefix: true,
     *  fuzzy: 0.2
     * })
     * ```
     *
     * ### Advanced prefix and fuzzy search:
     *
     * ```javascript
     * // Perform fuzzy and prefix search depending on the search term. Here
     * // performing prefix and fuzzy search only on terms longer than 3 characters
     * miniSearch.search('ismael mob', {
     *  prefix: term => term.length > 3
     *  fuzzy: term => term.length > 3 ? 0.2 : null
     * })
     * ```
     *
     * ### Combine with AND:
     *
     * ```javascript
     * // Combine search terms with AND (to match only documents that contain both
     * // "motorcycle" and "art")
     * miniSearch.search('motorcycle art', { combineWith: 'AND' })
     * ```
     *
     * ### Combine with AND_NOT:
     *
     * There is also an AND_NOT combinator, that finds documents that match the
     * first term, but do not match any of the other terms. This combinator is
     * rarely useful with simple queries, and is meant to be used with advanced
     * query combinations (see later for more details).
     *
     * ### Filtering results:
     *
     * ```javascript
     * // Filter only results in the 'fiction' category (assuming that 'category'
     * // is a stored field)
     * miniSearch.search('motorcycle art', {
     *   filter: (result) => result.category === 'fiction'
     * })
     * ```
     *
     * ### Wildcard query
     *
     * Searching for an empty string (assuming the default tokenizer) returns no
     * results. Sometimes though, one needs to match all documents, like in a
     * "wildcard" search. This is possible by passing the special value
     * {@link MiniSearch.wildcard} as the query:
     *
     * ```javascript
     * // Return search results for all documents
     * miniSearch.search(MiniSearch.wildcard)
     * ```
     *
     * Note that search options such as `filter` and `boostDocument` are still
     * applied, influencing which results are returned, and their order:
     *
     * ```javascript
     * // Return search results for all documents in the 'fiction' category
     * miniSearch.search(MiniSearch.wildcard, {
     *   filter: (result) => result.category === 'fiction'
     * })
     * ```
     *
     * ### Advanced combination of queries:
     *
     * It is possible to combine different subqueries with OR, AND, and AND_NOT,
     * and even with different search options, by passing a query expression
     * tree object as the first argument, instead of a string.
     *
     * ```javascript
     * // Search for documents that contain "zen" and ("motorcycle" or "archery")
     * miniSearch.search({
     *   combineWith: 'AND',
     *   queries: [
     *     'zen',
     *     {
     *       combineWith: 'OR',
     *       queries: ['motorcycle', 'archery']
     *     }
     *   ]
     * })
     *
     * // Search for documents that contain ("apple" or "pear") but not "juice" and
     * // not "tree"
     * miniSearch.search({
     *   combineWith: 'AND_NOT',
     *   queries: [
     *     {
     *       combineWith: 'OR',
     *       queries: ['apple', 'pear']
     *     },
     *     'juice',
     *     'tree'
     *   ]
     * })
     * ```
     *
     * Each node in the expression tree can be either a string, or an object that
     * supports all {@link SearchOptions} fields, plus a `queries` array field for
     * subqueries.
     *
     * Note that, while this can become complicated to do by hand for complex or
     * deeply nested queries, it provides a formalized expression tree API for
     * external libraries that implement a parser for custom query languages.
     *
     * @param query  Search query
     * @param searchOptions  Search options. Each option, if not given, defaults to the corresponding value of `searchOptions` given to the constructor, or to the library default.
     */
    search(query, searchOptions = {}) {
        const { searchOptions: globalSearchOptions } = this._options;
        const searchOptionsWithDefaults = { ...globalSearchOptions, ...searchOptions };
        const rawResults = this.executeQuery(query, searchOptions);
        const results = [];
        for (const [docId, { score, terms, match }] of rawResults) {
            // terms are the matched query terms, which will be returned to the user
            // as queryTerms. The quality is calculated based on them, as opposed to
            // the matched terms in the document (which can be different due to
            // prefix and fuzzy match)
            const quality = terms.length || 1;
            const result = {
                id: this._documentIds.get(docId),
                score: score * quality,
                terms: Object.keys(match),
                queryTerms: terms,
                match
            };
            Object.assign(result, this._storedFields.get(docId));
            if (searchOptionsWithDefaults.filter == null || searchOptionsWithDefaults.filter(result)) {
                results.push(result);
            }
        }
        // If it's a wildcard query, and no document boost is applied, skip sorting
        // the results, as all results have the same score of 1
        if (query === MiniSearch.wildcard && searchOptionsWithDefaults.boostDocument == null) {
            return results;
        }
        results.sort(byScore);
        return results;
    }
    /**
     * Provide suggestions for the given search query
     *
     * The result is a list of suggested modified search queries, derived from the
     * given search query, each with a relevance score, sorted by descending score.
     *
     * By default, it uses the same options used for search, except that by
     * default it performs prefix search on the last term of the query, and
     * combine terms with `'AND'` (requiring all query terms to match). Custom
     * options can be passed as a second argument. Defaults can be changed upon
     * calling the {@link MiniSearch} constructor, by passing a
     * `autoSuggestOptions` option.
     *
     * ### Basic usage:
     *
     * ```javascript
     * // Get suggestions for 'neuro':
     * miniSearch.autoSuggest('neuro')
     * // => [ { suggestion: 'neuromancer', terms: [ 'neuromancer' ], score: 0.46240 } ]
     * ```
     *
     * ### Multiple words:
     *
     * ```javascript
     * // Get suggestions for 'zen ar':
     * miniSearch.autoSuggest('zen ar')
     * // => [
     * //  { suggestion: 'zen archery art', terms: [ 'zen', 'archery', 'art' ], score: 1.73332 },
     * //  { suggestion: 'zen art', terms: [ 'zen', 'art' ], score: 1.21313 }
     * // ]
     * ```
     *
     * ### Fuzzy suggestions:
     *
     * ```javascript
     * // Correct spelling mistakes using fuzzy search:
     * miniSearch.autoSuggest('neromancer', { fuzzy: 0.2 })
     * // => [ { suggestion: 'neuromancer', terms: [ 'neuromancer' ], score: 1.03998 } ]
     * ```
     *
     * ### Filtering:
     *
     * ```javascript
     * // Get suggestions for 'zen ar', but only within the 'fiction' category
     * // (assuming that 'category' is a stored field):
     * miniSearch.autoSuggest('zen ar', {
     *   filter: (result) => result.category === 'fiction'
     * })
     * // => [
     * //  { suggestion: 'zen archery art', terms: [ 'zen', 'archery', 'art' ], score: 1.73332 },
     * //  { suggestion: 'zen art', terms: [ 'zen', 'art' ], score: 1.21313 }
     * // ]
     * ```
     *
     * @param queryString  Query string to be expanded into suggestions
     * @param options  Search options. The supported options and default values
     * are the same as for the {@link MiniSearch#search} method, except that by
     * default prefix search is performed on the last term in the query, and terms
     * are combined with `'AND'`.
     * @return  A sorted array of suggestions sorted by relevance score.
     */
    autoSuggest(queryString, options = {}) {
        options = { ...this._options.autoSuggestOptions, ...options };
        const suggestions = new Map();
        for (const { score, terms } of this.search(queryString, options)) {
            const phrase = terms.join(' ');
            const suggestion = suggestions.get(phrase);
            if (suggestion != null) {
                suggestion.score += score;
                suggestion.count += 1;
            }
            else {
                suggestions.set(phrase, { score, terms, count: 1 });
            }
        }
        const results = [];
        for (const [suggestion, { score, terms, count }] of suggestions) {
            results.push({ suggestion, terms, score: score / count });
        }
        results.sort(byScore);
        return results;
    }
    /**
     * Total number of documents available to search
     */
    get documentCount() {
        return this._documentCount;
    }
    /**
     * Number of terms in the index
     */
    get termCount() {
        return this._index.size;
    }
    /**
     * Deserializes a JSON index (serialized with `JSON.stringify(miniSearch)`)
     * and instantiates a MiniSearch instance. It should be given the same options
     * originally used when serializing the index.
     *
     * ### Usage:
     *
     * ```javascript
     * // If the index was serialized with:
     * let miniSearch = new MiniSearch({ fields: ['title', 'text'] })
     * miniSearch.addAll(documents)
     *
     * const json = JSON.stringify(miniSearch)
     * // It can later be deserialized like this:
     * miniSearch = MiniSearch.loadJSON(json, { fields: ['title', 'text'] })
     * ```
     *
     * @param json  JSON-serialized index
     * @param options  configuration options, same as the constructor
     * @return An instance of MiniSearch deserialized from the given JSON.
     */
    static loadJSON(json, options) {
        if (options == null) {
            throw new Error('MiniSearch: loadJSON should be given the same options used when serializing the index');
        }
        return this.loadJS(JSON.parse(json), options);
    }
    /**
     * Async equivalent of {@link MiniSearch.loadJSON}
     *
     * This function is an alternative to {@link MiniSearch.loadJSON} that returns
     * a promise, and loads the index in batches, leaving pauses between them to avoid
     * blocking the main thread. It tends to be slower than the synchronous
     * version, but does not block the main thread, so it can be a better choice
     * when deserializing very large indexes.
     *
     * @param json  JSON-serialized index
     * @param options  configuration options, same as the constructor
     * @return A Promise that will resolve to an instance of MiniSearch deserialized from the given JSON.
     */
    static async loadJSONAsync(json, options) {
        if (options == null) {
            throw new Error('MiniSearch: loadJSON should be given the same options used when serializing the index');
        }
        return this.loadJSAsync(JSON.parse(json), options);
    }
    /**
     * Returns the default value of an option. It will throw an error if no option
     * with the given name exists.
     *
     * @param optionName  Name of the option
     * @return The default value of the given option
     *
     * ### Usage:
     *
     * ```javascript
     * // Get default tokenizer
     * MiniSearch.getDefault('tokenize')
     *
     * // Get default term processor
     * MiniSearch.getDefault('processTerm')
     *
     * // Unknown options will throw an error
     * MiniSearch.getDefault('notExisting')
     * // => throws 'MiniSearch: unknown option "notExisting"'
     * ```
     */
    static getDefault(optionName) {
        if (defaultOptions.hasOwnProperty(optionName)) {
            return getOwnProperty(defaultOptions, optionName);
        }
        else {
            throw new Error(`MiniSearch: unknown option "${optionName}"`);
        }
    }
    /**
     * @ignore
     */
    static loadJS(js, options) {
        const { index, documentIds, fieldLength, storedFields, serializationVersion } = js;
        const miniSearch = this.instantiateMiniSearch(js, options);
        miniSearch._documentIds = objectToNumericMap(documentIds);
        miniSearch._fieldLength = objectToNumericMap(fieldLength);
        miniSearch._storedFields = objectToNumericMap(storedFields);
        for (const [shortId, id] of miniSearch._documentIds) {
            miniSearch._idToShortId.set(id, shortId);
        }
        for (const [term, data] of index) {
            const dataMap = new Map();
            for (const fieldId of Object.keys(data)) {
                let indexEntry = data[fieldId];
                // Version 1 used to nest the index entry inside a field called ds
                if (serializationVersion === 1) {
                    indexEntry = indexEntry.ds;
                }
                dataMap.set(parseInt(fieldId, 10), objectToNumericMap(indexEntry));
            }
            miniSearch._index.set(term, dataMap);
        }
        return miniSearch;
    }
    /**
     * @ignore
     */
    static async loadJSAsync(js, options) {
        const { index, documentIds, fieldLength, storedFields, serializationVersion } = js;
        const miniSearch = this.instantiateMiniSearch(js, options);
        miniSearch._documentIds = await objectToNumericMapAsync(documentIds);
        miniSearch._fieldLength = await objectToNumericMapAsync(fieldLength);
        miniSearch._storedFields = await objectToNumericMapAsync(storedFields);
        for (const [shortId, id] of miniSearch._documentIds) {
            miniSearch._idToShortId.set(id, shortId);
        }
        let count = 0;
        for (const [term, data] of index) {
            const dataMap = new Map();
            for (const fieldId of Object.keys(data)) {
                let indexEntry = data[fieldId];
                // Version 1 used to nest the index entry inside a field called ds
                if (serializationVersion === 1) {
                    indexEntry = indexEntry.ds;
                }
                dataMap.set(parseInt(fieldId, 10), await objectToNumericMapAsync(indexEntry));
            }
            if (++count % 1000 === 0)
                await wait(0);
            miniSearch._index.set(term, dataMap);
        }
        return miniSearch;
    }
    /**
     * @ignore
     */
    static instantiateMiniSearch(js, options) {
        const { documentCount, nextId, fieldIds, averageFieldLength, dirtCount, serializationVersion } = js;
        if (serializationVersion !== 1 && serializationVersion !== 2) {
            throw new Error('MiniSearch: cannot deserialize an index created with an incompatible version');
        }
        const miniSearch = new MiniSearch(options);
        miniSearch._documentCount = documentCount;
        miniSearch._nextId = nextId;
        miniSearch._idToShortId = new Map();
        miniSearch._fieldIds = fieldIds;
        miniSearch._avgFieldLength = averageFieldLength;
        miniSearch._dirtCount = dirtCount || 0;
        miniSearch._index = new SearchableMap();
        return miniSearch;
    }
    /**
     * @ignore
     */
    executeQuery(query, searchOptions = {}) {
        if (query === MiniSearch.wildcard) {
            return this.executeWildcardQuery(searchOptions);
        }
        if (typeof query !== 'string') {
            const options = { ...searchOptions, ...query, queries: undefined };
            const results = query.queries.map((subquery) => this.executeQuery(subquery, options));
            return this.combineResults(results, options.combineWith);
        }
        const { tokenize, processTerm, searchOptions: globalSearchOptions } = this._options;
        const options = { tokenize, processTerm, ...globalSearchOptions, ...searchOptions };
        const { tokenize: searchTokenize, processTerm: searchProcessTerm } = options;
        const terms = searchTokenize(query)
            .flatMap((term) => searchProcessTerm(term))
            .filter((term) => !!term);
        const queries = terms.map(termToQuerySpec(options));
        const results = queries.map(query => this.executeQuerySpec(query, options));
        return this.combineResults(results, options.combineWith);
    }
    /**
     * @ignore
     */
    executeQuerySpec(query, searchOptions) {
        const options = { ...this._options.searchOptions, ...searchOptions };
        const boosts = (options.fields || this._options.fields).reduce((boosts, field) => ({ ...boosts, [field]: getOwnProperty(options.boost, field) || 1 }), {});
        const { boostDocument, weights, maxFuzzy, bm25: bm25params } = options;
        const { fuzzy: fuzzyWeight, prefix: prefixWeight } = { ...defaultSearchOptions.weights, ...weights };
        const data = this._index.get(query.term);
        const results = this.termResults(query.term, query.term, 1, query.termBoost, data, boosts, boostDocument, bm25params);
        let prefixMatches;
        let fuzzyMatches;
        if (query.prefix) {
            prefixMatches = this._index.atPrefix(query.term);
        }
        if (query.fuzzy) {
            const fuzzy = (query.fuzzy === true) ? 0.2 : query.fuzzy;
            const maxDistance = fuzzy < 1 ? Math.min(maxFuzzy, Math.round(query.term.length * fuzzy)) : fuzzy;
            if (maxDistance)
                fuzzyMatches = this._index.fuzzyGet(query.term, maxDistance);
        }
        if (prefixMatches) {
            for (const [term, data] of prefixMatches) {
                const distance = term.length - query.term.length;
                if (!distance) {
                    continue;
                } // Skip exact match.
                // Delete the term from fuzzy results (if present) if it is also a
                // prefix result. This entry will always be scored as a prefix result.
                fuzzyMatches === null || fuzzyMatches === void 0 ? void 0 : fuzzyMatches.delete(term);
                // Weight gradually approaches 0 as distance goes to infinity, with the
                // weight for the hypothetical distance 0 being equal to prefixWeight.
                // The rate of change is much lower than that of fuzzy matches to
                // account for the fact that prefix matches stay more relevant than
                // fuzzy matches for longer distances.
                const weight = prefixWeight * term.length / (term.length + 0.3 * distance);
                this.termResults(query.term, term, weight, query.termBoost, data, boosts, boostDocument, bm25params, results);
            }
        }
        if (fuzzyMatches) {
            for (const term of fuzzyMatches.keys()) {
                const [data, distance] = fuzzyMatches.get(term);
                if (!distance) {
                    continue;
                } // Skip exact match.
                // Weight gradually approaches 0 as distance goes to infinity, with the
                // weight for the hypothetical distance 0 being equal to fuzzyWeight.
                const weight = fuzzyWeight * term.length / (term.length + distance);
                this.termResults(query.term, term, weight, query.termBoost, data, boosts, boostDocument, bm25params, results);
            }
        }
        return results;
    }
    /**
     * @ignore
     */
    executeWildcardQuery(searchOptions) {
        const results = new Map();
        const options = { ...this._options.searchOptions, ...searchOptions };
        for (const [shortId, id] of this._documentIds) {
            const score = options.boostDocument ? options.boostDocument(id, '', this._storedFields.get(shortId)) : 1;
            results.set(shortId, {
                score,
                terms: [],
                match: {}
            });
        }
        return results;
    }
    /**
     * @ignore
     */
    combineResults(results, combineWith = OR) {
        if (results.length === 0) {
            return new Map();
        }
        const operator = combineWith.toLowerCase();
        const combinator = combinators[operator];
        if (!combinator) {
            throw new Error(`Invalid combination operator: ${combineWith}`);
        }
        return results.reduce(combinator) || new Map();
    }
    /**
     * Allows serialization of the index to JSON, to possibly store it and later
     * deserialize it with {@link MiniSearch.loadJSON}.
     *
     * Normally one does not directly call this method, but rather call the
     * standard JavaScript `JSON.stringify()` passing the {@link MiniSearch}
     * instance, and JavaScript will internally call this method. Upon
     * deserialization, one must pass to {@link MiniSearch.loadJSON} the same
     * options used to create the original instance that was serialized.
     *
     * ### Usage:
     *
     * ```javascript
     * // Serialize the index:
     * let miniSearch = new MiniSearch({ fields: ['title', 'text'] })
     * miniSearch.addAll(documents)
     * const json = JSON.stringify(miniSearch)
     *
     * // Later, to deserialize it:
     * miniSearch = MiniSearch.loadJSON(json, { fields: ['title', 'text'] })
     * ```
     *
     * @return A plain-object serializable representation of the search index.
     */
    toJSON() {
        const index = [];
        for (const [term, fieldIndex] of this._index) {
            const data = {};
            for (const [fieldId, freqs] of fieldIndex) {
                data[fieldId] = Object.fromEntries(freqs);
            }
            index.push([term, data]);
        }
        return {
            documentCount: this._documentCount,
            nextId: this._nextId,
            documentIds: Object.fromEntries(this._documentIds),
            fieldIds: this._fieldIds,
            fieldLength: Object.fromEntries(this._fieldLength),
            averageFieldLength: this._avgFieldLength,
            storedFields: Object.fromEntries(this._storedFields),
            dirtCount: this._dirtCount,
            index,
            serializationVersion: 2
        };
    }
    /**
     * @ignore
     */
    termResults(sourceTerm, derivedTerm, termWeight, termBoost, fieldTermData, fieldBoosts, boostDocumentFn, bm25params, results = new Map()) {
        if (fieldTermData == null)
            return results;
        for (const field of Object.keys(fieldBoosts)) {
            const fieldBoost = fieldBoosts[field];
            const fieldId = this._fieldIds[field];
            const fieldTermFreqs = fieldTermData.get(fieldId);
            if (fieldTermFreqs == null)
                continue;
            let matchingFields = fieldTermFreqs.size;
            const avgFieldLength = this._avgFieldLength[fieldId];
            for (const docId of fieldTermFreqs.keys()) {
                if (!this._documentIds.has(docId)) {
                    this.removeTerm(fieldId, docId, derivedTerm);
                    matchingFields -= 1;
                    continue;
                }
                const docBoost = boostDocumentFn ? boostDocumentFn(this._documentIds.get(docId), derivedTerm, this._storedFields.get(docId)) : 1;
                if (!docBoost)
                    continue;
                const termFreq = fieldTermFreqs.get(docId);
                const fieldLength = this._fieldLength.get(docId)[fieldId];
                // NOTE: The total number of fields is set to the number of documents
                // `this._documentCount`. It could also make sense to use the number of
                // documents where the current field is non-blank as a normalization
                // factor. This will make a difference in scoring if the field is rarely
                // present. This is currently not supported, and may require further
                // analysis to see if it is a valid use case.
                const rawScore = calcBM25Score(termFreq, matchingFields, this._documentCount, fieldLength, avgFieldLength, bm25params);
                const weightedScore = termWeight * termBoost * fieldBoost * docBoost * rawScore;
                const result = results.get(docId);
                if (result) {
                    result.score += weightedScore;
                    assignUniqueTerm(result.terms, sourceTerm);
                    const match = getOwnProperty(result.match, derivedTerm);
                    if (match) {
                        match.push(field);
                    }
                    else {
                        result.match[derivedTerm] = [field];
                    }
                }
                else {
                    results.set(docId, {
                        score: weightedScore,
                        terms: [sourceTerm],
                        match: { [derivedTerm]: [field] }
                    });
                }
            }
        }
        return results;
    }
    /**
     * @ignore
     */
    addTerm(fieldId, documentId, term) {
        const indexData = this._index.fetch(term, createMap);
        let fieldIndex = indexData.get(fieldId);
        if (fieldIndex == null) {
            fieldIndex = new Map();
            fieldIndex.set(documentId, 1);
            indexData.set(fieldId, fieldIndex);
        }
        else {
            const docs = fieldIndex.get(documentId);
            fieldIndex.set(documentId, (docs || 0) + 1);
        }
    }
    /**
     * @ignore
     */
    removeTerm(fieldId, documentId, term) {
        if (!this._index.has(term)) {
            this.warnDocumentChanged(documentId, fieldId, term);
            return;
        }
        const indexData = this._index.fetch(term, createMap);
        const fieldIndex = indexData.get(fieldId);
        if (fieldIndex == null || fieldIndex.get(documentId) == null) {
            this.warnDocumentChanged(documentId, fieldId, term);
        }
        else if (fieldIndex.get(documentId) <= 1) {
            if (fieldIndex.size <= 1) {
                indexData.delete(fieldId);
            }
            else {
                fieldIndex.delete(documentId);
            }
        }
        else {
            fieldIndex.set(documentId, fieldIndex.get(documentId) - 1);
        }
        if (this._index.get(term).size === 0) {
            this._index.delete(term);
        }
    }
    /**
     * @ignore
     */
    warnDocumentChanged(shortDocumentId, fieldId, term) {
        for (const fieldName of Object.keys(this._fieldIds)) {
            if (this._fieldIds[fieldName] === fieldId) {
                this._options.logger('warn', `MiniSearch: document with ID ${this._documentIds.get(shortDocumentId)} has changed before removal: term "${term}" was not present in field "${fieldName}". Removing a document after it has changed can corrupt the index!`, 'version_conflict');
                return;
            }
        }
    }
    /**
     * @ignore
     */
    addDocumentId(documentId) {
        const shortDocumentId = this._nextId;
        this._idToShortId.set(documentId, shortDocumentId);
        this._documentIds.set(shortDocumentId, documentId);
        this._documentCount += 1;
        this._nextId += 1;
        return shortDocumentId;
    }
    /**
     * @ignore
     */
    addFields(fields) {
        for (let i = 0; i < fields.length; i++) {
            this._fieldIds[fields[i]] = i;
        }
    }
    /**
     * @ignore
     */
    addFieldLength(documentId, fieldId, count, length) {
        let fieldLengths = this._fieldLength.get(documentId);
        if (fieldLengths == null)
            this._fieldLength.set(documentId, fieldLengths = []);
        fieldLengths[fieldId] = length;
        const averageFieldLength = this._avgFieldLength[fieldId] || 0;
        const totalFieldLength = (averageFieldLength * count) + length;
        this._avgFieldLength[fieldId] = totalFieldLength / (count + 1);
    }
    /**
     * @ignore
     */
    removeFieldLength(documentId, fieldId, count, length) {
        if (count === 1) {
            this._avgFieldLength[fieldId] = 0;
            return;
        }
        const totalFieldLength = (this._avgFieldLength[fieldId] * count) - length;
        this._avgFieldLength[fieldId] = totalFieldLength / (count - 1);
    }
    /**
     * @ignore
     */
    saveStoredFields(documentId, doc) {
        const { storeFields, extractField } = this._options;
        if (storeFields == null || storeFields.length === 0) {
            return;
        }
        let documentFields = this._storedFields.get(documentId);
        if (documentFields == null)
            this._storedFields.set(documentId, documentFields = {});
        for (const fieldName of storeFields) {
            const fieldValue = extractField(doc, fieldName);
            if (fieldValue !== undefined)
                documentFields[fieldName] = fieldValue;
        }
    }
}
/**
 * The special wildcard symbol that can be passed to {@link MiniSearch#search}
 * to match all documents
 */
MiniSearch.wildcard = Symbol('*');
const getOwnProperty = (object, property) => Object.prototype.hasOwnProperty.call(object, property) ? object[property] : undefined;
const combinators = {
    [OR]: (a, b) => {
        for (const docId of b.keys()) {
            const existing = a.get(docId);
            if (existing == null) {
                a.set(docId, b.get(docId));
            }
            else {
                const { score, terms, match } = b.get(docId);
                existing.score = existing.score + score;
                existing.match = Object.assign(existing.match, match);
                assignUniqueTerms(existing.terms, terms);
            }
        }
        return a;
    },
    [AND]: (a, b) => {
        const combined = new Map();
        for (const docId of b.keys()) {
            const existing = a.get(docId);
            if (existing == null)
                continue;
            const { score, terms, match } = b.get(docId);
            assignUniqueTerms(existing.terms, terms);
            combined.set(docId, {
                score: existing.score + score,
                terms: existing.terms,
                match: Object.assign(existing.match, match)
            });
        }
        return combined;
    },
    [AND_NOT]: (a, b) => {
        for (const docId of b.keys())
            a.delete(docId);
        return a;
    }
};
const defaultBM25params = { k: 1.2, b: 0.7, d: 0.5 };
const calcBM25Score = (termFreq, matchingCount, totalCount, fieldLength, avgFieldLength, bm25params) => {
    const { k, b, d } = bm25params;
    const invDocFreq = Math.log(1 + (totalCount - matchingCount + 0.5) / (matchingCount + 0.5));
    return invDocFreq * (d + termFreq * (k + 1) / (termFreq + k * (1 - b + b * fieldLength / avgFieldLength)));
};
const termToQuerySpec = (options) => (term, i, terms) => {
    const fuzzy = (typeof options.fuzzy === 'function')
        ? options.fuzzy(term, i, terms)
        : (options.fuzzy || false);
    const prefix = (typeof options.prefix === 'function')
        ? options.prefix(term, i, terms)
        : (options.prefix === true);
    const termBoost = (typeof options.boostTerm === 'function')
        ? options.boostTerm(term, i, terms)
        : 1;
    return { term, fuzzy, prefix, termBoost };
};
const defaultOptions = {
    idField: 'id',
    extractField: (document, fieldName) => document[fieldName],
    stringifyField: (fieldValue, fieldName) => fieldValue.toString(),
    tokenize: (text) => text.split(SPACE_OR_PUNCTUATION),
    processTerm: (term) => term.toLowerCase(),
    fields: undefined,
    searchOptions: undefined,
    storeFields: [],
    logger: (level, message) => {
        if (typeof (console === null || console === void 0 ? void 0 : console[level]) === 'function')
            console[level](message);
    },
    autoVacuum: true
};
const defaultSearchOptions = {
    combineWith: OR,
    prefix: false,
    fuzzy: false,
    maxFuzzy: 6,
    boost: {},
    weights: { fuzzy: 0.45, prefix: 0.375 },
    bm25: defaultBM25params
};
const defaultAutoSuggestOptions = {
    combineWith: AND,
    prefix: (term, i, terms) => i === terms.length - 1
};
const defaultVacuumOptions = { batchSize: 1000, batchWait: 10 };
const defaultVacuumConditions = { minDirtFactor: 0.1, minDirtCount: 20 };
const defaultAutoVacuumOptions = { ...defaultVacuumOptions, ...defaultVacuumConditions };
const assignUniqueTerm = (target, term) => {
    // Avoid adding duplicate terms.
    if (!target.includes(term))
        target.push(term);
};
const assignUniqueTerms = (target, source) => {
    for (const term of source) {
        // Avoid adding duplicate terms.
        if (!target.includes(term))
            target.push(term);
    }
};
const byScore = ({ score: a }, { score: b }) => b - a;
const createMap = () => new Map();
const objectToNumericMap = (object) => {
    const map = new Map();
    for (const key of Object.keys(object)) {
        map.set(parseInt(key, 10), object[key]);
    }
    return map;
};
const objectToNumericMapAsync = async (object) => {
    const map = new Map();
    let count = 0;
    for (const key of Object.keys(object)) {
        map.set(parseInt(key, 10), object[key]);
        if (++count % 1000 === 0) {
            await wait(0);
        }
    }
    return map;
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// This regular expression matches any Unicode space, newline, or punctuation
// character
const SPACE_OR_PUNCTUATION = /[\n\r\p{Z}\p{P}]+/u;

export { MiniSearch as default };
//# sourceMappingURL=index.js.map
