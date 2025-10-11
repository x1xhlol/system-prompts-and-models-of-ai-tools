import { MaybePromise } from '@algolia/autocomplete-shared';
/**
 * Creates a runner that executes promises in a concurrent-safe way.
 *
 * This is useful to prevent older promises to resolve after a newer promise,
 * otherwise resulting in stale resolved values.
 */
export declare function createConcurrentSafePromise(): <TValue>(promise: MaybePromise<TValue>) => Promise<TValue>;
