/// <reference types="node" />

import http = require("http");

type Handler<Request extends http.IncomingMessage, Response extends http.ServerResponse> = (
    req: Request,
    res: Response,
    callback: (err?: Error) => void,
) => void;

declare namespace morgan {
    type FormatFn<
        Request extends http.IncomingMessage = http.IncomingMessage,
        Response extends http.ServerResponse = http.ServerResponse,
    > = (
        tokens: TokenIndexer<Request, Response>,
        req: Request,
        res: Response,
    ) => string | undefined | null;

    type TokenCallbackFn<
        Request extends http.IncomingMessage = http.IncomingMessage,
        Response extends http.ServerResponse = http.ServerResponse,
    > = (
        req: Request,
        res: Response,
        arg?: string | number | boolean,
    ) => string | undefined;

    interface TokenIndexer<
        Request extends http.IncomingMessage = http.IncomingMessage,
        Response extends http.ServerResponse = http.ServerResponse,
    > {
        [tokenName: string]: TokenCallbackFn<Request, Response>;
    }

    /**
     * Public interface of morgan logger.
     */
    interface Morgan<Request extends http.IncomingMessage, Response extends http.ServerResponse> {
        /***
         * Create a new morgan logger middleware function using the given format
         * and options. The format argument may be a string of a predefined name
         * (see below for the names), or a string of a format string containing
         * defined tokens.
         * @param format
         * @param options
         */
        (format: string, options?: Options<Request, Response>): Handler<Request, Response>;
        /***
         * Standard Apache combined log output.
         * :remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
         * @param format
         * @param options
         */
        (format: "combined", options?: Options<Request, Response>): Handler<Request, Response>;
        /***
         * Standard Apache common log output.
         * :remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length]
         * @param format
         * @param options
         */
        (format: "common", options?: Options<Request, Response>): Handler<Request, Response>;
        /**
         * Concise output colored by response status for development use. The
         * :status token will be colored red for server error codes, yellow for
         * client error codes, cyan for redirection codes, and uncolored for
         * all other codes.
         * :method :url :status :response-time ms - :res[content-length]
         */
        (format: "dev", options?: Options<Request, Response>): Handler<Request, Response>;

        /***
         * Shorter than default, also including response time.
         * :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
         * @param format
         * @param options
         */
        (format: "short", options?: Options<Request, Response>): Handler<Request, Response>;

        /***
         * The minimal output.
         * :method :url :status :res[content-length] - :response-time ms
         * @param format
         * @param options
         */
        (format: "tiny", options?: Options<Request, Response>): Handler<Request, Response>;

        /***
         * Create a new morgan logger middleware function using the given format
         * and options. The format argument may be a custom format function
         * which adheres to the signature.
         * @param format
         * @param options
         */
        (format: FormatFn<Request, Response>, options?: Options<Request, Response>): Handler<Request, Response>;

        /**
         * Define a custom token which can be used in custom morgan logging
         * formats.
         */
        token(name: string, callback: TokenCallbackFn<Request, Response>): Morgan<Request, Response>;
        /**
         * Define a named custom format by specifying a format string in token
         * notation.
         */
        format(name: string, fmt: string): Morgan<Request, Response>;

        /**
         * Define a named custom format by specifying a format function.
         */
        format(name: string, fmt: FormatFn<Request, Response>): Morgan<Request, Response>;

        /**
         * Compile a format string in token notation into a format function.
         */
        compile(format: string): FormatFn<Request, Response>;
    }

    /**
     * Define a custom token which can be used in custom morgan logging formats.
     */
    function token<
        Request extends http.IncomingMessage = http.IncomingMessage,
        Response extends http.ServerResponse = http.ServerResponse,
    >(
        name: string,
        callback: TokenCallbackFn<Request, Response>,
    ): Morgan<Request, Response>;

    /**
     * Define a named custom format by specifying a format string in token
     * notation.
     */
    function format<
        // eslint-disable-next-line @definitelytyped/no-unnecessary-generics
        Request extends http.IncomingMessage = http.IncomingMessage,
        // eslint-disable-next-line @definitelytyped/no-unnecessary-generics
        Response extends http.ServerResponse = http.ServerResponse,
    >(name: string, fmt: string): Morgan<Request, Response>;

    /**
     * Define a named custom format by specifying a format function.
     */
    function format<
        Request extends http.IncomingMessage = http.IncomingMessage,
        Response extends http.ServerResponse = http.ServerResponse,
    >(
        name: string,
        fmt: FormatFn<Request, Response>,
    ): Morgan<Request, Response>;

    /**
     * Compile a format string in token notation into a format function.
     */
    function compile<
        // eslint-disable-next-line @definitelytyped/no-unnecessary-generics
        Request extends http.IncomingMessage = http.IncomingMessage,
        // eslint-disable-next-line @definitelytyped/no-unnecessary-generics
        Response extends http.ServerResponse = http.ServerResponse,
    >(format: string): FormatFn<Request, Response>;

    interface StreamOptions {
        /**
         * Output stream for writing log lines.
         */
        write(str: string): void;
    }

    /***
     * Morgan accepts these properties in the options object.
     */
    interface Options<Request extends http.IncomingMessage, Response extends http.ServerResponse> {
        /***
         * Buffer duration before writing logs to the stream, defaults to false.
         * When set to true, defaults to 1000 ms.
         * @deprecated
         */
        buffer?: boolean | undefined;

        /***
         * Write log line on request instead of response. This means that a
         * requests will be logged even if the server crashes, but data from the
         * response cannot be logged (like the response code).
         */
        immediate?: boolean | undefined;

        /***
         * Function to determine if logging is skipped, defaults to false. This
         * function will be called as skip(req, res).
         */
        skip?(req: Request, res: Response): boolean;

        /***
         * Output stream for writing log lines, defaults to process.stdout.
         * @param str
         */
        stream?: StreamOptions | undefined;
    }
}

/***
 * Create a new morgan logger middleware function using the given format and
 * options. The format argument may be a string of a predefined name (see below
 * for the names), or a string of a format string containing defined tokens.
 * @param format
 * @param options
 */
declare function morgan<
    Request extends http.IncomingMessage = http.IncomingMessage,
    Response extends http.ServerResponse = http.ServerResponse,
>(
    format: string,
    options?: morgan.Options<Request, Response>,
): Handler<Request, Response>;

/***
 * Standard Apache combined log output.
 * :remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
 * @param format
 * @param options
 */
declare function morgan<
    Request extends http.IncomingMessage = http.IncomingMessage,
    Response extends http.ServerResponse = http.ServerResponse,
>(
    format: "combined",
    options?: morgan.Options<Request, Response>,
): Handler<Request, Response>;

/***
 * Standard Apache common log output.
 * :remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length]
 * @param format
 * @param options
 */
declare function morgan<
    Request extends http.IncomingMessage = http.IncomingMessage,
    Response extends http.ServerResponse = http.ServerResponse,
>(
    format: "common",
    options?: morgan.Options<Request, Response>,
): Handler<Request, Response>;

/***
 * Concise output colored by response status for development use. The :status
 * token will be colored red for server error codes, yellow for client error
 * codes, cyan for redirection codes, and uncolored for all other codes.
 * :method :url :status :response-time ms - :res[content-length]
 * @param format
 * @param options
 */
declare function morgan<
    Request extends http.IncomingMessage = http.IncomingMessage,
    Response extends http.ServerResponse = http.ServerResponse,
>(
    format: "dev",
    options?: morgan.Options<Request, Response>,
): Handler<Request, Response>;

/***
 * Shorter than default, also including response time.
 * :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
 * @param format
 * @param options
 */
declare function morgan<
    Request extends http.IncomingMessage = http.IncomingMessage,
    Response extends http.ServerResponse = http.ServerResponse,
>(
    format: "short",
    options?: morgan.Options<Request, Response>,
): Handler<Request, Response>;

/***
 * The minimal output.
 * :method :url :status :res[content-length] - :response-time ms
 * @param format
 * @param options
 */
declare function morgan<
    Request extends http.IncomingMessage = http.IncomingMessage,
    Response extends http.ServerResponse = http.ServerResponse,
>(
    format: "tiny",
    options?: morgan.Options<Request, Response>,
): Handler<Request, Response>;

/***
 * Create a new morgan logger middleware function using the given format and
 * options. The format argument may be a custom format function which adheres to
 * the signature.
 * @param format
 * @param options
 */
declare function morgan<
    Request extends http.IncomingMessage = http.IncomingMessage,
    Response extends http.ServerResponse = http.ServerResponse,
>(
    format: morgan.FormatFn<Request, Response>,
    options?: morgan.Options<Request, Response>,
): Handler<Request, Response>;

export = morgan;
