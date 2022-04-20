import {setCloneName} from 'src/utils/naming'

describe('The naming of a newly cloned resource', () => {
  it('clones a resource with the same name', () => {
    expect(
      setCloneName(
        'duplicate this',
        new Date(Date.UTC(2020, 11, 1, 12, 30, 45))
      )
    ).toBe('duplicate this (cloned at 12-01-2020:12:30:45)')
  })

  it("clones a clone, but doesn't add any extra spaces", () => {
    expect(
      setCloneName(
        'duplicate this  ',
        new Date(Date.UTC(2020, 11, 1, 12, 30, 45))
      )
    ).toBe('duplicate this (cloned at 12-01-2020:12:30:45)')
  })
})
