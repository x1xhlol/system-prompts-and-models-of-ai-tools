import { JSONValue } from './types.js';
export interface CustomTransfomer<I, O extends JSONValue> {
    name: string;
    isApplicable: (v: any) => v is I;
    serialize: (v: I) => O;
    deserialize: (v: O) => I;
}
export declare class CustomTransformerRegistry {
    private transfomers;
    register<I, O extends JSONValue>(transformer: CustomTransfomer<I, O>): void;
    findApplicable<T>(v: T): CustomTransfomer<T, JSONValue> | undefined;
    findByName(name: string): CustomTransfomer<any, any>;
}
