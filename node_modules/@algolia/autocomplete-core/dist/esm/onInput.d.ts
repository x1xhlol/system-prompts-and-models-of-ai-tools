import { AutocompleteScopeApi, AutocompleteState, AutocompleteStore, BaseItem, InternalAutocompleteOptions } from './types';
import { CancelablePromise } from './utils';
interface OnInputParams<TItem extends BaseItem> extends AutocompleteScopeApi<TItem> {
    event: any;
    /**
     * The next partial state to apply after the function is called.
     *
     * This is useful when we call `onInput` in a different scenario than an
     * actual input. For example, we use `onInput` when we click on an item,
     * but we want to close the panel in that case.
     */
    nextState?: Partial<AutocompleteState<TItem>>;
    props: InternalAutocompleteOptions<TItem>;
    query: string;
    store: AutocompleteStore<TItem>;
}
export declare function onInput<TItem extends BaseItem>({ event, nextState, props, query, refresh, store, ...setters }: OnInputParams<TItem>): CancelablePromise<void>;
export {};
