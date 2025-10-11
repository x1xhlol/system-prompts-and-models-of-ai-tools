import { Requester } from '@algolia/client-common';

type FetchRequesterOptions = {
    readonly requesterOptions?: RequestInit | undefined;
};
declare function createFetchRequester({ requesterOptions }?: FetchRequesterOptions): Requester;

export { type FetchRequesterOptions, createFetchRequester };
