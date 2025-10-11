import { unrefElement } from '@vueuse/core';
import { createFocusTrap } from 'focus-trap';
import { defineComponent, ref, watch, onScopeDispose, h } from 'vue';

const UseFocusTrap = /* @__PURE__ */ /*@__PURE__*/ defineComponent({
  name: "UseFocusTrap",
  props: ["as", "options"],
  setup(props, { slots }) {
    let trap;
    const target = ref();
    const activate = () => trap && trap.activate();
    const deactivate = () => trap && trap.deactivate();
    watch(
      () => unrefElement(target),
      (el) => {
        if (!el)
          return;
        trap = createFocusTrap(el, props.options || {});
        activate();
      },
      { flush: "post" }
    );
    onScopeDispose(() => deactivate());
    return () => {
      if (slots.default)
        return h(props.as || "div", { ref: target }, slots.default());
    };
  }
});

export { UseFocusTrap };
