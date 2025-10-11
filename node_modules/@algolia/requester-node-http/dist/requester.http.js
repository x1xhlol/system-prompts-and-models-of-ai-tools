// src/createHttpRequester.ts
import http from "http";
import https from "https";
import { URL } from "url";
var agentOptions = { keepAlive: true };
var defaultHttpAgent = new http.Agent(agentOptions);
var defaultHttpsAgent = new https.Agent(agentOptions);
function createHttpRequester({
  agent: userGlobalAgent,
  httpAgent: userHttpAgent,
  httpsAgent: userHttpsAgent,
  requesterOptions = {}
} = {}) {
  const httpAgent = userHttpAgent || userGlobalAgent || defaultHttpAgent;
  const httpsAgent = userHttpsAgent || userGlobalAgent || defaultHttpsAgent;
  function send(request) {
    return new Promise((resolve) => {
      let responseTimeout;
      let connectTimeout;
      const url = new URL(request.url);
      const path = url.search === null ? url.pathname : `${url.pathname}${url.search}`;
      const options = {
        agent: url.protocol === "https:" ? httpsAgent : httpAgent,
        hostname: url.hostname,
        path,
        method: request.method,
        ...requesterOptions,
        headers: {
          ...request.headers,
          ...requesterOptions.headers
        }
      };
      if (url.port && !requesterOptions.port) {
        options.port = url.port;
      }
      const req = (url.protocol === "https:" ? https : http).request(options, (response) => {
        let contentBuffers = [];
        response.on("data", (chunk) => {
          contentBuffers = contentBuffers.concat(chunk);
        });
        response.on("end", () => {
          clearTimeout(connectTimeout);
          clearTimeout(responseTimeout);
          resolve({
            status: response.statusCode || 0,
            content: Buffer.concat(contentBuffers).toString(),
            isTimedOut: false
          });
        });
      });
      const createTimeout = (timeout, content) => {
        return setTimeout(() => {
          req.destroy();
          resolve({
            status: 0,
            content,
            isTimedOut: true
          });
        }, timeout);
      };
      connectTimeout = createTimeout(request.connectTimeout, "Connection timeout");
      req.on("error", (error) => {
        clearTimeout(connectTimeout);
        clearTimeout(responseTimeout);
        resolve({ status: 0, content: error.message, isTimedOut: false });
      });
      req.once("response", () => {
        clearTimeout(connectTimeout);
        responseTimeout = createTimeout(request.responseTimeout, "Socket timeout");
      });
      if (request.data !== void 0) {
        req.write(request.data);
      }
      req.end();
    });
  }
  return { send };
}
export {
  createHttpRequester
};
//# sourceMappingURL=requester.http.js.map