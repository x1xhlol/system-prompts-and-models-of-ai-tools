import { AutocompleteOptions, AutocompleteSubscribers, BaseItem, InternalAutocompleteOptions } from './types';
export declare function getDefaultProps<TItem extends BaseItem>(props: AutocompleteOptions<TItem>, pluginSubscribers: AutocompleteSubscribers<TItem>): InternalAutocompleteOptions<TItem>;
