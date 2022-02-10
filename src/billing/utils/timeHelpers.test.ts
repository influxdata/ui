import {
  hoursToDays,
  hoursToNs,
  minToSeconds,
  nsToDays,
  nsToHours,
  nsToSeconds,
  secondsToNs,
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

it('converts nanoseconds to seconds', () => {
  expect(nsToSeconds(1500000000000)).toEqual(1500)
})

it('converts seconds to nanoseconds', () => {
  expect(secondsToNs(1500)).toEqual(1500000000000)
})

it('does not convert -1 (disabled)', () => {
  expect(nsToHours(-1)).toEqual(-1)
  expect(hoursToDays(-1)).toEqual(-1)
  expect(nsToDays(-1)).toEqual(-1)
  expect(minToSeconds(-1)).toEqual(-1)
  expect(hoursToNs(-1)).toEqual(-1)
  expect(nsToSeconds(-1)).toEqual(-1)
  expect(secondsToNs(-1)).toEqual(-1)
})
