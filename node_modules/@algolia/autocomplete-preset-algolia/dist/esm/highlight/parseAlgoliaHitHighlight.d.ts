import { HighlightedHit } from './HighlightedHit';
import { ParseAlgoliaHitParams } from './ParseAlgoliaHitParams';
import { ParsedAttribute } from './ParsedAttribute';
export declare function parseAlgoliaHitHighlight<THit extends HighlightedHit<unknown>>({ hit, attribute, }: ParseAlgoliaHitParams<THit>): ParsedAttribute[];
