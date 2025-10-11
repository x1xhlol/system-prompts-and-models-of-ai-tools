declare class Url {
    protocol: string;
    slashes: string;
    auth: string;
    port: string;
    hostname: string;
    hash: string;
    search: string;
    pathname: string;

    constructor();

    parse(url: string, slashesDenoteHost?: boolean): this;
    parseHost(host: string): void;
}

type Url_ = Url;

declare namespace mdurl {
    type Url = Url_;
}

declare const mdurl: {
    decode: {
        defaultChars: string;
        componentChars: string;
        /**
         * Decode percent-encoded string.
         */
        (str: string, exclude?: string): string;
    };

    encode: {
        defaultChars: string;
        componentChars: string;
        /**
         * Encode unsafe characters with percent-encoding, skipping already
         * encoded sequences.
         *
         * @param str string to encode
         * @param exclude list of characters to ignore (in addition to a-zA-Z0-9)
         * @param keepEscaped don't encode '%' in a correct escape sequence (default: true)
         */
        (str: string, exclude?: string, keepEscaped?: boolean): string;
    };

    format(url: Omit<mdurl.Url, "parse" | "parseHost">): string;

    parse(url: string | mdurl.Url, slashesDenoteHost?: boolean): mdurl.Url;
};

export = mdurl;
