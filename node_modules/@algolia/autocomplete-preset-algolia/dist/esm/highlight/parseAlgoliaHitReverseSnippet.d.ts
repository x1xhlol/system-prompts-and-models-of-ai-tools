import { ParseAlgoliaHitParams } from './ParseAlgoliaHitParams';
import { ParsedAttribute } from './ParsedAttribute';
import { SnippetedHit } from './SnippetedHit';
export declare function parseAlgoliaHitReverseSnippet<THit extends SnippetedHit<unknown>>(props: ParseAlgoliaHitParams<THit>): ParsedAttribute[];
