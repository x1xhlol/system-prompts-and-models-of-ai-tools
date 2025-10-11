import { BaseItem } from './AutocompleteApi';
import { AutocompleteState } from './AutocompleteState';
export interface AutocompleteNavigator<TItem extends BaseItem> {
    /**
     * Called when a URL should be open in the current page.
     */
    navigate(params: {
        itemUrl: string;
        item: TItem;
        state: AutocompleteState<TItem>;
    }): void;
    /**
     * Called when a URL should be open in a new tab.
     */
    navigateNewTab(params: {
        itemUrl: string;
        item: TItem;
        state: AutocompleteState<TItem>;
    }): void;
    /**
     * Called when a URL should be open in a new window.
     */
    navigateNewWindow(params: {
        itemUrl: string;
        item: TItem;
        state: AutocompleteState<TItem>;
    }): void;
}
