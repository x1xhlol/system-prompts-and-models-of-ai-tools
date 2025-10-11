(function (exports, core, idbKeyval, vue) {
  'use strict';

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
    const isFinished = vue.shallowRef(false);
    const data = (shallow ? vue.shallowRef : vue.ref)(initialValue);
    const rawInit = vue.toValue(initialValue);
    async function read() {
      try {
        const rawValue = await idbKeyval.get(key);
        if (rawValue === void 0) {
          if (rawInit !== void 0 && rawInit !== null && writeDefaults)
            await idbKeyval.set(key, rawInit);
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
          await idbKeyval.del(key);
        } else {
          await idbKeyval.update(key, () => vue.toRaw(data.value));
        }
      } catch (e) {
        onError(e);
      }
    }
    const {
      pause: pauseWatch,
      resume: resumeWatch
    } = core.watchPausable(data, () => write(), { flush, deep });
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

  exports.useIDBKeyval = useIDBKeyval;

})(this.VueUse = this.VueUse || {}, VueUse, idbKeyval, Vue);
