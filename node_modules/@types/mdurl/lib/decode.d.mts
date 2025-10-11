declare const decode: {
    defaultChars: string;
    componentChars: string;
    /**
     * Decode percent-encoded string.
     */
    (str: string, exclude?: string): string;
};

export default decode;
