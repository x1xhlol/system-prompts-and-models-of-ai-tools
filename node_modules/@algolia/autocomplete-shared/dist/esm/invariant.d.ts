/**
 * Throws an error if the condition is not met in development mode.
 * This is used to make development a better experience to provide guidance as
 * to where the error comes from.
 */
export declare function invariant(condition: boolean, message: string | (() => string)): void;
