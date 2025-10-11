# is What? 🙉

<a href="https://www.npmjs.com/package/is-what"><img src="https://img.shields.io/npm/v/is-what.svg" alt="Total Downloads"></a>
<a href="https://www.npmjs.com/package/is-what"><img src="https://img.shields.io/npm/dw/is-what.svg" alt="Latest Stable Version"></a>

Very simple & small JS type check functions. It's fully TypeScript supported!

```
npm i is-what
```

Or for deno available at: `"deno.land/x/is_what"`

> Also check out [is-where 🙈](https://github.com/mesqueeb/is-where)

## Motivation

I built is-what because the existing solutions were all too complex or too poorly built.

I was looking for:

- A simple way to check any kind of type (including non-primitives)
- Be able to check if an object is a plain object `{}` or a special object (like a class instance) ‼️
- Let TypeScript automatically know what type a value is when checking

And that's exactly what `is-what` is! (what a great wordplay 😃)

## Usage

is-what is really easy to use, and most functions work just like you'd expect.

```js
// import functions you want to use like so:
import { isString, isDate, isPlainObject } from 'is-what'
```

1. First I'll go over the simple functions available. Only `isNumber` and `isDate` have special treatment.
2. After that I'll talk about working with Objects (plain objects vs class instances etc.).
3. Lastly I'll talk about TypeScript implementation

### Simple type check functions

```js
// basics
isBoolean(true) // true
isBoolean(false) // true
isUndefined(undefined) // true
isNull(null) // true

// strings
isString('') // true
isEmptyString('') // true
isFullString('') // false

// numbers
isNumber(0) // true
isNumber('0') // false
isNumber(NaN) // false *
isPositiveNumber(1) // true
isNegativeNumber(-1) // true
// * see below for special NaN use cases!

// arrays
isArray([]) // true
isEmptyArray([]) // true
isFullArray([1]) // true

// objects
isPlainObject({}) // true *
isEmptyObject({}) // true
isFullObject({ a: 1 }) // true
// * see below for special object (& class instance) use cases!

// functions
isFunction(function () {}) // true
isFunction(() => {}) // true

// dates
isDate(new Date()) // true
isDate(new Date('invalid date')) // false

// maps & sets
isMap(new Map()) // true
isSet(new Set()) // true
isWeakMap(new WeakMap()) // true
isWeakSet(new WeakSet()) // true

// others
isRegExp(/\s/gi) // true
isSymbol(Symbol()) // true
isBlob(new Blob()) // true
isFile(new File([''], '', { type: 'text/html' })) // true
isError(new Error('')) // true
isPromise(new Promise((resolve) => {})) // true

// primitives
isPrimitive('') // true
// true for any of: boolean, null, undefined, number, string, symbol
```

### Let's talk about NaN

`isNaN` is a built-in JS Function but it really makes no sense:

```js
// 1)
typeof NaN === 'number' // true
// 🤔 ("not a number" is a "number"...)

// 2)
isNaN('1') // false
// 🤔 the string '1' is not-"not a number"... so it's a number??

// 3)
isNaN('one') // true
// 🤔 'one' is NaN but `NaN === 'one'` is false...
```

With is-what the way we treat NaN makes a little bit more sense:

```js
import { isNumber, isNaNValue } from 'is-what'

// 1)
isNumber(NaN) // false!
// let's not treat NaN as a number

// 2)
isNaNValue('1') // false
// if it's not NaN, it's not NaN!!

// 3)
isNaNValue('one') // false
// if it's not NaN, it's not NaN!!

isNaNValue(NaN) // true
```

### isPlainObject vs isAnyObject

Checking for a JavaScript object can be really difficult. In JavaScript you can create classes that will behave just like JavaScript objects but might have completely different prototypes. With is-what I went for this classification:

- `isPlainObject` will only return `true` on plain JavaScript objects and not on classes or others
- `isAnyObject` will be more loose and return `true` on regular objects, classes, etc.

```js
// define a plain object
const plainObject = { hello: 'I am a good old object.' }

// define a special object
class SpecialObject {
  constructor(somethingSpecial) {
    this.speciality = somethingSpecial
  }
}
const specialObject = new SpecialObject('I am a special object! I am a class instance!!!')

// check the plain object
isPlainObject(plainObject) // returns true
isAnyObject(plainObject) // returns true
getType(plainObject) // returns 'Object'

// check the special object
isPlainObject(specialObject) // returns false !!!!!!!!!
isAnyObject(specialObject) // returns true
getType(specialObject) // returns 'Object'
```

> Please note that `isPlainObject` will only return `true` for normal plain JavaScript objects.

### Getting and checking for specific types

You can check for specific types with `getType` and `isType`:

```js
import { getType, isType } from 'is-what'

getType('') // returns 'String'
// pass a Type as second param:
isType('', String) // returns true
```

If you just want to make sure your object _inherits_ from a particular class or
`toStringTag` value, you can use `isInstanceOf()` like this:

```js
import { isInstanceOf } from 'is-what'

isInstanceOf(new XMLHttpRequest(), 'EventTarget')
// returns true
isInstanceOf(globalThis, ReadableStream)
// returns false
```

## TypeScript

is-what makes TypeScript know the type during if statements. This means that a check returns the type of the payload for TypeScript users.

```ts
function isNumber(payload: any): payload is number {
  // return boolean
}
// As you can see above, all functions return a boolean for JavaScript, but pass the payload type to TypeScript.

// usage example:
function fn(payload: string | number): number {
  if (isNumber(payload)) {
    // ↑ TypeScript already knows payload is a number here!
    return payload
  }
  return 0
}
```

`isPlainObject` and `isAnyObject` with TypeScript will declare the payload to be an object type with any props:

```ts
function isPlainObject(payload: any): payload is { [key: string]: any }
function isAnyObject(payload: any): payload is { [key: string]: any }
// The reason to return `{[key: string]: any}` is to be able to do
if (isPlainObject(payload) && payload.id) return payload.id
// if isPlainObject() would return `payload is object` then it would give an error at `payload.id`
```

### isObjectLike

If you want more control over what kind of interface/type is casted when checking for objects.

To cast to a specific type while checking for `isAnyObject`, can use `isObjectLike<T>`:

```ts
import { isObjectLike } from 'is-what'

const payload = { name: 'Mesqueeb' } // current type: `{ name: string }`

// Without casting:
if (isAnyObject(payload)) {
  // in here `payload` is casted to: `Record<string | number | symbol, any>`
  // WE LOOSE THE TYPE!
}

// With casting:
// you can pass a specific type for TS that will be casted when the function returns
if (isObjectLike<{ name: string }>(payload)) {
  // in here `payload` is casted to: `{ name: string }`
}
```

Please note: this library will not actually check the shape of the object, you need to do that yourself.

`isObjectLike<T>` works like this under the hood:

```ts
function isObjectLike<T extends object>(payload: any): payload is T {
  return isAnyObject(payload)
}
```

## Meet the family (more tiny utils with TS support)

- [is-what 🙉](https://github.com/mesqueeb/is-what)
- [is-where 🙈](https://github.com/mesqueeb/is-where)
- [merge-anything 🥡](https://github.com/mesqueeb/merge-anything)
- [check-anything 👁](https://github.com/mesqueeb/check-anything)
- [remove-anything ✂️](https://github.com/mesqueeb/remove-anything)
- [getorset-anything 🐊](https://github.com/mesqueeb/getorset-anything)
- [map-anything 🗺](https://github.com/mesqueeb/map-anything)
- [filter-anything ⚔️](https://github.com/mesqueeb/filter-anything)
- [copy-anything 🎭](https://github.com/mesqueeb/copy-anything)
- [case-anything 🐫](https://github.com/mesqueeb/case-anything)
- [flatten-anything 🏏](https://github.com/mesqueeb/flatten-anything)
- [nestify-anything 🧅](https://github.com/mesqueeb/nestify-anything)

## Source code

It's litterally just these functions:

```js
function getType(payload) {
  return Object.prototype.toString.call(payload).slice(8, -1)
}
function isUndefined(payload) {
  return getType(payload) === 'Undefined'
}
function isString(payload) {
  return getType(payload) === 'String'
}
function isAnyObject(payload) {
  return getType(payload) === 'Object'
}
// etc...
```

See the full source code [here](https://github.com/mesqueeb/is-what/blob/production/src/index.ts).
