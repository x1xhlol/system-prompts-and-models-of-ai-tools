import { shallowRef, computed, toValue, watch, defineComponent, reactive } from 'vue';
import { toRef, until } from '@vueuse/shared';
import Schema from 'async-validator';

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
  const errors = computed(() => errorInfo.value?.errors || []);
  const errorFields = computed(() => errorInfo.value?.fields || {});
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

const UseAsyncValidator = /* @__PURE__ */ /*@__PURE__*/ defineComponent({
  name: "UseAsyncValidator",
  props: {
    form: {
      type: Object,
      required: true
    },
    rules: {
      type: Object,
      required: true
    }
  },
  setup(props, { slots }) {
    const data = reactive(useAsyncValidator(props.form, props.rules));
    return () => {
      if (slots.default)
        return slots.default(data);
    };
  }
});

export { UseAsyncValidator };
