/**
 * Returns a full element id for an autocomplete element.
 *
 * @param autocompleteInstanceId The id of the autocomplete instance
 * @param elementId The specific element id
 * @param source The source of the element, when it needs to be scoped
 */
export function getAutocompleteElementId(autocompleteInstanceId, elementId, source) {
  return [autocompleteInstanceId, source === null || source === void 0 ? void 0 : source.sourceId, elementId].filter(Boolean).join('-').replace(/\s/g, '');
}