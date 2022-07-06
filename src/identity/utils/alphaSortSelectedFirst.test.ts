import {alphaSortSelectedFirst} from './alphaSortSelectedFirst'

describe('alphaSortSelectedFirst', function() {
  it('should return an empty array when the input is empty', function() {
    expect(
      alphaSortSelectedFirst([], {name: 'uniqueName', id: 'uniqueId'})
    ).toEqual([])
  })

  it('should return a sorted array with the selected item at the top and rest is alphabetically sorted', function() {
    const itemArray = [
      {id: 'uniqueId1', name: 'uniqueName1'},
      {id: 'uniqueId2', name: 'uniqueName2'},
      {id: 'uniqueId3', name: 'uniqueName3'},
    ]
    const selectedItem = {id: 'uniqueId2', name: 'uniqueName2'}

    const result = alphaSortSelectedFirst(itemArray, selectedItem)

    const expectedResult = [
      selectedItem,
      {id: 'uniqueId1', name: 'uniqueName1'},
      {id: 'uniqueId3', name: 'uniqueName3'},
    ]
    expect(result).toEqual(expectedResult)
  })
})
