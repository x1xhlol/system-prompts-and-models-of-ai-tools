import http from 'http';
import https from 'https';
import { Requester } from '@algolia/client-common';

type CreateHttpRequesterOptions = Partial<{
    agent: http.Agent | https.Agent;
    httpAgent: http.Agent;
    httpsAgent: https.Agent;
    /**
     * RequestOptions to be merged with the end request, it will override default options if provided.
     */
    requesterOptions: https.RequestOptions;
}>;
declare function createHttpRequester({ agent: userGlobalAgent, httpAgent: userHttpAgent, httpsAgent: userHttpsAgent, requesterOptions, }?: CreateHttpRequesterOptions): Requester;

export { type CreateHttpRequesterOptions, createHttpRequester };
