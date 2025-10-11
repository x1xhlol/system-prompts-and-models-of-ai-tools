import { ComponentInternalInstance, ComponentOptions, SuspenseBoundary, App as App$1, VNode } from 'vue';
import * as hookable from 'hookable';
import { Hookable, HookKeys } from 'hookable';
import { Router, RouteLocationNormalizedLoaded, RouteRecordNormalized } from 'vue-router';
export { Router } from 'vue-router';
import { BirpcOptions, ChannelOptions, BirpcGroup, BirpcReturn } from 'birpc';

type App = any;
type VueAppInstance = ComponentInternalInstance & {
    type: {
        _componentTag: string | undefined;
        components: Record<string, ComponentInternalInstance['type']>;
        __VUE_DEVTOOLS_COMPONENT_GUSSED_NAME__: string;
        __isKeepAlive: boolean;
        devtools: {
            hide: boolean;
        };
        mixins: ComponentOptions[];
        extends: ComponentOptions;
        vuex: {
            getters: Record<string, unknown>;
        };
        computed: Record<string, unknown>;
    };
    __v_cache: Cache;
    __VUE_DEVTOOLS_NEXT_UID__: string;
    _isBeingDestroyed: boolean;
    _instance: VueAppInstance;
    _container: {
        _vnode: {
            component: VueAppInstance;
        };
    };
    isUnmounted: boolean;
    parent: VueAppInstance;
    appContext: {
        app: VueAppInstance & App & {
            __VUE_DEVTOOLS_NEXT_APP_RECORD_ID__: string;
            __VUE_DEVTOOLS_NEXT_APP_RECORD__: AppRecord;
        };
    };
    __VUE_DEVTOOLS_NEXT_APP_RECORD__: AppRecord;
    suspense: SuspenseBoundary & {
        suspenseKey: string;
    };
    renderContext: Record<string, unknown>;
    devtoolsRawSetupState: Record<string, unknown>;
    setupState: Record<string, unknown>;
    provides: Record<string | symbol, unknown>;
    ctx: Record<string, unknown>;
} & App;
interface AppRecord {
    id: string;
    name: string;
    app?: App;
    version?: string;
    types?: Record<string, string | symbol>;
    instanceMap: Map<string, VueAppInstance>;
    perfGroupIds: Map<string, {
        groupId: number;
        time: number;
    }>;
    rootInstance: VueAppInstance;
    routerId?: string;
    iframe?: string;
}

interface CustomCommandAction {
    type: 'url';
    /**
     * Url of the action, if set, execute the action will open the url
     */
    src: string;
}
interface CustomCommand {
    /**
     * The id of the command, should be unique
     */
    id: string;
    title: string;
    description?: string;
    /**
     * Order of the command, bigger number will be shown first
     * @default 0
     */
    order?: number;
    /**
     * Icon of the tab, support any Iconify icons, or a url to an image
     */
    icon?: string;
    /**
     * - action of the command
     * - __NOTE__: This will be ignored if `children` is set
     */
    action?: CustomCommandAction;
    /**
     * - children of action, if set, execute the action will show the children
     */
    children?: Omit<CustomCommand, 'children'>[];
}

interface CustomInspectorOptions {
    id: string;
    label: string;
    icon?: string;
    treeFilterPlaceholder?: string;
    stateFilterPlaceholder?: string;
    noSelectionText?: string;
    actions?: {
        icon: string;
        tooltip?: string;
        action: () => void | Promise<void>;
    }[];
    nodeActions?: {
        icon: string;
        tooltip?: string;
        action: (nodeId: string) => void | Promise<void>;
    }[];
}
interface InspectorNodeTag {
    label: string;
    textColor: number;
    backgroundColor: number;
    tooltip?: string;
}
type EditStatePayload = {
    value: any;
    newKey?: string | null;
    remove?: undefined | false;
} | {
    value?: undefined;
    newKey?: undefined;
    remove: true;
};
interface CustomInspectorNode {
    id: string;
    label: string;
    children?: CustomInspectorNode[];
    tags?: InspectorNodeTag[];
    name?: string;
    file?: string;
}
interface CustomInspectorState {
    [key: string]: (StateBase | Omit<ComponentState, 'type'>)[];
}

type ComponentInstance = any;
interface ComponentTreeNode {
    uid: string | number;
    id: string;
    name: string;
    renderKey: string | number;
    inactive: boolean;
    isFragment: boolean;
    hasChildren: boolean;
    children: ComponentTreeNode[];
    domOrder?: number[];
    consoleId?: string;
    isRouterView?: boolean;
    macthedRouteSegment?: string;
    tags: InspectorNodeTag[];
    autoOpen: boolean;
    meta?: any;
}
type ComponentBuiltinCustomStateTypes = 'function' | 'map' | 'set' | 'reference' | 'component' | 'component-definition' | 'router' | 'store';
interface ComponentCustomState extends ComponentStateBase {
    value: CustomState;
}
interface StateBase {
    key: string;
    value: any;
    editable?: boolean;
    objectType?: 'ref' | 'reactive' | 'computed' | 'other';
    raw?: string;
}
interface ComponentStateBase extends StateBase {
    type: string;
}
interface ComponentPropState extends ComponentStateBase {
    meta?: {
        type: string;
        required: boolean;
        /** Vue 1 only */
        mode?: 'default' | 'sync' | 'once';
    };
}
interface CustomState {
    _custom: {
        type: ComponentBuiltinCustomStateTypes | string;
        objectType?: string;
        display?: string;
        tooltip?: string;
        value?: any;
        abstract?: boolean;
        file?: string;
        uid?: number;
        readOnly?: boolean;
        /** Configure immediate child fields */
        fields?: {
            abstract?: boolean;
        };
        id?: any;
        actions?: {
            icon: string;
            tooltip?: string;
            action: () => void | Promise<void>;
        }[];
        /** internal */
        _reviveId?: number;
    };
}
type ComponentState = ComponentStateBase | ComponentPropState | ComponentCustomState;
interface InspectedComponentData {
    id: string;
    name: string;
    file: string;
    state: ComponentState[];
    functional?: boolean;
}
interface ComponentBounds {
    left: number;
    top: number;
    width: number;
    height: number;
}

interface DevToolsAppRecords extends AppRecord {
}
interface DevToolsState {
    connected: boolean;
    clientConnected: boolean;
    vitePluginDetected: boolean;
    appRecords: DevToolsAppRecords[];
    activeAppRecordId: string;
    tabs: CustomTab[];
    commands: CustomCommand[];
    highPerfModeEnabled: boolean;
    devtoolsClientDetected: {
        [key: string]: boolean;
    };
    perfUniqueGroupId: number;
    timelineLayersState: Record<string, boolean>;
}
declare const callStateUpdatedHook: (state: DevToolsState) => Promise<void>;
declare const callConnectedUpdatedHook: (state: DevToolsState, oldState: DevToolsState) => Promise<void>;
declare const devtoolsAppRecords: DevToolsAppRecords[] & {
    value: DevToolsAppRecords[];
};
declare const addDevToolsAppRecord: (app: AppRecord) => void;
declare const removeDevToolsAppRecord: (app: AppRecord["app"]) => void;
declare const activeAppRecord: AppRecord & {
    value: AppRecord;
    id: string;
};
declare function setActiveAppRecord(app: AppRecord): void;
declare function setActiveAppRecordId(id: string): void;
declare const devtoolsState: DevToolsState;
declare function resetDevToolsState(): void;
declare function updateDevToolsState(state: Partial<DevToolsState>): void;
declare function onDevToolsConnected(fn: () => void): Promise<void>;
declare function addCustomTab(tab: CustomTab): void;
declare function addCustomCommand(action: CustomCommand): void;
declare function removeCustomCommand(actionId: string): void;
declare function toggleClientConnected(state: boolean): void;

declare enum DevToolsV6PluginAPIHookKeys {
    VISIT_COMPONENT_TREE = "visitComponentTree",
    INSPECT_COMPONENT = "inspectComponent",
    EDIT_COMPONENT_STATE = "editComponentState",
    GET_INSPECTOR_TREE = "getInspectorTree",
    GET_INSPECTOR_STATE = "getInspectorState",
    EDIT_INSPECTOR_STATE = "editInspectorState",
    INSPECT_TIMELINE_EVENT = "inspectTimelineEvent",
    TIMELINE_CLEARED = "timelineCleared",
    SET_PLUGIN_SETTINGS = "setPluginSettings"
}
interface DevToolsV6PluginAPIHookPayloads {
    [DevToolsV6PluginAPIHookKeys.VISIT_COMPONENT_TREE]: {
        app: App;
        componentInstance: ComponentInstance;
        treeNode: ComponentTreeNode;
        filter: string;
    };
    [DevToolsV6PluginAPIHookKeys.INSPECT_COMPONENT]: {
        app: App;
        componentInstance: ComponentInstance;
        instanceData: InspectedComponentData;
    };
    [DevToolsV6PluginAPIHookKeys.EDIT_COMPONENT_STATE]: {
        app: App;
        inspectorId: string;
        nodeId: string;
        path: string[];
        type: string;
        state: EditStatePayload;
        set: (object: any, path?: string | (string[]), value?: any, cb?: (object: any, field: string, value: any) => void) => void;
    };
    [DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_TREE]: {
        app: App;
        inspectorId: string;
        filter: string;
        rootNodes: CustomInspectorNode[];
    };
    [DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_STATE]: {
        app: App;
        inspectorId: string;
        nodeId: string;
        state: CustomInspectorState;
    };
    [DevToolsV6PluginAPIHookKeys.EDIT_INSPECTOR_STATE]: {
        app: App;
        inspectorId: string;
        nodeId: string;
        path: string[];
        type: string;
        state: EditStatePayload;
        set: (object: any, path?: string | (string[]), value?: any, cb?: (object: any, field: string, value: any) => void) => void;
    };
    [DevToolsV6PluginAPIHookKeys.INSPECT_TIMELINE_EVENT]: {
        app: App;
        layerId: string;
        event: TimelineEvent;
        all?: boolean;
        data: any;
    };
    [DevToolsV6PluginAPIHookKeys.TIMELINE_CLEARED]: Record<string, never>;
    [DevToolsV6PluginAPIHookKeys.SET_PLUGIN_SETTINGS]: {
        app: App;
        pluginId: string;
        key: string;
        newValue: any;
        oldValue: any;
        settings: any;
    };
}
interface DevToolsV6PluginAPIHooks {
    [DevToolsV6PluginAPIHookKeys.VISIT_COMPONENT_TREE]: (payload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.VISIT_COMPONENT_TREE]) => void;
    [DevToolsV6PluginAPIHookKeys.INSPECT_COMPONENT]: (payload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.INSPECT_COMPONENT]) => void;
    [DevToolsV6PluginAPIHookKeys.EDIT_COMPONENT_STATE]: (payload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.EDIT_COMPONENT_STATE]) => void;
    [DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_TREE]: (payload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_TREE]) => void;
    [DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_STATE]: (payload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_STATE]) => void;
    [DevToolsV6PluginAPIHookKeys.EDIT_INSPECTOR_STATE]: (payload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.EDIT_INSPECTOR_STATE]) => void;
    [DevToolsV6PluginAPIHookKeys.INSPECT_TIMELINE_EVENT]: (payload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.INSPECT_TIMELINE_EVENT]) => void;
    [DevToolsV6PluginAPIHookKeys.TIMELINE_CLEARED]: (payload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.TIMELINE_CLEARED]) => void;
    [DevToolsV6PluginAPIHookKeys.SET_PLUGIN_SETTINGS]: (payload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.SET_PLUGIN_SETTINGS]) => void;
}
declare enum DevToolsContextHookKeys {
    ADD_INSPECTOR = "addInspector",
    SEND_INSPECTOR_TREE = "sendInspectorTree",
    SEND_INSPECTOR_STATE = "sendInspectorState",
    CUSTOM_INSPECTOR_SELECT_NODE = "customInspectorSelectNode",
    TIMELINE_LAYER_ADDED = "timelineLayerAdded",
    TIMELINE_EVENT_ADDED = "timelineEventAdded",
    GET_COMPONENT_INSTANCES = "getComponentInstances",
    GET_COMPONENT_BOUNDS = "getComponentBounds",
    GET_COMPONENT_NAME = "getComponentName",
    COMPONENT_HIGHLIGHT = "componentHighlight",
    COMPONENT_UNHIGHLIGHT = "componentUnhighlight"
}
interface DevToolsContextHookPayloads {
    [DevToolsContextHookKeys.ADD_INSPECTOR]: {
        inspector: CustomInspectorOptions;
        plugin: DevToolsPlugin;
    };
    [DevToolsContextHookKeys.SEND_INSPECTOR_TREE]: {
        inspectorId: string;
        plugin: DevToolsPlugin;
    };
    [DevToolsContextHookKeys.SEND_INSPECTOR_STATE]: {
        inspectorId: string;
        plugin: DevToolsPlugin;
    };
    [DevToolsContextHookKeys.CUSTOM_INSPECTOR_SELECT_NODE]: {
        inspectorId: string;
        nodeId: string;
        plugin: DevToolsPlugin;
    };
    [DevToolsContextHookKeys.TIMELINE_LAYER_ADDED]: {
        options: TimelineLayerOptions;
        plugin: DevToolsPlugin;
    };
    [DevToolsContextHookKeys.TIMELINE_EVENT_ADDED]: {
        options: TimelineEventOptions;
        plugin: DevToolsPlugin;
    };
    [DevToolsContextHookKeys.GET_COMPONENT_INSTANCES]: {
        app: App;
    };
    [DevToolsContextHookKeys.GET_COMPONENT_BOUNDS]: {
        instance: ComponentInstance;
    };
    [DevToolsContextHookKeys.GET_COMPONENT_NAME]: {
        instance: ComponentInstance;
    };
    [DevToolsContextHookKeys.COMPONENT_HIGHLIGHT]: {
        uid: string;
    };
    [DevToolsContextHookKeys.COMPONENT_UNHIGHLIGHT]: Record<string, never>;
}
declare enum DevToolsMessagingHookKeys {
    SEND_INSPECTOR_TREE_TO_CLIENT = "sendInspectorTreeToClient",
    SEND_INSPECTOR_STATE_TO_CLIENT = "sendInspectorStateToClient",
    SEND_TIMELINE_EVENT_TO_CLIENT = "sendTimelineEventToClient",
    SEND_INSPECTOR_TO_CLIENT = "sendInspectorToClient",
    SEND_ACTIVE_APP_UNMOUNTED_TO_CLIENT = "sendActiveAppUpdatedToClient",
    DEVTOOLS_STATE_UPDATED = "devtoolsStateUpdated",
    DEVTOOLS_CONNECTED_UPDATED = "devtoolsConnectedUpdated",
    ROUTER_INFO_UPDATED = "routerInfoUpdated"
}
interface DevToolsMessagingHookPayloads {
    [DevToolsMessagingHookKeys.SEND_INSPECTOR_TREE_TO_CLIENT]: {
        inspectorId: string;
        rootNodes: CustomInspectorNode[];
    };
    [DevToolsMessagingHookKeys.SEND_INSPECTOR_STATE_TO_CLIENT]: {
        inspectorId: string;
        nodeId: string;
        state: CustomInspectorState;
    };
    [DevToolsMessagingHookKeys.SEND_TIMELINE_EVENT_TO_CLIENT]: TimelineEventOptions;
    [DevToolsMessagingHookKeys.SEND_INSPECTOR_TO_CLIENT]: {
        id: string;
        label: string;
        logo: string;
        icon: string;
        packageName: string | undefined;
        homepage: string | undefined;
    }[];
    [DevToolsMessagingHookKeys.DEVTOOLS_STATE_UPDATED]: {
        state: DevToolsState;
    };
    [DevToolsMessagingHookKeys.DEVTOOLS_CONNECTED_UPDATED]: {
        state: DevToolsState;
        oldState: DevToolsState;
    };
    [DevToolsMessagingHookKeys.ROUTER_INFO_UPDATED]: {
        state: RouterInfo;
    };
}
interface DevToolsMessagingHooks {
    [DevToolsMessagingHookKeys.SEND_INSPECTOR_TREE_TO_CLIENT]: (payload: DevToolsMessagingHookPayloads[DevToolsMessagingHookKeys.SEND_INSPECTOR_TREE_TO_CLIENT]) => void;
    [DevToolsMessagingHookKeys.SEND_INSPECTOR_STATE_TO_CLIENT]: (payload: DevToolsMessagingHookPayloads[DevToolsMessagingHookKeys.SEND_INSPECTOR_STATE_TO_CLIENT]) => void;
    [DevToolsMessagingHookKeys.SEND_TIMELINE_EVENT_TO_CLIENT]: (payload: DevToolsMessagingHookPayloads[DevToolsMessagingHookKeys.SEND_TIMELINE_EVENT_TO_CLIENT]) => void;
    [DevToolsMessagingHookKeys.SEND_ACTIVE_APP_UNMOUNTED_TO_CLIENT]: () => void;
    [DevToolsMessagingHookKeys.SEND_INSPECTOR_TO_CLIENT]: (payload: DevToolsMessagingHookPayloads[DevToolsMessagingHookKeys.SEND_INSPECTOR_TO_CLIENT]) => void;
    [DevToolsMessagingHookKeys.DEVTOOLS_STATE_UPDATED]: (payload: DevToolsMessagingHookPayloads[DevToolsMessagingHookKeys.DEVTOOLS_STATE_UPDATED]) => void;
    [DevToolsMessagingHookKeys.DEVTOOLS_CONNECTED_UPDATED]: (payload: DevToolsMessagingHookPayloads[DevToolsMessagingHookKeys.DEVTOOLS_CONNECTED_UPDATED]) => void;
    [DevToolsMessagingHookKeys.ROUTER_INFO_UPDATED]: (payload: DevToolsMessagingHookPayloads[DevToolsMessagingHookKeys.ROUTER_INFO_UPDATED]) => void;
}
interface DevToolsContextHooks extends DevToolsV6PluginAPIHooks {
    [DevToolsContextHookKeys.ADD_INSPECTOR]: (payload: DevToolsContextHookPayloads[DevToolsContextHookKeys.ADD_INSPECTOR]) => void;
    [DevToolsContextHookKeys.SEND_INSPECTOR_TREE]: (payload: DevToolsContextHookPayloads[DevToolsContextHookKeys.SEND_INSPECTOR_TREE]) => void;
    [DevToolsContextHookKeys.SEND_INSPECTOR_STATE]: (payload: DevToolsContextHookPayloads[DevToolsContextHookKeys.SEND_INSPECTOR_STATE]) => void;
    [DevToolsContextHookKeys.CUSTOM_INSPECTOR_SELECT_NODE]: (payload: DevToolsContextHookPayloads[DevToolsContextHookKeys.CUSTOM_INSPECTOR_SELECT_NODE]) => void;
    [DevToolsContextHookKeys.TIMELINE_LAYER_ADDED]: (payload: DevToolsContextHookPayloads[DevToolsContextHookKeys.TIMELINE_LAYER_ADDED]) => void;
    [DevToolsContextHookKeys.TIMELINE_EVENT_ADDED]: (payload: DevToolsContextHookPayloads[DevToolsContextHookKeys.TIMELINE_EVENT_ADDED]) => void;
    [DevToolsContextHookKeys.GET_COMPONENT_INSTANCES]: (payload: DevToolsContextHookPayloads[DevToolsContextHookKeys.GET_COMPONENT_INSTANCES]) => void;
    [DevToolsContextHookKeys.GET_COMPONENT_BOUNDS]: (payload: DevToolsContextHookPayloads[DevToolsContextHookKeys.GET_COMPONENT_BOUNDS]) => void;
    [DevToolsContextHookKeys.GET_COMPONENT_NAME]: (payload: DevToolsContextHookPayloads[DevToolsContextHookKeys.GET_COMPONENT_NAME]) => void;
    [DevToolsContextHookKeys.COMPONENT_HIGHLIGHT]: (payload: DevToolsContextHookPayloads[DevToolsContextHookKeys.COMPONENT_HIGHLIGHT]) => void;
    [DevToolsContextHookKeys.COMPONENT_UNHIGHLIGHT]: () => void;
}
declare function createDevToolsCtxHooks(): hookable.Hookable<DevToolsContextHooks & DevToolsMessagingHooks, hookable.HookKeys<DevToolsContextHooks & DevToolsMessagingHooks>>;

interface ComponentInspector {
    enabled: boolean;
    position: {
        x: number;
        y: number;
    };
    linkParams: {
        file: string;
        line: number;
        column: number;
    };
    enable: () => void;
    disable: () => void;
    toggleEnabled: () => void;
    openInEditor: (baseUrl: string, file: string, line: number, column: number) => void;
    onUpdated: () => void;
}
declare function toggleComponentInspectorEnabled(enabled: boolean): void;
declare function getComponentInspector(): Promise<ComponentInspector>;

interface OpenInEditorOptions {
    baseUrl?: string;
    file?: string;
    line?: number;
    column?: number;
    host?: string;
}
declare function setOpenInEditorBaseUrl(url: string): void;
declare function openInEditor(options?: OpenInEditorOptions): void;

declare function createDevToolsApi(hooks: Hookable<DevToolsContextHooks & DevToolsMessagingHooks, HookKeys<DevToolsContextHooks & DevToolsMessagingHooks>>): {
    getInspectorTree(payload: Pick<DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_TREE], "inspectorId" | "filter">): Promise<never[]>;
    getInspectorState(payload: Pick<DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_STATE], "inspectorId" | "nodeId">): Promise<CustomInspectorState>;
    editInspectorState(payload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.EDIT_INSPECTOR_STATE]): void;
    sendInspectorState(inspectorId: string): void;
    inspectComponentInspector(): Promise<string>;
    cancelInspectComponentInspector(): void;
    getComponentRenderCode(id: string): any;
    scrollToComponent(id: string): void;
    openInEditor: typeof openInEditor;
    getVueInspector: typeof getComponentInspector;
    toggleApp(id: string, options?: {
        inspectingComponent?: boolean;
    }): void;
    inspectDOM(instanceId: string): void;
    updatePluginSettings(pluginId: string, key: string, value: string): void;
    getPluginSettings(pluginId: string): {
        options: Record<string, {
            label: string;
            description?: string;
        } & ({
            type: "boolean";
            defaultValue: boolean;
        } | {
            type: "choice";
            defaultValue: string | number;
            options: {
                value: string | number;
                label: string;
            }[];
            component?: "select" | "button-group";
        } | {
            type: "text";
            defaultValue: string;
        })> | null;
        values: any;
    };
};
type DevToolsApiType = ReturnType<typeof createDevToolsApi>;

declare function getDevToolsEnv(): {
    vitePluginDetected: boolean;
};
declare function setDevToolsEnv(env: Partial<any>): void;

interface DevToolsKitInspector {
    options: CustomInspectorOptions;
    descriptor: PluginDescriptor;
    treeFilterPlaceholder: string;
    stateFilterPlaceholder: string;
    treeFilter: string;
    selectedNodeId: string;
    appRecord: unknown;
}
declare const devtoolsInspector: DevToolsKitInspector[];
declare const callInspectorUpdatedHook: () => Promise<void>;
declare function addInspector(inspector: CustomInspectorOptions, descriptor: PluginDescriptor): void;
declare function getActiveInspectors(): {
    id: string;
    label: string;
    logo: string;
    icon: string;
    packageName: string | undefined;
    homepage: string | undefined;
    pluginId: string;
}[];
declare function getInspectorInfo(id: string): {
    id: string;
    label: string;
    logo: string | undefined;
    packageName: string | undefined;
    homepage: string | undefined;
    timelineLayers: {
        id: string;
        label: string;
        color: number;
    }[];
    treeFilterPlaceholder: string;
    stateFilterPlaceholder: string;
} | undefined;
declare function getInspector(id: string, app?: App$1): DevToolsKitInspector | undefined;
declare function getInspectorActions(id: string): {
    icon: string;
    tooltip?: string;
    action: () => void | Promise<void>;
}[] | undefined;
declare function getInspectorNodeActions(id: string): {
    icon: string;
    tooltip?: string;
    action: (nodeId: string) => void | Promise<void>;
}[] | undefined;

type DevToolsKitPluginBuffer = [PluginDescriptor, PluginSetupFunction];
declare const devtoolsPluginBuffer: DevToolsKitPluginBuffer[];
declare function addDevToolsPluginToBuffer(pluginDescriptor: PluginDescriptor, setupFn: PluginSetupFunction): void;

declare const ROUTER_KEY = "__VUE_DEVTOOLS_ROUTER__";
declare const ROUTER_INFO_KEY = "__VUE_DEVTOOLS_ROUTER_INFO__";
declare const devtoolsRouterInfo: RouterInfo;
declare const devtoolsRouter: {
    value: Router;
};

declare function updateTimelineLayersState(state: Record<string, boolean>): void;

interface DevtoolsContext {
    hooks: Hookable<DevToolsContextHooks & DevToolsMessagingHooks, HookKeys<DevToolsContextHooks & DevToolsMessagingHooks>>;
    state: DevToolsState & {
        activeAppRecordId: string;
        activeAppRecord: DevToolsAppRecords;
        appRecords: DevToolsAppRecords[];
    };
    api: DevToolsApiType;
}
declare const devtoolsContext: DevtoolsContext;

declare class DevToolsV6PluginAPI {
    private plugin;
    private hooks;
    constructor({ plugin, ctx }: {
        plugin: DevToolsPlugin;
        ctx: DevtoolsContext;
    });
    get on(): {
        visitComponentTree: (handler: DevToolsV6PluginAPIHooks[DevToolsV6PluginAPIHookKeys.VISIT_COMPONENT_TREE]) => void;
        inspectComponent: (handler: DevToolsV6PluginAPIHooks[DevToolsV6PluginAPIHookKeys.INSPECT_COMPONENT]) => void;
        editComponentState: (handler: DevToolsV6PluginAPIHooks[DevToolsV6PluginAPIHookKeys.EDIT_COMPONENT_STATE]) => void;
        getInspectorTree: (handler: DevToolsV6PluginAPIHooks[DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_TREE]) => void;
        getInspectorState: (handler: DevToolsV6PluginAPIHooks[DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_STATE]) => void;
        editInspectorState: (handler: DevToolsV6PluginAPIHooks[DevToolsV6PluginAPIHookKeys.EDIT_INSPECTOR_STATE]) => void;
        inspectTimelineEvent: (handler: DevToolsV6PluginAPIHooks[DevToolsV6PluginAPIHookKeys.INSPECT_TIMELINE_EVENT]) => void;
        timelineCleared: (handler: DevToolsV6PluginAPIHooks[DevToolsV6PluginAPIHookKeys.TIMELINE_CLEARED]) => void;
        setPluginSettings: (handler: DevToolsV6PluginAPIHooks[DevToolsV6PluginAPIHookKeys.SET_PLUGIN_SETTINGS]) => void;
    };
    notifyComponentUpdate(instance?: ComponentInstance): void;
    addInspector(options: CustomInspectorOptions): void;
    sendInspectorTree(inspectorId: string): void;
    sendInspectorState(inspectorId: string): void;
    selectInspectorNode(inspectorId: string, nodeId: string): void;
    visitComponentTree(payload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.VISIT_COMPONENT_TREE]): Promise<any>;
    now(): number;
    addTimelineLayer(options: TimelineLayerOptions): void;
    addTimelineEvent(options: TimelineEventOptions): void;
    getSettings(pluginId?: string): any;
    getComponentInstances(app: App): Promise<ComponentInstance[]>;
    getComponentBounds(instance: ComponentInstance): Promise<ComponentBounds>;
    getComponentName(instance: ComponentInstance): Promise<string>;
    highlightElement(instance: ComponentInstance): Promise<any>;
    unhighlightElement(): Promise<any>;
}

declare const DevToolsPluginAPI: typeof DevToolsV6PluginAPI;

type PluginSettingsItem = {
    label: string;
    description?: string;
} & ({
    type: 'boolean';
    defaultValue: boolean;
} | {
    type: 'choice';
    defaultValue: string | number;
    options: {
        value: string | number;
        label: string;
    }[];
    component?: 'select' | 'button-group';
} | {
    type: 'text';
    defaultValue: string;
});
type PluginSetupFunction = (api: InstanceType<typeof DevToolsPluginAPI>) => void;
interface PluginDescriptor {
    id: string;
    label: string;
    app: App$1<any>;
    packageName?: string;
    homepage?: string;
    componentStateTypes?: string[];
    logo?: string;
    disableAppScope?: boolean;
    disablePluginScope?: boolean;
    /**
     * Run the plugin setup and expose the api even if the devtools is not opened yet.
     * Useful to record timeline events early.
     */
    enableEarlyProxy?: boolean;
    settings?: Record<string, PluginSettingsItem>;
}
interface DevToolsPlugin {
    descriptor: PluginDescriptor;
    setupFn: PluginSetupFunction;
}

type HookAppInstance = App$1 & VueAppInstance;
declare enum DevToolsHooks {
    APP_INIT = "app:init",
    APP_UNMOUNT = "app:unmount",
    COMPONENT_UPDATED = "component:updated",
    COMPONENT_ADDED = "component:added",
    COMPONENT_REMOVED = "component:removed",
    COMPONENT_EMIT = "component:emit",
    PERFORMANCE_START = "perf:start",
    PERFORMANCE_END = "perf:end",
    ADD_ROUTE = "router:add-route",
    REMOVE_ROUTE = "router:remove-route",
    RENDER_TRACKED = "render:tracked",
    RENDER_TRIGGERED = "render:triggered",
    APP_CONNECTED = "app:connected",
    SETUP_DEVTOOLS_PLUGIN = "devtools-plugin:setup"
}
interface DevToolsEvent {
    [DevToolsHooks.APP_INIT]: (app: VueAppInstance['appContext']['app'], version: string, types: Record<string, string | symbol>) => void | Promise<void>;
    [DevToolsHooks.APP_CONNECTED]: () => void;
    [DevToolsHooks.APP_UNMOUNT]: (app: VueAppInstance['appContext']['app']) => void | Promise<void>;
    [DevToolsHooks.COMPONENT_ADDED]: (app: HookAppInstance, uid: number, parentUid: number, component: VueAppInstance) => void | Promise<void>;
    [DevToolsHooks.COMPONENT_EMIT]: (app: HookAppInstance, instance: VueAppInstance, event: string, params: unknown) => void | Promise<void>;
    [DevToolsHooks.COMPONENT_UPDATED]: DevToolsEvent['component:added'];
    [DevToolsHooks.COMPONENT_REMOVED]: DevToolsEvent['component:added'];
    [DevToolsHooks.SETUP_DEVTOOLS_PLUGIN]: (pluginDescriptor: PluginDescriptor, setupFn: PluginSetupFunction, options?: {
        target?: string;
    }) => void;
    [DevToolsHooks.PERFORMANCE_START]: (app: App$1, uid: number, vm: HookAppInstance, type: string, time: number) => void;
    [DevToolsHooks.PERFORMANCE_END]: (app: App$1, uid: number, vm: HookAppInstance, type: string, time: number) => void;
}
interface DevToolsHook {
    id: string;
    enabled?: boolean;
    devtoolsVersion: string;
    events: Map<DevToolsHooks, Function[]>;
    emit: (event: DevToolsHooks, ...payload: any[]) => void;
    on: <T extends Function>(event: DevToolsHooks, handler: T) => () => void;
    once: <T extends Function>(event: DevToolsHooks, handler: T) => void;
    off: <T extends Function>(event: DevToolsHooks, handler: T) => void;
    appRecords: AppRecord[];
    apps: any;
    cleanupBuffer?: (matchArg: unknown) => boolean;
}
interface VueHooks {
    on: {
        vueAppInit: (fn: DevToolsEvent[DevToolsHooks.APP_INIT]) => void;
        vueAppUnmount: (fn: DevToolsEvent[DevToolsHooks.APP_UNMOUNT]) => void;
        vueAppConnected: (fn: DevToolsEvent[DevToolsHooks.APP_CONNECTED]) => void;
        componentAdded: (fn: DevToolsEvent[DevToolsHooks.COMPONENT_ADDED]) => () => void;
        componentEmit: (fn: DevToolsEvent[DevToolsHooks.COMPONENT_EMIT]) => () => void;
        componentUpdated: (fn: DevToolsEvent[DevToolsHooks.COMPONENT_UPDATED]) => () => void;
        componentRemoved: (fn: DevToolsEvent[DevToolsHooks.COMPONENT_REMOVED]) => () => void;
        setupDevtoolsPlugin: (fn: DevToolsEvent[DevToolsHooks.SETUP_DEVTOOLS_PLUGIN]) => void;
        perfStart: (fn: DevToolsEvent[DevToolsHooks.PERFORMANCE_START]) => void;
        perfEnd: (fn: DevToolsEvent[DevToolsHooks.PERFORMANCE_END]) => void;
    };
    setupDevToolsPlugin: (pluginDescriptor: PluginDescriptor, setupFn: PluginSetupFunction) => void;
}

interface RouterInfo {
    currentRoute: RouteLocationNormalizedLoaded | null | Record<string, any>;
    routes: RouteRecordNormalized[];
}

type TabCategory = 'pinned' | 'app' | 'modules' | 'advanced';
type ModuleView = ModuleIframeView | ModuleVNodeView | ModuleSFCView;
interface ModuleIframeView {
    /**
     * Iframe view
     */
    type: 'iframe';
    /**
     * Url of the iframe
     */
    src: string;
    /**
     * Persist the iframe instance even if the tab is not active
     *
     * @default true
     */
    persistent?: boolean;
}
interface ModuleVNodeView {
    /**
     * Vue's VNode view
     */
    type: 'vnode';
    /**
     * Send vnode to the client, they must be static and serializable
     */
    vnode: VNode;
}
interface ModuleSFCView {
    /**
     * SFC view
     */
    type: 'sfc';
    /**
     * SFC component
     */
    sfc: string;
}
interface CustomTab {
    /**
     * The name of the tab, must be unique
     */
    name: string;
    /**
     * Icon of the tab, support any Iconify icons, or a url to an image
     */
    icon?: string;
    /**
     * Title of the tab
     */
    title: string;
    /**
     * Main view of the tab
     */
    view: ModuleView;
    /**
     * Category of the tab
     * @default 'app'
     */
    category?: TabCategory;
}

interface TimelineEvent<TData = any, TMeta = any> {
    time: number;
    data: TData;
    logType?: 'default' | 'warning' | 'error';
    meta?: TMeta;
    groupId?: number | string;
    title?: string;
    subtitle?: string;
}
interface ScreenshotOverlayEvent {
    layerId: string;
    renderMeta: any;
}
interface ScreenshotOverlayRenderContext<TData = any, TMeta = any> {
    screenshot: ScreenshotData;
    events: (TimelineEvent<TData, TMeta> & ScreenshotOverlayEvent)[];
    index: number;
}
type ScreenshotOverlayRenderResult = HTMLElement | string | false;
interface ScreenshotData {
    time: number;
}
interface TimelineLayerOptions<TData = any, TMeta = any> {
    id: string;
    label: string;
    color: number;
    skipScreenshots?: boolean;
    groupsOnly?: boolean;
    ignoreNoDurationGroups?: boolean;
    screenshotOverlayRender?: (event: TimelineEvent<TData, TMeta> & ScreenshotOverlayEvent, ctx: ScreenshotOverlayRenderContext) => ScreenshotOverlayRenderResult | Promise<ScreenshotOverlayRenderResult>;
}
interface TimelineEventOptions {
    layerId: string;
    event: TimelineEvent;
    all?: boolean;
}

declare function initDevTools(): void;
declare function onDevToolsClientConnected(fn: () => void): Promise<void>;

declare function toggleHighPerfMode(state?: boolean): void;

declare function createComponentsDevToolsPlugin(app: App): [PluginDescriptor, PluginSetupFunction];

declare function setupDevToolsPlugin(pluginDescriptor: PluginDescriptor, setupFn: PluginSetupFunction): void;
declare function callDevToolsPluginSetupFn(plugin: [PluginDescriptor, PluginSetupFunction], app: App): void;
declare function removeRegisteredPluginApp(app: App): void;
declare function registerDevToolsPlugin(app: App, options?: {
    inspectingComponent?: boolean;
}): void;

interface ComponentBoundingRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}
interface ComponentBoundingRectApiPayload {
    app?: VueAppInstance;
    inspectorId?: string;
    instanceId?: string;
    rect?: ComponentBoundingRect;
}

type customTypeEnums = 'function' | 'bigint' | 'map' | 'set' | 'store' | 'router' | 'component' | 'component-definition' | 'HTMLElement' | 'component-definition' | 'date';

type Recordable = Record<PropertyKey, any>;

type PropPath = string | string[];
interface InspectorStateEditorPayload {
    app?: AppRecord['app'];
    inspectorId: string;
    nodeId: string;
    type: string;
    path: PropPath;
    state: {
        value: unknown;
        newKey: string;
        remove?: boolean;
        type: string;
    };
    set?: (obj: Recordable, path: PropPath, value: unknown, cb?: (object: Recordable, field: string, value: unknown) => void) => unknown;
}

interface InspectorCustomState {
    _custom?: {
        type?: string;
        displayText?: string;
        tooltipText?: string;
        value?: string | InspectorCustomState;
        stateTypeName?: string;
        fields?: {
            abstract?: boolean;
        };
    };
}
interface InspectorState {
    key: string;
    value: string | number | boolean | null | Record<string, unknown> | InspectorCustomState | Array<unknown>;
    type: string;
    path?: string[];
    stateType?: string;
    stateTypeName?: string;
    meta?: Record<string, boolean | string>;
    raw?: string;
    editable?: boolean;
    children?: {
        key: string;
        value: string | number;
        type: string;
    }[];
}
interface InspectorStateApiPayload {
    app: VueAppInstance;
    inspectorId: string;
    nodeId: string;
    state: {
        id: string;
        name: string;
        file: string | undefined;
        state: InspectorState[];
        instance: VueAppInstance | undefined;
    };
}
interface AddInspectorApiPayload {
    id: string;
    label: string;
    icon?: string;
    treeFilterPlaceholder?: string;
    actions?: {
        icon: string;
        tooltip: string;
        action: (payload: unknown) => void;
    }[];
}

interface InspectorTreeApiPayload {
    app?: VueAppInstance;
    inspectorId?: string;
    filter?: string;
    instanceId?: string;
    rootNodes?: ComponentTreeNode[];
}
interface InspectorTree {
    id: string;
    label: string;
    tags?: InspectorNodeTag[];
    children?: InspectorTree[];
}

interface ComponentHighLighterOptions {
    bounds: ComponentBoundingRect;
    name?: string;
    id?: string;
    visible?: boolean;
}
interface ScrollToComponentOptions {
    id?: string;
}

declare function toggleComponentHighLighter(options: ComponentHighLighterOptions): void;
declare function highlight(instance: VueAppInstance): void;
declare function unhighlight(): void;
declare function cancelInspectComponentHighLighter(): void;
declare function inspectComponentHighLighter(): Promise<string>;
declare function scrollToComponent(options: ScrollToComponentOptions): void;

declare const UNDEFINED = "__vue_devtool_undefined__";
declare const INFINITY = "__vue_devtool_infinity__";
declare const NEGATIVE_INFINITY = "__vue_devtool_negative_infinity__";
declare const NAN = "__vue_devtool_nan__";

declare function getInspectorStateValueType(value: any, raw?: boolean): string;
declare function formatInspectorStateValue(value: any, quotes?: boolean, options?: {
    customClass?: Partial<Record<'string', string>>;
}): any;
declare function getRaw(value: InspectorState['value']): {
    value: object | string | number | boolean | null;
    inherit: Record<string, any> | {
        abstract: true;
    };
    customType?: customTypeEnums;
};
declare function toEdit(value: unknown, customType?: customTypeEnums): string;
declare function toSubmit(value: string, customType?: customTypeEnums): any;

declare function isPlainObject(obj: unknown): obj is object;

declare function escape(s: string): string;

declare function updateDevToolsClientDetected(params: Record<string, boolean>): void;

interface EventEmitter$2 {
    on: (name: string, handler: (data: any) => void) => void;
    send: (name: string, ...args: any[]) => void;
    emit: (name: string, ...args: any[]) => void;
}
interface ElectronClientContext extends EventEmitter$2 {
}
interface ElectronProxyContext extends EventEmitter$2 {
}
interface ElectronServerContext extends EventEmitter$2 {
}
declare function setElectronClientContext(context: ElectronClientContext): void;
declare function setElectronProxyContext(context: ElectronProxyContext): void;
declare function setElectronServerContext(context: ElectronServerContext): void;

interface EventEmitter$1 {
    onMessage: {
        addListener: (listener: (name: string, ...args: any[]) => void) => void;
    };
    postMessage: (name: string, ...args: any[]) => void;
}
interface ExtensionClientContext extends EventEmitter$1 {
}
declare function getExtensionClientContext(): ExtensionClientContext;
declare function setExtensionClientContext(context: ExtensionClientContext): void;

declare function setIframeServerContext(context: HTMLIFrameElement): void;

interface EventEmitter {
    on: (name: string, handler: (data: any) => void) => void;
    send: (name: string, ...args: any[]) => void;
}
interface ViteClientContext extends EventEmitter {
}
interface ViteDevServer {
    hot?: EventEmitter;
    ws?: EventEmitter;
}
declare function setViteClientContext(context: ViteClientContext): void;
declare function setViteServerContext(context: ViteDevServer): void;

type Presets = 'iframe' | 'electron' | 'vite' | 'broadcast' | 'extension';

interface CreateRpcClientOptions<RemoteFunctions> {
    options?: BirpcOptions<RemoteFunctions>;
    preset?: Presets;
    channel?: ChannelOptions;
}
interface CreateRpcServerOptions<RemoteFunctions> {
    options?: BirpcOptions<RemoteFunctions>;
    preset?: Presets;
    channel?: ChannelOptions;
}
declare function setRpcServerToGlobal<R, L>(rpc: BirpcGroup<R, L>): void;
declare function getRpcClient<R, L extends object = Record<string, never>>(): BirpcReturn<R, L>;
declare function getRpcServer<R, L extends object = Record<string, never>>(): BirpcGroup<R, L>;
declare function setViteRpcClientToGlobal<R, L>(rpc: BirpcReturn<R, L>): void;
declare function setViteRpcServerToGlobal<R, L>(rpc: BirpcGroup<R, L>): void;
declare function getViteRpcClient<R, L extends object = Record<string, never>>(): BirpcReturn<R, L>;
declare function getViteRpcServer<R, L extends object = Record<string, never>>(): BirpcGroup<R, L>;
declare function createRpcClient<RemoteFunctions = Record<string, never>, LocalFunctions extends object = Record<string, never>>(functions: LocalFunctions, options?: CreateRpcClientOptions<RemoteFunctions>): BirpcReturn<RemoteFunctions, LocalFunctions> | undefined;
declare function createRpcServer<RemoteFunctions = Record<string, never>, LocalFunctions extends object = Record<string, never>>(functions: LocalFunctions, options?: CreateRpcServerOptions<RemoteFunctions>): void;
declare function createRpcProxy<RemoteFunctions = Record<string, never>, LocalFunctions extends object = Record<string, never>>(options?: CreateRpcClientOptions<RemoteFunctions>): BirpcReturn<RemoteFunctions, LocalFunctions>;

declare function stringify<T extends object = Record<string, unknown>>(data: T): string | string[];
declare function parse(data: string, revive?: boolean): any;

declare const devtools: {
    hook: VueHooks;
    init: () => void;
    readonly ctx: DevtoolsContext;
    readonly api: {
        getInspectorTree(payload: Pick<DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_TREE], "inspectorId" | "filter">): Promise<never[]>;
        getInspectorState(payload: Pick<DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_STATE], "inspectorId" | "nodeId">): Promise<CustomInspectorState>;
        editInspectorState(payload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.EDIT_INSPECTOR_STATE]): void;
        sendInspectorState(inspectorId: string): void;
        inspectComponentInspector(): Promise<string>;
        cancelInspectComponentInspector(): void;
        getComponentRenderCode(id: string): any;
        scrollToComponent(id: string): void;
        openInEditor: typeof openInEditor;
        getVueInspector: typeof getComponentInspector;
        toggleApp(id: string, options?: {
            inspectingComponent?: boolean;
        }): void;
        inspectDOM(instanceId: string): void;
        updatePluginSettings(pluginId: string, key: string, value: string): void;
        getPluginSettings(pluginId: string): {
            options: Record<string, {
                label: string;
                description?: string;
            } & ({
                type: "boolean";
                defaultValue: boolean;
            } | {
                type: "choice";
                defaultValue: string | number;
                options: {
                    value: string | number;
                    label: string;
                }[];
                component?: "select" | "button-group";
            } | {
                type: "text";
                defaultValue: string;
            })> | null;
            values: any;
        };
    };
};

export { type AddInspectorApiPayload, type App, type AppRecord, type ComponentBoundingRect, type ComponentBoundingRectApiPayload, type ComponentBounds, type ComponentHighLighterOptions, type ComponentInspector, type ComponentInstance, type ComponentState, type ComponentTreeNode, type CreateRpcClientOptions, type CreateRpcServerOptions, type CustomCommand, type CustomCommandAction, type CustomInspectorNode, type CustomInspectorOptions, type CustomInspectorState, type CustomTab, type DevToolsApiType, type DevToolsAppRecords, DevToolsContextHookKeys, type DevToolsContextHookPayloads, type DevToolsContextHooks, type DevToolsEvent, type DevToolsHook, DevToolsHooks, DevToolsMessagingHookKeys, type DevToolsMessagingHookPayloads, type DevToolsMessagingHooks, type DevToolsPlugin, type DevToolsState, DevToolsV6PluginAPIHookKeys, type DevToolsV6PluginAPIHookPayloads, type DevToolsV6PluginAPIHooks, type DevtoolsContext, type EditStatePayload, INFINITY, type InspectedComponentData, type InspectorCustomState, type InspectorNodeTag, type InspectorState, type InspectorStateApiPayload, type InspectorStateEditorPayload, type InspectorTree, type InspectorTreeApiPayload, type ModuleIframeView, type ModuleSFCView, type ModuleVNodeView, type ModuleView, NAN, NEGATIVE_INFINITY, type OpenInEditorOptions, type PluginDescriptor, type PluginSetupFunction, type Presets, type PropPath, ROUTER_INFO_KEY, ROUTER_KEY, type RouterInfo, type ScreenshotData, type ScreenshotOverlayEvent, type ScreenshotOverlayRenderContext, type ScreenshotOverlayRenderResult, type ScrollToComponentOptions, type StateBase, type TimelineEvent, type TimelineEventOptions, type TimelineLayerOptions, UNDEFINED, type VueAppInstance, type VueHooks, activeAppRecord, addCustomCommand, addCustomTab, addDevToolsAppRecord, addDevToolsPluginToBuffer, addInspector, callConnectedUpdatedHook, callDevToolsPluginSetupFn, callInspectorUpdatedHook, callStateUpdatedHook, cancelInspectComponentHighLighter, createComponentsDevToolsPlugin, createDevToolsApi, createDevToolsCtxHooks, createRpcClient, createRpcProxy, createRpcServer, type customTypeEnums, devtools, devtoolsAppRecords, devtoolsContext, devtoolsInspector, devtoolsPluginBuffer, devtoolsRouter, devtoolsRouterInfo, devtoolsState, escape, formatInspectorStateValue, getActiveInspectors, getComponentInspector, getDevToolsEnv, getExtensionClientContext, getInspector, getInspectorActions, getInspectorInfo, getInspectorNodeActions, getInspectorStateValueType, getRaw, getRpcClient, getRpcServer, getViteRpcClient, getViteRpcServer, highlight, initDevTools, inspectComponentHighLighter, isPlainObject, onDevToolsClientConnected, onDevToolsConnected, openInEditor, parse, registerDevToolsPlugin, removeCustomCommand, removeDevToolsAppRecord, removeRegisteredPluginApp, resetDevToolsState, scrollToComponent, setActiveAppRecord, setActiveAppRecordId, setDevToolsEnv, setElectronClientContext, setElectronProxyContext, setElectronServerContext, setExtensionClientContext, setIframeServerContext, setOpenInEditorBaseUrl, setRpcServerToGlobal, setViteClientContext, setViteRpcClientToGlobal, setViteRpcServerToGlobal, setViteServerContext, setupDevToolsPlugin, stringify, toEdit, toSubmit, toggleClientConnected, toggleComponentHighLighter, toggleComponentInspectorEnabled, toggleHighPerfMode, unhighlight, updateDevToolsClientDetected, updateDevToolsState, updateTimelineLayersState };
