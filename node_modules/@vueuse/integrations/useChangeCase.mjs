import * as changeCase from 'change-case';
import { computed, toValue, ref } from 'vue';

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

export { useChangeCase };
