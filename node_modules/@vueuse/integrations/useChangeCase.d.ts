import * as changeCase from 'change-case';
import { Options } from 'change-case';
import { MaybeRef, MaybeRefOrGetter, WritableComputedRef, ComputedRef } from 'vue';

type EndsWithCase<T> = T extends `${infer _}Case` ? T : never;
type FilterKeys<T> = {
    [K in keyof T as K extends string ? K : never]: EndsWithCase<K>;
};
type ChangeCaseKeys = FilterKeys<typeof changeCase>;
type ChangeCaseType = ChangeCaseKeys[keyof ChangeCaseKeys];
declare function useChangeCase(input: MaybeRef<string>, type: MaybeRefOrGetter<ChangeCaseType>, options?: MaybeRefOrGetter<Options> | undefined): WritableComputedRef<string>;
declare function useChangeCase(input: MaybeRefOrGetter<string>, type: MaybeRefOrGetter<ChangeCaseType>, options?: MaybeRefOrGetter<Options> | undefined): ComputedRef<string>;

export { type ChangeCaseType, useChangeCase };
