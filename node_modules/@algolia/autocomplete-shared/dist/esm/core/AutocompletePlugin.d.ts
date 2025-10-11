import { AutocompleteScopeApi, BaseItem } from './AutocompleteApi';
import { AutocompleteOptions } from './AutocompleteOptions';
import { PluginReshape } from './AutocompleteReshape';
import { OnSelectParams, OnActiveParams, OnResolveParams } from './AutocompleteSource';
declare type PluginSubscriber<TParams> = (params: TParams) => void;
export interface PluginSubscribeParams<TItem extends BaseItem> extends AutocompleteScopeApi<TItem> {
    onSelect(fn: PluginSubscriber<OnSelectParams<TItem>>): void;
    onActive(fn: PluginSubscriber<OnActiveParams<TItem>>): void;
    onResolve(fn: PluginSubscriber<OnResolveParams<TItem>>): void;
}
export declare type AutocompletePlugin<TItem extends BaseItem, TData = unknown> = Partial<Pick<AutocompleteOptions<any>, 'onStateChange' | 'onSubmit' | 'onReset'> & Pick<AutocompleteOptions<TItem>, 'getSources'>> & {
    /**
     * The function called when Autocomplete starts.
     *
     * It lets you subscribe to lifecycle hooks and interact with the instance's state and context.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/plugins/#param-subscribe
     */
    subscribe?(params: PluginSubscribeParams<any>): void;
    /**
     * An extra plugin object to expose properties and functions as APIs.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/plugins/#param-data
     */
    data?: TData;
    /**
     * A name to identify the plugin.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/plugins/#param-name
     */
    name?: string;
    /**
     * A function to reshape the sources.
     *
     * It gets called before the user's reshape function.
     */
    reshape?: PluginReshape<TItem>;
    /**
     * @internal
     */
    __autocomplete_pluginOptions?: Record<string, any>;
};
export {};
