import { toRef, isClient, tryOnScopeDispose } from '@vueuse/shared';
import nprogress from 'nprogress';
import { computed, watchEffect } from 'vue';

function useNProgress(currentProgress = null, options) {
  const progress = toRef(currentProgress);
  const isLoading = computed({
    set: (load) => load ? nprogress.start() : nprogress.done(),
    get: () => typeof progress.value === "number" && progress.value < 1
  });
  if (options)
    nprogress.configure(options);
  const setProgress = nprogress.set;
  nprogress.set = (n) => {
    progress.value = n;
    return setProgress.call(nprogress, n);
  };
  watchEffect(() => {
    if (typeof progress.value === "number" && isClient)
      setProgress.call(nprogress, progress.value);
  });
  tryOnScopeDispose(nprogress.remove);
  return {
    isLoading,
    progress,
    start: nprogress.start,
    done: nprogress.done,
    remove: () => {
      progress.value = null;
      nprogress.remove();
    }
  };
}

export { useNProgress };
