import { toRef, isClient } from '@vueuse/shared';
import QRCode from 'qrcode';
import { shallowRef, watch } from 'vue';

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

export { useQRCode };
