(function (exports, changeCase, vue) {
  'use strict';

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n.default = e;
    return Object.freeze(n);
  }

  var changeCase__namespace = /*#__PURE__*/_interopNamespaceDefault(changeCase);

  const changeCaseTransforms = /* @__PURE__ */ Object.entries(changeCase__namespace).filter(([name, fn]) => typeof fn === "function" && name.endsWith("Case")).reduce((acc, [name, fn]) => {
    acc[name] = fn;
    return acc;
  }, {});
  function useChangeCase(input, type, options) {
    const typeRef = vue.computed(() => {
      const t = vue.toValue(type);
      if (!changeCaseTransforms[t])
        throw new Error(`Invalid change case type "${t}"`);
      return t;
    });
    if (typeof input === "function")
      return vue.computed(() => changeCaseTransforms[typeRef.value](vue.toValue(input), vue.toValue(options)));
    const text = vue.ref(input);
    return vue.computed({
      get() {
        return changeCaseTransforms[typeRef.value](text.value, vue.toValue(options));
      },
      set(value) {
        text.value = value;
      }
    });
  }

  exports.useChangeCase = useChangeCase;

})(this.VueUse = this.VueUse || {}, changeCase, Vue);
