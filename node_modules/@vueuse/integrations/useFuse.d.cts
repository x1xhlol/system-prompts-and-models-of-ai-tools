import * as vue from 'vue';
import { MaybeRefOrGetter, ComputedRef } from 'vue';
import * as fuse_js from 'fuse.js';
import fuse_js__default, { IFuseOptions, FuseResult } from 'fuse.js';

type FuseOptions<T> = IFuseOptions<T>;
interface UseFuseOptions<T> {
    fuseOptions?: FuseOptions<T>;
    resultLimit?: number;
    matchAllWhenSearchEmpty?: boolean;
}
declare function useFuse<DataItem>(search: MaybeRefOrGetter<string>, data: MaybeRefOrGetter<DataItem[]>, options?: MaybeRefOrGetter<UseFuseOptions<DataItem>>): {
    fuse: vue.Ref<{
        search: <R = DataItem>(pattern: string | fuse_js.Expression, options?: fuse_js.FuseSearchOptions) => FuseResult<R>[];
        setCollection: (docs: readonly DataItem[], index?: fuse_js.FuseIndex<DataItem> | undefined) => void;
        add: (doc: DataItem) => void;
        remove: (predicate: (doc: DataItem, idx: number) => boolean) => DataItem[];
        removeAt: (idx: number) => void;
        getIndex: () => fuse_js.FuseIndex<DataItem>;
    }, fuse_js__default<DataItem> | {
        search: <R = DataItem>(pattern: string | fuse_js.Expression, options?: fuse_js.FuseSearchOptions) => FuseResult<R>[];
        setCollection: (docs: readonly DataItem[], index?: fuse_js.FuseIndex<DataItem> | undefined) => void;
        add: (doc: DataItem) => void;
        remove: (predicate: (doc: DataItem, idx: number) => boolean) => DataItem[];
        removeAt: (idx: number) => void;
        getIndex: () => fuse_js.FuseIndex<DataItem>;
    }>;
    results: ComputedRef<FuseResult<DataItem>[]>;
};
type UseFuseReturn = ReturnType<typeof useFuse>;

export { type FuseOptions, type UseFuseOptions, type UseFuseReturn, useFuse };
