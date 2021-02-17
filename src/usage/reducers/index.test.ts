// Reducer
import {usageReducer} from 'src/usage/reducers'

// Actions
import {
  setAccount,
  setAccountStatus,
  setBillingDate,
  setBillingDateStatus,
  setHistory,
  setHistoryStatus,
} from 'src/usage/reducers'

// Mocks
import {
  mockBillingStart,
  mockAccount,
  mockHistory,
} from 'src/usage/reducers/mockUsageData'
import {RemoteDataState} from '@influxdata/clockface'

describe('usage reducer', () => {
  it('can set the account status', () => {
    const expected = usageReducer(
      undefined,
      setAccountStatus(RemoteDataState.Loading)
    )

    expect(expected.account.status).toEqual(RemoteDataState.Loading)
  })
  it('can set the account', () => {
    const expected = usageReducer(undefined, setAccount(mockAccount))

    expect(expected.account).toEqual(mockAccount)
    expect(expected.account.status).toEqual(RemoteDataState.Done)
  })
  it('can set the billing date status', () => {
    const expected = usageReducer(
      undefined,
      setBillingDateStatus(RemoteDataState.Loading)
    )

    expect(expected.billingStart.status).toEqual(RemoteDataState.Loading)
  })
  it('can set the billing date', () => {
    const expected = usageReducer(undefined, setBillingDate(mockBillingStart))

    expect(expected.billingStart).toEqual(mockBillingStart)
    expect(expected.billingStart.status).toEqual(RemoteDataState.Done)
  })
  it('can set the account history status', () => {
    const expected = usageReducer(
      undefined,
      setHistoryStatus(RemoteDataState.Loading)
    )

    expect(expected.history.status).toEqual(RemoteDataState.Loading)
  })
  it('can set the account history', () => {
    const expected = usageReducer(undefined, setHistory(mockHistory))

    expect(expected.history).toEqual(mockHistory)
    expect(expected.history.status).toEqual(RemoteDataState.Done)
  })
})
