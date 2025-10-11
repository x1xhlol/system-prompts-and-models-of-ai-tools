'use strict';

var core = require('@vueuse/core');
var focusTrap = require('focus-trap');
var vue = require('vue');

const UseFocusTrap = /* @__PURE__ */ /*@__PURE__*/ vue.defineComponent({
  name: "UseFocusTrap",
  props: ["as", "options"],
  setup(props, { slots }) {
    let trap;
    const target = vue.ref();
    const activate = () => trap && trap.activate();
    const deactivate = () => trap && trap.deactivate();
    vue.watch(
      () => core.unrefElement(target),
      (el) => {
        if (!el)
          return;
        trap = focusTrap.createFocusTrap(el, props.options || {});
        activate();
      },
      { flush: "post" }
    );
    vue.onScopeDispose(() => deactivate());
    return () => {
      if (slots.default)
        return vue.h(props.as || "div", { ref: target }, slots.default());
    };
  }
});

exports.UseFocusTrap = UseFocusTrap;
