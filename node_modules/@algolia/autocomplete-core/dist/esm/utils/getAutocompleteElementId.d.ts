import type { InternalAutocompleteSource } from '../types';
/**
 * Returns a full element id for an autocomplete element.
 *
 * @param autocompleteInstanceId The id of the autocomplete instance
 * @param elementId The specific element id
 * @param source The source of the element, when it needs to be scoped
 */
export declare function getAutocompleteElementId(autocompleteInstanceId: string, elementId: string, source?: InternalAutocompleteSource<any>): string;
