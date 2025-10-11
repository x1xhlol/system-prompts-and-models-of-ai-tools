import { AutocompleteCollection, AutocompleteStore, BaseItem } from './types';
interface GetAutocompleteSettersOptions<TItem extends BaseItem> {
    store: AutocompleteStore<TItem>;
}
export declare function getAutocompleteSetters<TItem extends BaseItem>({ store, }: GetAutocompleteSettersOptions<TItem>): {
    setActiveItemId: import("@algolia/autocomplete-shared/dist/esm/core/AutocompleteSetters").StateUpdater<number | null>;
    setQuery: import("@algolia/autocomplete-shared/dist/esm/core/AutocompleteSetters").StateUpdater<string>;
    setCollections: import("@algolia/autocomplete-shared/dist/esm/core/AutocompleteSetters").StateUpdater<(AutocompleteCollection<TItem> | import("@algolia/autocomplete-shared/dist/esm/core/AutocompleteCollection").AutocompleteCollectionItemsArray<TItem>)[]>;
    setIsOpen: import("@algolia/autocomplete-shared/dist/esm/core/AutocompleteSetters").StateUpdater<boolean>;
    setStatus: import("@algolia/autocomplete-shared/dist/esm/core/AutocompleteSetters").StateUpdater<"idle" | "loading" | "stalled" | "error">;
    setContext: import("@algolia/autocomplete-shared/dist/esm/core/AutocompleteSetters").StateUpdater<import("@algolia/autocomplete-shared/dist/esm/core/AutocompleteContext").AutocompleteContext>;
};
export {};
