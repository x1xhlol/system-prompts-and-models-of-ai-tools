export declare type HighlightHitParams<THit> = {
    /**
     * The Algolia hit whose attribute to retrieve the highlighted parts from.
     */
    hit: THit;
    /**
     * The attribute to retrieve the highlighted parts from.
     *
     * You can use the array syntax to reference nested attributes.
     */
    attribute: keyof THit | Array<string | number>;
    /**
     * The tag name to use for highlighted parts.
     *
     * @default "mark"
     */
    tagName?: string;
};
