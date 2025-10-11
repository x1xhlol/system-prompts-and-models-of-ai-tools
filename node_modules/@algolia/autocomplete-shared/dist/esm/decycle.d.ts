/**
 * Decycles objects with circular references.
 * This is used to print cyclic structures in development environment only.
 */
export declare function decycle(obj: any, seen?: Set<unknown>): any;
