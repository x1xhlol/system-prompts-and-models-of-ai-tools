import type { Hit } from '@algolia/client-search';
import type { MaybePromise } from '../MaybePromise';
import type { FacetHit, SearchForFacetValuesResponse } from '../preset-algolia/algoliasearch';
import type { RequesterDescription } from '../preset-algolia/createRequester';
import type { SearchResponse } from '../SearchResponse';
import { AutocompleteScopeApi, BaseItem } from './AutocompleteApi';
import { GetSourcesParams } from './AutocompleteOptions';
import { AutocompleteState } from './AutocompleteState';
export interface OnSelectParams<TItem extends BaseItem> extends AutocompleteScopeApi<TItem> {
    state: AutocompleteState<TItem>;
    event: any;
    item: TItem;
    itemInputValue: ReturnType<InternalAutocompleteSource<TItem>['getItemInputValue']>;
    itemUrl: ReturnType<InternalAutocompleteSource<TItem>['getItemUrl']>;
    source: InternalAutocompleteSource<TItem>;
}
export declare type OnActiveParams<TItem extends BaseItem> = OnSelectParams<TItem>;
export declare type OnResolveParams<TItem extends BaseItem> = {
    source: AutocompleteSource<TItem>;
    results: SearchForFacetValuesResponse | SearchResponse<TItem> | TItem[] | TItem[][];
    items: FacetHit[][] | FacetHit[] | Array<Hit<TItem>> | Array<SearchForFacetValuesResponse | SearchResponse<TItem> | TItem[] | TItem[][]>;
    state: AutocompleteState<TItem>;
};
declare type DefaultIndicator = {
    /**
     * Optional key on a function to indicate it's the default value of this function.
     */
    __default?: boolean;
};
export interface AutocompleteSource<TItem extends BaseItem> {
    /**
     * Unique identifier for the source.
     */
    sourceId: string;
    /**
     * The function called to get the value of an item.
     *
     * The value is used to fill the search box.
     */
    getItemInputValue?: DefaultIndicator & (({ item, state, }: {
        item: TItem;
        state: AutocompleteState<TItem>;
    }) => string);
    /**
     * The function called to get the URL of the item.
     *
     * The value is used to add [keyboard accessibility](https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/keyboard-navigation/) features to let users open items in the current tab, a new tab, or a new window.
     */
    getItemUrl?: DefaultIndicator & (({ item, state, }: {
        item: TItem;
        state: AutocompleteState<TItem>;
    }) => string | undefined);
    /**
     * The function called when the input changes.
     *
     * You can use this function to filter the items based on the query.
     */
    getItems(params: GetSourcesParams<TItem>): MaybePromise<TItem[] | TItem[][] | RequesterDescription<TItem>>;
    /**
     * The function called whenever an item is selected.
     */
    onSelect?: DefaultIndicator & ((params: OnSelectParams<TItem>) => void);
    /**
     * The function called whenever an item is active.
     *
     * You can trigger different behaviors if the item is active depending on the triggering event using the `event` parameter.
     */
    onActive?: DefaultIndicator & ((params: OnActiveParams<TItem>) => void);
    /**
     * The function called whenever a source resolves.
     */
    onResolve?: DefaultIndicator & ((params: OnResolveParams<TItem>) => void);
}
export declare type InternalAutocompleteSource<TItem extends BaseItem> = {
    [KParam in keyof AutocompleteSource<TItem>]-?: AutocompleteSource<TItem>[KParam];
};
export {};
