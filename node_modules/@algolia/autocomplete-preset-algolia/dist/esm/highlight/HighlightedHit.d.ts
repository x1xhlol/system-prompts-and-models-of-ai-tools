import { HighlightResult } from '../types';
export declare type HighlightedHit<THit> = THit & {
    _highlightResult?: HighlightResult<THit>;
};
