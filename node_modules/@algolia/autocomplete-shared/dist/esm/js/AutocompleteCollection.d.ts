import { BaseItem } from '../core';
import { InternalAutocompleteSource } from './AutocompleteSource';
export interface AutocompleteCollection<TItem extends BaseItem> {
    source: InternalAutocompleteSource<TItem>;
    items: TItem[];
}
