function getType(payload) {
  return Object.prototype.toString.call(payload).slice(8, -1);
}

function isAnyObject(payload) {
  return getType(payload) === "Object";
}

function isArray(payload) {
  return getType(payload) === "Array";
}

function isBlob(payload) {
  return getType(payload) === "Blob";
}

function isBoolean(payload) {
  return getType(payload) === "Boolean";
}

function isDate(payload) {
  return getType(payload) === "Date" && !isNaN(payload);
}

function isEmptyArray(payload) {
  return isArray(payload) && payload.length === 0;
}

function isPlainObject(payload) {
  if (getType(payload) !== "Object")
    return false;
  const prototype = Object.getPrototypeOf(payload);
  return !!prototype && prototype.constructor === Object && prototype === Object.prototype;
}

function isEmptyObject(payload) {
  return isPlainObject(payload) && Object.keys(payload).length === 0;
}

function isEmptyString(payload) {
  return payload === "";
}

function isError(payload) {
  return getType(payload) === "Error" || payload instanceof Error;
}

function isFile(payload) {
  return getType(payload) === "File";
}

function isFullArray(payload) {
  return isArray(payload) && payload.length > 0;
}

function isFullObject(payload) {
  return isPlainObject(payload) && Object.keys(payload).length > 0;
}

function isString(payload) {
  return getType(payload) === "String";
}

function isFullString(payload) {
  return isString(payload) && payload !== "";
}

function isFunction(payload) {
  return typeof payload === "function";
}

function isType(payload, type) {
  if (!(type instanceof Function)) {
    throw new TypeError("Type must be a function");
  }
  if (!Object.prototype.hasOwnProperty.call(type, "prototype")) {
    throw new TypeError("Type is not a class");
  }
  const name = type.name;
  return getType(payload) === name || Boolean(payload && payload.constructor === type);
}

function isInstanceOf(value, classOrClassName) {
  if (typeof classOrClassName === "function") {
    for (let p = value; p; p = Object.getPrototypeOf(p)) {
      if (isType(p, classOrClassName)) {
        return true;
      }
    }
    return false;
  } else {
    for (let p = value; p; p = Object.getPrototypeOf(p)) {
      if (getType(p) === classOrClassName) {
        return true;
      }
    }
    return false;
  }
}

function isMap(payload) {
  return getType(payload) === "Map";
}

function isNaNValue(payload) {
  return getType(payload) === "Number" && isNaN(payload);
}

function isNumber(payload) {
  return getType(payload) === "Number" && !isNaN(payload);
}

function isNegativeNumber(payload) {
  return isNumber(payload) && payload < 0;
}

function isNull(payload) {
  return getType(payload) === "Null";
}

function isOneOf(a, b, c, d, e) {
  return (value) => a(value) || b(value) || !!c && c(value) || !!d && d(value) || !!e && e(value);
}

function isUndefined(payload) {
  return getType(payload) === "Undefined";
}

const isNullOrUndefined = isOneOf(isNull, isUndefined);

function isObject(payload) {
  return isPlainObject(payload);
}

function isObjectLike(payload) {
  return isAnyObject(payload);
}

function isPositiveNumber(payload) {
  return isNumber(payload) && payload > 0;
}

function isSymbol(payload) {
  return getType(payload) === "Symbol";
}

function isPrimitive(payload) {
  return isBoolean(payload) || isNull(payload) || isUndefined(payload) || isNumber(payload) || isString(payload) || isSymbol(payload);
}

function isPromise(payload) {
  return getType(payload) === "Promise";
}

function isRegExp(payload) {
  return getType(payload) === "RegExp";
}

function isSet(payload) {
  return getType(payload) === "Set";
}

function isWeakMap(payload) {
  return getType(payload) === "WeakMap";
}

function isWeakSet(payload) {
  return getType(payload) === "WeakSet";
}

export { getType, isAnyObject, isArray, isBlob, isBoolean, isDate, isEmptyArray, isEmptyObject, isEmptyString, isError, isFile, isFullArray, isFullObject, isFullString, isFunction, isInstanceOf, isMap, isNaNValue, isNegativeNumber, isNull, isNullOrUndefined, isNumber, isObject, isObjectLike, isOneOf, isPlainObject, isPositiveNumber, isPrimitive, isPromise, isRegExp, isSet, isString, isSymbol, isType, isUndefined, isWeakMap, isWeakSet };
