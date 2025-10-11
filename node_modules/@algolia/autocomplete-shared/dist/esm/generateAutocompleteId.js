var autocompleteId = 0;
export function generateAutocompleteId() {
  return "autocomplete-".concat(autocompleteId++);
}