# Anthropic TypeScript API Library

[![NPM version](https://img.shields.io/npm/v/@anthropic-ai/sdk.svg)](https://npmjs.org/package/@anthropic-ai/sdk)

This library provides convenient access to the Anthropic REST API from server-side TypeScript or JavaScript.

For the AWS Bedrock API, see [`@anthropic-ai/bedrock-sdk`](https://github.com/anthropics/anthropic-bedrock-typescript).

## Migration from v0.4.x and below

In `v0.5.0`, we introduced a fully rewritten SDK. The new version offers better error handling, a more robust and intuitive streaming implementation, and more.

Key interface changes:

1. `new Client(apiKey)` → `new Anthropic({ apiKey })`
2. `client.complete()` → `client.completions.create()`
3. `client.completeStream()` → `client.completions.create({ stream: true })`
   1. `onUpdate` callback → `for await (const x of stream)`
   2. full message in stream → delta of message in stream

<details>
<summary>Example diff</summary>

```diff ts
  // Import "Anthropic" instead of "Client":
- import { Client, HUMAN_PROMPT, AI_PROMPT } from '@anthropic-ai/sdk';
+ import Anthropic, { HUMAN_PROMPT, AI_PROMPT } from '@anthropic-ai/sdk';

  // Instantiate with "apiKey" as an object property:
- const client = new Client(apiKey);
+ const client = new Anthropic({ apiKey });
  // or, simply provide an ANTHROPIC_API_KEY environment variable:
+ const client = new Anthropic();

  async function main() {
    // Request & response types are the same as before, but better-typed.
    const params = {
      prompt: `${HUMAN_PROMPT} How many toes do dogs have?${AI_PROMPT}`,
      max_tokens_to_sample: 200,
      model: "claude-1",
    };

    // Instead of "client.complete()", you now call "client.completions.create()":
-   await client.complete(params);
+   await client.completions.create(params);

    // Streaming requests now use async iterators instead of callbacks:
-   client.completeStream(params, {
-     onUpdate: (completion) => {
-       console.log(completion.completion); // full text
-     },
-   });
+   const stream = await client.completions.create({ ...params, stream: true });
+   for await (const completion of stream) {
+     process.stdout.write(completion.completion); // incremental text
+   }

    // And, since this library uses `Anthropic-Version: 2023-06-01`,
    // completion streams are now incremental diffs of text
    // rather than sending the whole message every time:
    let text = '';
-   await client.completeStream(params, {
-     onUpdate: (completion) => {
-       const diff = completion.completion.replace(text, "");
-       text = completion.completion;
-       process.stdout.write(diff);
-     },
-   });
+   const stream = await client.completions.create({ ...params, stream: true });
+   for await (const completion of stream) {
+     const diff = completion.completion;
+     text += diff;
+     process.stdout.write(diff);
+   }
    console.log('Done; final text is:')
    console.log(text)
  }
  main();
```

</details>

The API documentation can be found [here](https://docs.anthropic.com/claude/reference/).

## Installation

```sh
npm install --save @anthropic-ai/sdk
# or
yarn add @anthropic-ai/sdk
```

## Usage

The full API of this library can be found in [api.md](https://www.github.com/anthropics/anthropic-sdk-typescript/blob/main/api.md).

```js
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: 'my api key', // defaults to process.env["ANTHROPIC_API_KEY"]
});

async function main() {
  const completion = await anthropic.completions.create({
    model: 'claude-2',
    max_tokens_to_sample: 300,
    prompt: `${Anthropic.HUMAN_PROMPT} how does a court case get to the Supreme Court?${Anthropic.AI_PROMPT}`,
  });
}

main();
```

## Streaming Responses

We provide support for streaming responses using Server Sent Events (SSE).

```ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const stream = await anthropic.completions.create({
  prompt: `${Anthropic.HUMAN_PROMPT} Your prompt here${Anthropic.AI_PROMPT}`,
  model: 'claude-2',
  stream: true,
  max_tokens_to_sample: 300,
});
for await (const completion of stream) {
  console.log(completion.completion);
}
```

If you need to cancel a stream, you can `break` from the loop
or call `stream.controller.abort()`.

### Request & Response types

This library includes TypeScript definitions for all request params and response fields. You may import and use them like so:

```ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: 'my api key', // defaults to process.env["ANTHROPIC_API_KEY"]
});

async function main() {
  const params: Anthropic.CompletionCreateParams = {
    prompt: `${Anthropic.HUMAN_PROMPT} how does a court case get to the Supreme Court?${Anthropic.AI_PROMPT}`,
    max_tokens_to_sample: 300,
    model: 'claude-2',
  };
  const completion: Anthropic.Completion = await anthropic.completions.create(params);
}

main();
```

Documentation for each method, request param, and response field are available in docstrings and will appear on hover in most modern editors.

## Counting Tokens

We provide a [separate package](https://github.com/anthropics/anthropic-tokenizer-typescript) for counting how many tokens a given piece of text contains.

See the [repository documentation](https://github.com/anthropics/anthropic-tokenizer-typescript) for more details.

## Handling errors

When the library is unable to connect to the API,
or if the API returns a non-success status code (i.e., 4xx or 5xx response),
a subclass of `APIError` will be thrown:

```ts
async function main() {
  const completion = await anthropic.completions
    .create({
      prompt: `${Anthropic.HUMAN_PROMPT} Your prompt here${Anthropic.AI_PROMPT}`,
      max_tokens_to_sample: 300,
      model: 'claude-2',
    })
    .catch((err) => {
      if (err instanceof Anthropic.APIError) {
        console.log(err.status); // 400
        console.log(err.name); // BadRequestError
        console.log(err.headers); // {server: 'nginx', ...}
      } else {
        throw err;
      }
    });
}

main();
```

Error codes are as followed:

| Status Code | Error Type                 |
| ----------- | -------------------------- |
| 400         | `BadRequestError`          |
| 401         | `AuthenticationError`      |
| 403         | `PermissionDeniedError`    |
| 404         | `NotFoundError`            |
| 422         | `UnprocessableEntityError` |
| 429         | `RateLimitError`           |
| >=500       | `InternalServerError`      |
| N/A         | `APIConnectionError`       |

### Retries

Certain errors will be automatically retried 2 times by default, with a short exponential backoff.
Connection errors (for example, due to a network connectivity problem), 408 Request Timeout, 409 Conflict,
429 Rate Limit, and >=500 Internal errors will all be retried by default.

You can use the `maxRetries` option to configure or disable this:

<!-- prettier-ignore -->
```js
// Configure the default for all requests:
const anthropic = new Anthropic({
  maxRetries: 0, // default is 2
});

// Or, configure per-request:
await anthropic.completions.create(
  {
    prompt: `${Anthropic.HUMAN_PROMPT} Can you help me effectively ask for a raise at work?${Anthropic.AI_PROMPT}`,
    max_tokens_to_sample: 300,
    model: 'claude-2',
  },
  {
    maxRetries: 5,
  },
);
```

### Timeouts

Requests time out after 10 minutes by default. You can configure this with a `timeout` option:

<!-- prettier-ignore -->
```ts
// Configure the default for all requests:
const anthropic = new Anthropic({
  timeout: 20 * 1000, // 20 seconds (default is 10 minutes)
});

// Override per-request:
await anthropic.completions.create(
  {
    prompt: `${Anthropic.HUMAN_PROMPT} Where can I get a good coffee in my neighbourhood?${Anthropic.AI_PROMPT}`,
    max_tokens_to_sample: 300,
    model: 'claude-2',
  },
  {
    timeout: 5 * 1000,
  },
);
```

On timeout, an `APIConnectionTimeoutError` is thrown.

Note that requests which time out will be [retried twice by default](#retries).

## Default Headers

We automatically send the `anthropic-version` header set to `2023-06-01`.

If you need to, you can override it by setting default headers on a per-request basis.

Be aware that doing so may result in incorrect types and other unexpected or undefined behavior in the SDK.

```ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const completion = await anthropic.completions.create(
  {
    max_tokens_to_sample: 300,
    model: 'claude-2',
    prompt: `${Anthropic.HUMAN_PROMPT} Where can I get a good coffee in my neighbourhood?${Anthropic.AI_PROMPT}`,
  },
  { headers: { 'anthropic-version': 'My-Custom-Value' } },
);
```

## Advanced Usage

### Accessing raw Response data (e.g., headers)

The "raw" `Response` returned by `fetch()` can be accessed through the `.asResponse()` method on the `APIPromise` type that all methods return.

You can also use the `.withResponse()` method to get the raw `Response` along with the parsed data.

```ts
const anthropic = new Anthropic();

const response = await anthropic.completions
  .create({
    prompt: `${Anthropic.HUMAN_PROMPT} Can you help me effectively ask for a raise at work?${Anthropic.AI_PROMPT}`,
    max_tokens_to_sample: 300,
    model: 'claude-2',
  })
  .asResponse();
console.log(response.headers.get('X-My-Header'));
console.log(response.raw.statusText); // access the underlying Response object

// parses the response body, returning an object if the API responds with JSON
const completion: Completions.Completion = await response.parse();
console.log(completion.completion);
```

## Customizing the fetch client

By default, this library uses `node-fetch` in Node, and expects a global `fetch` function in other environments.

If you would prefer to use a global, web-standards-compliant `fetch` function even in a Node environment,
(for example, if you are running Node with `--experimental-fetch` or using NextJS which polyfills with `undici`),
add the following import before your first import `from "Anthropic"`:

<!-- prettier-ignore -->
```ts
// Tell TypeScript and the package to use the global web fetch instead of node-fetch.
// Note, despite the name, this does not add any polyfills, but expects them to be provided if needed.
import "@anthropic-ai/sdk/shims/web";
import Anthropic from "@anthropic-ai/sdk";
```

To do the inverse, add `import "@anthropic-ai/sdk/shims/node"` (which does import polyfills).
This can also be useful if you are getting the wrong TypeScript types for `Response` - more details [here](https://github.com/anthropics/anthropic-sdk-typescript/tree/main/src/_shims#readme).

You may also provide a custom `fetch` function when instantiating the client,
which can be used to inspect or alter the `Request` or `Response` before/after each request:

```ts
import { fetch } from 'undici'; // as one example
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  fetch: (url: RequestInfo, init?: RequestInfo): Response => {
    console.log('About to make request', url, init);
    const response = await fetch(url, init);
    console.log('Got response', response);
    return response;
  },
});
```

Note that if given a `DEBUG=true` environment variable, this library will log all requests and responses automatically.
This is intended for debugging purposes only and may change in the future without notice.

## Configuring an HTTP(S) Agent (e.g., for proxies)

By default, this library uses a stable agent for all http/https requests to reuse TCP connections, eliminating many TCP & TLS handshakes and shaving around 100ms off most requests.

If you would like to disable or customize this behavior, for example to use the API behind a proxy, you can pass an `httpAgent` which is used for all requests (be they http or https), for example:

<!-- prettier-ignore -->
```ts
import http from 'http';
import Anthropic from '@anthropic-ai/sdk';
import HttpsProxyAgent from 'https-proxy-agent';

// Configure the default for all requests:
const anthropic = new Anthropic({
  httpAgent: new HttpsProxyAgent(process.env.PROXY_URL),
});

// Override per-request:
await anthropic.completions.create(
  {
    prompt: `${Anthropic.HUMAN_PROMPT} How does a court case get to the Supreme Court?${Anthropic.AI_PROMPT}`,
    max_tokens_to_sample: 300,
    model: 'claude-2',
  },
  {
    baseURL: 'http://localhost:8080/test-api',
    httpAgent: new http.Agent({ keepAlive: false }),
  },
);
```

## Semantic Versioning

This package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:

1. Changes that only affect static types, without breaking runtime behavior.
2. Changes to library internals which are technically public but not intended or documented for external use. _(Please open a GitHub issue to let us know if you are relying on such internals)_.
3. Changes that we do not expect to impact the vast majority of users in practice.

We take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.

We are keen for your feedback; please open an [issue](https://www.github.com/anthropics/anthropic-sdk-typescript/issues) with questions, bugs, or suggestions.

## Requirements

TypeScript >= 4.5 is supported.

The following runtimes are supported:

- Node.js 18 LTS or later ([non-EOL](https://endoflife.date/nodejs)) versions.
- Deno v1.28.0 or higher, using `import Anthropic from "npm:@anthropic-ai/sdk"`.
- Bun 1.0 or later.
- Cloudflare Workers.
- Vercel Edge Runtime.
- Jest 28 or greater with the `"node"` environment (`"jsdom"` is not supported at this time).
- Nitro v2.6 or greater.

Note that React Native is not supported at this time.

If you are interested in other runtime environments, please open or upvote an issue on GitHub.
