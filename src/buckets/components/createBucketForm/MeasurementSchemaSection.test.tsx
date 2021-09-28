import {areColumnsKosher} from './MeasurementSchemaUtils'

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
})
