// src/createFetchRequester.ts
function isAbortError(error) {
  return error instanceof Error && error.name === "AbortError";
}
function getErrorMessage(error, abortContent) {
  if (isAbortError(error)) {
    return abortContent;
  }
  return error instanceof Error ? error.message : "Network request failed";
}
function createFetchRequester({ requesterOptions = {} } = {}) {
  async function send(request) {
    const abortController = new AbortController();
    const signal = abortController.signal;
    const createTimeout = (timeout) => {
      return setTimeout(() => {
        abortController.abort();
      }, timeout);
    };
    const connectTimeout = createTimeout(request.connectTimeout);
    let fetchRes;
    try {
      fetchRes = await fetch(request.url, {
        method: request.method,
        body: request.data || null,
        redirect: "manual",
        signal,
        ...requesterOptions,
        headers: {
          ...requesterOptions.headers,
          ...request.headers
        }
      });
    } catch (error) {
      return {
        status: 0,
        content: getErrorMessage(error, "Connection timeout"),
        isTimedOut: isAbortError(error)
      };
    }
    clearTimeout(connectTimeout);
    createTimeout(request.responseTimeout);
    try {
      const content = await fetchRes.text();
      return {
        content,
        isTimedOut: false,
        status: fetchRes.status
      };
    } catch (error) {
      return {
        status: 0,
        content: getErrorMessage(error, "Socket timeout"),
        isTimedOut: isAbortError(error)
      };
    }
  }
  return { send };
}
export {
  createFetchRequester
};
//# sourceMappingURL=requester.fetch.node.js.map