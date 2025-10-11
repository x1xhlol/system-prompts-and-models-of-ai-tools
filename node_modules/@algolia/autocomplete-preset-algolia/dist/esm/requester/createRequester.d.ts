import type { Fetcher, RequesterParams, RequestParams, RequesterDescription } from '../types';
export declare function createRequester(fetcher: Fetcher, requesterId?: string): (requesterParams: RequesterParams<any>) => <TTHit>(requestParams: RequestParams<TTHit>) => RequesterDescription<TTHit>;
