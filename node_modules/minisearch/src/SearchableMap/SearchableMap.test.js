/* eslint-env jest */

import SearchableMap from './SearchableMap'
import * as fc from 'fast-check'

describe('SearchableMap', () => {
  const strings = ['bin', 'border', 'acqua', 'aqua', 'poisson', 'parachute',
    'parapendio', 'acquamarina', 'summertime', 'summer', 'join', 'mediterraneo',
    'perciò', 'borderline', 'bo']
  const keyValues = strings.map((key, i) => [key, i])
  const object = keyValues.reduce((obj, [key, value]) => ({ ...obj, [key]: value }))

  const editDistance = function (a, b, mem = [[0]]) {
    mem[a.length] = mem[a.length] || [a.length]
    if (mem[a.length][b.length] !== undefined) { return mem[a.length][b.length] }
    const d = (a[a.length - 1] === b[b.length - 1]) ? 0 : 1
    const distance = (a.length === 1 && b.length === 1)
      ? d
      : Math.min(
        ((a.length > 0) ? editDistance(a.slice(0, -1), b, mem) + 1 : Infinity),
        ((b.length > 0) ? editDistance(a, b.slice(0, -1), mem) + 1 : Infinity),
        ((a.length > 0 && b.length > 0) ? editDistance(a.slice(0, -1), b.slice(0, -1), mem) + d : Infinity)
      )
    mem[a.length][b.length] = distance
    return distance
  }

  describe('clear', () => {
    it('empties the map', () => {
      const map = SearchableMap.from(keyValues)
      map.clear()
      expect(Array.from(map.entries())).toEqual([])
    })
  })

  describe('delete', () => {
    it('deletes the entry at the given key', () => {
      const map = SearchableMap.from(keyValues)
      map.delete('border')
      expect(map.has('border')).toBe(false)
      expect(map.has('summer')).toBe(true)
      expect(map.has('borderline')).toBe(true)
      expect(map.has('bo')).toBe(true)
    })

    it('changes the size of the map', () => {
      const map = SearchableMap.from(keyValues)
      const sizeBefore = map.size
      map.delete('summertime')
      expect(map.size).toEqual(sizeBefore - 1)
    })

    it('does nothing if the entry did not exist', () => {
      const map = new SearchableMap()
      expect(() => map.delete('something')).not.toThrow()
    })

    it('leaves the radix tree in the same state as before the entry was added', () => {
      const map = new SearchableMap()

      map.set('hello', 1)
      const before = new SearchableMap(new Map(map._tree))

      map.set('help', 2)
      map.delete('help')

      expect(map).toEqual(before)
    })
  })

  describe('entries', () => {
    it('returns an iterator of entries', () => {
      const map = SearchableMap.from(keyValues)
      const entries = Array.from({ [Symbol.iterator]: () => map.entries() })
      expect(entries.sort()).toEqual(keyValues.sort())
    })

    it('returns an iterable of entries', () => {
      const map = SearchableMap.from(keyValues)
      const entries = Array.from(map.entries())
      expect(entries.sort()).toEqual(keyValues.sort())
    })

    it('returns empty iterator, if the map is empty', () => {
      const map = new SearchableMap()
      const entries = Array.from(map.entries())
      expect(entries).toEqual([])
    })
  })

  describe('forEach', () => {
    it('iterates through each entry', () => {
      const entries = []
      const fn = (key, value) => entries.push([key, value])
      const map = SearchableMap.from(keyValues)
      map.forEach(fn)
      expect(entries).toEqual(Array.from(map.entries()))
    })
  })

  describe('get', () => {
    it('gets the value at key', () => {
      const key = 'foo'
      const value = 42
      const map = SearchableMap.fromObject({ [key]: value })
      expect(map.get(key)).toBe(value)
    })

    it('returns undefined if the key is not present', () => {
      const map = new SearchableMap()
      expect(map.get('not-existent')).toBe(undefined)
    })
  })

  describe('has', () => {
    it('returns true if the given key exists in the map', () => {
      const map = new SearchableMap()
      map.set('something', 42)
      expect(map.has('something')).toBe(true)

      map.set('something else', null)
      expect(map.has('something else')).toBe(true)
    })

    it('returns false if the given key does not exist in the map', () => {
      const map = SearchableMap.fromObject({ something: 42 })
      expect(map.has('not-existing')).toBe(false)
      expect(map.has('some')).toBe(false)
    })
  })

  describe('keys', () => {
    it('returns an iterator of keys', () => {
      const map = SearchableMap.from(keyValues)
      const keys = Array.from({ [Symbol.iterator]: () => map.keys() })
      expect(keys.sort()).toEqual(strings.sort())
    })

    it('returns an iterable of keys', () => {
      const map = SearchableMap.from(keyValues)
      const keys = Array.from(map.keys())
      expect(keys.sort()).toEqual(strings.sort())
    })

    it('returns empty iterator, if the map is empty', () => {
      const map = new SearchableMap()
      const keys = Array.from(map.keys())
      expect(keys).toEqual([])
    })
  })

  describe('set', () => {
    it('sets a value at key', () => {
      const map = new SearchableMap()
      const key = 'foo'
      const value = 42
      map.set(key, value)
      expect(map.get(key)).toBe(value)
    })

    it('overrides a value at key if it already exists', () => {
      const map = SearchableMap.fromObject({ foo: 123 })
      const key = 'foo'
      const value = 42
      map.set(key, value)
      expect(map.get(key)).toBe(value)
    })

    it('throws error if the given key is not a string', () => {
      const map = new SearchableMap()
      expect(() => map.set(123, 'foo')).toThrow('key must be a string')
    })
  })

  describe('size', () => {
    it('is a property containing the size of the map', () => {
      const map = SearchableMap.from(keyValues)
      expect(map.size).toEqual(keyValues.length)
      map.set('foo', 42)
      expect(map.size).toEqual(keyValues.length + 1)
      map.delete('border')
      expect(map.size).toEqual(keyValues.length)
      map.clear()
      expect(map.size).toEqual(0)
    })
  })

  describe('update', () => {
    it('sets a value at key applying a function to the previous value', () => {
      const map = new SearchableMap()
      const key = 'foo'
      const fn = jest.fn(x => (x || 0) + 1)
      map.update(key, fn)
      expect(fn).toHaveBeenCalledWith(undefined)
      expect(map.get(key)).toBe(1)
      map.update(key, fn)
      expect(fn).toHaveBeenCalledWith(1)
      expect(map.get(key)).toBe(2)
    })

    it('throws error if the given key is not a string', () => {
      const map = new SearchableMap()
      expect(() => map.update(123, () => {})).toThrow('key must be a string')
    })
  })

  describe('values', () => {
    it('returns an iterator of values', () => {
      const map = SearchableMap.fromObject(object)
      const values = Array.from({ [Symbol.iterator]: () => map.values() })
      expect(values.sort()).toEqual(Object.values(object).sort())
    })

    it('returns an iterable of values', () => {
      const map = SearchableMap.fromObject(object)
      const values = Array.from(map.values())
      expect(values.sort()).toEqual(Object.values(object).sort())
    })

    it('returns empty iterator, if the map is empty', () => {
      const map = new SearchableMap()
      const values = Array.from(map.values())
      expect(values).toEqual([])
    })
  })

  describe('atPrefix', () => {
    it('returns the submap at the given prefix', () => {
      const map = SearchableMap.from(keyValues)

      const sum = map.atPrefix('sum')
      expect(Array.from(sum.keys()).sort()).toEqual(strings.filter(string => string.startsWith('sum')).sort())

      const summer = sum.atPrefix('summer')
      expect(Array.from(summer.keys()).sort()).toEqual(strings.filter(string => string.startsWith('summer')).sort())

      const xyz = map.atPrefix('xyz')
      expect(Array.from(xyz.keys())).toEqual([])

      expect(() => sum.atPrefix('xyz')).toThrow()
    })

    it('correctly computes the size', () => {
      const map = SearchableMap.from(keyValues)
      const sum = map.atPrefix('sum')
      expect(sum.size).toEqual(strings.filter(string => string.startsWith('sum')).length)
    })
  })

  describe('fuzzyGet', () => {
    const terms = ['summer', 'acqua', 'aqua', 'acquire', 'poisson', 'qua']
    const keyValues = terms.map((key, i) => [key, i])
    const map = SearchableMap.from(keyValues)

    it('returns all entries having the given maximum edit distance from the given key', () => {
      [0, 1, 2, 3].forEach(distance => {
        const results = map.fuzzyGet('acqua', distance)
        const entries = Array.from(results)
        expect(entries.map(([key, [value, dist]]) => [key, dist]).sort())
          .toEqual(terms.map(term => [term, editDistance('acqua', term)]).filter(([, d]) => d <= distance).sort())
        expect(entries.every(([key, [value]]) => map.get(key) === value)).toBe(true)
      })
    })

    it('returns an empty object if no matching entries are found', () => {
      expect(map.fuzzyGet('winter', 1)).toEqual(new Map())
    })

    it('returns entries if edit distance is longer than key', () => {
      const map = SearchableMap.from([['x', 1], [' x', 2]])
      expect(Array.from(map.fuzzyGet('x', 2).values())).toEqual([[1, 0], [2, 1]])
    })
  })

  describe('with generated test data', () => {
    it('adds and removes entries', () => {
      const arrayOfStrings = fc.array(fc.oneof(fc.unicodeString(), fc.string()), { maxLength: 70 })
      const string = fc.oneof(fc.unicodeString({ minLength: 0, maxLength: 4 }), fc.string({ minLength: 0, maxLength: 4 }))
      const int = fc.integer({ min: 1, max: 4 })

      fc.assert(fc.property(arrayOfStrings, string, int, (terms, prefix, maxDist) => {
        const map = new SearchableMap()
        const standardMap = new Map()
        const uniqueTerms = [...new Set(terms)]

        terms.forEach((term, i) => {
          map.set(term, i)
          standardMap.set(term, i)
          expect(map.has(term)).toBe(true)
          expect(standardMap.get(term)).toEqual(i)
        })

        expect(map.size).toEqual(standardMap.size)
        expect(Array.from(map.entries()).sort()).toEqual(Array.from(standardMap.entries()).sort())

        expect(Array.from(map.atPrefix(prefix).keys()).sort())
          .toEqual(Array.from(new Set(terms)).filter(t => t.startsWith(prefix)).sort())

        const fuzzy = map.fuzzyGet(terms[0], maxDist)
        expect(Array.from(fuzzy, ([key, [value, dist]]) => [key, dist]).sort())
          .toEqual(uniqueTerms.map(term => [term, editDistance(terms[0], term)])
            .filter(([, dist]) => dist <= maxDist).sort())

        terms.forEach(term => {
          map.delete(term)
          expect(map.has(term)).toBe(false)
          expect(map.get(term)).toEqual(undefined)
        })

        expect(map.size).toEqual(0)
      }))
    })
  })
})
