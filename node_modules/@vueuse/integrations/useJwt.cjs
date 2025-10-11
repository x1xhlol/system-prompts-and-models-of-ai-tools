'use strict';

var jwtDecode = require('jwt-decode');
var vue = require('vue');

function useJwt(encodedJwt, options = {}) {
  const {
    onError,
    fallbackValue = null
  } = options;
  const decodeWithFallback = (encodedJwt2, options2) => {
    try {
      return jwtDecode.jwtDecode(encodedJwt2, options2);
    } catch (err) {
      onError == null ? void 0 : onError(err);
      return fallbackValue;
    }
  };
  const header = vue.computed(() => decodeWithFallback(vue.toValue(encodedJwt), { header: true }));
  const payload = vue.computed(() => decodeWithFallback(vue.toValue(encodedJwt)));
  return {
    header,
    payload
  };
}

exports.useJwt = useJwt;
