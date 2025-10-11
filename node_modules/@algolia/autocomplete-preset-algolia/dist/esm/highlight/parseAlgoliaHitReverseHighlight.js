import { parseAlgoliaHitHighlight } from './parseAlgoliaHitHighlight';
import { reverseHighlightedParts } from './reverseHighlightedParts';
export function parseAlgoliaHitReverseHighlight(props) {
  return reverseHighlightedParts(parseAlgoliaHitHighlight(props));
}