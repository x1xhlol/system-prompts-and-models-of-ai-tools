import { AutocompleteScopeApi, BaseItem } from '../core';
import { AutocompleteComponents } from './AutocompleteComponents';
import { HTMLTemplate, Pragma, PragmaFrag, Render, VNode } from './AutocompleteRenderer';
import { AutocompleteState } from './AutocompleteState';
export declare type AutocompleteRender<TItem extends BaseItem> = (params: AutocompleteScopeApi<TItem> & {
    children: VNode;
    state: AutocompleteState<TItem>;
    sections: VNode[];
    elements: Record<string, VNode>;
    components: AutocompleteComponents;
    createElement: Pragma;
    Fragment: PragmaFrag;
    html: HTMLTemplate;
    render: Render;
}, root: HTMLElement) => void;
