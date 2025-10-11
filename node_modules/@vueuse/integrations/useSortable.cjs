'use strict';

var core = require('@vueuse/core');
var Sortable = require('sortablejs');
var vue = require('vue');

function useSortable(el, list, options = {}) {
  let sortable;
  const { document = core.defaultDocument, ...resetOptions } = options;
  const defaultOptions = {
    onUpdate: (e) => {
      moveArrayElement(list, e.oldIndex, e.newIndex, e);
    }
  };
  const start = () => {
    const target = typeof el === "string" ? document == null ? void 0 : document.querySelector(el) : core.unrefElement(el);
    if (!target || sortable !== void 0)
      return;
    sortable = new Sortable(target, { ...defaultOptions, ...resetOptions });
  };
  const stop = () => {
    sortable == null ? void 0 : sortable.destroy();
    sortable = void 0;
  };
  const option = (name, value) => {
    if (value !== void 0)
      sortable == null ? void 0 : sortable.option(name, value);
    else
      return sortable == null ? void 0 : sortable.option(name);
  };
  core.tryOnMounted(start);
  core.tryOnScopeDispose(stop);
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
  const _valueIsRef = vue.isRef(list);
  const array = _valueIsRef ? [...vue.toValue(list)] : vue.toValue(list);
  if (to >= 0 && to < array.length) {
    const element = array.splice(from, 1)[0];
    vue.nextTick(() => {
      array.splice(to, 0, element);
      if (_valueIsRef)
        list.value = array;
    });
  }
}

exports.insertNodeAt = insertNodeAt;
exports.moveArrayElement = moveArrayElement;
exports.removeNode = removeNode;
exports.useSortable = useSortable;
