import { BaseItem } from './AutocompleteApi';
import { AutocompleteCollection, AutocompleteCollectionItemsArray } from './AutocompleteCollection';
import { AutocompleteState } from './AutocompleteState';
export declare type StateUpdater<TState> = (value: TState) => void;
export interface AutocompleteSetters<TItem extends BaseItem> {
    /**
     * Sets the highlighted item index.
     *
     * Pass `null` to unselect items.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/state/#param-setactiveitemid
     */
    setActiveItemId: StateUpdater<AutocompleteState<TItem>['activeItemId']>;
    /**
     * Sets the query.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/state/#param-setquery
     */
    setQuery: StateUpdater<AutocompleteState<TItem>['query']>;
    /**
     * Sets the collections.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/state/#param-setcollections
     */
    setCollections: StateUpdater<Array<AutocompleteCollection<TItem> | AutocompleteCollectionItemsArray<TItem>>>;
    /**
     * Sets whether the panel is open or not.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/state/#param-setisopen
     */
    setIsOpen: StateUpdater<AutocompleteState<TItem>['isOpen']>;
    /**
     * Sets the status of the autocomplete.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/state/#param-setisopen
     */
    setStatus: StateUpdater<AutocompleteState<TItem>['status']>;
    /**
     * Sets the context passed to lifecycle hooks.
     *
     * See more in [**Context**](https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/context/).
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/state/#param-setcontext
     */
    setContext: StateUpdater<AutocompleteState<TItem>['context']>;
}
