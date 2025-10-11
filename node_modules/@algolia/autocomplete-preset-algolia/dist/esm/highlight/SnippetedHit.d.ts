import { SnippetResult } from '../types';
export declare type SnippetedHit<THit> = THit & {
    _snippetResult?: SnippetResult<THit>;
};
