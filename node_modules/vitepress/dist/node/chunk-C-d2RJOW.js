import { createHash } from 'node:crypto';
import fs__default from 'node:fs';
import module, { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { MessageChannel, Worker, workerData, parentPort, receiveMessageOnPort } from 'node:worker_threads';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const CWD = process.cwd();
const cjsRequire$1 = typeof require === 'undefined' ? createRequire(import.meta.url) : require;
const EXTENSIONS = ['.ts', '.tsx', ...Object.keys(cjsRequire$1.extensions)];

const tryPkg = (pkg) => {
    try {
        return cjsRequire$1.resolve(pkg);
    }
    catch (_a) { }
};
const isPkgAvailable = (pkg) => !!tryPkg(pkg);
const tryFile = (filePath, includeDir = false) => {
    if (typeof filePath === 'string') {
        return fs__default.existsSync(filePath) &&
            (includeDir || fs__default.statSync(filePath).isFile())
            ? filePath
            : '';
    }
    for (const file of filePath !== null && filePath !== undefined ? filePath : []) {
        if (tryFile(file, includeDir)) {
            return file;
        }
    }
    return '';
};
const tryExtensions = (filepath, extensions = EXTENSIONS) => {
    const ext = [...extensions, ''].find(ext => tryFile(filepath + ext));
    return ext == null ? '' : filepath + ext;
};
const findUp = (searchEntry, searchFileOrIncludeDir, includeDir) => {
    console.assert(path.isAbsolute(searchEntry));
    if (!tryFile(searchEntry, true) ||
        (searchEntry !== CWD && !searchEntry.startsWith(CWD + path.sep))) {
        return '';
    }
    searchEntry = path.resolve(fs__default.statSync(searchEntry).isDirectory()
        ? searchEntry
        : path.resolve(searchEntry, '..'));
    const isSearchFile = "undefined" === 'string';
    const searchFile = 'package.json';
    do {
        const searched = tryFile(path.resolve(searchEntry, searchFile), isSearchFile);
        if (searched) {
            return searched;
        }
        searchEntry = path.resolve(searchEntry, '..');
    } while (searchEntry === CWD || searchEntry.startsWith(CWD + path.sep));
    return '';
};

const INT32_BYTES = 4;
const TsRunner = {
    TsNode: 'ts-node',
    EsbuildRegister: 'esbuild-register',
    EsbuildRunner: 'esbuild-runner',
    SWC: 'swc',
    TSX: 'tsx',
};
const { NODE_OPTIONS, SYNCKIT_EXEC_ARGV, SYNCKIT_GLOBAL_SHIMS, SYNCKIT_TIMEOUT, SYNCKIT_TS_RUNNER, } = process.env;
const IS_NODE_20 = Number(process.versions.node.split('.')[0]) >= 20;
const DEFAULT_TIMEOUT = SYNCKIT_TIMEOUT ? +SYNCKIT_TIMEOUT : undefined;
const DEFAULT_EXEC_ARGV = (SYNCKIT_EXEC_ARGV === null || SYNCKIT_EXEC_ARGV === undefined ? undefined : SYNCKIT_EXEC_ARGV.split(',')) || [];
const DEFAULT_TS_RUNNER = SYNCKIT_TS_RUNNER;
const DEFAULT_GLOBAL_SHIMS = ['1', 'true'].includes(SYNCKIT_GLOBAL_SHIMS);
const DEFAULT_GLOBAL_SHIMS_PRESET = [
    {
        moduleName: 'node-fetch',
        globalName: 'fetch',
    },
    {
        moduleName: 'node:perf_hooks',
        globalName: 'performance',
        named: 'performance',
    },
];
const MTS_SUPPORTED_NODE_VERSION = 16;
let syncFnCache;
function extractProperties(object) {
    if (object && typeof object === 'object') {
        const properties = {};
        for (const key in object) {
            properties[key] = object[key];
        }
        return properties;
    }
}
function createSyncFn(workerPath, timeoutOrOptions) {
    syncFnCache !== null && syncFnCache !== undefined ? syncFnCache : (syncFnCache = new Map());
    const cachedSyncFn = syncFnCache.get(workerPath);
    if (cachedSyncFn) {
        return cachedSyncFn;
    }
    if (!path.isAbsolute(workerPath)) {
        throw new Error('`workerPath` must be absolute');
    }
    const syncFn = startWorkerThread(workerPath, timeoutOrOptions);
    syncFnCache.set(workerPath, syncFn);
    return syncFn;
}
const cjsRequire = typeof require === 'undefined'
    ? module.createRequire(import.meta.url)
    : require;
const dataUrl = (code) => new URL(`data:text/javascript,${encodeURIComponent(code)}`);
const isFile = (path) => {
    var _a;
    try {
        return !!((_a = fs__default.statSync(path, { throwIfNoEntry: false })) === null || _a === void 0 ? void 0 : _a.isFile());
    }
    catch (_b) {
        return false;
    }
};
const setupTsRunner = (workerPath, { execArgv, tsRunner }) => {
    let ext = path.extname(workerPath);
    if (!/[/\\]node_modules[/\\]/.test(workerPath) &&
        (!ext || /^\.[cm]?js$/.test(ext))) {
        const workPathWithoutExt = ext
            ? workerPath.slice(0, -ext.length)
            : workerPath;
        let extensions;
        switch (ext) {
            case '.cjs': {
                extensions = ['.cts', '.cjs'];
                break;
            }
            case '.mjs': {
                extensions = ['.mts', '.mjs'];
                break;
            }
            default: {
                extensions = ['.ts', '.js'];
                break;
            }
        }
        const found = tryExtensions(workPathWithoutExt, extensions);
        let differentExt;
        if (found && (!ext || (differentExt = found !== workPathWithoutExt))) {
            workerPath = found;
            if (differentExt) {
                ext = path.extname(workerPath);
            }
        }
    }
    const isTs = /\.[cm]?ts$/.test(workerPath);
    let jsUseEsm = workerPath.endsWith('.mjs');
    let tsUseEsm = workerPath.endsWith('.mts');
    if (isTs) {
        if (!tsUseEsm) {
            const pkg = findUp(workerPath);
            if (pkg) {
                tsUseEsm =
                    cjsRequire(pkg).type ===
                        'module';
            }
        }
        if (tsRunner == null && isPkgAvailable(TsRunner.TsNode)) {
            tsRunner = TsRunner.TsNode;
        }
        switch (tsRunner) {
            case TsRunner.TsNode: {
                if (tsUseEsm) {
                    if (!execArgv.includes('--loader')) {
                        execArgv = ['--loader', `${TsRunner.TsNode}/esm`, ...execArgv];
                    }
                }
                else if (!execArgv.includes('-r')) {
                    execArgv = ['-r', `${TsRunner.TsNode}/register`, ...execArgv];
                }
                break;
            }
            case TsRunner.EsbuildRegister: {
                if (!execArgv.includes('-r')) {
                    execArgv = ['-r', TsRunner.EsbuildRegister, ...execArgv];
                }
                break;
            }
            case TsRunner.EsbuildRunner: {
                if (!execArgv.includes('-r')) {
                    execArgv = ['-r', `${TsRunner.EsbuildRunner}/register`, ...execArgv];
                }
                break;
            }
            case TsRunner.SWC: {
                if (!execArgv.includes('-r')) {
                    execArgv = ['-r', `@${TsRunner.SWC}-node/register`, ...execArgv];
                }
                break;
            }
            case TsRunner.TSX: {
                if (!execArgv.includes('--loader')) {
                    execArgv = ['--loader', TsRunner.TSX, ...execArgv];
                }
                break;
            }
            default: {
                throw new Error(`Unknown ts runner: ${String(tsRunner)}`);
            }
        }
    }
    else if (!jsUseEsm) {
        const pkg = findUp(workerPath);
        if (pkg) {
            jsUseEsm =
                cjsRequire(pkg).type === 'module';
        }
    }
    let resolvedPnpLoaderPath;
    if (process.versions.pnp) {
        const nodeOptions = NODE_OPTIONS === null || NODE_OPTIONS === undefined ? undefined : NODE_OPTIONS.split(/\s+/);
        let pnpApiPath;
        try {
            pnpApiPath = cjsRequire.resolve('pnpapi');
        }
        catch (_a) { }
        if (pnpApiPath &&
            !(nodeOptions === null || nodeOptions === undefined ? undefined : nodeOptions.some((option, index) => ['-r', '--require'].includes(option) &&
                pnpApiPath === cjsRequire.resolve(nodeOptions[index + 1]))) &&
            !execArgv.includes(pnpApiPath)) {
            execArgv = ['-r', pnpApiPath, ...execArgv];
            const pnpLoaderPath = path.resolve(pnpApiPath, '../.pnp.loader.mjs');
            if (isFile(pnpLoaderPath)) {
                resolvedPnpLoaderPath = pathToFileURL(pnpLoaderPath).toString();
                if (!IS_NODE_20) {
                    execArgv = [
                        '--experimental-loader',
                        resolvedPnpLoaderPath,
                        ...execArgv,
                    ];
                }
            }
        }
    }
    return {
        ext,
        isTs,
        jsUseEsm,
        tsRunner,
        tsUseEsm,
        workerPath,
        pnpLoaderPath: resolvedPnpLoaderPath,
        execArgv,
    };
};
const md5Hash = (text) => createHash('md5').update(text).digest('hex');
const encodeImportModule = (moduleNameOrGlobalShim, type = 'import') => {
    const { moduleName, globalName, named, conditional } = typeof moduleNameOrGlobalShim === 'string'
        ? { moduleName: moduleNameOrGlobalShim }
        : moduleNameOrGlobalShim;
    const importStatement = type === 'import'
        ? `import${globalName
            ? ' ' +
                (named === null
                    ? '* as ' + globalName
                    : (named === null || named === undefined ? undefined : named.trim())
                        ? `{${named}}`
                        : globalName) +
                ' from'
            : ''} '${path.isAbsolute(moduleName)
            ? String(pathToFileURL(moduleName))
            : moduleName}'`
        : `${globalName
            ? 'const ' + ((named === null || named === undefined ? undefined : named.trim()) ? `{${named}}` : globalName) + '='
            : ''}require('${moduleName
            .replace(/\\/g, '\\\\')}')`;
    if (!globalName) {
        return importStatement;
    }
    const overrideStatement = `globalThis.${globalName}=${(named === null || named === undefined ? undefined : named.trim()) ? named : globalName}`;
    return (importStatement +
        (conditional === false
            ? `;${overrideStatement}`
            : `;if(!globalThis.${globalName})${overrideStatement}`));
};
const _generateGlobals = (globalShims, type) => globalShims.reduce((acc, shim) => `${acc}${acc ? ';' : ''}${encodeImportModule(shim, type)}`, '');
let globalsCache;
let tmpdir;
const _dirname = typeof __dirname === 'undefined'
    ? path.dirname(fileURLToPath(import.meta.url))
    : __dirname;
let sharedBuffer;
let sharedBufferView;
const generateGlobals = (workerPath, globalShims, type = 'import') => {
    globalsCache !== null && globalsCache !== undefined ? globalsCache : (globalsCache = new Map());
    const cached = globalsCache.get(workerPath);
    if (cached) {
        const [content, filepath] = cached;
        if ((type === 'require' && !filepath) ||
            (type === 'import' && filepath && isFile(filepath))) {
            return content;
        }
    }
    const globals = _generateGlobals(globalShims, type);
    let content = globals;
    let filepath;
    if (type === 'import') {
        if (!tmpdir) {
            tmpdir = path.resolve(findUp(_dirname), '../node_modules/.synckit');
        }
        fs__default.mkdirSync(tmpdir, { recursive: true });
        filepath = path.resolve(tmpdir, md5Hash(workerPath) + '.mjs');
        content = encodeImportModule(filepath);
        fs__default.writeFileSync(filepath, globals);
    }
    globalsCache.set(workerPath, [content, filepath]);
    return content;
};
function startWorkerThread(workerPath, { timeout = DEFAULT_TIMEOUT, execArgv = DEFAULT_EXEC_ARGV, tsRunner = DEFAULT_TS_RUNNER, transferList = [], globalShims = DEFAULT_GLOBAL_SHIMS, } = {}) {
    const { port1: mainPort, port2: workerPort } = new MessageChannel();
    const { isTs, ext, jsUseEsm, tsUseEsm, tsRunner: finalTsRunner, workerPath: finalWorkerPath, pnpLoaderPath, execArgv: finalExecArgv, } = setupTsRunner(workerPath, { execArgv, tsRunner });
    const workerPathUrl = pathToFileURL(finalWorkerPath);
    if (/\.[cm]ts$/.test(finalWorkerPath)) {
        const isTsxSupported = !tsUseEsm ||
            Number.parseFloat(process.versions.node) >= MTS_SUPPORTED_NODE_VERSION;
        if (!finalTsRunner) {
            throw new Error('No ts runner specified, ts worker path is not supported');
        }
        else if ([
            TsRunner.EsbuildRegister,
            TsRunner.EsbuildRunner,
            TsRunner.SWC,
            ...(isTsxSupported ? [] : [TsRunner.TSX]),
        ].includes(finalTsRunner)) {
            throw new Error(`${finalTsRunner} is not supported for ${ext} files yet` +
                (isTsxSupported
                    ? ', you can try [tsx](https://github.com/esbuild-kit/tsx) instead'
                    : ''));
        }
    }
    const finalGlobalShims = (globalShims === true
        ? DEFAULT_GLOBAL_SHIMS_PRESET
        : Array.isArray(globalShims)
            ? globalShims
            : []).filter(({ moduleName }) => isPkgAvailable(moduleName));
    sharedBufferView !== null && sharedBufferView !== undefined ? sharedBufferView : (sharedBufferView = new Int32Array((sharedBuffer !== null && sharedBuffer !== undefined ? sharedBuffer : (sharedBuffer = new SharedArrayBuffer(INT32_BYTES))), 0, 1));
    const useGlobals = finalGlobalShims.length > 0;
    const useEval = isTs ? !tsUseEsm : !jsUseEsm && useGlobals;
    const worker = new Worker((jsUseEsm && useGlobals) || (tsUseEsm && finalTsRunner === TsRunner.TsNode)
        ? dataUrl(`${generateGlobals(finalWorkerPath, finalGlobalShims)};import '${String(workerPathUrl)}'`)
        : useEval
            ? `${generateGlobals(finalWorkerPath, finalGlobalShims, 'require')};${encodeImportModule(finalWorkerPath, 'require')}`
            : workerPathUrl, {
        eval: useEval,
        workerData: { sharedBuffer, workerPort, pnpLoaderPath },
        transferList: [workerPort, ...transferList],
        execArgv: finalExecArgv,
    });
    let nextID = 0;
    const receiveMessageWithId = (port, expectedId, waitingTimeout) => {
        const start = Date.now();
        const status = Atomics.wait(sharedBufferView, 0, 0, waitingTimeout);
        Atomics.store(sharedBufferView, 0, 0);
        if (!['ok', 'not-equal'].includes(status)) {
            const abortMsg = {
                id: expectedId,
                cmd: 'abort',
            };
            port.postMessage(abortMsg);
            throw new Error('Internal error: Atomics.wait() failed: ' + status);
        }
        const _a = receiveMessageOnPort(mainPort).message, { id } = _a, message = __rest(_a, ["id"]);
        if (id < expectedId) {
            const waitingTime = Date.now() - start;
            return receiveMessageWithId(port, expectedId, waitingTimeout ? waitingTimeout - waitingTime : undefined);
        }
        if (expectedId !== id) {
            throw new Error(`Internal error: Expected id ${expectedId} but got id ${id}`);
        }
        return Object.assign({ id }, message);
    };
    const syncFn = (...args) => {
        const id = nextID++;
        const msg = { id, args };
        worker.postMessage(msg);
        const { result, error, properties } = receiveMessageWithId(mainPort, id, timeout);
        if (error) {
            throw Object.assign(error, properties);
        }
        return result;
    };
    worker.unref();
    return syncFn;
}
function runAsWorker(fn) {
    if (!workerData) {
        return;
    }
    const { workerPort, sharedBuffer, pnpLoaderPath } = workerData;
    if (pnpLoaderPath && IS_NODE_20) {
        module.register(pnpLoaderPath);
    }
    const sharedBufferView = new Int32Array(sharedBuffer, 0, 1);
    parentPort.on('message', ({ id, args }) => {
        (() => __awaiter(this, undefined, undefined, function* () {
            let isAborted = false;
            const handleAbortMessage = (msg) => {
                if (msg.id === id && msg.cmd === 'abort') {
                    isAborted = true;
                }
            };
            workerPort.on('message', handleAbortMessage);
            let msg;
            try {
                msg = { id, result: yield fn(...args) };
            }
            catch (error) {
                msg = { id, error, properties: extractProperties(error) };
            }
            workerPort.off('message', handleAbortMessage);
            if (isAborted) {
                return;
            }
            workerPort.postMessage(msg);
            Atomics.add(sharedBufferView, 0, 1);
            Atomics.notify(sharedBufferView, 0);
        }))();
    });
}

export { createSyncFn as c, runAsWorker as r };
