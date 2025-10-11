'use strict';

var shared = require('@vueuse/shared');
var QRCode = require('qrcode');
var vue = require('vue');

function useQRCode(text, options) {
  const src = shared.toRef(text);
  const result = vue.shallowRef("");
  vue.watch(
    src,
    async (value) => {
      if (src.value && shared.isClient)
        result.value = await QRCode.toDataURL(value, options);
    },
    { immediate: true }
  );
  return result;
}

exports.useQRCode = useQRCode;
