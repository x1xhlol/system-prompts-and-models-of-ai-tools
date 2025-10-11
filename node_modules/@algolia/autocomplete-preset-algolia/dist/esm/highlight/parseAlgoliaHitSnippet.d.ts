import { ParseAlgoliaHitParams } from './ParseAlgoliaHitParams';
import { ParsedAttribute } from './ParsedAttribute';
import { SnippetedHit } from './SnippetedHit';
export declare function parseAlgoliaHitSnippet<THit extends SnippetedHit<unknown>>({ hit, attribute, }: ParseAlgoliaHitParams<THit>): ParsedAttribute[];
