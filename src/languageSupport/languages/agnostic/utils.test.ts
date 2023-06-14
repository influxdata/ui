import {TagKeyValuePair} from 'src/types'
import {
  groupedTagValues,
  getTagKeys,
} from 'src/languageSupport/languages/agnostic/utils'

const input: TagKeyValuePair[] = [
  {key: 'a', value: 'a1'},
  {key: 'a', value: 'a2'},
  {key: 'b', value: 'b1'},
  {key: 'c', value: 'c1'},
]

const inputOutOfOrder: TagKeyValuePair[] = [
  {key: 'c', value: 'c2'},
  {key: 'a', value: 'a1'},
  {key: 'a', value: 'a3'},
  {key: 'a', value: 'a2'},
  {key: 'b', value: 'b1'},
  {key: 'c', value: 'c1'},
]

describe('groupedTagValues', () => {
  it('happy path', () => {
    const expectResult: {[key: string]: string[]} = {
      a: ['a1', 'a2'],
      b: ['b1'],
      c: ['c1'],
    }
    expect(groupedTagValues(input)).toEqual(expectResult)
  })

  it('key order does not matter, but value order matters', () => {
    const expectResult: {[key: string]: string[]} = {
      a: ['a1', 'a3', 'a2'],
      b: ['b1'],
      c: ['c2', 'c1'],
    }
    expect(groupedTagValues(inputOutOfOrder)).toEqual(expectResult)
  })
})

describe('getTagKeys', () => {
  it('happy path -- return unique keys when some keys are duplicated', () => {
    const expectResult: string[] = ['a', 'b', 'c']
    expect(getTagKeys(input)).toEqual(expectResult)
  })

  it('order matters', () => {
    const expectResult: string[] = ['c', 'a', 'b']
    expect(getTagKeys(inputOutOfOrder)).toEqual(expectResult)
  })
})
