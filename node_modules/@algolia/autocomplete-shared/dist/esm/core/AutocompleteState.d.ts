import { BaseItem } from './AutocompleteApi';
import { AutocompleteCollection } from './AutocompleteCollection';
import { AutocompleteContext } from './AutocompleteContext';
export interface AutocompleteState<TItem extends BaseItem> {
    activeItemId: number | null;
    query: string;
    completion: string | null;
    collections: Array<AutocompleteCollection<TItem>>;
    isOpen: boolean;
    status: 'idle' | 'loading' | 'stalled' | 'error';
    context: AutocompleteContext;
}
