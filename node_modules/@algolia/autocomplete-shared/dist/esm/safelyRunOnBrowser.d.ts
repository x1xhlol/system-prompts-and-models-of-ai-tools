declare type BrowserCallback<TReturn> = (params: {
    window: typeof window;
}) => TReturn;
/**
 * Safely runs code meant for browser environments only.
 */
export declare function safelyRunOnBrowser<TReturn>(callback: BrowserCallback<TReturn>): TReturn | undefined;
export {};
