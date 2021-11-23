import {
  areColumnsProper,
  START_ERROR,
  isNameValid,
  TOO_LONG_ERROR,
  areNewSchemasValid,
  areSchemaUpdatesValid,
  csvToObjectArray,
  toCsvString,
} from './measurementSchemaUtils'

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

const unproper1 = [
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

const schemaRequestList1 = [
  {valid: true},
  {valid: true},
  {valid: false},
  {valid: true},
]

const schemaRequestList2 = [
  {valid: true},
  {valid: true},
  {valid: true},
  {valid: true},
]

const schemaRequestList3 = [{valid: true}]

const schemaRequestList4 = [{valid: false}]

const schemaUpdate1 = [
  {
    valid: true,
    hasUpdate: true,
  },
  {
    valid: true,
    hasUpdate: true,
  },
  {
    valid: true,
    hasUpdate: true,
  },
  {
    valid: true,
    hasUpdate: true,
  },
]

const schemaUpdate2 = [
  {
    valid: true,
    hasUpdate: true,
  },
  {
    valid: false,
    hasUpdate: false,
  },
  {
    valid: true,
    hasUpdate: true,
  },
  {
    valid: true,
    hasUpdate: true,
  },
]

const schemaUpdate3 = [
  {
    valid: true,
    hasUpdate: true,
  },
  {
    valid: false,
    hasUpdate: true,
  },
  {
    valid: true,
    hasUpdate: true,
  },
]

const schemaUpdate4 = [
  {
    valid: true,
    hasUpdate: true,
  },
]

const schemaUpdate5 = [
  {
    valid: false,
    hasUpdate: false,
  },
]
const schemaUpdate6 = [
  {
    valid: false,
    hasUpdate: true,
  },
]

describe('test data validity function', () => {
  const doTest = (data, expected) => {
    const actual = areColumnsProper(data)
    expect(actual).toBe(expected)
  }

  it('should be proper', () => {
    doTest(oneColumns, true)
  })

  it('should not be proper, the name is not as string', () => {
    doTest(unproper1, false)
  })

  it('should not be proper, the type is wrong', () => {
    doTest(columns1, false)
  })

  it('should not be proper, the dataType is wrong', () => {
    doTest(columns2, false)
  })
  it('should not be proper, the type is a field and it does not have a datatype', () => {
    doTest(columns3, false)
  })
})

describe('test name validity function', () => {
  const doTest = (data, expected, message?) => {
    const actual = isNameValid(data)
    expect(actual.valid).toBe(expected)

    if (message) {
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
    const testMe =
      'supercalifgragahatahaeuhtsueasupercalifgragahatahaeuhtsueatuaetsnheuahtnsaeuhtnseuahtnseuahtnseuhtneuahtneuhtnseuhtnseuhtnseuhtnseuhnst'
    doTest(testMe, false, TOO_LONG_ERROR)
  })
})

describe('test schema validity function', () => {
  const doTest = (data, expected) => {
    const actual = areNewSchemasValid(data)
    expect(actual).toBe(expected)
  }
  it('should be invalid (false); array contains a false', () => {
    doTest(schemaRequestList1, false)
  })
  it('should be valid (true), array is all true', () => {
    doTest(schemaRequestList2, true)
  })
  it('should be valid (true), array of one true item', () => {
    doTest(schemaRequestList3, true)
  })
  it('should be invalid (false), array of one false item', () => {
    doTest(schemaRequestList4, false)
  })
  it('should be valid, it is empty', () => {
    doTest([], true)
  })
  it('should be valid, it is null', () => {
    doTest(null, true)
  })
})

describe('test schema  update validity function', () => {
  const doTest = (data, expected) => {
    const actual = areSchemaUpdatesValid(data)
    expect(actual).toBe(expected)
  }
  it('should be valid (true); they are all true', () => {
    doTest(schemaUpdate1, true)
  })

  it('should be valid (true); they are all true or without an update', () => {
    doTest(schemaUpdate2, true)
  })
  it('should be invalid (false); one has an update and is invalid', () => {
    doTest(schemaUpdate3, false)
  })
  it('should be valid (true),has one item that is true', () => {
    doTest(schemaUpdate4, true)
  })
  it('should be valid (true), array of one item without an update', () => {
    doTest(schemaUpdate5, true)
  })
  it('should be invalid (false), array of one item that has an update and is invalid', () => {
    doTest(schemaUpdate6, false)
  })
  it('should be valid, it is empty', () => {
    doTest([], true)
  })
  it('should be valid, it is null', () => {
    doTest(null, true)
  })
})

describe('test csv conversion function (object->csv file)', () => {
  it('should create a valid csv file', () => {
    const csvString = toCsvString(oneColumns)

    const lines = csvString.split('\n')
    expect(lines[0]).toEqual('name,type,dataType')
    expect(lines[1]).toEqual('time,timestamp,')
    expect(lines[2]).toEqual('host,tag,')
    expect(lines[3]).toEqual('service,tag,')
    expect(lines[4]).toEqual('fsRead,field,float')
    expect(lines[5]).toEqual('fsWrite,field,float')
    expect(lines[6]).toEqual('timeSignature,tag,')
    expect(lines[7]).toEqual('composer,tag,')
    expect(lines[8]).toEqual('instrument,field,string')
    expect(lines[9]).toEqual('one,field,string')

    expect(lines.length).toEqual(10)
  })
})
describe('test csv to array function (parsing)', () => {
  it('should parse the csv correctly', () => {
    const contents = `name,type,dataType
    hello,how,are
    you,today,really`

    const parsed = csvToObjectArray(contents)

    expect(parsed?.length).toEqual(2)
    expect(parsed[0]['name']).toEqual('hello')
    expect(parsed[0]['type']).toEqual('how')
    expect(parsed[0]['dataType']).toEqual('are')
    expect(parsed[1]['name']).toEqual('you')
    expect(parsed[1]['type']).toEqual('today')
    expect(parsed[1]['dataType']).toEqual('really')
  })
  it('should parse the csv correctly, with a missing third element', () => {
    const contents = `name,type,dataType
    hello,how,are
    you,today,`

    const parsed = csvToObjectArray(contents)

    expect(parsed?.length).toEqual(2)
    expect(parsed[0]['name']).toEqual('hello')
    expect(parsed[0]['type']).toEqual('how')
    expect(parsed[0]['dataType']).toEqual('are')
    expect(parsed[1]['name']).toEqual('you')
    expect(parsed[1]['type']).toEqual('today')

    const secondKeys = Object.keys(parsed[1])
    expect(secondKeys.length).toEqual(2)
    expect(secondKeys).toContain('name')
    expect(secondKeys).toContain('type')
    expect(secondKeys).not.toContain('dataType')
  })
  it('should throw an error because of bad columns in the csv', () => {
    const contents = `name,type,data_type
    hello,how,are
    you,today,`
    try {
      csvToObjectArray(contents)
      fail('code should not reach here, it should throw an error')
    } catch (error) {
      expect(error).not.toEqual(null)
      expect(error.message).toEqual(
        'csv headers are not correct; they need to be : "name, type, dataType"'
      )
    }
  })
  it('should throw an error because of bad columns in the csv-not enough columns', () => {
    const contents = `name,type
    hello,how
    you,today`
    try {
      csvToObjectArray(contents)
      fail('code should not reach here, it should throw an error')
    } catch (error) {
      expect(error).not.toEqual(null)
      expect(error.message).toEqual(
        'csv headers are not correct; they need to be : "name, type, dataType"'
      )
    }
  })
})
