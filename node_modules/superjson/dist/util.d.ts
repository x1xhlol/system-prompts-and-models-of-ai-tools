export declare function find<T>(record: Record<string, T>, predicate: (v: T) => boolean): T | undefined;
export declare function forEach<T>(record: Record<string, T>, run: (v: T, key: string) => void): void;
export declare function includes<T>(arr: T[], value: T): boolean;
export declare function findArr<T>(record: T[], predicate: (v: T) => boolean): T | undefined;
