import { BaseItem } from '../core';
import { AutocompletePlugin as AutocompleteCorePlugin } from '../core/AutocompletePlugin';
import { AutocompleteOptions } from './AutocompleteOptions';
export declare type AutocompletePlugin<TItem extends BaseItem, TData> = Omit<AutocompleteCorePlugin<TItem, TData>, 'getSources'> & {
    /**
     * The [sources](https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/sources/) to get the suggestions from.
     *
     * When defined, they’re merged with the sources of your Autocomplete instance.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/plugins/#param-getsources
     */
    getSources?: AutocompleteOptions<TItem>['getSources'];
};
