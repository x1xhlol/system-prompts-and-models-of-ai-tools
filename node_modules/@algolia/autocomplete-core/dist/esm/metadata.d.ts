import { UserAgent } from '@algolia/autocomplete-shared';
import { AutocompleteEnvironment, AutocompleteOptionsWithMetadata, AutocompletePlugin, BaseItem } from '.';
declare type AutocompleteMetadata = {
    plugins: Array<{
        name: string | undefined;
        options: string[];
    }>;
    options: Record<string, string[]>;
    ua: UserAgent[];
};
declare type GetMetadataParams<TItem extends BaseItem, TData = unknown> = {
    plugins: Array<AutocompletePlugin<TItem, TData>>;
    options: AutocompleteOptionsWithMetadata<TItem>;
};
export declare function getMetadata<TItem extends BaseItem, TData = unknown>({ plugins, options, }: GetMetadataParams<TItem, TData>): {
    plugins: {
        name: string | undefined;
        options: string[];
    }[];
    options: {
        'autocomplete-core': string[];
    };
    ua: {
        segment: string;
        version: string;
    }[];
};
declare type InlineMetadataParams = {
    metadata: AutocompleteMetadata;
    environment: AutocompleteEnvironment;
};
export declare function injectMetadata({ metadata, environment, }: InlineMetadataParams): void;
export {};
