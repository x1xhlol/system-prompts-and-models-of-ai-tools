export declare class Registry<T> {
    private readonly generateIdentifier;
    private kv;
    constructor(generateIdentifier: (v: T) => string);
    register(value: T, identifier?: string): void;
    clear(): void;
    getIdentifier(value: T): string | undefined;
    getValue(identifier: string): T | undefined;
}
