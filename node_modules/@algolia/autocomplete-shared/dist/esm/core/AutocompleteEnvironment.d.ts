export declare type AutocompleteEnvironment = Window | {
    [prop: string]: unknown;
    addEventListener: Window['addEventListener'];
    removeEventListener: Window['removeEventListener'];
    setTimeout: Window['setTimeout'];
    clearTimeout: Window['clearTimeout'];
    document: Window['document'];
    location: {
        assign: Location['assign'];
    };
    open: Window['open'];
    navigator?: Partial<Window['navigator']>;
};
