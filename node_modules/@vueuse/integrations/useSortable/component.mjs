import { defaultDocument, tryOnMounted, tryOnScopeDispose, unrefElement, useVModel } from '@vueuse/core';
import { isRef, toValue, nextTick, defineComponent, ref, reactive, h } from 'vue';
import Sortable from 'sortablejs';

function useSortable(el, list, options = {}) {
  let sortable;
  const { document = defaultDocument, ...resetOptions } = options;
  const defaultOptions = {
    onUpdate: (e) => {
      moveArrayElement(list, e.oldIndex, e.newIndex, e);
    }
  };
  const start = () => {
    const target = typeof el === "string" ? document?.querySelector(el) : unrefElement(el);
    if (!target || sortable !== void 0)
      return;
    sortable = new Sortable(target, { ...defaultOptions, ...resetOptions });
  };
  const stop = () => {
    sortable?.destroy();
    sortable = void 0;
  };
  const option = (name, value) => {
    if (value !== void 0)
      sortable?.option(name, value);
    else
      return sortable?.option(name);
  };
  tryOnMounted(start);
  tryOnScopeDispose(stop);
  return {
    stop,
    start,
    option
  };
}
function insertNodeAt(parentElement, element, index) {
  const refElement = parentElement.children[index];
  parentElement.insertBefore(element, refElement);
}
function removeNode(node) {
  if (node.parentNode)
    node.parentNode.removeChild(node);
}
function moveArrayElement(list, from, to, e = null) {
  if (e != null) {
    removeNode(e.item);
    insertNodeAt(e.from, e.item, from);
  }
  const _valueIsRef = isRef(list);
  const array = _valueIsRef ? [...toValue(list)] : toValue(list);
  if (to >= 0 && to < array.length) {
    const element = array.splice(from, 1)[0];
    nextTick(() => {
      array.splice(to, 0, element);
      if (_valueIsRef)
        list.value = array;
    });
  }
}

const UseSortable = /* @__PURE__ */ /*@__PURE__*/ defineComponent({
  name: "UseSortable",
  props: {
    modelValue: {
      type: Array,
      required: true
    },
    tag: {
      type: String,
      default: "div"
    },
    options: {
      type: Object,
      required: true
    }
  },
  setup(props, { slots }) {
    const list = useVModel(props, "modelValue");
    const target = ref();
    const data = reactive(useSortable(target, list, props.options));
    return () => {
      if (slots.default)
        return h(props.tag, { ref: target }, slots.default(data));
    };
  }
});

export { UseSortable };
