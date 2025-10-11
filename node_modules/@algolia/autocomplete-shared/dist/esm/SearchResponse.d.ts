import type { SearchResponse as ClientSearchResponse } from '@algolia/client-search';
export declare type SearchResponse<TObject> = ClientSearchResponse<TObject> & {
    _automaticInsights?: true;
};
