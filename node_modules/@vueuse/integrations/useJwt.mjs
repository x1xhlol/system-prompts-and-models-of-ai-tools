import { jwtDecode } from 'jwt-decode';
import { computed, toValue } from 'vue';

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

export { useJwt };
