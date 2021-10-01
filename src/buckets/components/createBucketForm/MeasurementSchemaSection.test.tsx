import {areColumnsKosher,  START_ERROR, isNameValid, TOO_LONG_ERROR} from './MeasurementSchemaUtils'

const oneColumns = [
  {name: 'time', type: 'timestamp'},
  {name: 'host', type: 'tag'},
  {name: 'service', type: 'tag'},
  {name: 'fsRead', type: 'field', dataType: 'float'},
  {name: 'fsWrite', type: 'field', dataType: 'float'},
  {name: 'timeSignature', type: 'tag'},
  {name: 'composer', type: 'tag'},
  {name: 'instrument', type: 'field', dataType: 'string'},
  {name: 'one', type: 'field', dataType: 'string'},
]

const unkosher1 = [
  {name: 'time', type: 'timestamp'},
  {name: 23, type: 'tag'},
  {name: 'service', type: 'tag'},
  {name: 'fsRead', type: 'field', dataType: 'float'},
  {name: 'fsWrite', type: 'field', dataType: 'float'},
  {name: 'timeSignature', type: 'tag'},
  {name: 'composer', type: 'tag'},
  {name: 'instrument', type: 'field', dataType: 'string'},
  {name: 'one', type: 'field', dataType: 'string'},
]

const columns1 = [
  {name: 'time', type: 'timestamp'},
  {name: 'host', type: 'tag'},
  {name: 'service', type: 'tag'},
  {name: 'fsRead', type: 'field', dataType: 'float'},
  {name: 'fsWrite', type: 'field', dataType: 'float'},
  {name: 'timeSignature', type: 'time'},
]

const columns2 = [
  {name: 'time', type: 'timestamp'},
  {name: 'host', type: 'tag'},
  {name: 'service', type: 'tag'},
  {name: 'fsRead', type: 'field', dataType: 'double'},
  {name: 'fsWrite', type: 'field', dataType: 'float'},
  {name: 'timeSignature', type: 'tag'},
]

const columns3 = [
  {name: 'time', type: 'timestamp'},
  {name: 'host', type: 'tag'},
  {name: 'service', type: 'tag'},
  {name: 'fsRead', type: 'field'},
  {name: 'fsWrite', type: 'field', dataType: 'float'},
  {name: 'timeSignature', type: 'tag'},
]

describe('test data validity function', () => {
  const doTest = (data, expected) => {
    const actual = areColumnsKosher(data)
    expect(actual).toBe(expected)
  }

  it('should be kosher', () => {
    doTest(oneColumns, true)
  })

  it('should not be kosher, the name is not as string', () => {
    doTest(unkosher1, false)
  })

  it('should not be kosher, the type is wrong', () => {
    doTest(columns1, false)
  })

  it('should not be kosher, the dataType is wrong', () => {
    doTest(columns2, false)
  })
  it('should not be kosher, the type is a field and it does not have a datatype', () => {
    doTest(columns3, false)
  })
})

describe('test name validity function', () => {
  const doTest = (data, expected, message?) => {
    const actual = isNameValid(data)
    expect(actual.valid).toBe(expected)

    if(message) {
      expect(actual.message).toEqual(message)
    }
  }

  it('should be valid', () => {
    doTest('hello', true)
  })
  it('should be valid; number is not in the first position', () => {
    doTest('h3llo', true)
  })
  it('should be valid; underscore is not in the first position', () => {
    doTest('hello_there', true)
  })
  it('should not be valid, as it starts with an underscore', () => {
    doTest('_hello', false, START_ERROR)
  })
  it('should not be valid, as it starts with a number', () => {
    doTest('8hello', false, START_ERROR)
  })
  it('should not be valid, is too long', () => {
    // following is 135 chars long:
    const testMe = 'supercalifgragahatahaeuhtsueasupercalifgragahatahaeuhtsueatuaetsnheuahtnsaeuhtnseuahtnseuahtnseuhtneuahtneuhtnseuhtnseuhtnseuhtnseuhnst'
    doTest(testMe, false, TOO_LONG_ERROR)
  })

})
