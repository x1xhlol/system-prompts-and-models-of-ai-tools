declare type PromiseExecutor<TValue> = (resolve: (value: TValue | PromiseLike<TValue>) => void, reject: (reason?: any) => void) => void;
export declare type CancelablePromise<TValue> = {
    then<TResultFulfilled = TValue, TResultRejected = never>(onfulfilled?: ((value: TValue) => TResultFulfilled | PromiseLike<TResultFulfilled> | CancelablePromise<TResultFulfilled>) | undefined | null, onrejected?: ((reason: any) => TResultRejected | PromiseLike<TResultRejected> | CancelablePromise<TResultRejected>) | undefined | null): CancelablePromise<TResultFulfilled | TResultRejected>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult> | CancelablePromise<TResult>) | undefined | null): CancelablePromise<TValue | TResult>;
    finally(onfinally?: (() => void) | undefined | null): CancelablePromise<TValue>;
    cancel(): void;
    isCanceled(): boolean;
};
export declare function createCancelablePromise<TValue>(executor: PromiseExecutor<TValue>): CancelablePromise<TValue>;
export declare namespace createCancelablePromise {
    var resolve: <TValue>(value?: TValue | PromiseLike<TValue> | CancelablePromise<TValue> | undefined) => CancelablePromise<TValue | CancelablePromise<TValue> | undefined>;
    var reject: (reason?: any) => CancelablePromise<never>;
}
export declare function cancelable<TValue>(promise: Promise<TValue>): CancelablePromise<TValue>;
export {};
