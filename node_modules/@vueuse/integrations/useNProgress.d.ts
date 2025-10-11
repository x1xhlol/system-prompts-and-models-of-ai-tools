import * as vue from 'vue';
import { MaybeRefOrGetter } from 'vue';
import nprogress, { NProgressOptions } from 'nprogress';

type UseNProgressOptions = Partial<NProgressOptions>;
/**
 * Reactive progress bar.
 *
 * @see https://vueuse.org/useNProgress
 */
declare function useNProgress(currentProgress?: MaybeRefOrGetter<number | null | undefined>, options?: UseNProgressOptions): {
    isLoading: vue.WritableComputedRef<boolean, boolean>;
    progress: vue.Ref<number | null | undefined, number | null | undefined>;
    start: () => nprogress.NProgress;
    done: (force?: boolean) => nprogress.NProgress;
    remove: () => void;
};
type UseNProgressReturn = ReturnType<typeof useNProgress>;

export { type UseNProgressOptions, type UseNProgressReturn, useNProgress };
