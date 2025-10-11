import { toRef, until, noop, tryOnScopeDispose, notNullish, isClient } from '@vueuse/shared';
import Schema from 'async-validator';
import { shallowRef, computed, toValue, watch, ref, toRaw, watchEffect, isRef, nextTick } from 'vue';
import axios, { AxiosError } from 'axios';
import * as changeCase from 'change-case';
import Cookie from 'universal-cookie';
import { createEventHook, unrefElement, toArray, tryOnScopeDispose as tryOnScopeDispose$1, watchPausable, defaultDocument, tryOnMounted } from '@vueuse/core';
import { createDrauu } from 'drauu';
import { createFocusTrap } from 'focus-trap';
import Fuse from 'fuse.js';
import { get, set, del, update } from 'idb-keyval';
import { jwtDecode } from 'jwt-decode';
import nprogress from 'nprogress';
import QRCode from 'qrcode';
import Sortable from 'sortablejs';

const AsyncValidatorSchema = Schema.default || Schema;
function useAsyncValidator(value, rules, options = {}) {
  const {
    validateOption = {},
    immediate = true,
    manual = false
  } = options;
  const valueRef = toRef(value);
  const errorInfo = shallowRef(null);
  const isFinished = shallowRef(true);
  const pass = shallowRef(!immediate || manual);
  const errors = computed(() => {
    var _a;
    return ((_a = errorInfo.value) == null ? void 0 : _a.errors) || [];
  });
  const errorFields = computed(() => {
    var _a;
    return ((_a = errorInfo.value) == null ? void 0 : _a.fields) || {};
  });
  const validator = computed(() => new AsyncValidatorSchema(toValue(rules)));
  const execute = async () => {
    isFinished.value = false;
    pass.value = false;
    try {
      await validator.value.validate(valueRef.value, validateOption);
      pass.value = true;
      errorInfo.value = null;
    } catch (err) {
      errorInfo.value = err;
    } finally {
      isFinished.value = true;
    }
    return {
      pass: pass.value,
      errorInfo: errorInfo.value,
      errors: errors.value,
      errorFields: errorFields.value
    };
  };
  if (!manual) {
    watch(
      [valueRef, validator],
      () => execute(),
      { immediate, deep: true }
    );
  }
  const shell = {
    isFinished,
    pass,
    errors,
    errorInfo,
    errorFields,
    execute
  };
  function waitUntilFinished() {
    return new Promise((resolve, reject) => {
      until(isFinished).toBe(true).then(() => resolve(shell)).catch((error) => reject(error));
    });
  }
  return {
    ...shell,
    then(onFulfilled, onRejected) {
      return waitUntilFinished().then(onFulfilled, onRejected);
    }
  };
}

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
    onSuccess = noop,
    onError = noop,
    immediate,
    resetOnExecute = false
  } = options;
  const initialData = options.initialData;
  const response = shallowRef();
  const data = (shallow ? shallowRef : ref)(initialData);
  const isFinished = shallowRef(false);
  const isLoading = shallowRef(false);
  const isAborted = shallowRef(false);
  const error = shallowRef();
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
    until(isFinished).toBe(true).then(() => error.value ? reject(error.value) : resolve(result));
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
      error.value = new AxiosError(AxiosError.ERR_INVALID_URL);
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

const changeCaseTransforms = /* @__PURE__ */ Object.entries(changeCase).filter(([name, fn]) => typeof fn === "function" && name.endsWith("Case")).reduce((acc, [name, fn]) => {
  acc[name] = fn;
  return acc;
}, {});
function useChangeCase(input, type, options) {
  const typeRef = computed(() => {
    const t = toValue(type);
    if (!changeCaseTransforms[t])
      throw new Error(`Invalid change case type "${t}"`);
    return t;
  });
  if (typeof input === "function")
    return computed(() => changeCaseTransforms[typeRef.value](toValue(input), toValue(options)));
  const text = ref(input);
  return computed({
    get() {
      return changeCaseTransforms[typeRef.value](text.value, toValue(options));
    },
    set(value) {
      text.value = value;
    }
  });
}

function createCookies(req) {
  const universalCookie = new Cookie(req ? req.headers.cookie : null);
  return (dependencies, { doNotParse = false, autoUpdateDependencies = false } = {}) => useCookies(dependencies, { doNotParse, autoUpdateDependencies }, universalCookie);
}
function useCookies(dependencies, { doNotParse = false, autoUpdateDependencies = false } = {}, cookies = new Cookie()) {
  const watchingDependencies = autoUpdateDependencies ? [...dependencies || []] : dependencies;
  let previousCookies = cookies.getAll({ doNotParse: true });
  const touches = shallowRef(0);
  const onChange = () => {
    const newCookies = cookies.getAll({ doNotParse: true });
    if (shouldUpdate(
      watchingDependencies || null,
      newCookies,
      previousCookies
    )) {
      touches.value++;
    }
    previousCookies = newCookies;
  };
  cookies.addChangeListener(onChange);
  tryOnScopeDispose(() => {
    cookies.removeChangeListener(onChange);
  });
  return {
    /**
     * Reactive get cookie by name. If **autoUpdateDependencies = true** then it will update watching dependencies
     */
    get: (...args) => {
      if (autoUpdateDependencies && watchingDependencies && !watchingDependencies.includes(args[0]))
        watchingDependencies.push(args[0]);
      touches.value;
      return cookies.get(args[0], { doNotParse, ...args[1] });
    },
    /**
     * Reactive get all cookies
     */
    getAll: (...args) => {
      touches.value;
      return cookies.getAll({ doNotParse, ...args[0] });
    },
    set: (...args) => cookies.set(...args),
    remove: (...args) => cookies.remove(...args),
    addChangeListener: (...args) => cookies.addChangeListener(...args),
    removeChangeListener: (...args) => cookies.removeChangeListener(...args)
  };
}
function shouldUpdate(dependencies, newCookies, oldCookies) {
  if (!dependencies)
    return true;
  for (const dependency of dependencies) {
    if (newCookies[dependency] !== oldCookies[dependency])
      return true;
  }
  return false;
}

function useDrauu(target, options) {
  const drauuInstance = ref();
  let disposables = [];
  const onChangedHook = createEventHook();
  const onCanceledHook = createEventHook();
  const onCommittedHook = createEventHook();
  const onStartHook = createEventHook();
  const onEndHook = createEventHook();
  const canUndo = shallowRef(false);
  const canRedo = shallowRef(false);
  const altPressed = shallowRef(false);
  const shiftPressed = shallowRef(false);
  const brush = ref({
    color: "black",
    size: 3,
    arrowEnd: false,
    cornerRadius: 0,
    dasharray: void 0,
    fill: "transparent",
    mode: "draw",
    ...options == null ? void 0 : options.brush
  });
  watch(brush, () => {
    const instance = drauuInstance.value;
    if (instance) {
      instance.brush = brush.value;
      instance.mode = brush.value.mode;
    }
  }, { deep: true });
  const undo = () => {
    var _a;
    return (_a = drauuInstance.value) == null ? void 0 : _a.undo();
  };
  const redo = () => {
    var _a;
    return (_a = drauuInstance.value) == null ? void 0 : _a.redo();
  };
  const clear = () => {
    var _a;
    return (_a = drauuInstance.value) == null ? void 0 : _a.clear();
  };
  const cancel = () => {
    var _a;
    return (_a = drauuInstance.value) == null ? void 0 : _a.cancel();
  };
  const load = (svg) => {
    var _a;
    return (_a = drauuInstance.value) == null ? void 0 : _a.load(svg);
  };
  const dump = () => {
    var _a;
    return (_a = drauuInstance.value) == null ? void 0 : _a.dump();
  };
  const cleanup = () => {
    var _a;
    disposables.forEach((dispose) => dispose());
    (_a = drauuInstance.value) == null ? void 0 : _a.unmount();
  };
  const syncStatus = () => {
    if (drauuInstance.value) {
      canUndo.value = drauuInstance.value.canUndo();
      canRedo.value = drauuInstance.value.canRedo();
      altPressed.value = drauuInstance.value.altPressed;
      shiftPressed.value = drauuInstance.value.shiftPressed;
    }
  };
  watch(
    () => unrefElement(target),
    (el) => {
      if (!el || typeof SVGSVGElement === "undefined" || !(el instanceof SVGSVGElement))
        return;
      if (drauuInstance.value)
        cleanup();
      drauuInstance.value = createDrauu({ el, ...options });
      syncStatus();
      disposables = [
        drauuInstance.value.on("canceled", () => onCanceledHook.trigger()),
        drauuInstance.value.on("committed", (node) => onCommittedHook.trigger(node)),
        drauuInstance.value.on("start", () => onStartHook.trigger()),
        drauuInstance.value.on("end", () => onEndHook.trigger()),
        drauuInstance.value.on("changed", () => {
          syncStatus();
          onChangedHook.trigger();
        })
      ];
    },
    { flush: "post" }
  );
  tryOnScopeDispose(() => cleanup());
  return {
    drauuInstance,
    load,
    dump,
    clear,
    cancel,
    undo,
    redo,
    canUndo,
    canRedo,
    brush,
    onChanged: onChangedHook.on,
    onCommitted: onCommittedHook.on,
    onStart: onStartHook.on,
    onEnd: onEndHook.on,
    onCanceled: onCanceledHook.on
  };
}

function useFocusTrap(target, options = {}) {
  let trap;
  const { immediate, ...focusTrapOptions } = options;
  const hasFocus = shallowRef(false);
  const isPaused = shallowRef(false);
  const activate = (opts) => trap && trap.activate(opts);
  const deactivate = (opts) => trap && trap.deactivate(opts);
  const pause = () => {
    if (trap) {
      trap.pause();
      isPaused.value = true;
    }
  };
  const unpause = () => {
    if (trap) {
      trap.unpause();
      isPaused.value = false;
    }
  };
  const targets = computed(() => {
    const _targets = toValue(target);
    return toArray(_targets).map((el) => {
      const _el = toValue(el);
      return typeof _el === "string" ? _el : unrefElement(_el);
    }).filter(notNullish);
  });
  watch(
    targets,
    (els) => {
      if (!els.length)
        return;
      trap = createFocusTrap(els, {
        ...focusTrapOptions,
        onActivate() {
          hasFocus.value = true;
          if (options.onActivate)
            options.onActivate();
        },
        onDeactivate() {
          hasFocus.value = false;
          if (options.onDeactivate)
            options.onDeactivate();
        }
      });
      if (immediate)
        activate();
    },
    { flush: "post" }
  );
  tryOnScopeDispose$1(() => deactivate());
  return {
    hasFocus,
    isPaused,
    activate,
    deactivate,
    pause,
    unpause
  };
}

function useFuse(search, data, options) {
  const createFuse = () => {
    var _a, _b;
    return new Fuse(
      (_a = toValue(data)) != null ? _a : [],
      (_b = toValue(options)) == null ? void 0 : _b.fuseOptions
    );
  };
  const fuse = ref(createFuse());
  watch(
    () => {
      var _a;
      return (_a = toValue(options)) == null ? void 0 : _a.fuseOptions;
    },
    () => {
      fuse.value = createFuse();
    },
    { deep: true }
  );
  watch(
    () => toValue(data),
    (newData) => {
      fuse.value.setCollection(newData);
    },
    { deep: true }
  );
  const results = computed(() => {
    const resolved = toValue(options);
    if ((resolved == null ? void 0 : resolved.matchAllWhenSearchEmpty) && !toValue(search))
      return toValue(data).map((item, index) => ({ item, refIndex: index }));
    const limit = resolved == null ? void 0 : resolved.resultLimit;
    return fuse.value.search(toValue(search), limit ? { limit } : void 0);
  });
  return {
    fuse,
    results
  };
}

function useIDBKeyval(key, initialValue, options = {}) {
  const {
    flush = "pre",
    deep = true,
    shallow = false,
    onError = (e) => {
      console.error(e);
    },
    writeDefaults = true
  } = options;
  const isFinished = shallowRef(false);
  const data = (shallow ? shallowRef : ref)(initialValue);
  const rawInit = toValue(initialValue);
  async function read() {
    try {
      const rawValue = await get(key);
      if (rawValue === void 0) {
        if (rawInit !== void 0 && rawInit !== null && writeDefaults)
          await set(key, rawInit);
      } else {
        data.value = rawValue;
      }
    } catch (e) {
      onError(e);
    }
    isFinished.value = true;
  }
  read();
  async function write() {
    try {
      if (data.value == null) {
        await del(key);
      } else {
        await update(key, () => toRaw(data.value));
      }
    } catch (e) {
      onError(e);
    }
  }
  const {
    pause: pauseWatch,
    resume: resumeWatch
  } = watchPausable(data, () => write(), { flush, deep });
  async function setData(value) {
    pauseWatch();
    data.value = value;
    await write();
    resumeWatch();
  }
  return {
    set: setData,
    isFinished,
    data
  };
}

function useJwt(encodedJwt, options = {}) {
  const {
    onError,
    fallbackValue = null
  } = options;
  const decodeWithFallback = (encodedJwt2, options2) => {
    try {
      return jwtDecode(encodedJwt2, options2);
    } catch (err) {
      onError == null ? void 0 : onError(err);
      return fallbackValue;
    }
  };
  const header = computed(() => decodeWithFallback(toValue(encodedJwt), { header: true }));
  const payload = computed(() => decodeWithFallback(toValue(encodedJwt)));
  return {
    header,
    payload
  };
}

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

function useQRCode(text, options) {
  const src = toRef(text);
  const result = shallowRef("");
  watch(
    src,
    async (value) => {
      if (src.value && isClient)
        result.value = await QRCode.toDataURL(value, options);
    },
    { immediate: true }
  );
  return result;
}

function useSortable(el, list, options = {}) {
  let sortable;
  const { document = defaultDocument, ...resetOptions } = options;
  const defaultOptions = {
    onUpdate: (e) => {
      moveArrayElement(list, e.oldIndex, e.newIndex, e);
    }
  };
  const start = () => {
    const target = typeof el === "string" ? document == null ? void 0 : document.querySelector(el) : unrefElement(el);
    if (!target || sortable !== void 0)
      return;
    sortable = new Sortable(target, { ...defaultOptions, ...resetOptions });
  };
  const stop = () => {
    sortable == null ? void 0 : sortable.destroy();
    sortable = void 0;
  };
  const option = (name, value) => {
    if (value !== void 0)
      sortable == null ? void 0 : sortable.option(name, value);
    else
      return sortable == null ? void 0 : sortable.option(name);
  };
  tryOnMounted(start);
  tryOnScopeDispose$1(stop);
  return {
    stop,
    start,
    option
  };
}
function insertNodeAt(parentElement, element, index) {
  const refElement = parentElement.children[index];
  parentElement.insertBefore(element, refElement);
}
function removeNode(node) {
  if (node.parentNode)
    node.parentNode.removeChild(node);
}
function moveArrayElement(list, from, to, e = null) {
  if (e != null) {
    removeNode(e.item);
    insertNodeAt(e.from, e.item, from);
  }
  const _valueIsRef = isRef(list);
  const array = _valueIsRef ? [...toValue(list)] : toValue(list);
  if (to >= 0 && to < array.length) {
    const element = array.splice(from, 1)[0];
    nextTick(() => {
      array.splice(to, 0, element);
      if (_valueIsRef)
        list.value = array;
    });
  }
}

export { createCookies, insertNodeAt, moveArrayElement, removeNode, useAsyncValidator, useAxios, useChangeCase, useCookies, useDrauu, useFocusTrap, useFuse, useIDBKeyval, useJwt, useNProgress, useQRCode, useSortable };
