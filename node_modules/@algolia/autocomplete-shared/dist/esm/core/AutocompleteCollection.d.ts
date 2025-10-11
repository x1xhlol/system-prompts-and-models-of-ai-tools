import { BaseItem } from './AutocompleteApi';
import { InternalAutocompleteSource } from './AutocompleteSource';
export interface AutocompleteCollection<TItem extends BaseItem> {
    source: InternalAutocompleteSource<TItem>;
    items: TItem[];
}
export interface AutocompleteCollectionItemsArray<TItem extends BaseItem> {
    source: InternalAutocompleteSource<TItem>;
    items: TItem[][];
}
