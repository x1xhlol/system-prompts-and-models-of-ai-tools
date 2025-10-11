// adapted from https://stackoverflow.com/a/46432113/11613622
export class LRUCache {
    max;
    cache;
    constructor(max = 10) {
        this.max = max;
        this.cache = new Map();
    }
    get(key) {
        let item = this.cache.get(key);
        if (item !== undefined) {
            // refresh key
            this.cache.delete(key);
            this.cache.set(key, item);
        }
        return item;
    }
    set(key, val) {
        // refresh key
        if (this.cache.has(key))
            this.cache.delete(key);
        // evict oldest
        else if (this.cache.size === this.max)
            this.cache.delete(this.first());
        this.cache.set(key, val);
    }
    first() {
        return this.cache.keys().next().value;
    }
    clear() {
        this.cache.clear();
    }
}
