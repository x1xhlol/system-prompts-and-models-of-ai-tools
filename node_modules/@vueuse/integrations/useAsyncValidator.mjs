import { toRef, until } from '@vueuse/shared';
import Schema from 'async-validator';
import { shallowRef, computed, toValue, watch } from 'vue';

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

export { useAsyncValidator };
