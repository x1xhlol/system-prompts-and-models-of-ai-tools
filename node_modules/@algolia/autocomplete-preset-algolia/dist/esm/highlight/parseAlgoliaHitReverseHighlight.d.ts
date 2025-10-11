import { HighlightedHit } from './HighlightedHit';
import { ParseAlgoliaHitParams } from './ParseAlgoliaHitParams';
import { ParsedAttribute } from './ParsedAttribute';
export declare function parseAlgoliaHitReverseHighlight<THit extends HighlightedHit<unknown>>(props: ParseAlgoliaHitParams<THit>): ParsedAttribute[];
