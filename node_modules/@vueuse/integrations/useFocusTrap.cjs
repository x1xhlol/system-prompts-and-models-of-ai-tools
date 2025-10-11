'use strict';

var core = require('@vueuse/core');
var shared = require('@vueuse/shared');
var focusTrap = require('focus-trap');
var vue = require('vue');

function useFocusTrap(target, options = {}) {
  let trap;
  const { immediate, ...focusTrapOptions } = options;
  const hasFocus = vue.shallowRef(false);
  const isPaused = vue.shallowRef(false);
  const activate = (opts) => trap && trap.activate(opts);
  const deactivate = (opts) => trap && trap.deactivate(opts);
  const pause = () => {
    if (trap) {
      trap.pause();
      isPaused.value = true;
    }
  };
  const unpause = () => {
    if (trap) {
      trap.unpause();
      isPaused.value = false;
    }
  };
  const targets = vue.computed(() => {
    const _targets = vue.toValue(target);
    return core.toArray(_targets).map((el) => {
      const _el = vue.toValue(el);
      return typeof _el === "string" ? _el : core.unrefElement(_el);
    }).filter(shared.notNullish);
  });
  vue.watch(
    targets,
    (els) => {
      if (!els.length)
        return;
      trap = focusTrap.createFocusTrap(els, {
        ...focusTrapOptions,
        onActivate() {
          hasFocus.value = true;
          if (options.onActivate)
            options.onActivate();
        },
        onDeactivate() {
          hasFocus.value = false;
          if (options.onDeactivate)
            options.onDeactivate();
        }
      });
      if (immediate)
        activate();
    },
    { flush: "post" }
  );
  core.tryOnScopeDispose(() => deactivate());
  return {
    hasFocus,
    isPaused,
    activate,
    deactivate,
    pause,
    unpause
  };
}

exports.useFocusTrap = useFocusTrap;
