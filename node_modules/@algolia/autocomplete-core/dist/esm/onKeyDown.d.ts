import { AutocompleteScopeApi, AutocompleteStore, BaseItem, InternalAutocompleteOptions } from './types';
interface OnKeyDownOptions<TItem extends BaseItem> extends AutocompleteScopeApi<TItem> {
    event: KeyboardEvent;
    props: InternalAutocompleteOptions<TItem>;
    store: AutocompleteStore<TItem>;
}
export declare function onKeyDown<TItem extends BaseItem>({ event, props, refresh, store, ...setters }: OnKeyDownOptions<TItem>): void;
export {};
