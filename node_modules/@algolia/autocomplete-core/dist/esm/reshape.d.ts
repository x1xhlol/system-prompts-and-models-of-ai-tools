import { AutocompleteCollection, AutocompleteState, BaseItem, InternalAutocompleteOptions } from './types';
declare type ReshapeParams<TItem extends BaseItem> = {
    collections: Array<AutocompleteCollection<any>>;
    props: InternalAutocompleteOptions<TItem>;
    state: AutocompleteState<TItem>;
};
export declare function reshape<TItem extends BaseItem>({ collections, props, state, }: ReshapeParams<TItem>): {
    source: import("@algolia/autocomplete-shared/dist/esm/core/AutocompleteReshape").AutocompleteReshapeSource<TItem>;
    items: TItem[];
}[];
export {};
