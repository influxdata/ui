import {calculateCreditDaysUsed} from 'src/usage/context/usage'

describe('calculateCreditDaysUsed', () => {
  const ONE_DAY_MILLSECONDS = 1000 * 60 * 60 * 24

  it('handles falsy values as invalid date', () => {
    expect(calculateCreditDaysUsed(undefined)).toEqual(NaN)
    expect(calculateCreditDaysUsed(null)).toEqual(NaN)
    expect(calculateCreditDaysUsed('')).toEqual(NaN)
  })

  it('handles valid dates in the past', () => {
    const yesterday = new Date(Date.now() - ONE_DAY_MILLSECONDS).toISOString()
    const twoDaysAgo = new Date(
      Date.now() - 2 * ONE_DAY_MILLSECONDS
    ).toISOString()
    const oneWeekAgo = new Date(
      Date.now() - 7 * ONE_DAY_MILLSECONDS
    ).toISOString()
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * ONE_DAY_MILLSECONDS
    ).toISOString()

    expect(calculateCreditDaysUsed(yesterday)).toEqual(1)
    expect(calculateCreditDaysUsed(twoDaysAgo)).toEqual(2)
    expect(calculateCreditDaysUsed(oneWeekAgo)).toEqual(7)
    expect(calculateCreditDaysUsed(thirtyDaysAgo)).toEqual(30)
  })

  it('handles valid dates in the future', () => {
    const tomorrow = new Date(Date.now() + ONE_DAY_MILLSECONDS).toISOString()
    const twoDaysFromNow = new Date(
      Date.now() + 2 * ONE_DAY_MILLSECONDS
    ).toISOString()
    const oneWeekFromNow = new Date(
      Date.now() + 7 * ONE_DAY_MILLSECONDS
    ).toISOString()
    const thirtyDaysFromNow = new Date(
      Date.now() + 30 * ONE_DAY_MILLSECONDS
    ).toISOString()

    expect(calculateCreditDaysUsed(tomorrow)).toEqual(-1)
    expect(calculateCreditDaysUsed(twoDaysFromNow)).toEqual(-2)
    expect(calculateCreditDaysUsed(oneWeekFromNow)).toEqual(-7)
    expect(calculateCreditDaysUsed(thirtyDaysFromNow)).toEqual(-30)
  })
})
