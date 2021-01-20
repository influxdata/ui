import {
  nsToHours,
  hoursToDays,
  hoursToNs,
  nsToDays,
  minToSeconds,
} from './timeHelpers'

it('converts nanoseconds to hours', () => {
  expect(nsToHours(2592000000000000)).toEqual(720)
})

it('converts hours to days', () => {
  expect(hoursToDays(720)).toEqual(30)
})

it('converts nanoseconds to days', () => {
  expect(nsToDays(2592000000000000)).toEqual(30)
})

it('converts minutes to seconds', () => {
  expect(minToSeconds(5)).toEqual(300)
})

it('converts hours to nanoseconds', () => {
  expect(hoursToNs(720)).toEqual(2592000000000000)
})

it('does not convert -1 (disabled)', () => {
  expect(nsToHours(-1)).toEqual(-1)
  expect(hoursToDays(-1)).toEqual(-1)
  expect(nsToDays(-1)).toEqual(-1)
  expect(minToSeconds(-1)).toEqual(-1)
  expect(hoursToNs(-1)).toEqual(-1)
})
