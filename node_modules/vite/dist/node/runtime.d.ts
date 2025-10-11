import { V as ViteRuntimeOptions, b as ViteModuleRunner, M as ModuleCacheMap, c as HMRClient, R as ResolvedResult, d as ViteRuntimeModuleContext } from './types.d-aGj9QkWt.js';
export { a as FetchFunction, F as FetchResult, e as HMRConnection, H as HMRLogger, g as HMRRuntimeConnection, f as ModuleCache, S as SSRImportMetadata, h as ViteRuntimeImportMeta, s as ssrDynamicImportKey, i as ssrExportAllKey, j as ssrImportKey, k as ssrImportMetaKey, l as ssrModuleExportsKey } from './types.d-aGj9QkWt.js';
import '../../types/hot.js';
import '../../types/hmrPayload.js';
import '../../types/customEvent.js';

interface ViteRuntimeDebugger {
    (formatter: unknown, ...args: unknown[]): void;
}
declare class ViteRuntime {
    options: ViteRuntimeOptions;
    runner: ViteModuleRunner;
    private debug?;
    /**
     * Holds the cache of modules
     * Keys of the map are ids
     */
    moduleCache: ModuleCacheMap;
    hmrClient?: HMRClient;
    entrypoints: Set<string>;
    private idToUrlMap;
    private fileToIdMap;
    private envProxy;
    private _destroyed;
    private _resetSourceMapSupport?;
    constructor(options: ViteRuntimeOptions, runner: ViteModuleRunner, debug?: ViteRuntimeDebugger | undefined);
    /**
     * URL to execute. Accepts file path, server path or id relative to the root.
     */
    executeUrl<T = any>(url: string): Promise<T>;
    /**
     * Entrypoint URL to execute. Accepts file path, server path or id relative to the root.
     * In the case of a full reload triggered by HMR, this is the module that will be reloaded.
     * If this method is called multiple times, all entrypoints will be reloaded one at a time.
     */
    executeEntrypoint<T = any>(url: string): Promise<T>;
    /**
     * Clear all caches including HMR listeners.
     */
    clearCache(): void;
    /**
     * Clears all caches, removes all HMR listeners, and resets source map support.
     * This method doesn't stop the HMR connection.
     */
    destroy(): Promise<void>;
    /**
     * Returns `true` if the runtime has been destroyed by calling `destroy()` method.
     */
    isDestroyed(): boolean;
    private invalidateFiles;
    private normalizeEntryUrl;
    private processImport;
    private cachedRequest;
    private cachedModule;
    protected directRequest(id: string, fetchResult: ResolvedResult, _callstack: string[]): Promise<any>;
}

declare class ESModulesRunner implements ViteModuleRunner {
    runViteModule(context: ViteRuntimeModuleContext, code: string): Promise<any>;
    runExternalModule(filepath: string): Promise<any>;
}

export { ESModulesRunner, ModuleCacheMap, ResolvedResult, ViteModuleRunner, ViteRuntime, ViteRuntimeModuleContext, ViteRuntimeOptions };
