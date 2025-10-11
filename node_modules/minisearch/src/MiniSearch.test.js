/* eslint-env jest */

import MiniSearch from './MiniSearch'

describe('MiniSearch', () => {
  describe('constructor', () => {
    it('throws error if fields option is missing', () => {
      expect(() => new MiniSearch()).toThrow('MiniSearch: option "fields" must be provided')
    })

    it('initializes the attributes', () => {
      const options = { fields: ['title', 'text'] }
      const ms = new MiniSearch(options)
      expect(ms._documentCount).toEqual(0)
      expect(ms._fieldIds).toEqual({ title: 0, text: 1 })
      expect(ms._documentIds.size).toEqual(0)
      expect(ms._fieldLength.size).toEqual(0)
      expect(ms._avgFieldLength.length).toEqual(0)
      expect(ms._options).toMatchObject(options)
    })
  })

  describe('add', () => {
    it('adds the document to the index', () => {
      const ms = new MiniSearch({ fields: ['text'] })
      ms.add({ id: 1, text: 'Nel mezzo del cammin di nostra vita' })
      expect(ms.documentCount).toEqual(1)
    })

    it('does not throw error if a field is missing', () => {
      const ms = new MiniSearch({ fields: ['title', 'text'] })
      ms.add({ id: 1, text: 'Nel mezzo del cammin di nostra vita' })
      expect(ms.documentCount).toEqual(1)
    })

    it('throws error if the document does not have the ID field', () => {
      const ms = new MiniSearch({ idField: 'foo', fields: ['title', 'text'] })
      expect(() => {
        ms.add({ text: 'I do not have an ID' })
      }).toThrowError('MiniSearch: document does not have ID field "foo"')
    })

    it('throws error on duplicate ID', () => {
      const ms = new MiniSearch({ idField: 'foo', fields: ['title', 'text'] })
      ms.add({ foo: 'abc', text: 'Something' })

      expect(() => {
        ms.add({ foo: 'abc', text: 'I have a duplicate ID' })
      }).toThrowError('MiniSearch: duplicate ID abc')
    })

    it('extracts the ID field using extractField', () => {
      const extractField = (document, fieldName) => {
        if (fieldName === 'id') { return document.id.value }
        return MiniSearch.getDefault('extractField')(document, fieldName)
      }
      const ms = new MiniSearch({ fields: ['text'], extractField })

      ms.add({ id: { value: 123 }, text: 'Nel mezzo del cammin di nostra vita' })

      const results = ms.search('vita')
      expect(results[0].id).toEqual(123)
    })

    it('rejects falsy terms', () => {
      const processTerm = term => term === 'foo' ? null : term
      const ms = new MiniSearch({ fields: ['title', 'text'], processTerm })
      expect(() => {
        ms.add({ id: 123, text: 'foo bar' })
      }).not.toThrowError()
    })

    it('turns the field to string before tokenization', () => {
      const tokenize = jest.fn(x => x.split(/\W+/))
      const ms = new MiniSearch({ fields: ['id', 'tags', 'isBlinky'], tokenize })
      expect(() => {
        ms.add({ id: 123, tags: ['foo', 'bar'], isBlinky: false })
        ms.add({ id: 321, isBlinky: true })
      }).not.toThrowError()

      expect(tokenize).toHaveBeenCalledWith('123', 'id')
      expect(tokenize).toHaveBeenCalledWith('foo,bar', 'tags')
      expect(tokenize).toHaveBeenCalledWith('false', 'isBlinky')

      expect(tokenize).toHaveBeenCalledWith('321', 'id')
      expect(tokenize).toHaveBeenCalledWith('true', 'isBlinky')
    })

    it('turns the field to string before tokenization using a custom stringifyField function, if given', () => {
      const tokenize = jest.fn(x => x.split(/\W+/))
      const stringifyField = jest.fn((value, fieldName) => {
        if (fieldName === 'tags') {
          return value.join('|')
        } else if (typeof value === 'boolean') {
          return value ? 'T' : 'F'
        }
        return value.toString()
      })
      const ms = new MiniSearch({ fields: ['id', 'tags', 'isBlinky'], tokenize, stringifyField })
      expect(() => {
        ms.add({ id: 123, tags: ['foo', 'bar'], isBlinky: false })
        ms.add({ id: 321, isBlinky: true })
      }).not.toThrowError()

      expect(tokenize).toHaveBeenCalledWith('123', 'id')
      expect(tokenize).toHaveBeenCalledWith('foo|bar', 'tags')
      expect(tokenize).toHaveBeenCalledWith('F', 'isBlinky')

      expect(tokenize).toHaveBeenCalledWith('321', 'id')
      expect(tokenize).toHaveBeenCalledWith('T', 'isBlinky')
    })

    it('passes document and field name to the field extractor', () => {
      const extractField = jest.fn((document, fieldName) => {
        if (fieldName === 'pubDate') {
          return document[fieldName] && document[fieldName].toLocaleDateString('it-IT')
        }
        return fieldName.split('.').reduce((doc, key) => doc && doc[key], document)
      })
      const tokenize = jest.fn(string => string.split(/\W+/))
      const ms = new MiniSearch({
        fields: ['title', 'pubDate', 'author.name'],
        storeFields: ['category'],
        extractField,
        tokenize
      })
      const document = {
        id: 1,
        title: 'Divina Commedia',
        pubDate: new Date(1320, 0, 1),
        author: { name: 'Dante Alighieri' },
        category: 'poetry'
      }
      ms.add(document)
      expect(extractField).toHaveBeenCalledWith(document, 'title')
      expect(extractField).toHaveBeenCalledWith(document, 'pubDate')
      expect(extractField).toHaveBeenCalledWith(document, 'author.name')
      expect(extractField).toHaveBeenCalledWith(document, 'category')
      expect(tokenize).toHaveBeenCalledWith(document.title, 'title')
      expect(tokenize).toHaveBeenCalledWith(document.pubDate.toLocaleDateString('it-IT'), 'pubDate')
      expect(tokenize).toHaveBeenCalledWith(document.author.name, 'author.name')
      expect(tokenize).not.toHaveBeenCalledWith(document.category, 'category')
    })

    it('passes field value and name to tokenizer', () => {
      const tokenize = jest.fn(string => string.split(/\W+/))
      const ms = new MiniSearch({ fields: ['text', 'title'], tokenize })
      const document = { id: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita' }
      ms.add(document)
      expect(tokenize).toHaveBeenCalledWith(document.text, 'text')
      expect(tokenize).toHaveBeenCalledWith(document.title, 'title')
    })

    it('passes field value and name to term processor', () => {
      const processTerm = jest.fn(term => term.toLowerCase())
      const ms = new MiniSearch({ fields: ['text', 'title'], processTerm })
      const document = { id: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita' }
      ms.add(document)
      document.text.split(/\W+/).forEach(term => {
        expect(processTerm).toHaveBeenCalledWith(term, 'text')
      })
      document.title.split(/\W+/).forEach(term => {
        expect(processTerm).toHaveBeenCalledWith(term, 'title')
      })
    })

    it('allows processTerm to expand a single term into several terms', () => {
      const processTerm = (string) => string === 'foobar' ? ['foo', 'bar'] : string
      const ms = new MiniSearch({ fields: ['title', 'text'], processTerm })
      expect(() => {
        ms.add({ id: 123, text: 'foobar' })
      }).not.toThrowError()

      expect(ms.search('bar')).toHaveLength(1)
    })
  })

  describe('remove', () => {
    const documents = [
      { id: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita ... cammin' },
      { id: 2, title: 'I Promessi Sposi', text: 'Quel ramo del lago di Como' },
      { id: 3, title: 'Vita Nova', text: 'In quella parte del libro della mia memoria ... cammin' }
    ]

    let ms, _warn
    beforeEach(() => {
      ms = new MiniSearch({ fields: ['title', 'text'] })
      ms.addAll(documents)
      _warn = console.warn
      console.warn = jest.fn()
    })

    afterEach(() => {
      console.warn = _warn
    })

    it('removes the document from the index', () => {
      expect(ms.documentCount).toEqual(3)
      ms.remove(documents[0])
      expect(ms.documentCount).toEqual(2)
      expect(ms.search('commedia').length).toEqual(0)
      expect(ms.search('vita').map(({ id }) => id)).toEqual([3])
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('cleans up all data of the deleted document', () => {
      const otherDocument = { id: 4, title: 'Decameron', text: 'Umana cosa è aver compassione degli afflitti' }
      const originalFieldLength = new Map(ms._fieldLength)
      const originalAverageFieldLength = ms._avgFieldLength.slice()

      ms.add(otherDocument)
      ms.remove(otherDocument)

      expect(ms.documentCount).toEqual(3)
      expect(ms._fieldLength).toEqual(originalFieldLength)
      expect(ms._avgFieldLength).toEqual(originalAverageFieldLength)
    })

    it('does not remove terms from other documents', () => {
      ms.remove(documents[0])
      expect(ms.search('cammin').length).toEqual(1)
    })

    it('removes re-added document', () => {
      ms.remove(documents[0])
      ms.add(documents[0])
      ms.remove(documents[0])
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('removes documents when using a custom extractField', () => {
      const extractField = (document, fieldName) => {
        const path = fieldName.split('.')
        return path.reduce((doc, key) => doc && doc[key], document)
      }
      const ms = new MiniSearch({ fields: ['text.value'], storeFields: ['id'], extractField })
      const document = { id: 123, text: { value: 'Nel mezzo del cammin di nostra vita' } }
      ms.add(document)

      expect(() => {
        ms.remove(document)
      }).not.toThrowError()

      expect(ms.search('vita')).toEqual([])
    })

    it('cleans up the index', () => {
      const originalIdsSize = ms._documentIds.size
      ms.remove(documents[0])
      expect(ms._index.has('commedia')).toEqual(false)
      expect(ms._documentIds.size).toEqual(originalIdsSize - 1)
      expect(Array.from(ms._index.get('vita').keys())).toEqual([ms._fieldIds.title])
    })

    it('throws error if the document does not have the ID field', () => {
      const ms = new MiniSearch({ idField: 'foo', fields: ['title', 'text'] })
      expect(() => {
        ms.remove({ text: 'I do not have an ID' })
      }).toThrowError('MiniSearch: document does not have ID field "foo"')
    })

    it('extracts the ID field using extractField', () => {
      const extractField = (document, fieldName) => {
        if (fieldName === 'id') { return document.id.value }
        return MiniSearch.getDefault('extractField')(document, fieldName)
      }
      const ms = new MiniSearch({ fields: ['text'], extractField })
      const document = { id: { value: 123 }, text: 'Nel mezzo del cammin di nostra vita' }
      ms.add(document)

      expect(() => {
        ms.remove(document)
      }).not.toThrowError()

      expect(ms.search('vita')).toEqual([])
    })

    it('does not crash when the document has field named like default properties of object', () => {
      const ms = new MiniSearch({ fields: ['constructor'] })
      const document = { id: 1 }
      ms.add(document)

      expect(() => {
        ms.remove(document)
      }).not.toThrowError()
    })

    it('does not reassign IDs', () => {
      ms.remove(documents[0])
      ms.add(documents[0])
      expect(ms.search('commedia').map(result => result.id)).toEqual([documents[0].id])
      expect(ms.search('nova').map(result => result.id)).toEqual([documents[documents.length - 1].id])
    })

    it('rejects falsy terms', () => {
      const processTerm = term => term === 'foo' ? null : term
      const ms = new MiniSearch({ fields: ['title', 'text'], processTerm })
      const document = { id: 123, title: 'foo bar' }
      ms.add(document)
      expect(() => {
        ms.remove(document)
      }).not.toThrowError()
    })

    it('allows processTerm to expand a single term into several terms', () => {
      const processTerm = (string) => string === 'foobar' ? ['foo', 'bar'] : string
      const ms = new MiniSearch({ fields: ['title', 'text'], processTerm })
      const document = { id: 123, title: 'foobar' }
      ms.add(document)
      expect(() => {
        ms.remove(document)
      }).not.toThrowError()

      expect(ms.search('bar')).toHaveLength(0)
    })

    describe('when using custom per-field extraction/stringification/tokenizer/processing', () => {
      const documents = [
        { id: 1, title: 'Divina Commedia', tags: ['dante', 'virgilio'], author: { name: 'Dante Alighieri' }, available: true },
        { id: 2, title: 'I Promessi Sposi', tags: ['renzo', 'lucia'], author: { name: 'Alessandro Manzoni' }, available: false },
        { id: 3, title: 'Vita Nova', tags: ['dante'], author: { name: 'Dante Alighieri' }, available: true }
      ]
      const options = {
        fields: ['title', 'tags', 'authorName', 'available'],
        extractField: (doc, fieldName) => {
          if (fieldName === 'authorName') {
            return doc.author.name
          } else {
            return doc[fieldName]
          }
        },
        stringifyField: (fieldValue, fieldName) => {
          if (fieldName === 'available') {
            return fieldValue ? 'yes' : 'no'
          } else {
            return fieldValue.toString()
          }
        },
        tokenize: (field, fieldName) => {
          if (fieldName === 'tags') {
            return field.split(',')
          } else {
            return field.split(/\s+/)
          }
        },
        processTerm: (term, fieldName) => {
          if (fieldName === 'tags') {
            return term.toUpperCase()
          } else {
            return term.toLowerCase()
          }
        }
      }

      let ms, _warn
      beforeEach(() => {
        ms = new MiniSearch(options)
        ms.addAll(documents)
        _warn = console.warn
        console.warn = jest.fn()
      })

      afterEach(() => {
        console.warn = _warn
      })

      it('removes the document and its terms from the index', () => {
        expect(ms.documentCount).toEqual(3)
        expect(ms.search('commedia').map(({ id }) => id)).toEqual([1])
        expect(ms.search('DANTE').map(({ id }) => id)).toEqual([1, 3])
        expect(ms.search('vita').map(({ id }) => id)).toEqual([3])
        expect(ms.search('yes').map(({ id }) => id)).toEqual([1, 3])

        ms.remove(documents[0])

        expect(ms.documentCount).toEqual(2)
        expect(ms.search('commedia').map(({ id }) => id)).toEqual([])
        expect(ms.search('DANTE').map(({ id }) => id)).toEqual([3])
        expect(ms.search('vita').map(({ id }) => id)).toEqual([3])
        expect(ms.search('yes').map(({ id }) => id)).toEqual([3])
        expect(console.warn).not.toHaveBeenCalled()
      })
    })

    describe('when the document was not in the index', () => {
      it('throws an error', () => {
        expect(() => ms.remove({ id: 99 }))
          .toThrow('MiniSearch: cannot remove document with ID 99: it is not in the index')
      })
    })

    describe('when the document has changed', () => {
      it('warns of possible index corruption', () => {
        expect(() => ms.remove({ id: 1, title: 'Divina Commedia cammin', text: 'something has changed' }))
          .not.toThrow()
        expect(console.warn).toHaveBeenCalledTimes(4)
        ;[
          ['cammin', 'title'],
          ['something', 'text'],
          ['has', 'text'],
          ['changed', 'text']
        ].forEach(([term, field], i) => {
          expect(console.warn).toHaveBeenNthCalledWith(i + 1, `MiniSearch: document with ID 1 has changed before removal: term "${term}" was not present in field "${field}". Removing a document after it has changed can corrupt the index!`)
        })
      })

      it('does not throw error if console.warn is undefined', () => {
        console.warn = undefined
        expect(() => ms.remove({ id: 1, title: 'Divina Commedia cammin', text: 'something has changed' }))
          .not.toThrow()
      })

      it('calls the custom logger if given', () => {
        const logger = jest.fn()
        ms = new MiniSearch({ fields: ['title', 'text'], logger })
        ms.addAll(documents)
        ms.remove({ id: 1, title: 'Divina Commedia', text: 'something' })

        expect(logger).toHaveBeenCalledWith('warn', 'MiniSearch: document with ID 1 has changed before removal: term "something" was not present in field "text". Removing a document after it has changed can corrupt the index!', 'version_conflict')
        expect(console.warn).not.toHaveBeenCalled()
      })
    })
  })

  describe('removeAll', () => {
    const documents = [
      { id: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita ... cammin' },
      { id: 2, title: 'I Promessi Sposi', text: 'Quel ramo del lago di Como' },
      { id: 3, title: 'Vita Nova', text: 'In quella parte del libro della mia memoria ... cammin' }
    ]

    let ms, _warn
    beforeEach(() => {
      ms = new MiniSearch({ fields: ['title', 'text'] })
      _warn = console.warn
      console.warn = jest.fn()
    })

    afterEach(() => {
      console.warn = _warn
    })

    it('removes all documents from the index if called with no argument', () => {
      const empty = MiniSearch.loadJSON(JSON.stringify(ms), {
        fields: ['title', 'text']
      })

      ms.addAll(documents)
      expect(ms.documentCount).toEqual(3)

      ms.removeAll()

      expect(ms).toEqual(empty)
    })

    it('removes the given documents from the index', () => {
      ms.addAll(documents)
      expect(ms.documentCount).toEqual(3)

      ms.removeAll([documents[0], documents[2]])

      expect(ms.documentCount).toEqual(1)
      expect(ms.search('commedia').length).toEqual(0)
      expect(ms.search('vita').length).toEqual(0)
      expect(ms.search('lago').length).toEqual(1)
    })

    it('raises an error if called with a falsey argument', () => {
      ms.addAll(documents)

      expect(() => { ms.removeAll(null) }).toThrowError()
      expect(() => { ms.removeAll(undefined) }).toThrowError()
      expect(() => { ms.removeAll(false) }).toThrowError()
      expect(() => { ms.removeAll('') }).toThrowError()
      expect(() => { ms.removeAll([]) }).not.toThrowError()

      expect(ms.documentCount).toEqual(documents.length)
    })
  })

  describe('discard', () => {
    it('prevents a document from appearing in search results', () => {
      const ms = new MiniSearch({ fields: ['text'] })
      const documents = [
        { id: 1, text: 'Some interesting stuff' },
        { id: 2, text: 'Some more interesting stuff' }
      ]
      ms.addAll(documents)

      expect(ms.search('stuff').map((doc) => doc.id)).toEqual([1, 2])
      expect([1, 2].map((id) => ms.has(id))).toEqual([true, true])

      ms.discard(1)

      expect(ms.search('stuff').map((doc) => doc.id)).toEqual([2])
      expect([1, 2].map((id) => ms.has(id))).toEqual([false, true])
    })

    it('raises error if a document with the given ID does not exist', () => {
      const ms = new MiniSearch({ fields: ['text'] })

      expect(() => {
        ms.discard(99)
      }).toThrow('MiniSearch: cannot discard document with ID 99: it is not in the index')
    })

    it('adjusts internal data to account for the document being discarded', () => {
      const ms = new MiniSearch({ fields: ['text'] })
      const documents = [
        { id: 1, text: 'Some interesting stuff' },
        { id: 2, text: 'Some more interesting stuff' }
      ]
      ms.addAll(documents)
      const clone = MiniSearch.loadJSON(JSON.stringify(ms), {
        fields: ['text']
      })

      ms.discard(1)
      clone.remove({ id: 1, text: 'Some interesting stuff' })

      expect(ms._idToShortId).toEqual(clone._idToShortId)
      expect(ms._documentIds).toEqual(clone._documentIds)
      expect(ms._fieldLength).toEqual(clone._fieldLength)
      expect(ms._storedFields).toEqual(clone._storedFields)
      expect(ms._avgFieldLength).toEqual(clone._avgFieldLength)
      expect(ms._documentCount).toEqual(clone._documentCount)
      expect(ms._dirtCount).toEqual(1)
    })

    it('allows adding a new version of the document afterwards', () => {
      const ms = new MiniSearch({ fields: ['text'], storeFields: ['text'] })
      const documents = [
        { id: 1, text: 'Some interesting stuff' },
        { id: 2, text: 'Some more interesting stuff' }
      ]
      ms.addAll(documents)

      ms.discard(1)
      ms.add({ id: 1, text: 'Some new stuff' })

      expect(ms.search('stuff').map((doc) => doc.id)).toEqual([1, 2])
      expect(ms.search('new').map((doc) => doc.id)).toEqual([1])

      ms.discard(1)
      expect(ms.search('stuff').map((doc) => doc.id)).toEqual([2])

      ms.add({ id: 1, text: 'Some newer stuff' })
      expect(ms.search('stuff').map((doc) => doc.id)).toEqual([1, 2])
      expect(ms.search('new').map((doc) => doc.id)).toEqual([])
      expect(ms.search('newer').map((doc) => doc.id)).toEqual([1])
    })

    it('leaves the index in the same state as removal when all terms are searched at least once', () => {
      const ms = new MiniSearch({ fields: ['text'], storeFields: ['text'] })
      const document = { id: 1, text: 'Some stuff' }
      ms.add(document)
      const clone = MiniSearch.loadJSON(JSON.stringify(ms), {
        fields: ['text'],
        storeFields: ['text']
      })

      ms.discard(1)
      clone.remove({ id: 1, text: 'Some stuff' })

      expect(ms).not.toEqual(clone)

      const results = ms.search('some stuff')

      expect(ms._index).toEqual(clone._index)

      // Results are the same after the first search
      expect(ms.search('stuff')).toEqual(results)
    })

    it('triggers auto vacuum by default', () => {
      const ms = new MiniSearch({ fields: ['text'] })
      ms.add({ id: 1, text: 'Some stuff' })
      ms._dirtCount = 1000

      ms.discard(1)
      expect(ms.isVacuuming).toEqual(true)
    })

    it('triggers auto vacuum when the threshold is met', () => {
      const ms = new MiniSearch({
        fields: ['text'],
        autoVacuum: { minDirtCount: 2, minDirtFactor: 0, batchWait: 50, batchSize: 1 }
      })
      const documents = [
        { id: 1, text: 'Some stuff' },
        { id: 2, text: 'Some additional stuff' },
        { id: 3, text: 'Even more stuff' }
      ]
      ms.addAll(documents)

      expect(ms.isVacuuming).toEqual(false)

      ms.discard(1)
      expect(ms.isVacuuming).toEqual(false)

      ms.discard(2)
      expect(ms.isVacuuming).toEqual(true)
    })

    it('does not trigger auto vacuum if disabled', () => {
      const ms = new MiniSearch({ fields: ['text'], autoVacuum: false })
      const documents = [
        { id: 1, text: 'Some stuff' },
        { id: 2, text: 'Some additional stuff' }
      ]
      ms.addAll(documents)
      ms._dirtCount = 1000

      ms.discard(1)
      expect(ms.isVacuuming).toEqual(false)
    })

    it('applies default settings if autoVacuum is set to true', () => {
      const ms = new MiniSearch({ fields: ['text'], autoVacuum: true })
      const documents = [
        { id: 1, text: 'Some stuff' },
        { id: 2, text: 'Some additional stuff' }
      ]
      ms.addAll(documents)
      ms._dirtCount = 1000

      ms.discard(1)
      expect(ms.isVacuuming).toEqual(true)
    })

    it('applies default settings if options are set to null', async () => {
      const ms = new MiniSearch({
        fields: ['text'],
        autoVacuum: { minDirtCount: null, minDirtFactor: null, batchWait: null, batchSize: null }
      })
      const documents = [
        { id: 1, text: 'Some stuff' },
        { id: 2, text: 'Some additional stuff' }
      ]
      ms.addAll(documents)
      ms._dirtCount = 1000

      const x = ms.discard(1)
      expect(ms.isVacuuming).toEqual(true)
      await x
    })

    it('vacuums until under the dirt thresholds when called multiple times', async () => {
      const minDirtCount = 2
      const ms = new MiniSearch({
        fields: ['text'],
        autoVacuum: { minDirtCount, minDirtFactor: 0, batchSize: 1, batchWait: 10 }
      })
      const documents = []
      for (let i = 0; i < 5; i++) {
        documents.push({ id: i + 1, text: `Document number ${i}` })
      }
      ms.addAll(documents)

      expect(ms._dirtCount).toEqual(0)

      // Calling discard multiple times should start an auto-vacuum and enqueue
      // another, so that the remaining dirt count afterwards is always below
      // minDirtCount
      documents.forEach((doc) => ms.discard(doc.id))

      while (ms.isVacuuming) {
        await ms._currentVacuum
      }

      expect(ms._dirtCount).toBeLessThan(minDirtCount)
    })

    it('does not perform unnecessary vacuuming when called multiple times', async () => {
      const minDirtCount = 2
      const ms = new MiniSearch({
        fields: ['text'],
        autoVacuum: { minDirtCount, minDirtFactor: 0, batchSize: 1, batchWait: 10 }
      })
      const documents = [
        { id: 1, text: 'Document one' },
        { id: 2, text: 'Document two' },
        { id: 3, text: 'Document three' }
      ]
      ms.addAll(documents)

      // Calling discard multiple times will start an auto-vacuum and enqueue
      // another, subject to minDirtCount/minDirtFactor conditions. The last one
      // should be a no-op, as the remaining dirt count after the first auto
      // vacuum would be 1, which is below minDirtCount
      documents.forEach((doc) => ms.discard(doc.id))

      while (ms.isVacuuming) {
        await ms._currentVacuum
      }

      expect(ms._dirtCount).toBe(1)
    })

    it('enqueued vacuum runs without conditions if a manual vacuum was called while enqueued', async () => {
      const minDirtCount = 2
      const ms = new MiniSearch({
        fields: ['text'],
        autoVacuum: { minDirtCount, minDirtFactor: 0, batchSize: 1, batchWait: 10 }
      })
      const documents = [
        { id: 1, text: 'Document one' },
        { id: 2, text: 'Document two' },
        { id: 3, text: 'Document three' }
      ]
      ms.addAll(documents)

      // Calling discard multiple times will start an auto-vacuum and enqueue
      // another, subject to minDirtCount/minDirtFactor conditions. The last one
      // would be a no-op, as the remaining dirt count after the first auto
      // vacuum would be 1, which is below minDirtCount
      documents.forEach((doc) => ms.discard(doc.id))

      // But before the enqueued vacuum is ran, we invoke a manual vacuum with
      // no conditions, so it should run even with a dirt count below
      // minDirtCount
      ms.vacuum()

      while (ms.isVacuuming) {
        await ms._currentVacuum
      }

      expect(ms._dirtCount).toBe(0)
    })
  })

  describe('discardAll', () => {
    it('prevents the documents from appearing in search results', () => {
      const ms = new MiniSearch({ fields: ['text'] })
      const documents = [
        { id: 1, text: 'Some interesting stuff' },
        { id: 2, text: 'Some more interesting stuff' },
        { id: 3, text: 'Some even more interesting stuff' }
      ]
      ms.addAll(documents)

      expect(ms.search('stuff').map((doc) => doc.id)).toEqual([1, 2, 3])
      expect([1, 2, 3].map((id) => ms.has(id))).toEqual([true, true, true])

      ms.discardAll([1, 3])

      expect(ms.search('stuff').map((doc) => doc.id)).toEqual([2])
      expect([1, 2, 3].map((id) => ms.has(id))).toEqual([false, true, false])
    })

    it('only triggers at most a single auto vacuum at the end', () => {
      const ms = new MiniSearch({ fields: ['text'], autoVacuum: { minDirtCount: 3, minDirtFactor: 0, batchSize: 1, batchWait: 10 } })
      const documents = []
      for (let i = 1; i <= 10; i++) {
        documents.push({ id: i, text: `Document ${i}` })
      }
      ms.addAll(documents)
      ms.discardAll([1, 2])
      expect(ms.isVacuuming).toEqual(false)

      ms.discardAll([3, 4, 5, 6, 7, 8, 9, 10])
      expect(ms.isVacuuming).toEqual(true)
      expect(ms._enqueuedVacuum).toEqual(null)
    })

    it('does not change auto vacuum settings in case of errors', () => {
      const ms = new MiniSearch({ fields: ['text'], autoVacuum: { minDirtCount: 1, minDirtFactor: 0, batchSize: 1, batchWait: 10 } })
      ms.add({ id: 1, text: 'Some stuff' })

      expect(() => { ms.discardAll([3]) }).toThrow()
      expect(ms.isVacuuming).toEqual(false)

      ms.discardAll([1])
      expect(ms.isVacuuming).toEqual(true)
    })
  })

  describe('replace', () => {
    it('replaces an existing document with a new version', () => {
      const ms = new MiniSearch({ fields: ['text'] })
      const documents = [
        { id: 1, text: 'Some quite interesting stuff' },
        { id: 2, text: 'Some more interesting stuff' }
      ]
      ms.addAll(documents)

      expect(ms.search('stuff').map((doc) => doc.id)).toEqual([1, 2])
      expect(ms.search('quite').map((doc) => doc.id)).toEqual([1])
      expect(ms.search('even').map((doc) => doc.id)).toEqual([])

      ms.replace({ id: 1, text: 'Some even more interesting stuff' })

      expect(ms.search('stuff').map((doc) => doc.id)).toEqual([2, 1])
      expect(ms.search('quite').map((doc) => doc.id)).toEqual([])
      expect(ms.search('even').map((doc) => doc.id)).toEqual([1])
    })

    it('raises error if a document with the given ID does not exist', () => {
      const ms = new MiniSearch({ fields: ['text'] })

      expect(() => {
        ms.replace({ id: 1, text: 'Some stuff' })
      }).toThrow('MiniSearch: cannot discard document with ID 1: it is not in the index')
    })
  })

  describe('vacuum', () => {
    it('cleans up discarded documents from the index', async () => {
      const ms = new MiniSearch({ fields: ['text'], storeFields: ['text'] })
      const documents = [
        { id: 1, text: 'Some stuff' },
        { id: 2, text: 'Some additional stuff' }
      ]
      ms.addAll(documents)
      const clone = MiniSearch.loadJSON(JSON.stringify(ms), {
        fields: ['text'],
        storeFields: ['text']
      })

      ms.discard(1)
      ms.discard(2)
      clone.remove({ id: 1, text: 'Some stuff' })
      clone.remove({ id: 2, text: 'Some additional stuff' })

      expect(ms).not.toEqual(clone)

      await ms.vacuum({ batchSize: 1 })

      expect(ms).toEqual(clone)
      expect(ms.isVacuuming).toEqual(false)
    })

    it('schedules a second vacuum right after the current one completes, if one is ongoing', async () => {
      const ms = new MiniSearch({ fields: ['text'] })
      const empty = MiniSearch.loadJSON(JSON.stringify(ms), {
        fields: ['text']
      })
      const documents = [
        { id: 1, text: 'Some stuff' },
        { id: 2, text: 'Some additional stuff' }
      ]
      ms.addAll(documents)

      ms.discard(1)
      ms.discard(2)
      ms.add({ id: 3, text: 'Even more stuff' })

      ms.vacuum({ batchSize: 1, batchWait: 50 })
      ms.discard(3)

      await ms.vacuum()

      expect(ms._index).toEqual(empty._index)
      expect(ms.isVacuuming).toEqual(false)
    })

    it('does not enqueue more than one vacuum on top of the ongoing one', async () => {
      const ms = new MiniSearch({ fields: ['text'] })
      const documents = [
        { id: 1, text: 'Some stuff' },
        { id: 2, text: 'Some additional stuff' }
      ]

      ms.addAll(documents)
      ms.discard(1)
      ms.discard(2)

      const a = ms.vacuum({ batchSize: 1, batchWait: 50 })
      const b = ms.vacuum()
      const c = ms.vacuum()

      expect(a).not.toBe(b)
      expect(b).toBe(c)
      expect(ms.isVacuuming).toEqual(true)

      await c

      expect(ms.isVacuuming).toEqual(false)
    })

    it('allows batch size to be bigger than the term count', async () => {
      const ms = new MiniSearch({ fields: ['text'] })
      const documents = [
        { id: 1, text: 'Some stuff' },
        { id: 2, text: 'Some additional stuff' }
      ]
      ms.addAll(documents)
      await ms.vacuum({ batchSize: ms.termCount + 1 })
      expect(ms.isVacuuming).toEqual(false)
    })
  })

  describe('addAll', () => {
    it('adds all the documents to the index', () => {
      const ms = new MiniSearch({ fields: ['text'] })
      const documents = [
        { id: 1, text: 'Nel mezzo del cammin di nostra vita' },
        { id: 2, text: 'Mi ritrovai per una selva oscura' }
      ]
      ms.addAll(documents)
      expect(ms.documentCount).toEqual(documents.length)
    })
  })

  describe('addAllAsync', () => {
    it('adds all the documents to the index', () => {
      const ms = new MiniSearch({ fields: ['text'] })
      const documents = [
        { id: 1, text: 'Nel mezzo' },
        { id: 2, text: 'del cammin' },
        { id: 3, text: 'di nostra vita' },
        { id: 4, text: 'Mi ritrovai' },
        { id: 5, text: 'per una' },
        { id: 6, text: 'selva oscura' },
        { id: 7, text: 'ché la' },
        { id: 8, text: 'diritta via' },
        { id: 9, text: 'era smarrita' },
        { id: 10, text: 'ahi quanto' },
        { id: 11, text: 'a dir' },
        { id: 12, text: 'qual era' },
        { id: 13, text: 'è cosa dura' }
      ]

      return ms.addAllAsync(documents).then(() => {
        expect(ms.documentCount).toEqual(documents.length)
      })
    })

    it('accepts a chunkSize option', () => {
      const ms = new MiniSearch({ fields: ['text'] })
      const documents = [
        { id: 1, text: 'Nel mezzo' },
        { id: 2, text: 'del cammin' },
        { id: 3, text: 'di nostra vita' },
        { id: 4, text: 'Mi ritrovai' },
        { id: 5, text: 'per una' },
        { id: 6, text: 'selva oscura' },
        { id: 7, text: 'ché la' },
        { id: 8, text: 'diritta via' },
        { id: 9, text: 'era smarrita' },
        { id: 10, text: 'ahi quanto' },
        { id: 11, text: 'a dir' },
        { id: 12, text: 'qual era' },
        { id: 13, text: 'è cosa dura' }
      ]

      return ms.addAllAsync(documents, { chunkSize: 3 }).then(() => {
        expect(ms.documentCount).toEqual(documents.length)
      })
    })
  })

  describe('has', () => {
    it('returns true if a document with the given ID was added to the index, false otherwise', () => {
      const documents = [
        { id: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita' },
        { id: 2, title: 'I Promessi Sposi', text: 'Quel ramo del lago di Como' }
      ]
      const ms = new MiniSearch({ fields: ['title', 'text'] })
      ms.addAll(documents)

      expect(ms.has(1)).toEqual(true)
      expect(ms.has(2)).toEqual(true)
      expect(ms.has(3)).toEqual(false)

      ms.remove({ id: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita' })
      ms.discard(2)

      expect(ms.has(1)).toEqual(false)
      expect(ms.has(2)).toEqual(false)
    })

    it('works well with custom ID fields', () => {
      const documents = [
        { uid: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita' },
        { uid: 2, title: 'I Promessi Sposi', text: 'Quel ramo del lago di Como' }
      ]
      const ms = new MiniSearch({ fields: ['title', 'text'], idField: 'uid' })
      ms.addAll(documents)

      expect(ms.has(1)).toEqual(true)
      expect(ms.has(2)).toEqual(true)
      expect(ms.has(3)).toEqual(false)

      ms.remove({ uid: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita' })
      ms.discard(2)

      expect(ms.has(1)).toEqual(false)
      expect(ms.has(2)).toEqual(false)
    })
  })

  describe('getStoredFields', () => {
    it('returns the stored fields for the given document ID, or undefined if the document is not in the index', () => {
      const documents = [
        { id: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita' },
        { id: 2, title: 'I Promessi Sposi', text: 'Quel ramo del lago di Como' }
      ]
      const ms = new MiniSearch({ fields: ['title', 'text'], storeFields: ['title', 'text'] })
      ms.addAll(documents)

      expect(ms.getStoredFields(1)).toEqual({ title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita' })
      expect(ms.getStoredFields(2)).toEqual({ title: 'I Promessi Sposi', text: 'Quel ramo del lago di Como' })
      expect(ms.getStoredFields(3)).toBe(undefined)

      ms.discard(1)
      expect(ms.getStoredFields(1)).toBe(undefined)
    })
  })

  describe('search', () => {
    const documents = [
      { id: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita' },
      { id: 2, title: 'I Promessi Sposi', text: 'Quel ramo del lago di Como', lang: 'it', category: 'fiction' },
      { id: 3, title: 'Vita Nova', text: 'In quella parte del libro della mia memoria', category: 'poetry' }
    ]
    const ms = new MiniSearch({ fields: ['title', 'text'], storeFields: ['lang', 'category'] })
    ms.addAll(documents)

    it('returns scored results', () => {
      const results = ms.search('vita')
      expect(results.length).toBeGreaterThan(0)
      expect(results.map(({ id }) => id).sort()).toEqual([1, 3])
      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score)
    })

    it('returns stored fields in the results', () => {
      const results = ms.search('del')
      expect(results.length).toBeGreaterThan(0)
      expect(results.map(({ lang }) => lang).sort()).toEqual(['it', undefined, undefined])
      expect(results.map(({ category }) => category).sort()).toEqual(['fiction', 'poetry', undefined])
    })

    it('returns empty array if there is no match', () => {
      const results = ms.search('paguro')
      expect(results).toEqual([])
    })

    it('returns empty array for empty search', () => {
      const results = ms.search('')
      expect(results).toEqual([])
    })

    it('returns empty results for terms that are not in the index', () => {
      let results
      expect(() => {
        results = ms.search('sottomarino aeroplano')
      }).not.toThrowError()
      expect(results.length).toEqual(0)
    })

    it('boosts fields', () => {
      const results = ms.search('vita', { boost: { title: 2 } })
      expect(results.map(({ id }) => id)).toEqual([3, 1])
      expect(results[0].score).toBeGreaterThan(results[1].score)
    })

    it('computes a meaningful score when fields are named liked default properties of object', () => {
      const ms = new MiniSearch({ fields: ['constructor'] })
      ms.add({ id: 1, constructor: 'something' })
      ms.add({ id: 2, constructor: 'something else' })

      const results = ms.search('something')
      results.forEach((result) => {
        expect(Number.isFinite(result.score)).toBe(true)
      })
    })

    it('searches only selected fields', () => {
      const results = ms.search('vita', { fields: ['title'] })
      expect(results).toHaveLength(1)
      expect(results[0].id).toEqual(3)
    })

    it('searches only selected fields even if other fields are boosted', () => {
      const results = ms.search('vita', { fields: ['title'], boost: { text: 2 } })
      expect(results).toHaveLength(1)
      expect(results[0].id).toEqual(3)
    })

    it('combines results with OR by default', () => {
      const results = ms.search('cammin como sottomarino')
      expect(results.length).toEqual(2)
      expect(results.map(({ id }) => id)).toEqual([2, 1])
    })

    it('combines results with AND if combineWith is AND', () => {
      const results = ms.search('vita cammin', { combineWith: 'AND' })
      expect(results.length).toEqual(1)
      expect(results.map(({ id }) => id)).toEqual([1])
      expect(ms.search('vita sottomarino', { combineWith: 'AND' }).length).toEqual(0)
      expect(ms.search('sottomarino vita', { combineWith: 'AND' }).length).toEqual(0)
    })

    it('combines results with AND_NOT if combineWith is AND_NOT', () => {
      const results = ms.search('vita cammin', { combineWith: 'AND_NOT' })
      expect(results.length).toEqual(1)
      expect(results.map(({ id }) => id)).toEqual([3])
      expect(ms.search('vita sottomarino', { combineWith: 'AND_NOT' }).length).toEqual(2)
      expect(ms.search('sottomarino vita', { combineWith: 'AND_NOT' }).length).toEqual(0)
    })

    it('raises an error if combineWith is not a valid operator', () => {
      expect(() => {
        ms.search('vita cammin', { combineWith: 'XOR' })
      }).toThrowError('Invalid combination operator: XOR')
    })

    it('returns empty results for empty search', () => {
      expect(ms.search('')).toEqual([])
      expect(ms.search('', { combineWith: 'OR' })).toEqual([])
      expect(ms.search('', { combineWith: 'AND' })).toEqual([])
      expect(ms.search('', { combineWith: 'AND_NOT' })).toEqual([])
    })

    it('executes fuzzy search', () => {
      const results = ms.search('camin memory', { fuzzy: 2 })
      expect(results.length).toEqual(2)
      expect(results.map(({ id }) => id)).toEqual([1, 3])
    })

    it('executes fuzzy search with maximum fuzziness', () => {
      const results = ms.search('comedia', { fuzzy: 0.6, maxFuzzy: 3 })
      expect(results.length).toEqual(1)
      expect(results.map(({ id }) => id)).toEqual([1])
    })

    it('executes prefix search', () => {
      const results = ms.search('que', { prefix: true })
      expect(results.length).toEqual(2)
      expect(results.map(({ id }) => id)).toEqual([2, 3])
    })

    it('combines prefix search and fuzzy search', () => {
      const results = ms.search('cammino quel', { fuzzy: 0.25, prefix: true })
      expect(results.length).toEqual(3)
      expect(results.map(({ id }) => id)).toEqual([2, 1, 3])
    })

    it('assigns weights to prefix matches and fuzzy matches', () => {
      const exact = ms.search('cammino quel')
      expect(exact.map(({ id }) => id)).toEqual([2])

      const prefixLast = ms.search('cammino quel', { fuzzy: true, prefix: true, weights: { prefix: 0.1 } })
      expect(prefixLast.map(({ id }) => id)).toEqual([2, 1, 3])
      expect(prefixLast[0].score).toEqual(exact[0].score)

      const fuzzyLast = ms.search('cammino quel', { fuzzy: true, prefix: true, weights: { fuzzy: 0.1 } })
      expect(fuzzyLast.map(({ id }) => id)).toEqual([2, 3, 1])
      expect(fuzzyLast[0].score).toEqual(exact[0].score)
    })

    it('assigns weight lower than exact match to a match that is both a prefix and fuzzy match', () => {
      const ms = new MiniSearch({ fields: ['text'] })
      const documents = [
        { id: 1, text: 'Poi che la gente poverella crebbe' },
        { id: 2, text: 'Deus, venerunt gentes' }
      ]
      ms.addAll(documents)
      expect(ms.documentCount).toEqual(documents.length)

      const exact = ms.search('gente')
      const combined = ms.search('gente', { fuzzy: 0.2, prefix: true })
      expect(combined.map(({ id }) => id)).toEqual([1, 2])
      expect(combined[0].score).toEqual(exact[0].score)
      expect(combined[1].match.gentes).toEqual(['text'])
    })

    it('accepts a function to compute fuzzy and prefix options from term', () => {
      const fuzzy = jest.fn(term => term.length > 4 ? 2 : false)
      const prefix = jest.fn(term => term.length > 4)
      const results = ms.search('quel comedia', { fuzzy, prefix })
      expect(fuzzy).toHaveBeenNthCalledWith(1, 'quel', 0, ['quel', 'comedia'])
      expect(fuzzy).toHaveBeenNthCalledWith(2, 'comedia', 1, ['quel', 'comedia'])
      expect(prefix).toHaveBeenNthCalledWith(1, 'quel', 0, ['quel', 'comedia'])
      expect(prefix).toHaveBeenNthCalledWith(2, 'comedia', 1, ['quel', 'comedia'])
      expect(results.length).toEqual(2)
      expect(results.map(({ id }) => id)).toEqual([2, 1])
    })

    it('boosts documents by calling boostDocument with document ID, term, and stored fields', () => {
      const query = 'divina commedia nova'
      const boostFactor = 1.234
      const boostDocument = jest.fn((id, term) => boostFactor)
      const resultsWithoutBoost = ms.search(query)
      const results = ms.search(query, { boostDocument })
      expect(boostDocument).toHaveBeenCalledWith(1, 'divina', {})
      expect(boostDocument).toHaveBeenCalledWith(1, 'commedia', {})
      expect(boostDocument).toHaveBeenCalledWith(3, 'nova', { category: 'poetry' })
      expect(results[0].score).toBeCloseTo(resultsWithoutBoost[0].score * boostFactor)
    })

    it('boosts terms by calling boostTerm with normalized query term, term index in the query, and array of all query terms', () => {
      const query = 'Commedia nova'
      const boostFactors = {
        commedia: 1.5,
        nova: 1.1
      }
      const boostTerm = jest.fn((term, i, terms) => boostFactors[term])
      const resultsWithoutBoost = ms.search(query)
      const results = ms.search(query, { boostTerm })

      expect(boostTerm).toHaveBeenCalledWith('commedia', 0, ['commedia', 'nova'])
      expect(boostTerm).toHaveBeenCalledWith('nova', 1, ['commedia', 'nova'])
      expect(results[0].score).toBeCloseTo(resultsWithoutBoost[0].score * boostFactors.commedia)
      expect(results[1].score).toBeCloseTo(resultsWithoutBoost[1].score * boostFactors.nova)
    })

    it('skips document if boostDocument returns a falsy value', () => {
      const query = 'vita'
      const boostDocument = jest.fn((id, term) => id === 3 ? null : 1)
      const resultsWithoutBoost = ms.search(query)
      const results = ms.search(query, { boostDocument })
      expect(resultsWithoutBoost.map(({ id }) => id)).toContain(3)
      expect(results.map(({ id }) => id)).not.toContain(3)
    })

    it('uses a specific search-time tokenizer if specified', () => {
      const tokenize = (string) => string.split('X')
      const results = ms.search('divinaXcommedia', { tokenize })
      expect(results.length).toBeGreaterThan(0)
      expect(results.map(({ id }) => id).sort()).toEqual([1])
    })

    it('uses a specific search-time term processing function if specified', () => {
      const processTerm = (string) => string.replace(/1/g, 'i').replace(/4/g, 'a').toLowerCase()
      const results = ms.search('d1v1n4', { processTerm })
      expect(results.length).toBeGreaterThan(0)
      expect(results.map(({ id }) => id).sort()).toEqual([1])
    })

    it('rejects falsy terms', () => {
      const processTerm = (term) => term === 'quel' ? null : term
      const results = ms.search('quel commedia', { processTerm })
      expect(results.length).toBeGreaterThan(0)
      expect(results.map(({ id }) => id).sort()).toEqual([1])
    })

    it('allows processTerm to expand a single term into several terms', () => {
      const processTerm = (string) => string === 'divinacommedia' ? ['divina', 'commedia'] : string
      const results = ms.search('divinacommedia', { processTerm })
      expect(results.length).toBeGreaterThan(0)
      expect(results.map(({ id }) => id).sort()).toEqual([1])
    })

    it('allows custom filtering of results on the basis of stored fields', () => {
      const results = ms.search('del', {
        filter: ({ category }) => category === 'poetry'
      })
      expect(results.length).toBe(1)
      expect(results.every(({ category }) => category === 'poetry')).toBe(true)
    })

    it('allows to define a default filter upon instantiation', () => {
      const ms = new MiniSearch({
        fields: ['title', 'text'],
        storeFields: ['category'],
        searchOptions: {
          filter: ({ category }) => category === 'poetry'
        }
      })
      ms.addAll(documents)
    
      const results = ms.search('del')
      expect(results.length).toBe(1)
      expect(results.every(({ category }) => category === 'poetry')).toBe(true)
    })

    it('allows customizing BM25+ parameters', () => {
      const ms = new MiniSearch({ fields: ['text'], searchOptions: { bm25: { k: 1.2, b: 0.7, d: 0.5 } } })
      const documents = [
        { id: 1, text: 'something very very very cool' },
        { id: 2, text: 'something cool' }
      ]
      ms.addAll(documents)

      expect(ms.search('very')[0].score).toBeGreaterThan(ms.search('very', { bm25: { k: 1, b: 0.7, d: 0.5 } })[0].score)
      expect(ms.search('something')[1].score).toBeGreaterThan(ms.search('something', { bm25: { k: 1.2, b: 1, d: 0.5 } })[1].score)
      expect(ms.search('something')[1].score).toBeGreaterThan(ms.search('something', { bm25: { k: 1.2, b: 0.7, d: 0.1 } })[1].score)

      // Defaults are taken from the searchOptions passed to the constructor
      const other = new MiniSearch({ fields: ['text'], searchOptions: { bm25: { k: 1, b: 0.7, d: 0.5 } } })
      other.addAll(documents)

      expect(other.search('very')).toEqual(ms.search('very', { bm25: { k: 1, b: 0.7, d: 0.5 } }))
    })

    it('allows searching for the special value `MiniSearch.wildcard` to match all terms', () => {
      const ms = new MiniSearch({ fields: ['text'], storeFields: ['cool'] })
      const documents = [
        { id: 1, text: 'something cool', cool: true },
        { id: 2, text: 'something else', cool: false },
        { id: 3, text: null, cool: true }
      ]
      ms.addAll(documents)

      // The string "*" is just a normal term
      expect(ms.search('*')).toEqual([])

      // The empty string is just a normal query
      expect(ms.search('')).toEqual([])

      // The value `MiniSearch.wildcard` matches all terms
      expect(ms.search(MiniSearch.wildcard).map(({ id }) => id)).toEqual([1, 2, 3])

      // Filters and document boosting are still applied
      const results = ms.search(MiniSearch.wildcard, {
        filter: (x) => x.cool,
        boostDocument: (id) => id
      })
      expect(results.map(({ id }) => id)).toEqual([3, 1])
    })

    describe('when passing a query tree', () => {
      it('searches according to the given combination', () => {
        const results = ms.search({
          combineWith: 'OR',
          queries: [
            {
              combineWith: 'AND',
              queries: ['vita', 'cammin']
            },
            'como sottomarino',
            {
              combineWith: 'AND',
              queries: ['nova', 'pappagallo']
            }
          ]
        })
        expect(results.length).toEqual(2)
        expect(results.map(({ id }) => id)).toEqual([1, 2])
      })

      it('allows combining wildcard queries', () => {
        const results = ms.search({
          combineWith: 'AND_NOT',
          queries: [
            MiniSearch.wildcard,
            'vita'
          ]
        })
        expect(results.length).toEqual(1)
        expect(results.map(({ id }) => id)).toEqual([2])
      })

      it('uses the given options for each subquery, cascading them properly', () => {
        const results = ms.search({
          combineWith: 'OR',
          fuzzy: true,
          queries: [
            {
              prefix: true,
              fields: ['title'],
              queries: ['vit']
            },
            {
              combineWith: 'AND',
              queries: ['bago', 'coomo']
            }
          ],
          weights: {
            fuzzy: 0.2,
            prefix: 0.75
          }
        })

        expect(results.length).toEqual(2)
        expect(results.map(({ id }) => id)).toEqual([3, 2])
      })

      it('uses the search options in the second argument as default', () => {
        let reference = ms.search({
          queries: [
            { fields: ['text'], queries: ['vita'] },
            { fields: ['title'], queries: ['promessi'] }
          ]
        })

        // Boost field
        let results = ms.search({
          queries: [
            { fields: ['text'], queries: ['vita'] },
            { fields: ['title'], queries: ['promessi'] }
          ]
        }, { boost: { title: 2 } })

        expect(results.length).toEqual(reference.length)
        expect(results.find((r) => r.id === 2).score)
          .toBeGreaterThan(reference.find((r) => r.id === 2).score)

        // Combine with AND
        results = ms.search({
          queries: [
            { fields: ['text'], queries: ['vita'] },
            { fields: ['title'], queries: ['promessi'] }
          ]
        }, { combineWith: 'AND' })

        expect(results.length).toEqual(0)

        // Combine with AND, then override it with OR
        results = ms.search({
          queries: [
            { fields: ['text'], queries: ['vita'] },
            { fields: ['title'], queries: ['promessi'] }
          ],
          combineWith: 'OR'
        }, { combineWith: 'AND' })

        expect(results.length).toEqual(reference.length)
      })
    })

    describe('match data', () => {
      const documents = [
        { id: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita' },
        { id: 2, title: 'I Promessi Sposi', text: 'Quel ramo del lago di Como' },
        { id: 3, title: 'Vita Nova', text: 'In quella parte del libro della mia memoria ... vita' }
      ]
      const ms = new MiniSearch({ fields: ['title', 'text'] })
      ms.addAll(documents)

      it('reports information about matched terms and fields', () => {
        const results = ms.search('vita nova')
        expect(results.length).toBeGreaterThan(0)
        expect(results.map(({ match }) => match)).toEqual([
          { vita: ['title', 'text'], nova: ['title'] },
          { vita: ['text'] }
        ])
        expect(results.map(({ terms }) => terms)).toEqual([
          ['vita', 'nova'],
          ['vita']
        ])
        expect(results.map(({ queryTerms }) => queryTerms)).toEqual([
          ['vita', 'nova'],
          ['vita']
        ])
      })

      it('reports correct info when combining terms with AND', () => {
        const results = ms.search('vita nova', { combineWith: 'AND' })
        expect(results.map(({ match }) => match)).toEqual([
          { vita: ['title', 'text'], nova: ['title'] }
        ])
        expect(results.map(({ terms }) => terms)).toEqual([
          ['vita', 'nova']
        ])
        expect(results.map(({ queryTerms }) => queryTerms)).toEqual([
          ['vita', 'nova']
        ])
      })

      it('reports correct info for fuzzy and prefix queries', () => {
        const results = ms.search('vi nuova', { fuzzy: 0.2, prefix: true })
        expect(results.map(({ match }) => match)).toEqual([
          { vita: ['title', 'text'], nova: ['title'] },
          { vita: ['text'] }
        ])
        expect(results.map(({ terms }) => terms)).toEqual([
          ['vita', 'nova'],
          ['vita']
        ])
        expect(results.map(({ queryTerms }) => queryTerms)).toEqual([
          ['vi', 'nuova'],
          ['vi']
        ])
      })

      it('reports correct info for many fuzzy and prefix queries', () => {
        const results = ms.search('vi nuova m de', { fuzzy: 0.2, prefix: true })
        expect(results.map(({ match }) => match)).toEqual([
          { del: ['text'], della: ['text'], memoria: ['text'], mia: ['text'], vita: ['title', 'text'], nova: ['title'] },
          { del: ['text'], mezzo: ['text'], vita: ['text'] },
          { del: ['text'] }
        ])
        expect(results.map(({ terms }) => terms)).toEqual([
          ['vita', 'nova', 'memoria', 'mia', 'della', 'del'],
          ['vita', 'mezzo', 'del'],
          ['del']
        ])
        expect(results.map(({ queryTerms }) => queryTerms)).toEqual([
          ['vi', 'nuova', 'm', 'de'],
          ['vi', 'm', 'de'],
          ['de']
        ])
      })

      it('passes only the query to tokenize', () => {
        const tokenize = jest.fn(string => string.split(/\W+/))
        const ms = new MiniSearch({ fields: ['text', 'title'], searchOptions: { tokenize } })
        const query = 'some search query'
        ms.search(query)
        expect(tokenize).toHaveBeenCalledWith(query)
      })

      it('passes only the term to processTerm', () => {
        const processTerm = jest.fn(term => term.toLowerCase())
        const ms = new MiniSearch({ fields: ['text', 'title'], searchOptions: { processTerm } })
        const query = 'some search query'
        ms.search(query)
        query.split(/\W+/).forEach(term => {
          expect(processTerm).toHaveBeenCalledWith(term)
        })
      })

      it('does not break when special properties of object are used as a term', () => {
        const specialWords = ['constructor', 'hasOwnProperty', 'isPrototypeOf']
        const ms = new MiniSearch({ fields: ['text'] })
        const processTerm = MiniSearch.getDefault('processTerm')

        ms.add({ id: 1, text: specialWords.join(' ') })

        specialWords.forEach((word) => {
          expect(() => { ms.search(word) }).not.toThrowError()

          const results = ms.search(word)
          expect(results[0].id).toEqual(1)
          expect(results[0].match[processTerm(word)]).toEqual(['text'])
        })
      })
    })

    describe('movie ranking set', () => {
      const ms = new MiniSearch({
        fields: ['title', 'description'],
        storeFields: ['title']
      })

      ms.add({
        id: 'tt1487931',
        title: 'Khumba',
        description: 'When half-striped zebra Khumba is blamed for the lack of rain by the rest of his insular, superstitious herd, he embarks on a daring quest to earn his stripes. In his search for the legendary waterhole in which the first zebras got their stripes, Khumba meets a quirky range of characters and teams up with an unlikely duo: overprotective wildebeest Mama V and Bradley, a self-obsessed, flamboyant ostrich. But before he can reunite with his herd, Khumba must confront Phango, a sadistic leopard who controls the waterholes and terrorizes all the animals in the Great Karoo. It\'s not all black-and-white in this colorful adventure with a difference.'
      })

      ms.add({
        id: 'tt8737608',
        title: 'Rams',
        description: 'A feud between two sheep farmers.'
      })

      ms.add({
        id: 'tt0983983',
        title: 'Shaun the Sheep',
        description: 'Shaun is a cheeky and mischievous sheep at Mossy Bottom farm who\'s the leader of the flock and always plays slapstick jokes, pranks and causes trouble especially on Farmer X and his grumpy guide dog, Bitzer.'
      })

      ms.add({
        id: 'tt5174284',
        title: 'Shaun the Sheep: The Farmer\'s Llamas',
        description: 'At the annual County Fair, three peculiar llamas catch the eye of Shaun, who tricks the unsuspecting Farmer into buying them. At first, it\'s all fun and games at Mossy Bottom Farm until the trio of unruly animals shows their true colours, wreaking havoc before everyone\'s eyes. Now, it\'s up to Bitzer and Shaun to come up with a winning strategy, if they want to reclaim the farm. Can they rid the once-peaceful ranch of the troublemakers?'
      })

      ms.add({
        id: 'tt0102926',
        title: 'The Silence of the Lambs',
        description: 'F.B.I. trainee Clarice Starling (Jodie Foster) works hard to advance her career, while trying to hide or put behind her West Virginia roots, of which if some knew, would automatically classify her as being backward or white trash. After graduation, she aspires to work in the agency\'s Behavioral Science Unit under the leadership of Jack Crawford (Scott Glenn). While she is still a trainee, Crawford asks her to question Dr. Hannibal Lecter (Sir Anthony Hopkins), a psychiatrist imprisoned, thus far, for eight years in maximum security isolation for being a serial killer who cannibalized his victims. Clarice is able to figure out the assignment is to pick Lecter\'s brains to help them solve another serial murder case, that of someone coined by the media as "Buffalo Bill" (Ted Levine), who has so far killed five victims, all located in the eastern U.S., all young women, who are slightly overweight (especially around the hips), all who were drowned in natural bodies of water, and all who were stripped of large swaths of skin. She also figures that Crawford chose her, as a woman, to be able to trigger some emotional response from Lecter. After speaking to Lecter for the first time, she realizes that everything with him will be a psychological game, with her often having to read between the very cryptic lines he provides. She has to decide how much she will play along, as his request in return for talking to him is to expose herself emotionally to him. The case takes a more dire turn when a sixth victim is discovered, this one from who they are able to retrieve a key piece of evidence, if Lecter is being forthright as to its meaning. A potential seventh victim is high profile Catherine Martin (Brooke Smith), the daughter of Senator Ruth Martin (Diane Baker), which places greater scrutiny on the case as they search for a hopefully still alive Catherine. Who may factor into what happens is Dr. Frederick Chilton (Anthony Heald), the warden at the prison, an opportunist who sees the higher profile with Catherine, meaning a higher profile for himself if he can insert himself successfully into the proceedings.'
      })

      ms.add({
        id: 'tt0395479',
        title: 'Boundin\'',
        description: 'In the not too distant past, a lamb lives in the desert plateau just below the snow line. He is proud of how bright and shiny his coat of wool is, so much so that it makes him want to dance, which in turn makes all the other creatures around him also want to dance. His life changes when one spring day he is captured, his wool shorn, and thrown back out onto the plateau all naked and pink. But a bounding jackalope who wanders by makes the lamb look at life a little differently in seeing that there is always something exciting in life to bound about.'
      })

      ms.add({
        id: 'tt9812474',
        title: 'Lamb',
        description: 'Haunted by the indelible mark of loss and silent grief, sad-eyed María and her taciturn husband, Ingvar, seek solace in back-breaking work and the demanding schedule at their sheep farm in the remote, harsh, wind-swept landscapes of mountainous Iceland. Then, with their relationship hanging on by a thread, something unexplainable happens, and just like that, happiness blesses the couple\'s grim household once more. Now, as a painful ending gives birth to a new beginning, Ingvar\'s troubled brother, Pétur, arrives at the farmhouse, threatening María and Ingvar\'s delicate, newfound bliss. But, nature\'s gifts demand sacrifice. How far are ecstatic María and Ingvar willing to go in the name of love?'
      })

      ms.add({
        id: 'tt0306646',
        title: 'Ringing Bell',
        description: 'A baby lamb named Chirin is living an idyllic life on a farm with many other sheep. Chirin is very adventurous and tends to get lost, so he wears a bell around his neck so that his mother can always find him. His mother warns Chirin that he must never venture beyond the fence surrounding the farm, because a huge black wolf lives in the mountains and loves to eat sheep. Chirin is too young and naive to take the advice to heart, until one night the wolf enters the barn and is prepared to kill Chirin, but at the last moment the lamb\'s mother throws herself in the way and is killed instead. The wolf leaves, and Chirin is horrified to see his mother\'s body. Unable to understand why his mother was killed, he becomes very angry and swears that he will go into the mountains and kill the wolf.'
      })

      ms.add({
        id: 'tt1212022',
        title: 'The Lion of Judah',
        description: 'Follow the adventures of a bold lamb (Judah) and his stable friends as they try to avoid the sacrificial alter the week preceding the crucifixion of Christ. It is a heart-warming account of the Easter story as seen through the eyes of a lovable pig (Horace), a faint-hearted horse (Monty), a pedantic rat (Slink), a rambling rooster (Drake), a motherly cow (Esmay) and a downtrodden donkey (Jack). This magnificent period piece with its epic sets is a roller coaster ride of emotions. Enveloped in humor, this quest follows the animals from the stable in Bethlehem to the great temple in Jerusalem and onto the hillside of Calvary as these unlikely heroes try to save their friend. The journey weaves seamlessly through the biblical accounts of Palm Sunday, Jesus turning the tables in the temple, Peter\'s denial and with a tense, heart-wrenching climax, depicts the crucifixion and resurrection with gentleness and breathtaking beauty. For Judah, the lamb with the heart of a lion, it is a story of courage and faith. For Jack, the disappointed donkey, it becomes a pivotal voyage of hope. For Horace, the, well the dirty pig, and Drake the ignorant rooster, it is an opportunity to do something inappropriate and get into trouble.'
      })

      it('returns best results for lamb', () => {
        // This should be fairly easy. We test that exact matches come before
        // prefix matches, and that hits in shorter fields (title) come before
        // hits in longer fields (description)
        const hits = ms.search('lamb', { fuzzy: 1, prefix: true })
        expect(hits.map(({ title }) => title)).toEqual([
          // Exact title match.
          'Lamb',

          // Contains term twice, shortest description.
          'Boundin\'',

          // Contains term twice.
          'Ringing Bell',

          // Contains term twice, longest description.
          'The Lion of Judah',

          // Prefix match in title.
          'The Silence of the Lambs'
        ])
      })

      it('returns best results for sheep', () => {
        // This tests more complex interaction between scoring. We want hits in
        // the title to be automatically considered most relevant, because they
        // are very short, and the search term occurs less frequently in the
        // title than it does in the description. One result, 'Rams', has a very
        // short description with an exact match, but it should never outrank
        // the result with an exact match in the title AND description.
        const hits = ms.search('sheep', { fuzzy: 1, prefix: true })
        expect(hits.map(({ title }) => title)).toEqual([
          // Has 'sheep' in title and once in a description of average length.
          'Shaun the Sheep',

          // Has 'sheep' just once, in a short description.
          'Rams',

          // Contains 'sheep' just once, in a long title.
          'Shaun the Sheep: The Farmer\'s Llamas',

          // Has most occurrences of 'sheep'.
          'Ringing Bell',

          // Contains 'sheep' just once, in a long description.
          'Lamb'
        ])
      })

      it('returns best results for shaun', () => {
        // Two movies contain the query in the title. Pick the shorter title.
        expect(ms.search('shaun the sheep')[0].title).toEqual('Shaun the Sheep')
        expect(ms.search('shaun the sheep', { fuzzy: 1, prefix: true })[0].title).toEqual('Shaun the Sheep')
      })

      it('returns best results for chirin', () => {
        // The title contains neither 'sheep' nor the character name. Movies
        // that have 'sheep' or 'the' in the title should not outrank this.
        expect(ms.search('chirin the sheep')[0].title).toEqual('Ringing Bell')
        expect(ms.search('chirin the sheep', { fuzzy: 1, prefix: true })[0].title).toEqual('Ringing Bell')
      })

      it('returns best results for judah', () => {
        // Title contains the character's name, but the word 'sheep' never
        // occurs. Other movies that do contain 'sheep' should not outrank this.
        expect(ms.search('judah the sheep')[0].title).toEqual('The Lion of Judah')
        expect(ms.search('judah the sheep', { fuzzy: 1, prefix: true })[0].title).toEqual('The Lion of Judah')
      })

      it('returns best results for bounding', () => {
        // The expected hit has an exact match in the description and a fuzzy
        // match in the title, and both variations of the term are highly
        // specific. Does not contain 'sheep' at all! Because 'sheep' is a
        // slightly more common term in the dataset, that should not cause other
        // results to outrank this.
        expect(ms.search('bounding sheep', { fuzzy: 1 })[0].title).toEqual('Boundin\'')
      })
    })

    describe('song ranking set', () => {
      const ms = new MiniSearch({
        fields: ['song', 'artist'],
        storeFields: ['song']
      })

      ms.add({
        id: '1',
        song: 'Killer Queen',
        artist: 'Queen'
      })

      ms.add({
        id: '2',
        song: 'The Witch Queen Of New Orleans',
        artist: 'Redbone'
      })

      ms.add({
        id: '3',
        song: 'Waterloo',
        artist: 'Abba'
      })

      ms.add({
        id: '4',
        song: 'Take A Chance On Me',
        artist: 'Abba'
      })

      ms.add({
        id: '5',
        song: 'Help',
        artist: 'The Beatles'
      })

      ms.add({
        id: '6',
        song: 'Yellow Submarine',
        artist: 'The Beatles'
      })

      ms.add({
        id: '7',
        song: 'Dancing Queen',
        artist: 'Abba'
      })

      ms.add({
        id: '8',
        song: 'Bohemian Rhapsody',
        artist: 'Queen'
      })

      it('returns best results for witch queen', () => {
        const hits = ms.search('witch queen', { fuzzy: 1, prefix: true })
        expect(hits.map(({ song }) => song)).toEqual([
          // The only result that has both terms. This should not be outranked
          // by hits that match only one term.
          'The Witch Queen Of New Orleans',

          // Contains just one term, but matches both song and artist.
          'Killer Queen',

          // Match on artist only. Artist is an exact match for 'Queen'.
          'Bohemian Rhapsody',

          // Match on song only. Song is a worse match for 'Queen'.
          'Dancing Queen'
        ])
      })

      it('returns best results for queen', () => {
        // The only match where both song and artist contain 'queen'.
        expect(ms.search('queen', { fuzzy: 1, prefix: true })[0].song).toEqual('Killer Queen')
      })
    })
  })

  describe('default tokenization', () => {
    it('splits on non-alphanumeric taking diacritics into account', () => {
      const documents = [
        {
          id: 1,
          text:
          `Se la vita è sventura,
perché da noi si dura?
Intatta luna, tale
è lo stato mortale.
Ma tu mortal non sei,
e forse del mio dir poco ti cale`
        },
        {
          id: 2,
          text: 'The estimates range from roughly 1 in 100 to 1 in 100,000. The higher figures come from the working engineers, and the very low figures from management. What are the causes and consequences of this lack of agreement? Since 1 part in 100,000 would imply that one could put a Shuttle up each day for 300 years expecting to lose only one, we could properly ask "What is the cause of management\'s fantastic faith in the machinery?"'
        }
      ]
      const ms = new MiniSearch({ fields: ['text'] })
      ms.addAll(documents)
      expect(ms.search('perché').length).toBeGreaterThan(0)
      expect(ms.search('perch').length).toEqual(0)
      expect(ms.search('luna').length).toBeGreaterThan(0)

      expect(ms.search('300').length).toBeGreaterThan(0)
      expect(ms.search('machinery').length).toBeGreaterThan(0)
    })

    it('supports non-latin alphabets', () => {
      const documents = [
        { id: 1, title: 'София София' },
        { id: 2, title: 'アネモネ' },
        { id: 3, title: '«τέχνη»' },
        { id: 4, title: 'سمت  الرأس' },
        { id: 5, title: '123 45' }
      ]
      const ms = new MiniSearch({ fields: ['title'] })
      ms.addAll(documents)

      expect(ms.search('софия').map(({ id }) => id)).toEqual([1])
      expect(ms.search('アネモネ').map(({ id }) => id)).toEqual([2])
      expect(ms.search('τέχνη').map(({ id }) => id)).toEqual([3])
      expect(ms.search('الرأس').map(({ id }) => id)).toEqual([4])
      expect(ms.search('123').map(({ id }) => id)).toEqual([5])
    })

    it('splits on multiple contiguous spaces or punctuation characters correctly', () => {
      const tokenize = MiniSearch.getDefault('tokenize')

      expect(tokenize('a  b...c ? d')).toEqual(['a', 'b', 'c', 'd'])
    })
  })

  describe('autoSuggest', () => {
    const documents = [
      { id: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita', category: 'poetry' },
      { id: 2, title: 'I Promessi Sposi', text: 'Quel ramo del lago di Como', category: 'fiction' },
      { id: 3, title: 'Vita Nova', text: 'In quella parte del libro della mia memoria', category: 'poetry' }
    ]
    const ms = new MiniSearch({ fields: ['title', 'text'], storeFields: ['category'] })
    ms.addAll(documents)

    it('returns scored suggestions', () => {
      const results = ms.autoSuggest('com')
      expect(results.length).toBeGreaterThan(0)
      expect(results.map(({ suggestion }) => suggestion)).toEqual(['como', 'commedia'])
      expect(results[0].score).toBeGreaterThan(results[1].score)
    })

    it('returns empty array if there is no match', () => {
      const results = ms.autoSuggest('paguro')
      expect(results).toEqual([])
    })

    it('returns empty array for empty search', () => {
      const results = ms.autoSuggest('')
      expect(results).toEqual([])
    })

    it('returns scored suggestions for multi-word queries', () => {
      const results = ms.autoSuggest('vita no')
      expect(results.length).toBeGreaterThan(0)
      expect(results.map(({ suggestion }) => suggestion)).toEqual(['vita nova', 'vita nostra'])
      expect(results[0].score).toBeGreaterThan(results[1].score)
    })

    it('respects the order of the terms in the query', () => {
      const results = ms.autoSuggest('nostra vi')
      expect(results.map(({ suggestion }) => suggestion)).toEqual(['nostra vita'])
    })

    it('returns empty suggestions for terms that are not in the index', () => {
      let results
      expect(() => {
        results = ms.autoSuggest('sottomarino aeroplano')
      }).not.toThrowError()
      expect(results.length).toEqual(0)
    })

    it('does not duplicate suggested terms', () => {
      const results = ms.autoSuggest('vita', { fuzzy: true, prefix: true })
      expect(results[0].suggestion).toEqual('vita')
      expect(results[0].terms).toEqual(['vita'])
    })

    it('applies the given custom filter', () => {
      let results = ms.autoSuggest('que', {
        filter: ({ category }) => category === 'fiction'
      })
      expect(results[0].suggestion).toEqual('quel')
      expect(results).toHaveLength(1)

      results = ms.autoSuggest('que', {
        filter: ({ category }) => category === 'poetry'
      })
      expect(results[0].suggestion).toEqual('quella')
      expect(results).toHaveLength(1)
    })



    it('respects the custom defaults set in the constructor', () => {
      const ms = new MiniSearch({
        fields: ['title', 'text'],
        autoSuggestOptions: { combineWith: 'OR', fuzzy: true }
      })
      ms.addAll(documents)
      const results = ms.autoSuggest('nosta vi')
      expect(results.map(({ suggestion }) => suggestion)).toEqual(['nostra vita', 'vita'])
    })

    it('applies the default search options if not overridden by the auto suggest defaults', () => {
      const ms = new MiniSearch({
        fields: ['title', 'text'],
        searchOptions: { combineWith: 'OR', fuzzy: true }
      })
      ms.addAll(documents)
      const results = ms.autoSuggest('nosta vi')
      expect(results.map(({ suggestion }) => suggestion)).toEqual(['nostra vita'])
    })
  })

  describe('loadJSON', () => {
    const documents = [
      { id: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita', category: 'poetry' },
      { id: 2, title: 'I Promessi Sposi', text: 'Quel ramo del lago di Como', category: 'fiction' },
      { id: 3, title: 'Vita Nova', text: 'In quella parte del libro della mia memoria', category: 'poetry' }
    ]

    it('loads a JSON-serialized search index', () => {
      const options = { fields: ['title', 'text'], storeFields: ['category'] }
      const ms = new MiniSearch(options)
      ms.addAll(documents)

      const json = JSON.stringify(ms)
      const deserialized = MiniSearch.loadJSON(json, options)
      expect(ms.search('vita')).toEqual(deserialized.search('vita'))

      const original = ms.toJSON()
      const final = deserialized.toJSON()

      // Normalize order of data in the serialized index
      original.index.sort()
      final.index.sort()

      expect(original).toEqual(final)
    })

    it('raises an error if called without options', () => {
      const options = { fields: ['title', 'text'] }
      const ms = new MiniSearch(options)
      ms.addAll(documents)
      const json = JSON.stringify(ms)
      expect(() => {
        MiniSearch.loadJSON(json)
      }).toThrowError('MiniSearch: loadJSON should be given the same options used when serializing the index')
    })

    it('raises an error if given an incompatible serialized version', () => {
      const options = { fields: ['title', 'text'] }
      const json = '{}'

      expect(() => {
        MiniSearch.loadJSON(json, options)
      }).toThrowError('MiniSearch: cannot deserialize an index created with an incompatible version')
    })

    it('is compatible with serializationVersion 1', () => {
      const options = { fields: ['title', 'text'], storeFields: ['category'] }
      const jsonV1 = '{"documentCount":3,"nextId":3,"documentIds":{"0":1,"1":2,"2":3},"fieldIds":{"title":0,"text":1},"fieldLength":{"0":[2,7],"1":[3,6],"2":[2,8]},"averageFieldLength":[2.3333333333333335,7],"storedFields":{"0":{"category":"poetry"},"1":{"category":"fiction"},"2":{"category":"poetry"}},"index":[["memoria",{"1":{"df":1,"ds":{"2":1}}}],["mezzo",{"1":{"df":1,"ds":{"0":1}}}],["mia",{"1":{"df":1,"ds":{"2":1}}}],["libro",{"1":{"df":1,"ds":{"2":1}}}],["lago",{"1":{"df":1,"ds":{"1":1}}}],["parte",{"1":{"df":1,"ds":{"2":1}}}],["promessi",{"0":{"df":1,"ds":{"1":1}}}],["ramo",{"1":{"df":1,"ds":{"1":1}}}],["quella",{"1":{"df":1,"ds":{"2":1}}}],["quel",{"1":{"df":1,"ds":{"1":1}}}],["sposi",{"0":{"df":1,"ds":{"1":1}}}],["in",{"1":{"df":1,"ds":{"2":1}}}],["i",{"0":{"df":1,"ds":{"1":1}}}],["vita",{"0":{"df":1,"ds":{"2":1}},"1":{"df":1,"ds":{"0":1}}}],["nova",{"0":{"df":1,"ds":{"2":1}}}],["nostra",{"1":{"df":1,"ds":{"0":1}}}],["nel",{"1":{"df":1,"ds":{"0":1}}}],["como",{"1":{"df":1,"ds":{"1":1}}}],["commedia",{"0":{"df":1,"ds":{"0":1}}}],["cammin",{"1":{"df":1,"ds":{"0":1}}}],["di",{"1":{"df":2,"ds":{"0":1,"1":1}}}],["divina",{"0":{"df":1,"ds":{"0":1}}}],["della",{"1":{"df":1,"ds":{"2":1}}}],["del",{"1":{"df":3,"ds":{"0":1,"1":1,"2":1}}}]],"serializationVersion":1}'

      const ms1 = MiniSearch.loadJSON(jsonV1, options)
      const ms2 = new MiniSearch(options)
      ms2.addAll(documents)

      const original = ms1.toJSON()
      const expected = ms2.toJSON()

      // Normalize order of data in the serialized index
      original.index.sort()
      expected.index.sort()

      expect(original).toEqual(expected)
    })

    it('allows subclassing and changing .loadJS', () => {
      class Modified extends MiniSearch {
        static loadJS (js, options) {
          return super.loadJS({ ...js, documentCount: 99 }, options)
        }
      }

      const options = { fields: ['title', 'text'], storeFields: ['category'] }
      const ms = new MiniSearch(options)
      ms.addAll(documents)

      const json = JSON.stringify(ms)
      const deserialized = Modified.loadJSON(json, options)
      expect(deserialized.documentCount).toEqual(99)
    })
  })

  describe('loadJSONAsync', () => {
    const documents = [
      { id: 1, title: 'Divina Commedia', text: 'Nel mezzo del cammin di nostra vita', category: 'poetry' },
      { id: 2, title: 'I Promessi Sposi', text: 'Quel ramo del lago di Como', category: 'fiction' },
      { id: 3, title: 'Vita Nova', text: 'In quella parte del libro della mia memoria', category: 'poetry' }
    ]

    it('makes a MiniSearch instance that is identical to .loadJSON()', async () => {
      const options = { fields: ['title', 'text'], storeFields: ['category'] }
      const ms = new MiniSearch(options)
      ms.addAll(documents)
      const json = JSON.stringify(ms)

      const deserializedAsync = await MiniSearch.loadJSONAsync(json, options)
      const deserialized = MiniSearch.loadJSON(json, options)

      expect(deserialized).toEqual(deserializedAsync)
    })
  })

  describe('getDefault', () => {
    it('returns the default value of the given option', () => {
      expect(MiniSearch.getDefault('idField')).toEqual('id')
      expect(MiniSearch.getDefault('extractField')).toBeInstanceOf(Function)
      expect(MiniSearch.getDefault('tokenize')).toBeInstanceOf(Function)
      expect(MiniSearch.getDefault('processTerm')).toBeInstanceOf(Function)
      expect(MiniSearch.getDefault('searchOptions')).toBe(undefined)
      expect(MiniSearch.getDefault('fields')).toBe(undefined)
    })

    it('throws an error if there is no option with the given name', () => {
      expect(() => { MiniSearch.getDefault('foo') }).toThrowError('MiniSearch: unknown option "foo"')
    })
  })
})
