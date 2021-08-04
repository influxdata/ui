import {incrementCloneName} from 'src/utils/naming'

describe('The naming of a newly cloned resource', () => {
  it('clones a resource with the same name', () => {
    const namesList = ['duplicate this']
    expect(incrementCloneName(namesList, 'duplicate this')).toBe(
      'duplicate this (clone 1)'
    )
  })

  it("clones a clone, but doesn't add any extra spaces", () => {
    const namesList = ['duplicate this', 'duplicate this  (clone 1)']
    expect(incrementCloneName(namesList, 'duplicate this  (clone 1)')).toBe(
      'duplicate this (clone 2)'
    )
  })
})
