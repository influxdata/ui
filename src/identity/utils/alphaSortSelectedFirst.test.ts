import {alphaSortSelectedFirst} from 'src/identity/utils/alphaSortSelectedFirst'

describe('GlobalHeader alphaSortSelectedFirst function', function () {
  it('should return an empty array when the array of items is empty', function () {
    expect(
      alphaSortSelectedFirst([], {id: '3490824', name: 'Zote'})
    ).toStrictEqual([])
  })

  it('should sort the array without mutatating the original array', function () {
    const inputArray = [
      {id: '456', name: 'Millibelle'},
      {id: '789', name: 'Tuk'},
      {id: '123', name: 'Bardoon'},
    ]
    const selectedItem = inputArray[2]

    const expectedResult = [
      {id: '123', name: 'Bardoon'},
      {id: '456', name: 'Millibelle'},
      {id: '789', name: 'Tuk'},
    ]

    const sortedResult = alphaSortSelectedFirst(inputArray, selectedItem)

    expect(sortedResult).toEqual(expectedResult)
    expect(expectedResult).not.toEqual(inputArray)
  })

  it('should return an array sorted alphabetically, case-insensitive, with the selected item at the top', function () {
    const inputArray = [
      {id: '234592', name: 'salubra'},
      {id: '900389203', name: 'Jiji 20'},
      {id: '4356456', name: 'jiji 1'},
      {id: '23443', name: 'Sly'},
      {id: '90402', name: 'Millibelle'},
      {id: '905342', name: 'lemm'},
      {id: '234642', name: 'Tuk'},
      {id: '234723', name: 'Jiji 5'},
      {id: '0239490', name: 'oro'},
      {id: '02394023490', name: 'Mato'},
      {id: '2349024', name: 'Sheo'},
      {id: '23453', name: 'zote'},
      {id: '23453', name: 'Bardoon'},
    ]

    const selectedItem = inputArray[4]

    const expectedResult = [
      {id: '90402', name: 'Millibelle'},
      {id: '23453', name: 'Bardoon'},
      {id: '4356456', name: 'jiji 1'},
      {id: '234723', name: 'Jiji 5'},
      {id: '900389203', name: 'Jiji 20'},
      {id: '905342', name: 'lemm'},
      {id: '02394023490', name: 'Mato'},
      {id: '0239490', name: 'oro'},
      {id: '234592', name: 'salubra'},
      {id: '2349024', name: 'Sheo'},
      {id: '23443', name: 'Sly'},
      {id: '234642', name: 'Tuk'},
      {id: '23453', name: 'zote'},
    ]

    const result = alphaSortSelectedFirst(inputArray, selectedItem)

    expect(result).toEqual(expectedResult)
  })
})
