export declare type StringifiedPath = string;
declare type Path = string[];
export declare const escapeKey: (key: string) => string;
export declare const stringifyPath: (path: Path) => StringifiedPath;
export declare const parsePath: (string: StringifiedPath) => string[];
export {};
