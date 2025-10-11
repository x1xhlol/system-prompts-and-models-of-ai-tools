import { TypeAnnotation } from './transformer.js';
import SuperJSON from './index.js';
declare type Tree<T> = InnerNode<T> | Leaf<T>;
declare type Leaf<T> = [T];
declare type InnerNode<T> = [T, Record<string, Tree<T>>];
export declare type MinimisedTree<T> = Tree<T> | Record<string, Tree<T>> | undefined;
export declare function applyValueAnnotations(plain: any, annotations: MinimisedTree<TypeAnnotation>, superJson: SuperJSON): any;
export declare function applyReferentialEqualityAnnotations(plain: any, annotations: ReferentialEqualityAnnotations): any;
interface Result {
    transformedValue: any;
    annotations?: MinimisedTree<TypeAnnotation>;
}
export declare type ReferentialEqualityAnnotations = Record<string, string[]> | [string[]] | [string[], Record<string, string[]>];
export declare function generateReferentialEqualityAnnotations(identitites: Map<any, any[][]>, dedupe: boolean): ReferentialEqualityAnnotations | undefined;
export declare const walker: (object: any, identities: Map<any, any[][]>, superJson: SuperJSON, dedupe: boolean, path?: any[], objectsInThisPath?: any[], seenObjects?: Map<unknown, Result>) => Result;
export {};
