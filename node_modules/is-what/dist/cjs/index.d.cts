/**
 * Returns the object type of the given payload
 *
 * @param {any} payload
 * @returns {string}
 */
declare function getType(payload: any): string;

type PlainObject = Record<string | number | symbol, any>;
/**
 * Returns whether the payload is a plain JavaScript object (excluding special classes or objects
 * with other prototypes)
 *
 * @param {any} payload
 * @returns {payload is PlainObject}
 */
declare function isPlainObject(payload: any): payload is PlainObject;

/**
 * Returns whether the payload is an any kind of object (including special classes or objects with
 * different prototypes)
 *
 * @param {any} payload
 * @returns {payload is PlainObject}
 */
declare function isAnyObject(payload: any): payload is PlainObject;

/**
 * Returns whether the payload is an array
 *
 * @param {any} payload
 * @returns {payload is any[]}
 */
declare function isArray(payload: any): payload is any[];

/**
 * Returns whether the payload is a Blob
 *
 * @param {any} payload
 * @returns {payload is Blob}
 */
declare function isBlob(payload: any): payload is Blob;

/**
 * Returns whether the payload is a boolean
 *
 * @param {any} payload
 * @returns {payload is boolean}
 */
declare function isBoolean(payload: any): payload is boolean;

/**
 * Returns whether the payload is a Date, and that the date is valid
 *
 * @param {any} payload
 * @returns {payload is Date}
 */
declare function isDate(payload: any): payload is Date;

/**
 * Returns whether the payload is a an empty array
 *
 * @param {any} payload
 * @returns {payload is []}
 */
declare function isEmptyArray(payload: any): payload is [];

/**
 * Returns whether the payload is a an empty object (excluding special classes or objects with other
 * prototypes)
 *
 * @param {any} payload
 * @returns {payload is { [K in any]: never }}
 */
declare function isEmptyObject(payload: any): payload is {
    [K in any]: never;
};

/**
 * Returns whether the payload is ''
 *
 * @param {any} payload
 * @returns {payload is string}
 */
declare function isEmptyString(payload: any): payload is string;

/**
 * Returns whether the payload is an Error
 *
 * @param {any} payload
 * @returns {payload is Error}
 */
declare function isError(payload: any): payload is Error;

/**
 * Returns whether the payload is a File
 *
 * @param {any} payload
 * @returns {payload is File}
 */
declare function isFile(payload: any): payload is File;

/**
 * Returns whether the payload is a an array with at least 1 item
 *
 * @param {any} payload
 * @returns {payload is any[]}
 */
declare function isFullArray(payload: any): payload is any[];

/**
 * Returns whether the payload is a an empty object (excluding special classes or objects with other
 * prototypes)
 *
 * @param {any} payload
 * @returns {payload is PlainObject}
 */
declare function isFullObject(payload: any): payload is PlainObject;

/**
 * Returns whether the payload is a string, BUT returns false for ''
 *
 * @param {any} payload
 * @returns {payload is string}
 */
declare function isFullString(payload: any): payload is string;

type AnyFunction = (...args: any[]) => any;
/**
 * Returns whether the payload is a function (regular or async)
 *
 * @param {any} payload
 * @returns {payload is AnyFunction}
 */
declare function isFunction(payload: any): payload is AnyFunction;

type AnyClass = new (...args: any[]) => any;
/**
 * Does a generic check to check that the given payload is of a given type. In cases like Number, it
 * will return true for NaN as NaN is a Number (thanks javascript!); It will, however, differentiate
 * between object and null
 *
 * @template T
 * @param {any} payload
 * @param {T} type
 * @returns {payload is T}
 * @throws {TypeError} Will throw type error if type is an invalid type
 */
declare function isType<T extends AnyFunction | AnyClass>(payload: any, type: T): payload is T;

type GlobalClassName = {
    [K in keyof typeof globalThis]: (typeof globalThis)[K] extends AnyClass ? K : never;
}[keyof typeof globalThis];
/**
 * Checks if a value is an instance of a class or a class name. Useful when you want to check if a
 * value is an instance of a class that may not be defined in the current scope. For example, if you
 * want to check if a value is an `OffscreenCanvas` instance, you might not want to do the song and
 * dance of using `typeof OffscreenCanvas !== 'undefined'` and then shimming `OffscreenCanvas` if
 * the types aren't around.
 *
 * @example
 *   if (isInstanceOf(value, 'OffscreenCanvas')) {
 *     // value is an OffscreenCanvas
 *   }
 *
 * @param value The value to recursively check
 * @param class_ A string or class that the value should be an instance of
 */
declare function isInstanceOf<T extends AnyClass>(value: unknown, class_: T): value is T;
declare function isInstanceOf<K extends GlobalClassName>(value: unknown, className: K): value is (typeof globalThis)[K];
declare function isInstanceOf(value: unknown, className: string): value is object;

/**
 * Returns whether the payload is a Map
 *
 * @param {any} payload
 * @returns {payload is Map<any, any>}
 */
declare function isMap(payload: any): payload is Map<any, any>;

/**
 * Returns whether the payload is literally the value `NaN` (it's `NaN` and also a `number`)
 *
 * @param {any} payload
 * @returns {payload is typeof NaN}
 */
declare function isNaNValue(payload: any): payload is typeof NaN;

/**
 * Returns whether the payload is a negative number (but not 0)
 *
 * @param {any} payload
 * @returns {payload is number}
 */
declare function isNegativeNumber(payload: any): payload is number;

/**
 * Returns whether the payload is null
 *
 * @param {any} payload
 * @returns {payload is null}
 */
declare function isNull(payload: any): payload is null;

/**
 * Returns true whether the payload is null or undefined
 *
 * @param {any} payload
 * @returns {(payload is null | undefined)}
 */
declare const isNullOrUndefined: (payload: any) => payload is null | undefined;

/**
 * Returns whether the payload is a number (but not NaN)
 *
 * This will return `false` for `NaN`!!
 *
 * @param {any} payload
 * @returns {payload is number}
 */
declare function isNumber(payload: any): payload is number;

/**
 * Returns whether the payload is a plain JavaScript object (excluding special classes or objects
 * with other prototypes)
 *
 * @param {any} payload
 * @returns {payload is PlainObject}
 */
declare function isObject(payload: any): payload is PlainObject;

/**
 * Returns whether the payload is an object like a type passed in < >
 *
 * Usage: isObjectLike<{id: any}>(payload) // will make sure it's an object and has an `id` prop.
 *
 * @template T This must be passed in < >
 * @param {any} payload
 * @returns {payload is T}
 */
declare function isObjectLike<T extends PlainObject>(payload: any): payload is T;

type TypeGuard<A, B extends A> = (payload: A) => payload is B;
/**
 * A factory function that creates a function to check if the payload is one of the given types.
 *
 * @example
 *   import { isOneOf, isNull, isUndefined } from 'is-what'
 *
 *   const isNullOrUndefined = isOneOf(isNull, isUndefined)
 *
 *   isNullOrUndefined(null) // true
 *   isNullOrUndefined(undefined) // true
 *   isNullOrUndefined(123) // false
 */
declare function isOneOf<A, B extends A, C extends A>(a: TypeGuard<A, B>, b: TypeGuard<A, C>): TypeGuard<A, B | C>;
/**
 * A factory function that creates a function to check if the payload is one of the given types.
 *
 * @example
 *   import { isOneOf, isNull, isUndefined } from 'is-what'
 *
 *   const isNullOrUndefined = isOneOf(isNull, isUndefined)
 *
 *   isNullOrUndefined(null) // true
 *   isNullOrUndefined(undefined) // true
 *   isNullOrUndefined(123) // false
 */
declare function isOneOf<A, B extends A, C extends A, D extends A>(a: TypeGuard<A, B>, b: TypeGuard<A, C>, c: TypeGuard<A, D>): TypeGuard<A, B | C | D>;
/**
 * A factory function that creates a function to check if the payload is one of the given types.
 *
 * @example
 *   import { isOneOf, isNull, isUndefined } from 'is-what'
 *
 *   const isNullOrUndefined = isOneOf(isNull, isUndefined)
 *
 *   isNullOrUndefined(null) // true
 *   isNullOrUndefined(undefined) // true
 *   isNullOrUndefined(123) // false
 */
declare function isOneOf<A, B extends A, C extends A, D extends A, E extends A>(a: TypeGuard<A, B>, b: TypeGuard<A, C>, c: TypeGuard<A, D>, d: TypeGuard<A, E>): TypeGuard<A, B | C | D | E>;
/**
 * A factory function that creates a function to check if the payload is one of the given types.
 *
 * @example
 *   import { isOneOf, isNull, isUndefined } from 'is-what'
 *
 *   const isNullOrUndefined = isOneOf(isNull, isUndefined)
 *
 *   isNullOrUndefined(null) // true
 *   isNullOrUndefined(undefined) // true
 *   isNullOrUndefined(123) // false
 */
declare function isOneOf<A, B extends A, C extends A, D extends A, E extends A, F extends A>(a: TypeGuard<A, B>, b: TypeGuard<A, C>, c: TypeGuard<A, D>, d: TypeGuard<A, E>, e: TypeGuard<A, F>): TypeGuard<A, B | C | D | E | F>;

/**
 * Returns whether the payload is a positive number (but not 0)
 *
 * @param {any} payload
 * @returns {payload is number}
 */
declare function isPositiveNumber(payload: any): payload is number;

/**
 * Returns whether the payload is a primitive type (eg. Boolean | Null | Undefined | Number | String
 * | Symbol)
 *
 * @param {any} payload
 * @returns {(payload is boolean | null | undefined | number | string | symbol)}
 */
declare function isPrimitive(payload: any): payload is boolean | null | undefined | number | string | symbol;

/**
 * Returns whether the payload is a Promise
 *
 * @param {any} payload
 * @returns {payload is Promise<any>}
 */
declare function isPromise(payload: any): payload is Promise<any>;

/**
 * Returns whether the payload is a regular expression (RegExp)
 *
 * @param {any} payload
 * @returns {payload is RegExp}
 */
declare function isRegExp(payload: any): payload is RegExp;

/**
 * Returns whether the payload is a Set
 *
 * @param {any} payload
 * @returns {payload is Set<any>}
 */
declare function isSet(payload: any): payload is Set<any>;

/**
 * Returns whether the payload is a string
 *
 * @param {any} payload
 * @returns {payload is string}
 */
declare function isString(payload: any): payload is string;

/**
 * Returns whether the payload is a Symbol
 *
 * @param {any} payload
 * @returns {payload is symbol}
 */
declare function isSymbol(payload: any): payload is symbol;

/**
 * Returns whether the payload is undefined
 *
 * @param {any} payload
 * @returns {payload is undefined}
 */
declare function isUndefined(payload: any): payload is undefined;

/**
 * Returns whether the payload is a WeakMap
 *
 * @param {any} payload
 * @returns {payload is WeakMap<any, any>}
 */
declare function isWeakMap(payload: any): payload is WeakMap<any, any>;

/**
 * Returns whether the payload is a WeakSet
 *
 * @param {any} payload
 * @returns {payload is WeakSet<any>}
 */
declare function isWeakSet(payload: any): payload is WeakSet<any>;

type AnyAsyncFunction = (...args: any[]) => Promise<any>;

export { AnyAsyncFunction, AnyClass, AnyFunction, PlainObject, getType, isAnyObject, isArray, isBlob, isBoolean, isDate, isEmptyArray, isEmptyObject, isEmptyString, isError, isFile, isFullArray, isFullObject, isFullString, isFunction, isInstanceOf, isMap, isNaNValue, isNegativeNumber, isNull, isNullOrUndefined, isNumber, isObject, isObjectLike, isOneOf, isPlainObject, isPositiveNumber, isPrimitive, isPromise, isRegExp, isSet, isString, isSymbol, isType, isUndefined, isWeakMap, isWeakSet };
