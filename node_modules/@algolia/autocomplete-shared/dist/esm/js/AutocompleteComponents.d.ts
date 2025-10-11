/// <reference types="react" />
import { HighlightHitParams } from './HighlightHitParams';
declare type AutocompleteHighlightComponent = <THit>({ hit, attribute, tagName, }: HighlightHitParams<THit>) => JSX.Element;
export declare type PublicAutocompleteComponents = Record<string, (props: any) => JSX.Element>;
export interface AutocompleteComponents extends PublicAutocompleteComponents {
    /**
     * Highlight matches in an Algolia hit.
     */
    Highlight: AutocompleteHighlightComponent;
    /**
     * Reverse-highlight matches in an Algolia hit.
     */
    ReverseHighlight: AutocompleteHighlightComponent;
    /**
     * Reverse-highlight and snippets matches in an Algolia hit.
     */
    ReverseSnippet: AutocompleteHighlightComponent;
    /**
     * Highlight and snippet matches in an Algolia hit.
     */
    Snippet: AutocompleteHighlightComponent;
}
export {};
