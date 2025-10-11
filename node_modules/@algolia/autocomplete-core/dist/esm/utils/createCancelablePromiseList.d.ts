import { CancelablePromise } from '.';
export declare type CancelablePromiseList<TValue> = {
    /**
     * Add a cancelable promise to the list.
     *
     * @param cancelablePromise The cancelable promise to add.
     */
    add(cancelablePromise: CancelablePromise<TValue>): CancelablePromise<TValue>;
    /**
     * Cancel all pending promises.
     *
     * Requests aren't actually stopped. All pending promises will settle, but
     * attached handlers won't run.
     */
    cancelAll(): void;
    /**
     * Whether there are pending promises in the list.
     */
    isEmpty(): boolean;
};
export declare function createCancelablePromiseList<TValue>(): CancelablePromiseList<TValue>;
