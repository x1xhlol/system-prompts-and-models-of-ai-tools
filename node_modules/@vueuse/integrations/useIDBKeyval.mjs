import { watchPausable } from '@vueuse/core';
import { get, set, del, update } from 'idb-keyval';
import { shallowRef, ref, toValue, toRaw } from 'vue';

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

export { useIDBKeyval };
