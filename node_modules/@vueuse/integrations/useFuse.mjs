import Fuse from 'fuse.js';
import { ref, watch, toValue, computed } from 'vue';

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

export { useFuse };
