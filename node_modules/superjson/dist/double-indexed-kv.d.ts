export declare class DoubleIndexedKV<K, V> {
    keyToValue: Map<K, V>;
    valueToKey: Map<V, K>;
    set(key: K, value: V): void;
    getByKey(key: K): V | undefined;
    getByValue(value: V): K | undefined;
    clear(): void;
}
