type Cache = {
    /**
     * Gets the value of the given `key`.
     */
    get: <TValue>(key: Record<string, any> | string, defaultValue: () => Promise<TValue>, events?: CacheEvents<TValue> | undefined) => Promise<TValue>;
    /**
     * Sets the given value with the given `key`.
     */
    set: <TValue>(key: Record<string, any> | string, value: TValue) => Promise<TValue>;
    /**
     * Deletes the given `key`.
     */
    delete: (key: Record<string, any> | string) => Promise<void>;
    /**
     * Clears the cache.
     */
    clear: () => Promise<void>;
};
type CacheEvents<TValue> = {
    /**
     * The callback when the given `key` is missing from the cache.
     */
    miss: (value: TValue) => Promise<any>;
};
type MemoryCacheOptions = {
    /**
     * If keys and values should be serialized using `JSON.stringify`.
     */
    serializable?: boolean | undefined;
};
type BrowserLocalStorageOptions = {
    /**
     * The cache key.
     */
    key: string;
    /**
     * The time to live for each cached item in seconds.
     */
    timeToLive?: number | undefined;
    /**
     * The native local storage implementation.
     */
    localStorage?: Storage | undefined;
};
type BrowserLocalStorageCacheItem = {
    /**
     * The cache item creation timestamp.
     */
    timestamp: number;
    /**
     * The cache item value.
     */
    value: any;
};
type FallbackableCacheOptions = {
    /**
     * List of caches order by priority.
     */
    caches: Cache[];
};

type Host = {
    /**
     * The host URL.
     */
    url: string;
    /**
     * The accepted transporter.
     */
    accept: 'read' | 'readWrite' | 'write';
    /**
     * The protocol of the host URL.
     */
    protocol: 'http' | 'https';
    /**
     * The port of the host URL.
     */
    port?: number | undefined;
};
type StatefulHost = Host & {
    /**
     * The status of the host.
     */
    status: 'down' | 'timed out' | 'up';
    /**
     * The last update of the host status, used to compare with the expiration delay.
     */
    lastUpdate: number;
    /**
     * Returns whether the host is up or not.
     */
    isUp: () => boolean;
    /**
     * Returns whether the host is timed out or not.
     */
    isTimedOut: () => boolean;
};

declare const LogLevelEnum: Readonly<Record<string, LogLevelType>>;
type LogLevelType = 1 | 2 | 3;
type Logger = {
    /**
     * Logs debug messages.
     */
    debug: (message: string, args?: any | undefined) => Promise<void>;
    /**
     * Logs info messages.
     */
    info: (message: string, args?: any | undefined) => Promise<void>;
    /**
     * Logs error messages.
     */
    error: (message: string, args?: any | undefined) => Promise<void>;
};

type Headers = Record<string, string>;
type QueryParameters = Record<string, any>;
/**
 * The method of the request.
 */
type Method = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
type Request = {
    method: Method;
    /**
     * The path of the REST API to send the request to.
     */
    path: string;
    queryParameters: QueryParameters;
    data?: Array<Record<string, any>> | Record<string, any> | undefined;
    headers: Headers;
    /**
     * If the given request should persist on the cache. Keep in mind,
     * that some methods may have this option enabled by default.
     */
    cacheable?: boolean | undefined;
    /**
     * Some POST methods in the Algolia REST API uses the `read` transporter.
     * This information is defined at the spec level.
     */
    useReadTransporter?: boolean | undefined;
};
type EndRequest = Pick<Request, 'headers' | 'method'> & {
    /**
     * The full URL of the REST API.
     */
    url: string;
    /**
     * The connection timeout, in milliseconds.
     */
    connectTimeout: number;
    /**
     * The response timeout, in milliseconds.
     */
    responseTimeout: number;
    data?: string | undefined;
};
type Response = {
    /**
     * The body of the response.
     */
    content: string;
    /**
     * Whether the API call is timed out or not.
     */
    isTimedOut: boolean;
    /**
     * The HTTP status code of the response.
     */
    status: number;
};
type Requester = {
    /**
     * Sends the given `request` to the server.
     */
    send: (request: EndRequest) => Promise<Response>;
};

type RequestOptions = Pick<Request, 'cacheable'> & {
    /**
     * Custom timeout for the request. Note that, in normal situations
     * the given timeout will be applied. But the transporter layer may
     * increase this timeout if there is need for it.
     */
    timeouts?: Partial<Timeouts> | undefined;
    /**
     * Custom headers for the request. This headers are
     * going to be merged the transporter headers.
     */
    headers?: Headers | undefined;
    /**
     * Custom query parameters for the request. This query parameters are
     * going to be merged the transporter query parameters.
     */
    queryParameters?: QueryParameters | undefined;
    /**
     * Custom data for the request. This data is
     * going to be merged the transporter data.
     */
    data?: Array<Record<string, any>> | Record<string, any> | undefined;
};
type StackFrame = {
    request: EndRequest;
    response: Response;
    host: Host;
    triesLeft: number;
};
type AlgoliaAgentOptions = {
    /**
     * The segment. Usually the integration name.
     */
    segment: string;
    /**
     * The version. Usually the integration version.
     */
    version?: string | undefined;
};
type AlgoliaAgent = {
    /**
     * The raw value of the user agent.
     */
    value: string;
    /**
     * Mutates the current user agent adding the given user agent options.
     */
    add: (options: AlgoliaAgentOptions) => AlgoliaAgent;
};
type Timeouts = {
    /**
     * Timeout in milliseconds before the connection is established.
     */
    connect: number;
    /**
     * Timeout in milliseconds before reading the response on a read request.
     */
    read: number;
    /**
     * Timeout in milliseconds before reading the response on a write request.
     */
    write: number;
};
type TransporterOptions = {
    /**
     * The cache of the hosts. Usually used to persist
     * the state of the host when its down.
     */
    hostsCache: Cache;
    /**
     * The logger instance to send events of the transporter.
     */
    logger: Logger;
    /**
     * The underlying requester used. Should differ
     * depending of the environment where the client
     * will be used.
     */
    requester: Requester;
    /**
     * The cache of the requests. When requests are
     * `cacheable`, the returned promised persists
     * in this cache to shared in similar requests
     * before being resolved.
     */
    requestsCache: Cache;
    /**
     * The cache of the responses. When requests are
     * `cacheable`, the returned responses persists
     * in this cache to shared in similar requests.
     */
    responsesCache: Cache;
    /**
     * The timeouts used by the requester. The transporter
     * layer may increase this timeouts as defined on the
     * retry strategy.
     */
    timeouts: Timeouts;
    /**
     * The hosts used by the requester.
     */
    hosts: Host[];
    /**
     * The headers used by the requester. The transporter
     * layer may add some extra headers during the request
     * for the user agent, and others.
     */
    baseHeaders: Headers;
    /**
     * The query parameters used by the requester. The transporter
     * layer may add some extra headers during the request
     * for the user agent, and others.
     */
    baseQueryParameters: QueryParameters;
    /**
     * The user agent used. Sent on query parameters.
     */
    algoliaAgent: AlgoliaAgent;
};
type Transporter = TransporterOptions & {
    /**
     * Performs a request.
     * The `baseRequest` and `baseRequestOptions` will be merged accordingly.
     */
    request: <TResponse>(baseRequest: Request, baseRequestOptions?: RequestOptions) => Promise<TResponse>;
};

type AuthMode = 'WithinHeaders' | 'WithinQueryParameters';
type OverriddenTransporterOptions = 'baseHeaders' | 'baseQueryParameters' | 'hosts';
type CreateClientOptions = Omit<TransporterOptions, OverriddenTransporterOptions | 'algoliaAgent'> & Partial<Pick<TransporterOptions, OverriddenTransporterOptions>> & {
    appId: string;
    apiKey: string;
    authMode?: AuthMode | undefined;
    algoliaAgents: AlgoliaAgentOptions[];
};
type ClientOptions = Partial<Omit<CreateClientOptions, 'apiKey' | 'appId'>>;

type IterableOptions<TResponse> = Partial<{
    /**
     * The function that runs right after the API call has been resolved, allows you to do anything with the response before `validate`.
     */
    aggregator: (response: TResponse) => unknown | PromiseLike<unknown>;
    /**
     * The `validate` condition to throw an error and its message.
     */
    error: {
        /**
         * The function to validate the error condition.
         */
        validate: (response: TResponse) => boolean | PromiseLike<boolean>;
        /**
         * The error message to throw.
         */
        message: (response: TResponse) => string | PromiseLike<string>;
    };
    /**
     * The function to decide how long to wait between iterations.
     */
    timeout: () => number | PromiseLike<number>;
}>;
type CreateIterablePromise<TResponse> = IterableOptions<TResponse> & {
    /**
     * The function to run, which returns a promise.
     *
     * The `previousResponse` parameter (`undefined` on the first call) allows you to build your request with incremental logic, to iterate on `page` or `cursor` for example.
     */
    func: (previousResponse?: TResponse | undefined) => Promise<TResponse>;
    /**
     * The validator function. It receive the resolved return of the API call.
     */
    validate: (response: TResponse) => boolean | PromiseLike<boolean>;
};

declare function createBrowserLocalStorageCache(options: BrowserLocalStorageOptions): Cache;

declare function createFallbackableCache(options: FallbackableCacheOptions): Cache;

declare function createMemoryCache(options?: MemoryCacheOptions): Cache;

declare function createNullCache(): Cache;

declare const DEFAULT_CONNECT_TIMEOUT_BROWSER = 1000;
declare const DEFAULT_READ_TIMEOUT_BROWSER = 2000;
declare const DEFAULT_WRITE_TIMEOUT_BROWSER = 30000;
declare const DEFAULT_CONNECT_TIMEOUT_NODE = 2000;
declare const DEFAULT_READ_TIMEOUT_NODE = 5000;
declare const DEFAULT_WRITE_TIMEOUT_NODE = 30000;

declare function createAlgoliaAgent(version: string): AlgoliaAgent;

declare function createAuth(appId: string, apiKey: string, authMode?: AuthMode): {
    readonly headers: () => Headers;
    readonly queryParameters: () => QueryParameters;
};

/**
 * Helper: Returns the promise of a given `func` to iterate on, based on a given `validate` condition.
 *
 * @param createIterator - The createIterator options.
 * @param createIterator.func - The function to run, which returns a promise.
 * @param createIterator.validate - The validator function. It receives the resolved return of `func`.
 * @param createIterator.aggregator - The function that runs right after the `func` method has been executed, allows you to do anything with the response before `validate`.
 * @param createIterator.error - The `validate` condition to throw an error, and its message.
 * @param createIterator.timeout - The function to decide how long to wait between iterations.
 */
declare function createIterablePromise<TResponse>({ func, validate, aggregator, error, timeout, }: CreateIterablePromise<TResponse>): Promise<TResponse>;

type GetAlgoliaAgent = {
    algoliaAgents: AlgoliaAgentOptions[];
    client: string;
    version: string;
};
declare function getAlgoliaAgent({ algoliaAgents, client, version }: GetAlgoliaAgent): AlgoliaAgent;

declare function createNullLogger(): Logger;

declare function createStatefulHost(host: Host, status?: StatefulHost['status']): StatefulHost;

declare function createTransporter({ hosts, hostsCache, baseHeaders, logger, baseQueryParameters, algoliaAgent, timeouts, requester, requestsCache, responsesCache, }: TransporterOptions): Transporter;

declare class AlgoliaError extends Error {
    name: string;
    constructor(message: string, name: string);
}
declare class IndexNotFoundError extends AlgoliaError {
    constructor(indexName: string);
}
declare class IndicesInSameAppError extends AlgoliaError {
    constructor();
}
declare class IndexAlreadyExistsError extends AlgoliaError {
    constructor(indexName: string);
}
declare class ErrorWithStackTrace extends AlgoliaError {
    stackTrace: StackFrame[];
    constructor(message: string, stackTrace: StackFrame[], name: string);
}
declare class RetryError extends ErrorWithStackTrace {
    constructor(stackTrace: StackFrame[]);
}
declare class ApiError extends ErrorWithStackTrace {
    status: number;
    constructor(message: string, status: number, stackTrace: StackFrame[], name?: string);
}
declare class DeserializationError extends AlgoliaError {
    response: Response;
    constructor(message: string, response: Response);
}
type DetailedErrorWithMessage = {
    message: string;
    label: string;
};
type DetailedErrorWithTypeID = {
    id: string;
    type: string;
    name?: string | undefined;
};
type DetailedError = {
    code: string;
    details?: DetailedErrorWithMessage[] | DetailedErrorWithTypeID[] | undefined;
};
declare class DetailedApiError extends ApiError {
    error: DetailedError;
    constructor(message: string, status: number, error: DetailedError, stackTrace: StackFrame[]);
}

declare function shuffle<TData>(array: TData[]): TData[];
declare function serializeUrl(host: Host, path: string, queryParameters: QueryParameters): string;
declare function serializeQueryParameters(parameters: QueryParameters): string;
declare function serializeData(request: Request, requestOptions: RequestOptions): string | undefined;
declare function serializeHeaders(baseHeaders: Headers, requestHeaders: Headers, requestOptionsHeaders?: Headers | undefined): Headers;
declare function deserializeSuccess<TObject>(response: Response): TObject;
declare function deserializeFailure({ content, status }: Response, stackFrame: StackFrame[]): Error;

declare function isNetworkError({ isTimedOut, status }: Omit<Response, 'content'>): boolean;
declare function isRetryable({ isTimedOut, status }: Omit<Response, 'content'>): boolean;
declare function isSuccess({ status }: Pick<Response, 'status'>): boolean;

declare function stackTraceWithoutCredentials(stackTrace: StackFrame[]): StackFrame[];
declare function stackFrameWithoutCredentials(stackFrame: StackFrame): StackFrame;

export { type AlgoliaAgent, type AlgoliaAgentOptions, AlgoliaError, ApiError, type AuthMode, type BrowserLocalStorageCacheItem, type BrowserLocalStorageOptions, type Cache, type CacheEvents, type ClientOptions, type CreateClientOptions, type CreateIterablePromise, DEFAULT_CONNECT_TIMEOUT_BROWSER, DEFAULT_CONNECT_TIMEOUT_NODE, DEFAULT_READ_TIMEOUT_BROWSER, DEFAULT_READ_TIMEOUT_NODE, DEFAULT_WRITE_TIMEOUT_BROWSER, DEFAULT_WRITE_TIMEOUT_NODE, DeserializationError, DetailedApiError, type DetailedError, type DetailedErrorWithMessage, type DetailedErrorWithTypeID, type EndRequest, ErrorWithStackTrace, type FallbackableCacheOptions, type GetAlgoliaAgent, type Headers, type Host, IndexAlreadyExistsError, IndexNotFoundError, IndicesInSameAppError, type IterableOptions, LogLevelEnum, type LogLevelType, type Logger, type MemoryCacheOptions, type Method, type QueryParameters, type Request, type RequestOptions, type Requester, type Response, RetryError, type StackFrame, type StatefulHost, type Timeouts, type Transporter, type TransporterOptions, createAlgoliaAgent, createAuth, createBrowserLocalStorageCache, createFallbackableCache, createIterablePromise, createMemoryCache, createNullCache, createNullLogger, createStatefulHost, createTransporter, deserializeFailure, deserializeSuccess, getAlgoliaAgent, isNetworkError, isRetryable, isSuccess, serializeData, serializeHeaders, serializeQueryParameters, serializeUrl, shuffle, stackFrameWithoutCredentials, stackTraceWithoutCredentials };
