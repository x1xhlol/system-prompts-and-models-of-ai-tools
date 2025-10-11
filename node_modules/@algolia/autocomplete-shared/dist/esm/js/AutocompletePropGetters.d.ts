import { BaseItem, AutocompleteApi as AutocompleteCoreApi, AutocompleteScopeApi } from '../core';
import { AutocompleteState } from './AutocompleteState';
declare type PropsGetterParams<TItem extends BaseItem, TParam> = TParam & {
    state: AutocompleteState<TItem>;
} & AutocompleteScopeApi<TItem>;
export declare type AutocompletePropGetters<TItem extends BaseItem> = {
    getEnvironmentProps(params: PropsGetterParams<TItem, {
        props: ReturnType<AutocompleteCoreApi<TItem>['getEnvironmentProps']>;
    }>): ReturnType<AutocompleteCoreApi<TItem>['getEnvironmentProps']>;
    getFormProps(params: PropsGetterParams<TItem, {
        props: ReturnType<AutocompleteCoreApi<TItem>['getFormProps']>;
    }>): ReturnType<AutocompleteCoreApi<TItem>['getFormProps']>;
    getInputProps(params: PropsGetterParams<TItem, {
        props: ReturnType<AutocompleteCoreApi<TItem>['getInputProps']>;
        inputElement: HTMLInputElement;
    }>): ReturnType<AutocompleteCoreApi<TItem>['getInputProps']>;
    getItemProps(params: PropsGetterParams<TItem, {
        props: ReturnType<AutocompleteCoreApi<TItem>['getItemProps']>;
    }>): ReturnType<AutocompleteCoreApi<TItem>['getItemProps']>;
    getLabelProps(params: PropsGetterParams<TItem, {
        props: ReturnType<AutocompleteCoreApi<TItem>['getLabelProps']>;
    }>): ReturnType<AutocompleteCoreApi<TItem>['getLabelProps']>;
    getListProps(params: PropsGetterParams<TItem, {
        props: ReturnType<AutocompleteCoreApi<TItem>['getListProps']>;
    }>): ReturnType<AutocompleteCoreApi<TItem>['getListProps']>;
    getPanelProps(params: PropsGetterParams<TItem, {
        props: ReturnType<AutocompleteCoreApi<TItem>['getPanelProps']>;
    }>): ReturnType<AutocompleteCoreApi<TItem>['getPanelProps']>;
    getRootProps(params: PropsGetterParams<TItem, {
        props: ReturnType<AutocompleteCoreApi<TItem>['getRootProps']>;
    }>): ReturnType<AutocompleteCoreApi<TItem>['getRootProps']>;
};
export {};
