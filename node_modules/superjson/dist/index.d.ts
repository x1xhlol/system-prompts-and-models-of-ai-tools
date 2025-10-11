import { Class, JSONValue, SuperJSONResult, SuperJSONValue } from './types.js';
import { ClassRegistry, RegisterOptions } from './class-registry.js';
import { Registry } from './registry.js';
import { CustomTransfomer, CustomTransformerRegistry } from './custom-transformer-registry.js';
export default class SuperJSON {
    /**
     * If true, SuperJSON will make sure only one instance of referentially equal objects are serialized and the rest are replaced with `null`.
     */
    private readonly dedupe;
    /**
     * @param dedupeReferentialEqualities  If true, SuperJSON will make sure only one instance of referentially equal objects are serialized and the rest are replaced with `null`.
     */
    constructor({ dedupe, }?: {
        dedupe?: boolean;
    });
    serialize(object: SuperJSONValue): SuperJSONResult;
    deserialize<T = unknown>(payload: SuperJSONResult): T;
    stringify(object: SuperJSONValue): string;
    parse<T = unknown>(string: string): T;
    readonly classRegistry: ClassRegistry;
    registerClass(v: Class, options?: RegisterOptions | string): void;
    readonly symbolRegistry: Registry<Symbol>;
    registerSymbol(v: Symbol, identifier?: string): void;
    readonly customTransformerRegistry: CustomTransformerRegistry;
    registerCustom<I, O extends JSONValue>(transformer: Omit<CustomTransfomer<I, O>, 'name'>, name: string): void;
    readonly allowedErrorProps: string[];
    allowErrorProps(...props: string[]): void;
    private static defaultInstance;
    static serialize: (object: SuperJSONValue) => SuperJSONResult;
    static deserialize: <T = unknown>(payload: SuperJSONResult) => T;
    static stringify: (object: SuperJSONValue) => string;
    static parse: <T = unknown>(string: string) => T;
    static registerClass: (v: Class, options?: string | RegisterOptions | undefined) => void;
    static registerSymbol: (v: Symbol, identifier?: string | undefined) => void;
    static registerCustom: <I, O extends JSONValue>(transformer: Omit<CustomTransfomer<I, O>, "name">, name: string) => void;
    static allowErrorProps: (...props: string[]) => void;
}
export { SuperJSON, SuperJSONResult };
export declare const serialize: (object: SuperJSONValue) => SuperJSONResult;
export declare const deserialize: <T = unknown>(payload: SuperJSONResult) => T;
export declare const stringify: (object: SuperJSONValue) => string;
export declare const parse: <T = unknown>(string: string) => T;
export declare const registerClass: (v: Class, options?: string | RegisterOptions | undefined) => void;
export declare const registerCustom: <I, O extends JSONValue>(transformer: Omit<CustomTransfomer<I, O>, "name">, name: string) => void;
export declare const registerSymbol: (v: Symbol, identifier?: string | undefined) => void;
export declare const allowErrorProps: (...props: string[]) => void;
