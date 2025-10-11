import { BaseItem } from './AutocompleteApi';
import { AutocompleteSource } from './AutocompleteSource';
import { AutocompleteState } from './AutocompleteState';
export declare type AutocompleteReshapeSource<TItem extends BaseItem> = AutocompleteSource<TItem> & {
    getItems(): TItem[];
};
export declare type AutocompleteReshapeSourcesBySourceId<TItem extends BaseItem> = Record<string, AutocompleteReshapeSource<TItem>>;
export declare type ReshapeParams<TItem extends BaseItem, TState extends AutocompleteState<TItem> = AutocompleteState<TItem>> = {
    /**
     * The resolved sources provided by [`getSources`](https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/sources/#param-getsources)
     */
    sources: Array<AutocompleteReshapeSource<TItem>>;
    /**
     * The resolved sources grouped by [`sourceId`](https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/sources/#param-sourceid)s
     */
    sourcesBySourceId: AutocompleteReshapeSourcesBySourceId<TItem>;
    /**
     * The current Autocomplete state.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/state
     */
    state: TState;
};
export declare type Reshape<TItem extends BaseItem, TState extends AutocompleteState<TItem> = AutocompleteState<TItem>> = (params: ReshapeParams<TItem, TState>) => Array<AutocompleteReshapeSource<TItem>>;
export declare type PluginReshape<TItem extends BaseItem, TState extends AutocompleteState<TItem> = AutocompleteState<TItem>> = (params: Omit<ReshapeParams<TItem, TState>, 'sources'>) => Omit<ReshapeParams<TItem, TState>, 'sources'>;
