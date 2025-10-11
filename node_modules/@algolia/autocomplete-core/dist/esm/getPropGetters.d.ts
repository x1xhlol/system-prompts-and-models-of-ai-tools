import { AutocompleteScopeApi, AutocompleteStore, BaseItem, GetEnvironmentProps, GetFormProps, GetInputProps, GetItemProps, GetLabelProps, GetListProps, GetPanelProps, GetRootProps, InternalAutocompleteOptions } from './types';
interface GetPropGettersOptions<TItem extends BaseItem> extends AutocompleteScopeApi<TItem> {
    store: AutocompleteStore<TItem>;
    props: InternalAutocompleteOptions<TItem>;
}
export declare function getPropGetters<TItem extends BaseItem, TEvent, TMouseEvent, TKeyboardEvent>({ props, refresh, store, ...setters }: GetPropGettersOptions<TItem>): {
    getEnvironmentProps: GetEnvironmentProps;
    getRootProps: GetRootProps;
    getFormProps: GetFormProps<TEvent>;
    getLabelProps: GetLabelProps;
    getInputProps: GetInputProps<TEvent, TMouseEvent, TKeyboardEvent>;
    getPanelProps: GetPanelProps<TMouseEvent>;
    getListProps: GetListProps;
    getItemProps: GetItemProps<any, TMouseEvent>;
};
export {};
