# Copy anything 🎭

<a href="https://www.npmjs.com/package/copy-anything"><img src="https://img.shields.io/npm/v/copy-anything.svg" alt="Total Downloads"></a>
<a href="https://www.npmjs.com/package/copy-anything"><img src="https://img.shields.io/npm/dw/copy-anything.svg" alt="Latest Stable Version"></a>

```
npm i copy-anything
```

An optimised way to copy'ing (cloning) an object or array. A small and simple integration.

## Motivation

I created this package because I tried a lot of similar packages that do copy'ing/cloning. But all had its quirks, and _all of them break things they are not supposed to break_... 😞

I was looking for:

- a simple copy/clone function
- has to be fast!
- props must lose any reference to original object
- works with arrays and objects in arrays!
- supports symbols
- can copy non-enumerable props as well
- **does not break special class instances**　‼️

This last one is crucial! So many libraries use custom classes that create objects with special prototypes, and such objects all break when trying to copy them inproperly. So we gotta be careful!

copy-anything will copy objects and nested properties, but only as long as they're "plain objects". As soon as a sub-prop is not a "plain object" and has a special prototype, it will copy that instance over "as is". ♻️
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

## Usage

<!-- prettier-ignore-start -->
```js
import { copy } from 'copy-anything'

const original = { name: 'Ditto', type: { water: true } }
const copy = copy(original)

// now if we change a nested prop like the type
copy.type.water = false
// or add a new nested prop
copy.type.fire = true

// then the original object will still be the same:
(original.type.water === true) // true
(original.type.fire === undefined) // true
```

> Please note, by default copy-anything does not copy non-enumerable props. If you need to copy those, see the instructions further down below.

## Works with arrays

It will also clone arrays, **as well as objects inside arrays!** 😉

```js
const original = [{ name: 'Squirtle' }]
const copy = copy(original)

// now if we change a prop in the array
copy[0].name = 'Wartortle'
// or add a new item to the array
copy.push({ name: 'Charmander' })

// then the original array will still be the same:
(original[0].name === 'Squirtle') // true
(original[1] === undefined) // true
```

## Non-enumerable

By default, copy-anything only copies enumerable properties. If you also want to copy non-enumerable properties you can do so by passing that as an option.

```js
const original = { name: 'Bulbasaur' }
// bulbasaur's ID is non-enumerable
Object.defineProperty(original, 'id', {
  value: '001',
  writable: true,
  enumerable: false,
  configurable: true,
})
const copy1 = copy(original)
(copy1.id === undefined) // true

const copy2 = copy(original, { nonenumerable: true })
(copy2.id === '001') // true
```

## Limit to specific props

You can limit to specific props.

```js
const original = { name: 'Flareon', type: ['fire'], id: '136' }
const copy = copy(original, { props: ['name'] })

(copy) // will look like: `{ name: 'Flareon' }`
```

> Please note, if the props you have specified are non-enumerable, you will also need to pass `{nonenumerable: true}`.

<!-- prettier-ignore-end -->
## Source code

The source code is literally just these lines. Most of the magic comes from the isPlainObject function from the [is-what library](https://github.com/mesqueeb/is-what).

```JavaScript
import { isPlainObject } from 'is-what'

export function copy (target) {
  if (isArray(target)) return target.map(i => copy(i))
  if (!isPlainObject(target)) return target
  return Object.keys(target)
    .reduce((carry, key) => {
      const val = target[key]
      carry[key] = copy(val)
      return carry
    }, {})
}
```
