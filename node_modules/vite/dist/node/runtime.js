const VALID_ID_PREFIX = "/@id/", NULL_BYTE_PLACEHOLDER = "__x00__";
let SOURCEMAPPING_URL = "sourceMa";
SOURCEMAPPING_URL += "ppingURL";
const isWindows = typeof process < "u" && process.platform === "win32";
function wrapId(id) {
  return id.startsWith(VALID_ID_PREFIX) ? id : VALID_ID_PREFIX + id.replace("\0", NULL_BYTE_PLACEHOLDER);
}
function unwrapId(id) {
  return id.startsWith(VALID_ID_PREFIX) ? id.slice(VALID_ID_PREFIX.length).replace(NULL_BYTE_PLACEHOLDER, "\0") : id;
}
const windowsSlashRE = /\\/g;
function slash(p) {
  return p.replace(windowsSlashRE, "/");
}
const postfixRE = /[?#].*$/;
function cleanUrl(url) {
  return url.replace(postfixRE, "");
}
function isPrimitive(value) {
  return !value || typeof value != "object" && typeof value != "function";
}
function withTrailingSlash(path) {
  return path[path.length - 1] !== "/" ? `${path}/` : path;
}
const AsyncFunction = async function() {
}.constructor, _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  return input && input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/, _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  return typeof process < "u" && typeof process.cwd == "function" ? process.cwd().replace(/\\/g, "/") : "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "", resolvedAbsolute = !1;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    !path || path.length === 0 || (resolvedPath = `${path}/${resolvedPath}`, resolvedAbsolute = isAbsolute(path));
  }
  return resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute), resolvedAbsolute && !isAbsolute(resolvedPath) ? `/${resolvedPath}` : resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "", lastSegmentLength = 0, lastSlash = -1, dots = 0, char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length)
      char = path[index];
    else {
      if (char === "/")
        break;
      char = "/";
    }
    if (char === "/") {
      if (!(lastSlash === index - 1 || dots === 1)) if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            lastSlashIndex === -1 ? (res = "", lastSegmentLength = 0) : (res = res.slice(0, lastSlashIndex), lastSegmentLength = res.length - 1 - res.lastIndexOf("/")), lastSlash = index, dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "", lastSegmentLength = 0, lastSlash = index, dots = 0;
            continue;
          }
        }
        allowAboveRoot && (res += res.length > 0 ? "/.." : "..", lastSegmentLength = 2);
      } else
        res.length > 0 ? res += `/${path.slice(lastSlash + 1, index)}` : res = path.slice(lastSlash + 1, index), lastSegmentLength = index - lastSlash - 1;
      lastSlash = index, dots = 0;
    } else char === "." && dots !== -1 ? ++dots : dots = -1;
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
}, dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  return segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0]) && (segments[0] += "/"), segments.join("/") || (isAbsolute(p) ? "/" : ".");
}, decodeBase64 = typeof atob < "u" ? atob : (str) => Buffer.from(str, "base64").toString("utf-8"), CHAR_FORWARD_SLASH = 47, CHAR_BACKWARD_SLASH = 92, percentRegEx = /%/g, backslashRegEx = /\\/g, newlineRegEx = /\n/g, carriageReturnRegEx = /\r/g, tabRegEx = /\t/g, questionRegex = /\?/g, hashRegex = /#/g;
function encodePathChars(filepath) {
  return filepath.indexOf("%") !== -1 && (filepath = filepath.replace(percentRegEx, "%25")), !isWindows && filepath.indexOf("\\") !== -1 && (filepath = filepath.replace(backslashRegEx, "%5C")), filepath.indexOf(`
`) !== -1 && (filepath = filepath.replace(newlineRegEx, "%0A")), filepath.indexOf("\r") !== -1 && (filepath = filepath.replace(carriageReturnRegEx, "%0D")), filepath.indexOf("	") !== -1 && (filepath = filepath.replace(tabRegEx, "%09")), filepath;
}
const posixDirname = dirname, posixResolve = resolve;
function posixPathToFileHref(posixPath) {
  let resolved = posixResolve(posixPath);
  const filePathLast = posixPath.charCodeAt(posixPath.length - 1);
  return (filePathLast === CHAR_FORWARD_SLASH || isWindows && filePathLast === CHAR_BACKWARD_SLASH) && resolved[resolved.length - 1] !== "/" && (resolved += "/"), resolved = encodePathChars(resolved), resolved.indexOf("?") !== -1 && (resolved = resolved.replace(questionRegex, "%3F")), resolved.indexOf("#") !== -1 && (resolved = resolved.replace(hashRegex, "%23")), new URL(`file://${resolved}`).href;
}
function toWindowsPath(path) {
  return path.replace(/\//g, "\\");
}
const comma = 44, chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", intToChar = new Uint8Array(64), charToInt = new Uint8Array(128);
for (let i = 0; i < chars.length; i++) {
  const c = chars.charCodeAt(i);
  intToChar[i] = c, charToInt[c] = i;
}
function decodeInteger(reader, relative) {
  let value = 0, shift = 0, integer = 0;
  do {
    const c = reader.next();
    integer = charToInt[c], value |= (integer & 31) << shift, shift += 5;
  } while (integer & 32);
  const shouldNegate = value & 1;
  return value >>>= 1, shouldNegate && (value = -2147483648 | -value), relative + value;
}
function hasMoreVlq(reader, max) {
  return reader.pos >= max ? !1 : reader.peek() !== comma;
}
class StringReader {
  constructor(buffer) {
    this.pos = 0, this.buffer = buffer;
  }
  next() {
    return this.buffer.charCodeAt(this.pos++);
  }
  peek() {
    return this.buffer.charCodeAt(this.pos);
  }
  indexOf(char) {
    const { buffer, pos } = this, idx = buffer.indexOf(char, pos);
    return idx === -1 ? buffer.length : idx;
  }
}
function decode(mappings) {
  const { length } = mappings, reader = new StringReader(mappings), decoded = [];
  let genColumn = 0, sourcesIndex = 0, sourceLine = 0, sourceColumn = 0, namesIndex = 0;
  do {
    const semi = reader.indexOf(";"), line = [];
    let sorted = !0, lastCol = 0;
    for (genColumn = 0; reader.pos < semi; ) {
      let seg;
      genColumn = decodeInteger(reader, genColumn), genColumn < lastCol && (sorted = !1), lastCol = genColumn, hasMoreVlq(reader, semi) ? (sourcesIndex = decodeInteger(reader, sourcesIndex), sourceLine = decodeInteger(reader, sourceLine), sourceColumn = decodeInteger(reader, sourceColumn), hasMoreVlq(reader, semi) ? (namesIndex = decodeInteger(reader, namesIndex), seg = [genColumn, sourcesIndex, sourceLine, sourceColumn, namesIndex]) : seg = [genColumn, sourcesIndex, sourceLine, sourceColumn]) : seg = [genColumn], line.push(seg), reader.pos++;
    }
    sorted || sort(line), decoded.push(line), reader.pos = semi + 1;
  } while (reader.pos <= length);
  return decoded;
}
function sort(line) {
  line.sort(sortComparator);
}
function sortComparator(a, b) {
  return a[0] - b[0];
}
const COLUMN = 0, SOURCES_INDEX = 1, SOURCE_LINE = 2, SOURCE_COLUMN = 3, NAMES_INDEX = 4;
let found = !1;
function binarySearch(haystack, needle, low, high) {
  for (; low <= high; ) {
    const mid = low + (high - low >> 1), cmp = haystack[mid][COLUMN] - needle;
    if (cmp === 0)
      return found = !0, mid;
    cmp < 0 ? low = mid + 1 : high = mid - 1;
  }
  return found = !1, low - 1;
}
function upperBound(haystack, needle, index) {
  for (let i = index + 1; i < haystack.length && haystack[i][COLUMN] === needle; index = i++)
    ;
  return index;
}
function lowerBound(haystack, needle, index) {
  for (let i = index - 1; i >= 0 && haystack[i][COLUMN] === needle; index = i--)
    ;
  return index;
}
function memoizedBinarySearch(haystack, needle, state, key) {
  const { lastKey, lastNeedle, lastIndex } = state;
  let low = 0, high = haystack.length - 1;
  if (key === lastKey) {
    if (needle === lastNeedle)
      return found = lastIndex !== -1 && haystack[lastIndex][COLUMN] === needle, lastIndex;
    needle >= lastNeedle ? low = lastIndex === -1 ? 0 : lastIndex : high = lastIndex;
  }
  return state.lastKey = key, state.lastNeedle = needle, state.lastIndex = binarySearch(haystack, needle, low, high);
}
const LINE_GTR_ZERO = "`line` must be greater than 0 (lines start at line 1)", COL_GTR_EQ_ZERO = "`column` must be greater than or equal to 0 (columns start at column 0)", LEAST_UPPER_BOUND = -1, GREATEST_LOWER_BOUND = 1;
function cast(map) {
  return map;
}
function decodedMappings(map) {
  var _a;
  return (_a = map)._decoded || (_a._decoded = decode(map._encoded));
}
function originalPositionFor(map, needle) {
  let { line, column, bias } = needle;
  if (line--, line < 0)
    throw new Error(LINE_GTR_ZERO);
  if (column < 0)
    throw new Error(COL_GTR_EQ_ZERO);
  const decoded = decodedMappings(map);
  if (line >= decoded.length)
    return OMapping(null, null, null, null);
  const segments = decoded[line], index = traceSegmentInternal(segments, map._decodedMemo, line, column, bias || GREATEST_LOWER_BOUND);
  if (index === -1)
    return OMapping(null, null, null, null);
  const segment = segments[index];
  if (segment.length === 1)
    return OMapping(null, null, null, null);
  const { names, resolvedSources } = map;
  return OMapping(resolvedSources[segment[SOURCES_INDEX]], segment[SOURCE_LINE] + 1, segment[SOURCE_COLUMN], segment.length === 5 ? names[segment[NAMES_INDEX]] : null);
}
function OMapping(source, line, column, name) {
  return { source, line, column, name };
}
function traceSegmentInternal(segments, memo, line, column, bias) {
  let index = memoizedBinarySearch(segments, column, memo, line);
  return found ? index = (bias === LEAST_UPPER_BOUND ? upperBound : lowerBound)(segments, column, index) : bias === LEAST_UPPER_BOUND && index++, index === -1 || index === segments.length ? -1 : index;
}
class DecodedMap {
  constructor(map, from) {
    this.map = map;
    const { mappings, names, sources } = map;
    this.version = map.version, this.names = names || [], this._encoded = mappings || "", this._decodedMemo = memoizedState(), this.url = from, this.resolvedSources = (sources || []).map(
      (s) => posixResolve(s || "", from)
    );
  }
  _encoded;
  _decoded;
  _decodedMemo;
  url;
  version;
  names = [];
  resolvedSources;
}
function memoizedState() {
  return {
    lastKey: -1,
    lastNeedle: -1,
    lastIndex: -1
  };
}
function getOriginalPosition(map, needle) {
  const result = originalPositionFor(map, needle);
  return result.column == null ? null : result;
}
const VITE_RUNTIME_SOURCEMAPPING_REGEXP = new RegExp(
  `//# ${SOURCEMAPPING_URL}=data:application/json;base64,(.+)`
);
class ModuleCacheMap extends Map {
  root;
  constructor(root, entries) {
    super(entries), this.root = withTrailingSlash(root);
  }
  normalize(fsPath) {
    return normalizeModuleId(fsPath, this.root);
  }
  /**
   * Assign partial data to the map
   */
  update(fsPath, mod) {
    return fsPath = this.normalize(fsPath), super.has(fsPath) ? Object.assign(super.get(fsPath), mod) : this.setByModuleId(fsPath, mod), this;
  }
  setByModuleId(modulePath, mod) {
    return super.set(modulePath, mod);
  }
  set(fsPath, mod) {
    return this.setByModuleId(this.normalize(fsPath), mod);
  }
  getByModuleId(modulePath) {
    super.has(modulePath) || this.setByModuleId(modulePath, {});
    const mod = super.get(modulePath);
    return mod.imports || Object.assign(mod, {
      imports: /* @__PURE__ */ new Set(),
      importers: /* @__PURE__ */ new Set()
    }), mod;
  }
  get(fsPath) {
    return this.getByModuleId(this.normalize(fsPath));
  }
  deleteByModuleId(modulePath) {
    return super.delete(modulePath);
  }
  delete(fsPath) {
    return this.deleteByModuleId(this.normalize(fsPath));
  }
  invalidate(id) {
    const module = this.get(id);
    module.evaluated = !1, module.meta = void 0, module.map = void 0, module.promise = void 0, module.exports = void 0, module.imports?.clear();
  }
  isImported({
    importedId,
    importedBy
  }, seen = /* @__PURE__ */ new Set()) {
    if (importedId = this.normalize(importedId), importedBy = this.normalize(importedBy), importedBy === importedId) return !0;
    if (seen.has(importedId)) return !1;
    seen.add(importedId);
    const importers = this.getByModuleId(importedId)?.importers;
    if (!importers) return !1;
    if (importers.has(importedBy)) return !0;
    for (const importer of importers)
      if (this.isImported({
        importedBy,
        importedId: importer
      }))
        return !0;
    return !1;
  }
  /**
   * Invalidate modules that dependent on the given modules, up to the main entry
   */
  invalidateDepTree(ids, invalidated = /* @__PURE__ */ new Set()) {
    for (const _id of ids) {
      const id = this.normalize(_id);
      if (invalidated.has(id)) continue;
      invalidated.add(id);
      const mod = super.get(id);
      mod?.importers && this.invalidateDepTree(mod.importers, invalidated), super.delete(id);
    }
    return invalidated;
  }
  /**
   * Invalidate dependency modules of the given modules, down to the bottom-level dependencies
   */
  invalidateSubDepTree(ids, invalidated = /* @__PURE__ */ new Set()) {
    for (const _id of ids) {
      const id = this.normalize(_id);
      if (invalidated.has(id)) continue;
      invalidated.add(id);
      const subIds = Array.from(super.entries()).filter(([, mod]) => mod.importers?.has(id)).map(([key]) => key);
      subIds.length && this.invalidateSubDepTree(subIds, invalidated), super.delete(id);
    }
    return invalidated;
  }
  getSourceMap(moduleId) {
    const mod = this.get(moduleId);
    if (mod.map) return mod.map;
    if (!mod.meta || !("code" in mod.meta)) return null;
    const mapString = VITE_RUNTIME_SOURCEMAPPING_REGEXP.exec(mod.meta.code)?.[1];
    if (!mapString) return null;
    const baseFile = mod.meta.file || moduleId.split("?")[0];
    return mod.map = new DecodedMap(JSON.parse(decodeBase64(mapString)), baseFile), mod.map;
  }
}
const prefixedBuiltins = /* @__PURE__ */ new Set(["node:test"]);
function normalizeModuleId(file, root) {
  if (prefixedBuiltins.has(file)) return file;
  let unixFile = slash(file).replace(/^\/@fs\//, isWindows ? "" : "/").replace(/^node:/, "").replace(/^\/+/, "/");
  return unixFile.startsWith(root) && (unixFile = unixFile.slice(root.length - 1)), unixFile.replace(/^file:\//, "/");
}
class HMRContext {
  constructor(hmrClient, ownerPath) {
    this.hmrClient = hmrClient, this.ownerPath = ownerPath, hmrClient.dataMap.has(ownerPath) || hmrClient.dataMap.set(ownerPath, {});
    const mod = hmrClient.hotModulesMap.get(ownerPath);
    mod && (mod.callbacks = []);
    const staleListeners = hmrClient.ctxToListenersMap.get(ownerPath);
    if (staleListeners)
      for (const [event, staleFns] of staleListeners) {
        const listeners = hmrClient.customListenersMap.get(event);
        listeners && hmrClient.customListenersMap.set(
          event,
          listeners.filter((l) => !staleFns.includes(l))
        );
      }
    this.newListeners = /* @__PURE__ */ new Map(), hmrClient.ctxToListenersMap.set(ownerPath, this.newListeners);
  }
  newListeners;
  get data() {
    return this.hmrClient.dataMap.get(this.ownerPath);
  }
  accept(deps, callback) {
    if (typeof deps == "function" || !deps)
      this.acceptDeps([this.ownerPath], ([mod]) => deps?.(mod));
    else if (typeof deps == "string")
      this.acceptDeps([deps], ([mod]) => callback?.(mod));
    else if (Array.isArray(deps))
      this.acceptDeps(deps, callback);
    else
      throw new Error("invalid hot.accept() usage.");
  }
  // export names (first arg) are irrelevant on the client side, they're
  // extracted in the server for propagation
  acceptExports(_, callback) {
    this.acceptDeps([this.ownerPath], ([mod]) => callback?.(mod));
  }
  dispose(cb) {
    this.hmrClient.disposeMap.set(this.ownerPath, cb);
  }
  prune(cb) {
    this.hmrClient.pruneMap.set(this.ownerPath, cb);
  }
  // Kept for backward compatibility (#11036)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  decline() {
  }
  invalidate(message) {
    this.hmrClient.notifyListeners("vite:invalidate", {
      path: this.ownerPath,
      message
    }), this.send("vite:invalidate", { path: this.ownerPath, message }), this.hmrClient.logger.debug(
      `[vite] invalidate ${this.ownerPath}${message ? `: ${message}` : ""}`
    );
  }
  on(event, cb) {
    const addToMap = (map) => {
      const existing = map.get(event) || [];
      existing.push(cb), map.set(event, existing);
    };
    addToMap(this.hmrClient.customListenersMap), addToMap(this.newListeners);
  }
  off(event, cb) {
    const removeFromMap = (map) => {
      const existing = map.get(event);
      if (existing === void 0)
        return;
      const pruned = existing.filter((l) => l !== cb);
      if (pruned.length === 0) {
        map.delete(event);
        return;
      }
      map.set(event, pruned);
    };
    removeFromMap(this.hmrClient.customListenersMap), removeFromMap(this.newListeners);
  }
  send(event, data) {
    this.hmrClient.messenger.send(
      JSON.stringify({ type: "custom", event, data })
    );
  }
  acceptDeps(deps, callback = () => {
  }) {
    const mod = this.hmrClient.hotModulesMap.get(this.ownerPath) || {
      id: this.ownerPath,
      callbacks: []
    };
    mod.callbacks.push({
      deps,
      fn: callback
    }), this.hmrClient.hotModulesMap.set(this.ownerPath, mod);
  }
}
class HMRMessenger {
  constructor(connection) {
    this.connection = connection;
  }
  queue = [];
  send(message) {
    this.queue.push(message), this.flush();
  }
  flush() {
    this.connection.isReady() && (this.queue.forEach((msg) => this.connection.send(msg)), this.queue = []);
  }
}
class HMRClient {
  constructor(logger, connection, importUpdatedModule) {
    this.logger = logger, this.importUpdatedModule = importUpdatedModule, this.messenger = new HMRMessenger(connection);
  }
  hotModulesMap = /* @__PURE__ */ new Map();
  disposeMap = /* @__PURE__ */ new Map();
  pruneMap = /* @__PURE__ */ new Map();
  dataMap = /* @__PURE__ */ new Map();
  customListenersMap = /* @__PURE__ */ new Map();
  ctxToListenersMap = /* @__PURE__ */ new Map();
  messenger;
  async notifyListeners(event, data) {
    const cbs = this.customListenersMap.get(event);
    cbs && await Promise.allSettled(cbs.map((cb) => cb(data)));
  }
  clear() {
    this.hotModulesMap.clear(), this.disposeMap.clear(), this.pruneMap.clear(), this.dataMap.clear(), this.customListenersMap.clear(), this.ctxToListenersMap.clear();
  }
  // After an HMR update, some modules are no longer imported on the page
  // but they may have left behind side effects that need to be cleaned up
  // (.e.g style injections)
  async prunePaths(paths) {
    await Promise.all(
      paths.map((path) => {
        const disposer = this.disposeMap.get(path);
        if (disposer) return disposer(this.dataMap.get(path));
      })
    ), paths.forEach((path) => {
      const fn = this.pruneMap.get(path);
      fn && fn(this.dataMap.get(path));
    });
  }
  warnFailedUpdate(err, path) {
    err.message.includes("fetch") || this.logger.error(err), this.logger.error(
      `[hmr] Failed to reload ${path}. This could be due to syntax errors or importing non-existent modules. (see errors above)`
    );
  }
  updateQueue = [];
  pendingUpdateQueue = !1;
  /**
   * buffer multiple hot updates triggered by the same src change
   * so that they are invoked in the same order they were sent.
   * (otherwise the order may be inconsistent because of the http request round trip)
   */
  async queueUpdate(payload) {
    if (this.updateQueue.push(this.fetchUpdate(payload)), !this.pendingUpdateQueue) {
      this.pendingUpdateQueue = !0, await Promise.resolve(), this.pendingUpdateQueue = !1;
      const loading = [...this.updateQueue];
      this.updateQueue = [], (await Promise.all(loading)).forEach((fn) => fn && fn());
    }
  }
  async fetchUpdate(update) {
    const { path, acceptedPath } = update, mod = this.hotModulesMap.get(path);
    if (!mod)
      return;
    let fetchedModule;
    const isSelfUpdate = path === acceptedPath, qualifiedCallbacks = mod.callbacks.filter(
      ({ deps }) => deps.includes(acceptedPath)
    );
    if (isSelfUpdate || qualifiedCallbacks.length > 0) {
      const disposer = this.disposeMap.get(acceptedPath);
      disposer && await disposer(this.dataMap.get(acceptedPath));
      try {
        fetchedModule = await this.importUpdatedModule(update);
      } catch (e) {
        this.warnFailedUpdate(e, acceptedPath);
      }
    }
    return () => {
      for (const { deps, fn } of qualifiedCallbacks)
        fn(
          deps.map((dep) => dep === acceptedPath ? fetchedModule : void 0)
        );
      const loggedPath = isSelfUpdate ? path : `${acceptedPath} via ${path}`;
      this.logger.debug(`[vite] hot updated: ${loggedPath}`);
    };
  }
}
function analyzeImportedModDifference(mod, rawId, moduleType, metadata) {
  if (!metadata?.isDynamicImport && metadata?.importedNames?.length) {
    const missingBindings = metadata.importedNames.filter((s) => !(s in mod));
    if (missingBindings.length) {
      const lastBinding = missingBindings[missingBindings.length - 1];
      throw moduleType === "module" ? new SyntaxError(
        `[vite] The requested module '${rawId}' does not provide an export named '${lastBinding}'`
      ) : new SyntaxError(`[vite] Named export '${lastBinding}' not found. The requested module '${rawId}' is a CommonJS module, which may not support all module.exports as named exports.
CommonJS modules can always be imported via the default export, for example using:

import pkg from '${rawId}';
const {${missingBindings.join(", ")}} = pkg;
`);
    }
  }
}
const ssrModuleExportsKey = "__vite_ssr_exports__", ssrImportKey = "__vite_ssr_import__", ssrDynamicImportKey = "__vite_ssr_dynamic_import__", ssrExportAllKey = "__vite_ssr_exportAll__", ssrImportMetaKey = "__vite_ssr_import_meta__", noop = () => {
}, silentConsole = {
  debug: noop,
  error: noop
};
function createHMRHandler(runtime) {
  const queue = new Queue();
  return (payload) => queue.enqueue(() => handleHMRPayload(runtime, payload));
}
async function handleHMRPayload(runtime, payload) {
  const hmrClient = runtime.hmrClient;
  if (!(!hmrClient || runtime.isDestroyed()))
    switch (payload.type) {
      case "connected":
        hmrClient.logger.debug("[vite] connected."), hmrClient.messenger.flush();
        break;
      case "update":
        await hmrClient.notifyListeners("vite:beforeUpdate", payload), await Promise.all(
          payload.updates.map(async (update) => {
            if (update.type === "js-update")
              return update.acceptedPath = unwrapId(update.acceptedPath), update.path = unwrapId(update.path), hmrClient.queueUpdate(update);
            hmrClient.logger.error(
              "[vite] css hmr is not supported in runtime mode."
            );
          })
        ), await hmrClient.notifyListeners("vite:afterUpdate", payload);
        break;
      case "custom": {
        await hmrClient.notifyListeners(payload.event, payload.data);
        break;
      }
      case "full-reload": {
        const { triggeredBy } = payload, clearEntrypoints = triggeredBy ? [...runtime.entrypoints].filter(
          (entrypoint) => runtime.moduleCache.isImported({
            importedId: triggeredBy,
            importedBy: entrypoint
          })
        ) : [...runtime.entrypoints];
        if (!clearEntrypoints.length) break;
        hmrClient.logger.debug("[vite] program reload"), await hmrClient.notifyListeners("vite:beforeFullReload", payload), runtime.moduleCache.clear();
        for (const id of clearEntrypoints)
          await runtime.executeUrl(id);
        break;
      }
      case "prune":
        await hmrClient.notifyListeners("vite:beforePrune", payload), await hmrClient.prunePaths(payload.paths);
        break;
      case "error": {
        await hmrClient.notifyListeners("vite:error", payload);
        const err = payload.err;
        hmrClient.logger.error(
          `[vite] Internal Server Error
${err.message}
${err.stack}`
        );
        break;
      }
      default:
        return payload;
    }
}
class Queue {
  queue = [];
  pending = !1;
  enqueue(promise) {
    return new Promise((resolve2, reject) => {
      this.queue.push({
        promise,
        resolve: resolve2,
        reject
      }), this.dequeue();
    });
  }
  dequeue() {
    if (this.pending)
      return !1;
    const item = this.queue.shift();
    return item ? (this.pending = !0, item.promise().then(item.resolve).catch(item.reject).finally(() => {
      this.pending = !1, this.dequeue();
    }), !0) : !1;
  }
}
const sourceMapCache = {}, fileContentsCache = {}, moduleGraphs = /* @__PURE__ */ new Set(), retrieveFileHandlers = /* @__PURE__ */ new Set(), retrieveSourceMapHandlers = /* @__PURE__ */ new Set(), createExecHandlers = (handlers) => (...args) => {
  for (const handler of handlers) {
    const result = handler(...args);
    if (result) return result;
  }
  return null;
}, retrieveFileFromHandlers = createExecHandlers(retrieveFileHandlers), retrieveSourceMapFromHandlers = createExecHandlers(
  retrieveSourceMapHandlers
);
let overridden = !1;
const originalPrepare = Error.prepareStackTrace;
function resetInterceptor(runtime, options) {
  moduleGraphs.delete(runtime.moduleCache), options.retrieveFile && retrieveFileHandlers.delete(options.retrieveFile), options.retrieveSourceMap && retrieveSourceMapHandlers.delete(options.retrieveSourceMap), moduleGraphs.size === 0 && (Error.prepareStackTrace = originalPrepare, overridden = !1);
}
function interceptStackTrace(runtime, options = {}) {
  return overridden || (Error.prepareStackTrace = prepareStackTrace, overridden = !0), moduleGraphs.add(runtime.moduleCache), options.retrieveFile && retrieveFileHandlers.add(options.retrieveFile), options.retrieveSourceMap && retrieveSourceMapHandlers.add(options.retrieveSourceMap), () => resetInterceptor(runtime, options);
}
function supportRelativeURL(file, url) {
  if (!file) return url;
  const dir = posixDirname(slash(file)), match = /^\w+:\/\/[^/]*/.exec(dir);
  let protocol = match ? match[0] : "";
  const startPath = dir.slice(protocol.length);
  return protocol && /^\/\w:/.test(startPath) ? (protocol += "/", protocol + slash(posixResolve(startPath, url))) : protocol + posixResolve(startPath, url);
}
function getRuntimeSourceMap(position) {
  for (const moduleCache of moduleGraphs) {
    const sourceMap = moduleCache.getSourceMap(position.source);
    if (sourceMap)
      return {
        url: position.source,
        map: sourceMap,
        vite: !0
      };
  }
  return null;
}
function retrieveFile(path) {
  if (path in fileContentsCache) return fileContentsCache[path];
  const content = retrieveFileFromHandlers(path);
  return typeof content == "string" ? (fileContentsCache[path] = content, content) : null;
}
function retrieveSourceMapURL(source) {
  const fileData = retrieveFile(source);
  if (!fileData) return null;
  const re = /\/\/[@#]\s*sourceMappingURL=([^\s'"]+)\s*$|\/\*[@#]\s*sourceMappingURL=[^\s*'"]+\s*\*\/\s*$/gm;
  let lastMatch, match;
  for (; match = re.exec(fileData); ) lastMatch = match;
  return lastMatch ? lastMatch[1] : null;
}
const reSourceMap = /^data:application\/json[^,]+base64,/;
function retrieveSourceMap(source) {
  const urlAndMap = retrieveSourceMapFromHandlers(source);
  if (urlAndMap) return urlAndMap;
  let sourceMappingURL = retrieveSourceMapURL(source);
  if (!sourceMappingURL) return null;
  let sourceMapData;
  if (reSourceMap.test(sourceMappingURL)) {
    const rawData = sourceMappingURL.slice(sourceMappingURL.indexOf(",") + 1);
    sourceMapData = Buffer.from(rawData, "base64").toString(), sourceMappingURL = source;
  } else
    sourceMappingURL = supportRelativeURL(source, sourceMappingURL), sourceMapData = retrieveFile(sourceMappingURL);
  return sourceMapData ? {
    url: sourceMappingURL,
    map: sourceMapData
  } : null;
}
function mapSourcePosition(position) {
  if (!position.source) return position;
  let sourceMap = getRuntimeSourceMap(position);
  if (sourceMap || (sourceMap = sourceMapCache[position.source]), !sourceMap) {
    const urlAndMap = retrieveSourceMap(position.source);
    if (urlAndMap && urlAndMap.map) {
      const url = urlAndMap.url;
      sourceMap = sourceMapCache[position.source] = {
        url,
        map: new DecodedMap(
          typeof urlAndMap.map == "string" ? JSON.parse(urlAndMap.map) : urlAndMap.map,
          url
        )
      };
      const contents = sourceMap.map?.map.sourcesContent;
      sourceMap.map && contents && sourceMap.map.resolvedSources.forEach((source, i) => {
        const content = contents[i];
        if (content && source && url) {
          const contentUrl = supportRelativeURL(url, source);
          fileContentsCache[contentUrl] = content;
        }
      });
    } else
      sourceMap = sourceMapCache[position.source] = {
        url: null,
        map: null
      };
  }
  if (sourceMap && sourceMap.map && sourceMap.url) {
    const originalPosition = getOriginalPosition(sourceMap.map, position);
    if (originalPosition && originalPosition.source != null)
      return originalPosition.source = supportRelativeURL(
        sourceMap.url,
        originalPosition.source
      ), sourceMap.vite && (originalPosition._vite = !0), originalPosition;
  }
  return position;
}
function mapEvalOrigin(origin) {
  let match = /^eval at ([^(]+) \((.+):(\d+):(\d+)\)$/.exec(origin);
  if (match) {
    const position = mapSourcePosition({
      name: null,
      source: match[2],
      line: +match[3],
      column: +match[4] - 1
    });
    return `eval at ${match[1]} (${position.source}:${position.line}:${position.column + 1})`;
  }
  return match = /^eval at ([^(]+) \((.+)\)$/.exec(origin), match ? `eval at ${match[1]} (${mapEvalOrigin(match[2])})` : origin;
}
function CallSiteToString() {
  let fileName, fileLocation = "";
  if (this.isNative())
    fileLocation = "native";
  else {
    fileName = this.getScriptNameOrSourceURL(), !fileName && this.isEval() && (fileLocation = this.getEvalOrigin(), fileLocation += ", "), fileName ? fileLocation += fileName : fileLocation += "<anonymous>";
    const lineNumber = this.getLineNumber();
    if (lineNumber != null) {
      fileLocation += `:${lineNumber}`;
      const columnNumber = this.getColumnNumber();
      columnNumber && (fileLocation += `:${columnNumber}`);
    }
  }
  let line = "";
  const functionName = this.getFunctionName();
  let addSuffix = !0;
  const isConstructor = this.isConstructor();
  if (this.isToplevel() || isConstructor)
    isConstructor ? line += `new ${functionName || "<anonymous>"}` : functionName ? line += functionName : (line += fileLocation, addSuffix = !1);
  else {
    let typeName = this.getTypeName();
    typeName === "[object Object]" && (typeName = "null");
    const methodName = this.getMethodName();
    functionName ? (typeName && functionName.indexOf(typeName) !== 0 && (line += `${typeName}.`), line += functionName, methodName && functionName.indexOf(`.${methodName}`) !== functionName.length - methodName.length - 1 && (line += ` [as ${methodName}]`)) : line += `${typeName}.${methodName || "<anonymous>"}`;
  }
  return addSuffix && (line += ` (${fileLocation})`), line;
}
function cloneCallSite(frame) {
  const object = {};
  return Object.getOwnPropertyNames(Object.getPrototypeOf(frame)).forEach((name) => {
    const key = name;
    object[key] = /^(?:is|get)/.test(name) ? function() {
      return frame[key].call(frame);
    } : frame[key];
  }), object.toString = CallSiteToString, object;
}
function wrapCallSite(frame, state) {
  if (state === void 0 && (state = { nextPosition: null, curPosition: null }), frame.isNative())
    return state.curPosition = null, frame;
  const source = frame.getFileName() || frame.getScriptNameOrSourceURL();
  if (source) {
    const line = frame.getLineNumber();
    let column = frame.getColumnNumber() - 1;
    const headerLength = 62;
    line === 1 && column > headerLength && !frame.isEval() && (column -= headerLength);
    const position = mapSourcePosition({
      name: null,
      source,
      line,
      column
    });
    state.curPosition = position, frame = cloneCallSite(frame);
    const originalFunctionName = frame.getFunctionName;
    return frame.getFunctionName = function() {
      const name = state.nextPosition == null ? originalFunctionName() : state.nextPosition.name || originalFunctionName();
      return name === "eval" && "_vite" in position ? null : name;
    }, frame.getFileName = function() {
      return position.source ?? void 0;
    }, frame.getLineNumber = function() {
      return position.line;
    }, frame.getColumnNumber = function() {
      return position.column + 1;
    }, frame.getScriptNameOrSourceURL = function() {
      return position.source;
    }, frame;
  }
  let origin = frame.isEval() && frame.getEvalOrigin();
  return origin && (origin = mapEvalOrigin(origin), frame = cloneCallSite(frame), frame.getEvalOrigin = function() {
    return origin || void 0;
  }), frame;
}
function prepareStackTrace(error, stack) {
  const name = error.name || "Error", message = error.message || "", errorString = `${name}: ${message}`, state = { nextPosition: null, curPosition: null }, processedStack = [];
  for (let i = stack.length - 1; i >= 0; i--)
    processedStack.push(`
    at ${wrapCallSite(stack[i], state)}`), state.nextPosition = state.curPosition;
  return state.curPosition = state.nextPosition = null, errorString + processedStack.reverse().join("");
}
function enableSourceMapSupport(runtime) {
  if (runtime.options.sourcemapInterceptor === "node") {
    if (typeof process > "u")
      throw new TypeError(
        `Cannot use "sourcemapInterceptor: 'node'" because global "process" variable is not available.`
      );
    if (typeof process.setSourceMapsEnabled != "function")
      throw new TypeError(
        `Cannot use "sourcemapInterceptor: 'node'" because "process.setSourceMapsEnabled" function is not available. Please use Node >= 16.6.0.`
      );
    const isEnabledAlready = process.sourceMapsEnabled ?? !1;
    return process.setSourceMapsEnabled(!0), () => !isEnabledAlready && process.setSourceMapsEnabled(!1);
  }
  return interceptStackTrace(
    runtime,
    typeof runtime.options.sourcemapInterceptor == "object" ? runtime.options.sourcemapInterceptor : void 0
  );
}
class ViteRuntime {
  constructor(options, runner, debug) {
    this.options = options, this.runner = runner, this.debug = debug, this.moduleCache = options.moduleCache ?? new ModuleCacheMap(options.root), typeof options.hmr == "object" && (this.hmrClient = new HMRClient(
      options.hmr.logger === !1 ? silentConsole : options.hmr.logger || console,
      options.hmr.connection,
      ({ acceptedPath, ssrInvalidates }) => (this.moduleCache.invalidate(acceptedPath), ssrInvalidates && this.invalidateFiles(ssrInvalidates), this.executeUrl(acceptedPath))
    ), options.hmr.connection.onUpdate(createHMRHandler(this))), options.sourcemapInterceptor !== !1 && (this._resetSourceMapSupport = enableSourceMapSupport(this));
  }
  /**
   * Holds the cache of modules
   * Keys of the map are ids
   */
  moduleCache;
  hmrClient;
  entrypoints = /* @__PURE__ */ new Set();
  idToUrlMap = /* @__PURE__ */ new Map();
  fileToIdMap = /* @__PURE__ */ new Map();
  envProxy = new Proxy({}, {
    get(_, p) {
      throw new Error(
        `[vite-runtime] Dynamic access of "import.meta.env" is not supported. Please, use "import.meta.env.${String(p)}" instead.`
      );
    }
  });
  _destroyed = !1;
  _resetSourceMapSupport;
  /**
   * URL to execute. Accepts file path, server path or id relative to the root.
   */
  async executeUrl(url) {
    url = this.normalizeEntryUrl(url);
    const fetchedModule = await this.cachedModule(url);
    return await this.cachedRequest(url, fetchedModule);
  }
  /**
   * Entrypoint URL to execute. Accepts file path, server path or id relative to the root.
   * In the case of a full reload triggered by HMR, this is the module that will be reloaded.
   * If this method is called multiple times, all entrypoints will be reloaded one at a time.
   */
  async executeEntrypoint(url) {
    url = this.normalizeEntryUrl(url);
    const fetchedModule = await this.cachedModule(url);
    return await this.cachedRequest(url, fetchedModule, [], {
      entrypoint: !0
    });
  }
  /**
   * Clear all caches including HMR listeners.
   */
  clearCache() {
    this.moduleCache.clear(), this.idToUrlMap.clear(), this.entrypoints.clear(), this.hmrClient?.clear();
  }
  /**
   * Clears all caches, removes all HMR listeners, and resets source map support.
   * This method doesn't stop the HMR connection.
   */
  async destroy() {
    this._resetSourceMapSupport?.(), this.clearCache(), this.hmrClient = void 0, this._destroyed = !0;
  }
  /**
   * Returns `true` if the runtime has been destroyed by calling `destroy()` method.
   */
  isDestroyed() {
    return this._destroyed;
  }
  invalidateFiles(files) {
    files.forEach((file) => {
      const ids = this.fileToIdMap.get(file);
      ids && ids.forEach((id) => this.moduleCache.invalidate(id));
    });
  }
  // we don't use moduleCache.normalize because this URL doesn't have to follow the same rules
  // this URL is something that user passes down manually, and is later resolved by fetchModule
  // moduleCache.normalize is used on resolved "file" property
  normalizeEntryUrl(url) {
    if (url[0] === ".")
      return url;
    url.startsWith("file://") && (url = url.slice(isWindows ? 8 : 7)), url = slash(url);
    const _root = this.options.root, root = _root[_root.length - 1] === "/" ? _root : `${_root}/`;
    return url.startsWith(root) ? url.slice(root.length - 1) : url[0] === "/" ? url : wrapId(url);
  }
  processImport(exports, fetchResult, metadata) {
    if (!("externalize" in fetchResult))
      return exports;
    const { id, type } = fetchResult;
    return type !== "module" && type !== "commonjs" || analyzeImportedModDifference(exports, id, type, metadata), exports;
  }
  async cachedRequest(id, fetchedModule, callstack = [], metadata) {
    const moduleId = fetchedModule.id;
    metadata?.entrypoint && this.entrypoints.add(moduleId);
    const mod = this.moduleCache.getByModuleId(moduleId), { imports, importers } = mod, importee = callstack[callstack.length - 1];
    if (importee && importers.add(importee), (callstack.includes(moduleId) || Array.from(imports.values()).some((i) => importers.has(i))) && mod.exports)
      return this.processImport(mod.exports, fetchedModule, metadata);
    let debugTimer;
    this.debug && (debugTimer = setTimeout(() => {
      const getStack = () => `stack:
${[...callstack, moduleId].reverse().map((p) => `  - ${p}`).join(`
`)}`;
      this.debug(
        `[vite-runtime] module ${moduleId} takes over 2s to load.
${getStack()}`
      );
    }, 2e3));
    try {
      if (mod.promise)
        return this.processImport(await mod.promise, fetchedModule, metadata);
      const promise = this.directRequest(id, fetchedModule, callstack);
      return mod.promise = promise, mod.evaluated = !1, this.processImport(await promise, fetchedModule, metadata);
    } finally {
      mod.evaluated = !0, debugTimer && clearTimeout(debugTimer);
    }
  }
  async cachedModule(id, importer) {
    if (this._destroyed)
      throw new Error("[vite] Vite runtime has been destroyed.");
    const normalized = this.idToUrlMap.get(id);
    if (normalized) {
      const mod2 = this.moduleCache.getByModuleId(normalized);
      if (mod2.meta)
        return mod2.meta;
    }
    this.debug?.("[vite-runtime] fetching", id);
    const fetchedModule = id.startsWith("data:") ? { externalize: id, type: "builtin" } : await this.options.fetchModule(id, importer), idQuery = id.split("?")[1], query = idQuery ? `?${idQuery}` : "", file = "file" in fetchedModule ? fetchedModule.file : void 0, fullFile = file ? `${file}${query}` : id, moduleId = this.moduleCache.normalize(fullFile), mod = this.moduleCache.getByModuleId(moduleId);
    if (fetchedModule.id = moduleId, mod.meta = fetchedModule, file) {
      const fileModules = this.fileToIdMap.get(file) || [];
      fileModules.push(moduleId), this.fileToIdMap.set(file, fileModules);
    }
    return this.idToUrlMap.set(id, moduleId), this.idToUrlMap.set(unwrapId(id), moduleId), fetchedModule;
  }
  // override is allowed, consider this a public API
  async directRequest(id, fetchResult, _callstack) {
    const moduleId = fetchResult.id, callstack = [..._callstack, moduleId], mod = this.moduleCache.getByModuleId(moduleId), request = async (dep, metadata) => {
      const fetchedModule = await this.cachedModule(dep, moduleId);
      return this.moduleCache.getByModuleId(fetchedModule.id).importers.add(moduleId), mod.imports.add(fetchedModule.id), this.cachedRequest(dep, fetchedModule, callstack, metadata);
    }, dynamicRequest = async (dep) => (dep = String(dep), dep[0] === "." && (dep = posixResolve(posixDirname(id), dep)), request(dep, { isDynamicImport: !0 }));
    if ("externalize" in fetchResult) {
      const { externalize } = fetchResult;
      this.debug?.("[vite-runtime] externalizing", externalize);
      const exports2 = await this.runner.runExternalModule(externalize);
      return mod.exports = exports2, exports2;
    }
    const { code, file } = fetchResult;
    if (code == null) {
      const importer = callstack[callstack.length - 2];
      throw new Error(
        `[vite-runtime] Failed to load "${id}"${importer ? ` imported from ${importer}` : ""}`
      );
    }
    const modulePath = cleanUrl(file || moduleId), href = posixPathToFileHref(modulePath), filename = modulePath, dirname2 = posixDirname(modulePath), meta = {
      filename: isWindows ? toWindowsPath(filename) : filename,
      dirname: isWindows ? toWindowsPath(dirname2) : dirname2,
      url: href,
      env: this.envProxy,
      resolve(id2, parent) {
        throw new Error(
          '[vite-runtime] "import.meta.resolve" is not supported.'
        );
      },
      // should be replaced during transformation
      glob() {
        throw new Error('[vite-runtime] "import.meta.glob" is not supported.');
      }
    }, exports = /* @__PURE__ */ Object.create(null);
    Object.defineProperty(exports, Symbol.toStringTag, {
      value: "Module",
      enumerable: !1,
      configurable: !1
    }), mod.exports = exports;
    let hotContext;
    this.hmrClient && Object.defineProperty(meta, "hot", {
      enumerable: !0,
      get: () => {
        if (!this.hmrClient)
          throw new Error("[vite-runtime] HMR client was destroyed.");
        return this.debug?.("[vite-runtime] creating hmr context for", moduleId), hotContext ||= new HMRContext(this.hmrClient, moduleId), hotContext;
      },
      set: (value) => {
        hotContext = value;
      }
    });
    const context = {
      [ssrImportKey]: request,
      [ssrDynamicImportKey]: dynamicRequest,
      [ssrModuleExportsKey]: exports,
      [ssrExportAllKey]: (obj) => exportAll(exports, obj),
      [ssrImportMetaKey]: meta
    };
    return this.debug?.("[vite-runtime] executing", href), await this.runner.runViteModule(context, code, id), exports;
  }
}
function exportAll(exports, sourceModule) {
  if (exports !== sourceModule && !(isPrimitive(sourceModule) || Array.isArray(sourceModule) || sourceModule instanceof Promise)) {
    for (const key in sourceModule)
      if (key !== "default" && key !== "__esModule")
        try {
          Object.defineProperty(exports, key, {
            enumerable: !0,
            configurable: !0,
            get: () => sourceModule[key]
          });
        } catch {
        }
  }
}
class ESModulesRunner {
  async runViteModule(context, code) {
    await new AsyncFunction(
      ssrModuleExportsKey,
      ssrImportMetaKey,
      ssrImportKey,
      ssrDynamicImportKey,
      ssrExportAllKey,
      // source map should already be inlined by Vite
      '"use strict";' + code
    )(
      context[ssrModuleExportsKey],
      context[ssrImportMetaKey],
      context[ssrImportKey],
      context[ssrDynamicImportKey],
      context[ssrExportAllKey]
    ), Object.seal(context[ssrModuleExportsKey]);
  }
  runExternalModule(filepath) {
    return import(filepath);
  }
}
export {
  ESModulesRunner,
  ModuleCacheMap,
  ViteRuntime,
  ssrDynamicImportKey,
  ssrExportAllKey,
  ssrImportKey,
  ssrImportMetaKey,
  ssrModuleExportsKey
};
