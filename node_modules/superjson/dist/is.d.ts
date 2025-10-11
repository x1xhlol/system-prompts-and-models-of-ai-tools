/// <reference types="node" />
export declare const isUndefined: (payload: any) => payload is undefined;
export declare const isNull: (payload: any) => payload is null;
export declare const isPlainObject: (payload: any) => payload is {
    [key: string]: any;
};
export declare const isEmptyObject: (payload: any) => payload is {};
export declare const isArray: (payload: any) => payload is any[];
export declare const isString: (payload: any) => payload is string;
export declare const isNumber: (payload: any) => payload is number;
export declare const isBoolean: (payload: any) => payload is boolean;
export declare const isRegExp: (payload: any) => payload is RegExp;
export declare const isMap: (payload: any) => payload is Map<any, any>;
export declare const isSet: (payload: any) => payload is Set<any>;
export declare const isSymbol: (payload: any) => payload is symbol;
export declare const isDate: (payload: any) => payload is Date;
export declare const isError: (payload: any) => payload is Error;
export declare const isNaNValue: (payload: any) => payload is number;
export declare const isPrimitive: (payload: any) => payload is string | number | boolean | symbol | null | undefined;
export declare const isBigint: (payload: any) => payload is bigint;
export declare const isInfinite: (payload: any) => payload is number;
export declare type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Uint8ClampedArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;
export declare type TypedArray = InstanceType<TypedArrayConstructor>;
export declare const isTypedArray: (payload: any) => payload is TypedArray;
export declare const isURL: (payload: any) => payload is URL;
