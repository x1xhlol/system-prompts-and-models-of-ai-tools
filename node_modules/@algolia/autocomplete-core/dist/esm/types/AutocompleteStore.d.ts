import { CancelablePromiseList } from '../utils';
import { BaseItem, InternalAutocompleteOptions, AutocompleteState } from './';
export interface AutocompleteStore<TItem extends BaseItem> {
    getState(): AutocompleteState<TItem>;
    dispatch(action: ActionType, payload: any): void;
    pendingRequests: CancelablePromiseList<void>;
}
export declare type Reducer = <TItem extends BaseItem>(state: AutocompleteState<TItem>, action: Action<TItem, any>) => AutocompleteState<TItem>;
declare type Action<TItem extends BaseItem, TPayload> = {
    type: ActionType;
    props: InternalAutocompleteOptions<TItem>;
    payload: TPayload;
};
export declare type ActionType = 'setActiveItemId' | 'setQuery' | 'setCollections' | 'setIsOpen' | 'setStatus' | 'setContext' | 'ArrowUp' | 'ArrowDown' | 'Escape' | 'Enter' | 'submit' | 'reset' | 'focus' | 'blur' | 'mousemove' | 'mouseleave' | 'click';
export {};
