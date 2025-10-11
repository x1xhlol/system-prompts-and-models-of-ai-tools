declare const VIEW_MODE_STORAGE_KEY = "__vue-devtools-view-mode__";
declare const VITE_PLUGIN_DETECTED_STORAGE_KEY = "__vue-devtools-vite-plugin-detected__";
declare const VITE_PLUGIN_CLIENT_URL_STORAGE_KEY = "__vue-devtools-vite-plugin-client-url__";
declare const BROADCAST_CHANNEL_NAME = "__vue-devtools-broadcast-channel__";

declare const isBrowser: boolean;
declare const target: typeof globalThis;
declare const isInChromePanel: boolean;
declare const isInIframe: boolean;
declare const isInElectron: boolean;
declare const isNuxtApp: boolean;
declare const isInSeparateWindow: boolean;

declare function NOOP(): void;
declare const isNumeric: (str: string | number) => boolean;
declare const isMacOS: () => boolean;
declare function classify(str: string): string;
declare function camelize(str: string): string;
declare function kebabize(str: string): string;
declare function basename(filename: string, ext: string): string;
declare function sortByKey(state: unknown[]): Record<"key", number>[];
/**
 * Check a string is start with `/` or a valid http url
 */
declare function isUrlString(str: string): boolean;
/**
 * @copyright [rfdc](https://github.com/davidmarkclements/rfdc)
 * @description A really fast deep clone alternative
 */
declare const deepClone: <T>(input: T) => T;
declare function randomStr(): string;
declare function isObject<T extends object>(value: any): value is T;
declare function isArray<T>(value: any): value is T[];
declare function isSet<T>(value: any): value is Set<T>;
declare function isMap<K, V>(value: any): value is Map<K, V>;

export { BROADCAST_CHANNEL_NAME, NOOP, VIEW_MODE_STORAGE_KEY, VITE_PLUGIN_CLIENT_URL_STORAGE_KEY, VITE_PLUGIN_DETECTED_STORAGE_KEY, basename, camelize, classify, deepClone, isArray, isBrowser, isInChromePanel, isInElectron, isInIframe, isInSeparateWindow, isMacOS, isMap, isNumeric, isNuxtApp, isObject, isSet, isUrlString, kebabize, randomStr, sortByKey, target };
