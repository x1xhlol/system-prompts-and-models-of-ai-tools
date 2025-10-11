const getType = (payload) => Object.prototype.toString.call(payload).slice(8, -1);
export const isUndefined = (payload) => typeof payload === 'undefined';
export const isNull = (payload) => payload === null;
export const isPlainObject = (payload) => {
    if (typeof payload !== 'object' || payload === null)
        return false;
    if (payload === Object.prototype)
        return false;
    if (Object.getPrototypeOf(payload) === null)
        return true;
    return Object.getPrototypeOf(payload) === Object.prototype;
};
export const isEmptyObject = (payload) => isPlainObject(payload) && Object.keys(payload).length === 0;
export const isArray = (payload) => Array.isArray(payload);
export const isString = (payload) => typeof payload === 'string';
export const isNumber = (payload) => typeof payload === 'number' && !isNaN(payload);
export const isBoolean = (payload) => typeof payload === 'boolean';
export const isRegExp = (payload) => payload instanceof RegExp;
export const isMap = (payload) => payload instanceof Map;
export const isSet = (payload) => payload instanceof Set;
export const isSymbol = (payload) => getType(payload) === 'Symbol';
export const isDate = (payload) => payload instanceof Date && !isNaN(payload.valueOf());
export const isError = (payload) => payload instanceof Error;
export const isNaNValue = (payload) => typeof payload === 'number' && isNaN(payload);
export const isPrimitive = (payload) => isBoolean(payload) ||
    isNull(payload) ||
    isUndefined(payload) ||
    isNumber(payload) ||
    isString(payload) ||
    isSymbol(payload);
export const isBigint = (payload) => typeof payload === 'bigint';
export const isInfinite = (payload) => payload === Infinity || payload === -Infinity;
export const isTypedArray = (payload) => ArrayBuffer.isView(payload) && !(payload instanceof DataView);
export const isURL = (payload) => payload instanceof URL;
//# sourceMappingURL=is.js.map