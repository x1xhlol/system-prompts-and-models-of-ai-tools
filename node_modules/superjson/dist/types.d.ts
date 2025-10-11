import { TypeAnnotation } from './transformer.js';
import { MinimisedTree, ReferentialEqualityAnnotations } from './plainer.js';
export declare type Class = {
    new (...args: any[]): any;
};
export declare type PrimitiveJSONValue = string | number | boolean | undefined | null;
export declare type JSONValue = PrimitiveJSONValue | JSONArray | JSONObject;
export interface JSONArray extends Array<JSONValue> {
}
export interface JSONObject {
    [key: string]: JSONValue;
}
declare type ClassInstance = any;
export declare type SerializableJSONValue = Symbol | Set<SuperJSONValue> | Map<SuperJSONValue, SuperJSONValue> | undefined | bigint | Date | ClassInstance | RegExp;
export declare type SuperJSONValue = JSONValue | SerializableJSONValue | SuperJSONArray | SuperJSONObject;
export interface SuperJSONArray extends Array<SuperJSONValue> {
}
export interface SuperJSONObject {
    [key: string]: SuperJSONValue;
}
export interface SuperJSONResult {
    json: JSONValue;
    meta?: {
        values?: MinimisedTree<TypeAnnotation>;
        referentialEqualities?: ReferentialEqualityAnnotations;
    };
}
export {};
