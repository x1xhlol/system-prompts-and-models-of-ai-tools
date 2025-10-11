import { parseAlgoliaHitSnippet } from './parseAlgoliaHitSnippet';
import { reverseHighlightedParts } from './reverseHighlightedParts';
export function parseAlgoliaHitReverseSnippet(props) {
  return reverseHighlightedParts(parseAlgoliaHitSnippet(props));
}