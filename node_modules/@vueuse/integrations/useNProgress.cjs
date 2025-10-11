'use strict';

var shared = require('@vueuse/shared');
var nprogress = require('nprogress');
var vue = require('vue');

function useNProgress(currentProgress = null, options) {
  const progress = shared.toRef(currentProgress);
  const isLoading = vue.computed({
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
  vue.watchEffect(() => {
    if (typeof progress.value === "number" && shared.isClient)
      setProgress.call(nprogress, progress.value);
  });
  shared.tryOnScopeDispose(nprogress.remove);
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

exports.useNProgress = useNProgress;
