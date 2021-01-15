import {kbToMb} from './unitHelpers'

it('converts kilobytes to megabytes', () => {
  expect(kbToMb(1000)).toEqual(1)
})
