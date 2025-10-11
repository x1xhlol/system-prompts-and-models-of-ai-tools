import { BaseItem, GetSources, GetSourcesParams, InternalGetSources } from '../types';
export declare function getNormalizedSources<TItem extends BaseItem>(getSources: GetSources<TItem>, params: GetSourcesParams<TItem>): ReturnType<InternalGetSources<TItem>>;
