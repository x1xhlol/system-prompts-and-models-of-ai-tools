import { AutocompleteState, BaseItem } from './types';
interface GetCompletionProps<TItem extends BaseItem> {
    state: AutocompleteState<TItem>;
}
export declare function getCompletion<TItem extends BaseItem>({ state, }: GetCompletionProps<TItem>): string | null;
export {};
