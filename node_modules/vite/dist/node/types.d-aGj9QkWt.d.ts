import { ModuleNamespace, ViteHotContext } from '../../types/hot.js';
import { Update, HMRPayload } from '../../types/hmrPayload.js';
import { InferCustomEventPayload } from '../../types/customEvent.js';

type CustomListenersMap = Map<string, ((data: any) => void)[]>;
interface HotModule {
    id: string;
    callbacks: HotCallback[];
}
interface HotCallback {
    deps: string[];
    fn: (modules: Array<ModuleNamespace | undefined>) => void;
}
interface HMRLogger {
    error(msg: string | Error): void;
    debug(...msg: unknown[]): void;
}
interface HMRConnection {
    /**
     * Checked before sending messages to the client.
     */
    isReady(): boolean;
    /**
     * Send message to the client.
     */
    send(messages: string): void;
}
declare class HMRMessenger {
    private connection;
    constructor(connection: HMRConnection);
    private queue;
    send(message: string): void;
    flush(): void;
}
declare class HMRClient {
    logger: HMRLogger;
    private importUpdatedModule;
    hotModulesMap: Map<string, HotModule>;
    disposeMap: Map<string, (data: any) => void | Promise<void>>;
    pruneMap: Map<string, (data: any) => void | Promise<void>>;
    dataMap: Map<string, any>;
    customListenersMap: CustomListenersMap;
    ctxToListenersMap: Map<string, CustomListenersMap>;
    messenger: HMRMessenger;
    constructor(logger: HMRLogger, connection: HMRConnection, importUpdatedModule: (update: Update) => Promise<ModuleNamespace>);
    notifyListeners<T extends string>(event: T, data: InferCustomEventPayload<T>): Promise<void>;
    clear(): void;
    prunePaths(paths: string[]): Promise<void>;
    protected warnFailedUpdate(err: Error, path: string | string[]): void;
    private updateQueue;
    private pendingUpdateQueue;
    /**
     * buffer multiple hot updates triggered by the same src change
     * so that they are invoked in the same order they were sent.
     * (otherwise the order may be inconsistent because of the http request round trip)
     */
    queueUpdate(payload: Update): Promise<void>;
    private fetchUpdate;
}

interface DefineImportMetadata {
    /**
     * Imported names before being transformed to `ssrImportKey`
     *
     * import foo, { bar as baz, qux } from 'hello'
     * => ['default', 'bar', 'qux']
     *
     * import * as namespace from 'world
     * => undefined
     */
    importedNames?: string[];
}
interface SSRImportBaseMetadata extends DefineImportMetadata {
    isDynamicImport?: boolean;
}

interface SourceMapLike {
    version: number;
    mappings?: string;
    names?: string[];
    sources?: string[];
    sourcesContent?: string[];
}
declare class DecodedMap {
    map: SourceMapLike;
    _encoded: string;
    _decoded: undefined | number[][][];
    _decodedMemo: Stats;
    url: string;
    version: number;
    names: string[];
    resolvedSources: string[];
    constructor(map: SourceMapLike, from: string);
}
interface Stats {
    lastKey: number;
    lastNeedle: number;
    lastIndex: number;
}

declare class ModuleCacheMap extends Map<string, ModuleCache> {
    private root;
    constructor(root: string, entries?: [string, ModuleCache][]);
    normalize(fsPath: string): string;
    /**
     * Assign partial data to the map
     */
    update(fsPath: string, mod: ModuleCache): this;
    setByModuleId(modulePath: string, mod: ModuleCache): this;
    set(fsPath: string, mod: ModuleCache): this;
    getByModuleId(modulePath: string): ModuleCache;
    get(fsPath: string): ModuleCache;
    deleteByModuleId(modulePath: string): boolean;
    delete(fsPath: string): boolean;
    invalidate(id: string): void;
    isImported({ importedId, importedBy, }: {
        importedId: string;
        importedBy: string;
    }, seen?: Set<string>): boolean;
    /**
     * Invalidate modules that dependent on the given modules, up to the main entry
     */
    invalidateDepTree(ids: string[] | Set<string>, invalidated?: Set<string>): Set<string>;
    /**
     * Invalidate dependency modules of the given modules, down to the bottom-level dependencies
     */
    invalidateSubDepTree(ids: string[] | Set<string>, invalidated?: Set<string>): Set<string>;
    getSourceMap(moduleId: string): null | DecodedMap;
}

declare const ssrModuleExportsKey = "__vite_ssr_exports__";
declare const ssrImportKey = "__vite_ssr_import__";
declare const ssrDynamicImportKey = "__vite_ssr_dynamic_import__";
declare const ssrExportAllKey = "__vite_ssr_exportAll__";
declare const ssrImportMetaKey = "__vite_ssr_import_meta__";

interface RetrieveFileHandler {
    (path: string): string | null | undefined | false;
}
interface RetrieveSourceMapHandler {
    (path: string): null | {
        url: string;
        map: any;
    };
}
interface InterceptorOptions {
    retrieveFile?: RetrieveFileHandler;
    retrieveSourceMap?: RetrieveSourceMapHandler;
}

interface SSRImportMetadata extends SSRImportBaseMetadata {
    entrypoint?: boolean;
}
interface HMRRuntimeConnection extends HMRConnection {
    /**
     * Configure how HMR is handled when this connection triggers an update.
     * This method expects that connection will start listening for HMR updates and call this callback when it's received.
     */
    onUpdate(callback: (payload: HMRPayload) => void): void;
}
interface ViteRuntimeImportMeta extends ImportMeta {
    url: string;
    env: ImportMetaEnv;
    hot?: ViteHotContext;
    [key: string]: any;
}
interface ViteRuntimeModuleContext {
    [ssrModuleExportsKey]: Record<string, any>;
    [ssrImportKey]: (id: string, metadata?: DefineImportMetadata) => Promise<any>;
    [ssrDynamicImportKey]: (id: string, options?: ImportCallOptions) => Promise<any>;
    [ssrExportAllKey]: (obj: any) => void;
    [ssrImportMetaKey]: ViteRuntimeImportMeta;
}
interface ViteModuleRunner {
    /**
     * Run code that was transformed by Vite.
     * @param context Function context
     * @param code Transformed code
     * @param id ID that was used to fetch the module
     */
    runViteModule(context: ViteRuntimeModuleContext, code: string, id: string): Promise<any>;
    /**
     * Run externalized module.
     * @param file File URL to the external module
     */
    runExternalModule(file: string): Promise<any>;
}
interface ModuleCache {
    promise?: Promise<any>;
    exports?: any;
    evaluated?: boolean;
    map?: DecodedMap;
    meta?: FetchResult;
    /**
     * Module ids that imports this module
     */
    importers?: Set<string>;
    imports?: Set<string>;
}
type FetchResult = ExternalFetchResult | ViteFetchResult;
interface ExternalFetchResult {
    /**
     * The path to the externalized module starting with file://,
     * by default this will be imported via a dynamic "import"
     * instead of being transformed by vite and loaded with vite runtime
     */
    externalize: string;
    /**
     * Type of the module. Will be used to determine if import statement is correct.
     * For example, if Vite needs to throw an error if variable is not actually exported
     */
    type?: 'module' | 'commonjs' | 'builtin' | 'network';
}
interface ViteFetchResult {
    /**
     * Code that will be evaluated by vite runtime
     * by default this will be wrapped in an async function
     */
    code: string;
    /**
     * File path of the module on disk.
     * This will be resolved as import.meta.url/filename
     */
    file: string | null;
}
type ResolvedResult = (ExternalFetchResult | ViteFetchResult) & {
    id: string;
};
/**
 * @experimental
 */
type FetchFunction = (id: string, importer?: string) => Promise<FetchResult>;
interface ViteRuntimeOptions {
    /**
     * Root of the project
     */
    root: string;
    /**
     * A method to get the information about the module.
     * For SSR, Vite exposes `server.ssrFetchModule` function that you can use here.
     * For other runtime use cases, Vite also exposes `fetchModule` from its main entry point.
     */
    fetchModule: FetchFunction;
    /**
     * Custom environment variables available on `import.meta.env`. This doesn't modify the actual `process.env`.
     */
    environmentVariables?: Record<string, any>;
    /**
     * Configure how source maps are resolved. Prefers `node` if `process.setSourceMapsEnabled` is available.
     * Otherwise it will use `prepareStackTrace` by default which overrides `Error.prepareStackTrace` method.
     * You can provide an object to configure how file contents and source maps are resolved for files that were not processed by Vite.
     */
    sourcemapInterceptor?: false | 'node' | 'prepareStackTrace' | InterceptorOptions;
    /**
     * Disable HMR or configure HMR options.
     */
    hmr?: false | {
        /**
         * Configure how HMR communicates between the client and the server.
         */
        connection: HMRRuntimeConnection;
        /**
         * Configure HMR logger.
         */
        logger?: false | HMRLogger;
    };
    /**
     * Custom module cache. If not provided, creates a separate module cache for each ViteRuntime instance.
     */
    moduleCache?: ModuleCacheMap;
}
interface ImportMetaEnv {
    [key: string]: any;
    BASE_URL: string;
    MODE: string;
    DEV: boolean;
    PROD: boolean;
    SSR: boolean;
}

export { type FetchResult as F, type HMRLogger as H, ModuleCacheMap as M, type ResolvedResult as R, type SSRImportMetadata as S, type ViteRuntimeOptions as V, type FetchFunction as a, type ViteModuleRunner as b, HMRClient as c, type ViteRuntimeModuleContext as d, type HMRConnection as e, type ModuleCache as f, type HMRRuntimeConnection as g, type ViteRuntimeImportMeta as h, ssrExportAllKey as i, ssrImportKey as j, ssrImportMetaKey as k, ssrModuleExportsKey as l, ssrDynamicImportKey as s };
