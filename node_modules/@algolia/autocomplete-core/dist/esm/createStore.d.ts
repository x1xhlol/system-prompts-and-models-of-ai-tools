import { AutocompleteState, AutocompleteStore, BaseItem, InternalAutocompleteOptions, Reducer } from './types';
declare type OnStoreStateChange<TItem extends BaseItem> = ({ prevState, state, }: {
    prevState: AutocompleteState<TItem>;
    state: AutocompleteState<TItem>;
}) => void;
export declare function createStore<TItem extends BaseItem>(reducer: Reducer, props: InternalAutocompleteOptions<TItem>, onStoreStateChange: OnStoreStateChange<TItem>): AutocompleteStore<TItem>;
export {};
