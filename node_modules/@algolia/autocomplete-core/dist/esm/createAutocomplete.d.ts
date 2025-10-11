import { AutocompleteApi, AutocompleteOptions as AutocompleteCoreOptions, BaseItem } from './types';
export interface AutocompleteOptionsWithMetadata<TItem extends BaseItem> extends AutocompleteCoreOptions<TItem> {
    /**
     * @internal
     */
    __autocomplete_metadata?: Record<string, unknown>;
}
export declare function createAutocomplete<TItem extends BaseItem, TEvent = Event, TMouseEvent = MouseEvent, TKeyboardEvent = KeyboardEvent>(options: AutocompleteOptionsWithMetadata<TItem>): AutocompleteApi<TItem, TEvent, TMouseEvent, TKeyboardEvent>;
