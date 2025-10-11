'use strict';

var Fuse = require('fuse.js');
var vue = require('vue');

function useFuse(search, data, options) {
  const createFuse = () => {
    var _a, _b;
    return new Fuse(
      (_a = vue.toValue(data)) != null ? _a : [],
      (_b = vue.toValue(options)) == null ? void 0 : _b.fuseOptions
    );
  };
  const fuse = vue.ref(createFuse());
  vue.watch(
    () => {
      var _a;
      return (_a = vue.toValue(options)) == null ? void 0 : _a.fuseOptions;
    },
    () => {
      fuse.value = createFuse();
    },
    { deep: true }
  );
  vue.watch(
    () => vue.toValue(data),
    (newData) => {
      fuse.value.setCollection(newData);
    },
    { deep: true }
  );
  const results = vue.computed(() => {
    const resolved = vue.toValue(options);
    if ((resolved == null ? void 0 : resolved.matchAllWhenSearchEmpty) && !vue.toValue(search))
      return vue.toValue(data).map((item, index) => ({ item, refIndex: index }));
    const limit = resolved == null ? void 0 : resolved.resultLimit;
    return fuse.value.search(vue.toValue(search), limit ? { limit } : void 0);
  });
  return {
    fuse,
    results
  };
}

exports.useFuse = useFuse;
