import { AutocompleteScopeApi, AutocompleteOptions as AutocompleteCoreOptions, BaseItem, GetSourcesParams } from '../core';
import { MaybePromise } from '../MaybePromise';
import { AutocompleteClassNames } from './AutocompleteClassNames';
import { PublicAutocompleteComponents } from './AutocompleteComponents';
import { AutocompletePlugin } from './AutocompletePlugin';
import { AutocompletePropGetters } from './AutocompletePropGetters';
import { AutocompleteRender } from './AutocompleteRender';
import { AutocompleteRenderer } from './AutocompleteRenderer';
import { AutocompleteSource } from './AutocompleteSource';
import { AutocompleteState } from './AutocompleteState';
import { AutocompleteTranslations } from './AutocompleteTranslations';
export interface OnStateChangeProps<TItem extends BaseItem> extends AutocompleteScopeApi<TItem> {
    /**
     * The current Autocomplete state.
     */
    state: AutocompleteState<TItem>;
    /**
     * The previous Autocomplete state.
     */
    prevState: AutocompleteState<TItem>;
}
export declare type GetSources<TItem extends BaseItem> = (params: GetSourcesParams<TItem>) => MaybePromise<Array<AutocompleteSource<TItem> | boolean | undefined>>;
export interface AutocompleteOptions<TItem extends BaseItem> extends AutocompleteCoreOptions<TItem>, Partial<AutocompletePropGetters<TItem>> {
    /**
     * The container for the Autocomplete search box.
     *
     * You can either pass a [CSS selector](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors) or an [Element](https://developer.mozilla.org/docs/Web/API/HTMLElement). If there are several containers matching the selector, Autocomplete picks up the first one.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-container
     */
    container: string | HTMLElement;
    /**
     * The container for the Autocomplete panel.
     *
     * You can either pass a [CSS selector](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors) or an [Element](https://developer.mozilla.org/docs/Web/API/HTMLElement). If there are several containers matching the selector, Autocomplete picks up the first one.
     *
     * @default document.body
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-panelcontainer
     */
    panelContainer?: string | HTMLElement;
    /**
     * The Media Query to turn Autocomplete into a detached experience.
     *
     * @default "(max-width: 680px)"
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-detachedmediaquery
     * @link https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
     */
    detachedMediaQuery?: string;
    getSources?: GetSources<TItem>;
    /**
     * The panel's horizontal position.
     *
     * @default "input-wrapper-width"
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-panelplacement
     */
    panelPlacement?: 'start' | 'end' | 'full-width' | 'input-wrapper-width';
    /**
     * Class names to inject for each created DOM element.
     *
     * This is useful to style your autocomplete with external CSS frameworks.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-classnames
     */
    classNames?: Partial<AutocompleteClassNames>;
    /**
     * The function that renders the autocomplete panel.
     *
     * This is useful to customize the rendering, for example, using multi-row or multi-column layouts.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-render
     */
    render?: AutocompleteRender<TItem>;
    /**
     * The function that renders a no results section when there are no hits.
     *
     * This is useful to let the user know that the query returned no results.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-rendernoresults
     */
    renderNoResults?: AutocompleteRender<TItem>;
    initialState?: Partial<AutocompleteState<TItem>>;
    onStateChange?(props: OnStateChangeProps<TItem>): void;
    /**
     * The virtual DOM implementation to plug to Autocomplete. It defaults to Preact.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-renderer
     */
    renderer?: AutocompleteRenderer;
    plugins?: Array<AutocompletePlugin<any, any>>;
    /**
     * Components to register in the Autocomplete rendering lifecycles.
     *
     * Registered components become available in [`templates`](https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/templates/), [`render`](https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-render), and in [`renderNoResults`](https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-rendernoresults).
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-components
     */
    components?: PublicAutocompleteComponents;
    /**
     * A mapping of translation strings.
     *
     * Defaults to English values.
     *
     * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-translations
     */
    translations?: Partial<AutocompleteTranslations>;
}
