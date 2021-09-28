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

describe('test data validity function', () => {
  it('should be kosher', () => {
    const actual = areColumnsKosher(oneColumns)
    expect(actual).toBe(true)
  })

    it('should not be kosher, the name is not as string', () => {
        const actual = areColumnsKosher(unkosher1)
        expect(actual).toBe(false)
    })
})
