declare const encode: {
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

export default encode;
