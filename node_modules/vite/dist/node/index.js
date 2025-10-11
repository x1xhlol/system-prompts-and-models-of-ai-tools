export { parseAst, parseAstAsync } from 'rollup/parseAst';
import { i as isInNodeModules, a as arraify } from './chunks/dep-D_zLpgQd.js';
export { b as build, g as buildErrorMessage, k as createFilter, v as createLogger, c as createServer, d as defineConfig, h as fetchModule, f as formatPostcssSourceMap, y as isFileLoadingAllowed, x as isFileServingAllowed, l as loadConfigFromFile, z as loadEnv, j as mergeAlias, m as mergeConfig, n as normalizePath, o as optimizeDeps, e as preprocessCSS, p as preview, r as resolveConfig, A as resolveEnvPrefix, q as rollupVersion, w as searchForWorkspaceRoot, u as send, s as sortUserPlugins, t as transformWithEsbuild } from './chunks/dep-D_zLpgQd.js';
export { VERSION as version } from './constants.js';
export { version as esbuildVersion } from 'esbuild';
import { existsSync, readFileSync } from 'node:fs';
import { ViteRuntime, ESModulesRunner } from 'vite/runtime';
import 'node:fs/promises';
import 'node:path';
import 'node:url';
import 'node:util';
import 'node:perf_hooks';
import 'node:module';
import 'node:crypto';
import 'tty';
import 'path';
import 'fs';
import 'node:events';
import 'node:stream';
import 'node:string_decoder';
import 'node:child_process';
import 'node:http';
import 'node:https';
import 'util';
import 'net';
import 'events';
import 'url';
import 'http';
import 'stream';
import 'os';
import 'child_process';
import 'node:os';
import 'node:dns';
import 'crypto';
import 'module';
import 'node:assert';
import 'node:v8';
import 'node:worker_threads';
import 'node:buffer';
import 'querystring';
import 'node:readline';
import 'zlib';
import 'buffer';
import 'https';
import 'tls';
import 'node:net';
import 'assert';
import 'node:zlib';

const CSS_LANGS_RE = (
  // eslint-disable-next-line regexp/no-unused-capturing-group
  /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/
);
const isCSSRequest = (request) => CSS_LANGS_RE.test(request);
class SplitVendorChunkCache {
  cache;
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  reset() {
    this.cache = /* @__PURE__ */ new Map();
  }
}
function splitVendorChunk(options = {}) {
  const cache = options.cache ?? new SplitVendorChunkCache();
  return (id, { getModuleInfo }) => {
    if (isInNodeModules(id) && !isCSSRequest(id) && staticImportedByEntry(id, getModuleInfo, cache.cache)) {
      return "vendor";
    }
  };
}
function staticImportedByEntry(id, getModuleInfo, cache, importStack = []) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  if (importStack.includes(id)) {
    cache.set(id, false);
    return false;
  }
  const mod = getModuleInfo(id);
  if (!mod) {
    cache.set(id, false);
    return false;
  }
  if (mod.isEntry) {
    cache.set(id, true);
    return true;
  }
  const someImporterIs = mod.importers.some(
    (importer) => staticImportedByEntry(
      importer,
      getModuleInfo,
      cache,
      importStack.concat(id)
    )
  );
  cache.set(id, someImporterIs);
  return someImporterIs;
}
function splitVendorChunkPlugin() {
  const caches = [];
  function createSplitVendorChunk(output, config) {
    const cache = new SplitVendorChunkCache();
    caches.push(cache);
    const build = config.build ?? {};
    const format = output?.format;
    if (!build.ssr && !build.lib && format !== "umd" && format !== "iife") {
      return splitVendorChunk({ cache });
    }
  }
  return {
    name: "vite:split-vendor-chunk",
    config(config) {
      let outputs = config?.build?.rollupOptions?.output;
      if (outputs) {
        outputs = arraify(outputs);
        for (const output of outputs) {
          const viteManualChunks = createSplitVendorChunk(output, config);
          if (viteManualChunks) {
            if (output.manualChunks) {
              if (typeof output.manualChunks === "function") {
                const userManualChunks = output.manualChunks;
                output.manualChunks = (id, api) => {
                  return userManualChunks(id, api) ?? viteManualChunks(id, api);
                };
              } else {
                console.warn(
                  "(!) the `splitVendorChunk` plugin doesn't have any effect when using the object form of `build.rollupOptions.output.manualChunks`. Consider using the function form instead."
                );
              }
            } else {
              output.manualChunks = viteManualChunks;
            }
          }
        }
      } else {
        return {
          build: {
            rollupOptions: {
              output: {
                manualChunks: createSplitVendorChunk({}, config)
              }
            }
          }
        };
      }
    },
    buildStart() {
      caches.forEach((cache) => cache.reset());
    }
  };
}

class ServerHMRBroadcasterClient {
  constructor(hmrChannel) {
    this.hmrChannel = hmrChannel;
  }
  send(...args) {
    let payload;
    if (typeof args[0] === "string") {
      payload = {
        type: "custom",
        event: args[0],
        data: args[1]
      };
    } else {
      payload = args[0];
    }
    if (payload.type !== "custom") {
      throw new Error(
        "Cannot send non-custom events from the client to the server."
      );
    }
    this.hmrChannel.send(payload);
  }
}
class ServerHMRConnector {
  handlers = [];
  hmrChannel;
  hmrClient;
  connected = false;
  constructor(server) {
    const hmrChannel = server.hot?.channels.find(
      (c) => c.name === "ssr"
    );
    if (!hmrChannel) {
      throw new Error(
        "Your version of Vite doesn't support HMR during SSR. Please, use Vite 5.1 or higher."
      );
    }
    this.hmrClient = new ServerHMRBroadcasterClient(hmrChannel);
    hmrChannel.api.outsideEmitter.on("send", (payload) => {
      this.handlers.forEach((listener) => listener(payload));
    });
    this.hmrChannel = hmrChannel;
  }
  isReady() {
    return this.connected;
  }
  send(message) {
    const payload = JSON.parse(message);
    this.hmrChannel.api.innerEmitter.emit(
      payload.event,
      payload.data,
      this.hmrClient
    );
  }
  onUpdate(handler) {
    this.handlers.push(handler);
    handler({ type: "connected" });
    this.connected = true;
  }
}

function createHMROptions(server, options) {
  if (server.config.server.hmr === false || options.hmr === false) {
    return false;
  }
  const connection = new ServerHMRConnector(server);
  return {
    connection,
    logger: options.hmr?.logger
  };
}
const prepareStackTrace = {
  retrieveFile(id) {
    if (existsSync(id)) {
      return readFileSync(id, "utf-8");
    }
  }
};
function resolveSourceMapOptions(options) {
  if (options.sourcemapInterceptor != null) {
    if (options.sourcemapInterceptor === "prepareStackTrace") {
      return prepareStackTrace;
    }
    if (typeof options.sourcemapInterceptor === "object") {
      return { ...prepareStackTrace, ...options.sourcemapInterceptor };
    }
    return options.sourcemapInterceptor;
  }
  if (typeof process !== "undefined" && "setSourceMapsEnabled" in process) {
    return "node";
  }
  return prepareStackTrace;
}
async function createViteRuntime(server, options = {}) {
  const hmr = createHMROptions(server, options);
  return new ViteRuntime(
    {
      ...options,
      root: server.config.root,
      fetchModule: server.ssrFetchModule,
      hmr,
      sourcemapInterceptor: resolveSourceMapOptions(options)
    },
    options.runner || new ESModulesRunner()
  );
}

export { ServerHMRConnector, createViteRuntime, isCSSRequest, splitVendorChunk, splitVendorChunkPlugin };
