import SuperJSON from './index.js';
export declare type PrimitiveTypeAnnotation = 'number' | 'undefined' | 'bigint';
declare type LeafTypeAnnotation = PrimitiveTypeAnnotation | 'regexp' | 'Date' | 'Error' | 'URL';
declare type TypedArrayAnnotation = ['typed-array', string];
declare type ClassTypeAnnotation = ['class', string];
declare type SymbolTypeAnnotation = ['symbol', string];
declare type CustomTypeAnnotation = ['custom', string];
declare type SimpleTypeAnnotation = LeafTypeAnnotation | 'map' | 'set';
declare type CompositeTypeAnnotation = TypedArrayAnnotation | ClassTypeAnnotation | SymbolTypeAnnotation | CustomTypeAnnotation;
export declare type TypeAnnotation = SimpleTypeAnnotation | CompositeTypeAnnotation;
export declare function isInstanceOfRegisteredClass(potentialClass: any, superJson: SuperJSON): potentialClass is any;
export declare const transformValue: (value: any, superJson: SuperJSON) => {
    value: any;
    type: TypeAnnotation;
} | undefined;
export declare const untransformValue: (json: any, type: TypeAnnotation, superJson: SuperJSON) => any;
export {};
