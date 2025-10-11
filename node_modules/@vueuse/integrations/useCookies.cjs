'use strict';

var shared = require('@vueuse/shared');
var Cookie = require('universal-cookie');
var vue = require('vue');

function createCookies(req) {
  const universalCookie = new Cookie(req ? req.headers.cookie : null);
  return (dependencies, { doNotParse = false, autoUpdateDependencies = false } = {}) => useCookies(dependencies, { doNotParse, autoUpdateDependencies }, universalCookie);
}
function useCookies(dependencies, { doNotParse = false, autoUpdateDependencies = false } = {}, cookies = new Cookie()) {
  const watchingDependencies = autoUpdateDependencies ? [...dependencies || []] : dependencies;
  let previousCookies = cookies.getAll({ doNotParse: true });
  const touches = vue.shallowRef(0);
  const onChange = () => {
    const newCookies = cookies.getAll({ doNotParse: true });
    if (shouldUpdate(
      watchingDependencies || null,
      newCookies,
      previousCookies
    )) {
      touches.value++;
    }
    previousCookies = newCookies;
  };
  cookies.addChangeListener(onChange);
  shared.tryOnScopeDispose(() => {
    cookies.removeChangeListener(onChange);
  });
  return {
    /**
     * Reactive get cookie by name. If **autoUpdateDependencies = true** then it will update watching dependencies
     */
    get: (...args) => {
      if (autoUpdateDependencies && watchingDependencies && !watchingDependencies.includes(args[0]))
        watchingDependencies.push(args[0]);
      touches.value;
      return cookies.get(args[0], { doNotParse, ...args[1] });
    },
    /**
     * Reactive get all cookies
     */
    getAll: (...args) => {
      touches.value;
      return cookies.getAll({ doNotParse, ...args[0] });
    },
    set: (...args) => cookies.set(...args),
    remove: (...args) => cookies.remove(...args),
    addChangeListener: (...args) => cookies.addChangeListener(...args),
    removeChangeListener: (...args) => cookies.removeChangeListener(...args)
  };
}
function shouldUpdate(dependencies, newCookies, oldCookies) {
  if (!dependencies)
    return true;
  for (const dependency of dependencies) {
    if (newCookies[dependency] !== oldCookies[dependency])
      return true;
  }
  return false;
}

exports.createCookies = createCookies;
exports.useCookies = useCookies;
