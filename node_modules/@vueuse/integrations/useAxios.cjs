'use strict';

var shared = require('@vueuse/shared');
var axios = require('axios');
var vue = require('vue');

function useAxios(...args) {
  const url = typeof args[0] === "string" ? args[0] : void 0;
  const argsPlaceholder = typeof url === "string" ? 1 : 0;
  const defaultOptions = {
    immediate: !!argsPlaceholder,
    shallow: true,
    abortPrevious: true
  };
  let defaultConfig = {};
  let instance = axios;
  let options = defaultOptions;
  const isAxiosInstance = (val) => !!(val == null ? void 0 : val.request);
  if (args.length > 0 + argsPlaceholder) {
    if (isAxiosInstance(args[0 + argsPlaceholder]))
      instance = args[0 + argsPlaceholder];
    else
      defaultConfig = args[0 + argsPlaceholder];
  }
  if (args.length > 1 + argsPlaceholder) {
    if (isAxiosInstance(args[1 + argsPlaceholder]))
      instance = args[1 + argsPlaceholder];
  }
  if (args.length === 2 + argsPlaceholder && !isAxiosInstance(args[1 + argsPlaceholder]) || args.length === 3 + argsPlaceholder) {
    options = args[args.length - 1] || defaultOptions;
  }
  const {
    shallow,
    onSuccess = shared.noop,
    onError = shared.noop,
    immediate,
    resetOnExecute = false
  } = options;
  const initialData = options.initialData;
  const response = vue.shallowRef();
  const data = (shallow ? vue.shallowRef : vue.ref)(initialData);
  const isFinished = vue.shallowRef(false);
  const isLoading = vue.shallowRef(false);
  const isAborted = vue.shallowRef(false);
  const error = vue.shallowRef();
  let abortController = new AbortController();
  const abort = (message) => {
    if (isFinished.value || !isLoading.value)
      return;
    abortController.abort(message);
    abortController = new AbortController();
    isAborted.value = true;
    isLoading.value = false;
    isFinished.value = false;
  };
  const loading = (loading2) => {
    isLoading.value = loading2;
    isFinished.value = !loading2;
  };
  const resetData = () => {
    if (resetOnExecute)
      data.value = initialData;
  };
  const waitUntilFinished = () => new Promise((resolve, reject) => {
    shared.until(isFinished).toBe(true).then(() => error.value ? reject(error.value) : resolve(result));
  });
  const promise = {
    then: (...args2) => waitUntilFinished().then(...args2),
    catch: (...args2) => waitUntilFinished().catch(...args2)
  };
  let executeCounter = 0;
  const execute = (executeUrl = url, config = {}) => {
    error.value = void 0;
    const _url = typeof executeUrl === "string" ? executeUrl : url != null ? url : config.url;
    if (_url === void 0) {
      error.value = new axios.AxiosError(axios.AxiosError.ERR_INVALID_URL);
      isFinished.value = true;
      return promise;
    }
    resetData();
    if (options.abortPrevious !== false)
      abort();
    loading(true);
    executeCounter += 1;
    const currentExecuteCounter = executeCounter;
    isAborted.value = false;
    instance(_url, { ...defaultConfig, ...typeof executeUrl === "object" ? executeUrl : config, signal: abortController.signal }).then((r) => {
      if (isAborted.value)
        return;
      response.value = r;
      const result2 = r.data;
      data.value = result2;
      onSuccess(result2);
    }).catch((e) => {
      error.value = e;
      onError(e);
    }).finally(() => {
      var _a;
      (_a = options.onFinish) == null ? void 0 : _a.call(options);
      if (currentExecuteCounter === executeCounter)
        loading(false);
    });
    return promise;
  };
  if (immediate && url)
    execute();
  const result = {
    response,
    data,
    error,
    isFinished,
    isLoading,
    cancel: abort,
    isAborted,
    isCanceled: isAborted,
    abort,
    execute
  };
  return {
    ...result,
    ...promise
  };
}

exports.useAxios = useAxios;
