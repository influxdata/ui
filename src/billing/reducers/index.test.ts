// Reducer
import {billingReducer} from 'src/billing/reducers'

// Actions
import {
  setAccount,
  setAccountStatus,
  setBillingSettings,
  setBillingSettingsStatus,
  setInvoices,
  setInvoicesStatus,
  setPaymentMethods,
  setPaymentMethodsStatus,
  setRegion,
  setRegionStatus,
} from 'src/billing/reducers'

// Mocks
import {
  mockBillingSettings,
  mockAccount,
  mockInvoices,
  mockPaymentMethods,
  mockCreditCard,
  mockRegion,
} from 'src/billing/reducers/mockBillingData'
import {RemoteDataState} from '@influxdata/clockface'

describe('billing reducer', () => {
  it('can set the account status', () => {
    const expected = billingReducer(
      undefined,
      setAccountStatus(RemoteDataState.Loading)
    )

    expect(expected.account.status).toEqual(RemoteDataState.Loading)
  })
  it('can set the account', () => {
    const expected = billingReducer(undefined, setAccount(mockAccount))

    expect(expected.account).toEqual(mockAccount)
    expect(expected.account.status).toEqual(RemoteDataState.Done)
  })
  it('can set the billing settings status', () => {
    const expected = billingReducer(
      undefined,
      setBillingSettingsStatus(RemoteDataState.Loading)
    )

    expect(expected.billingSettings.status).toEqual(RemoteDataState.Loading)
  })
  it('can set the billing settings', () => {
    const expected = billingReducer(
      undefined,
      setBillingSettings(mockBillingSettings)
    )

    expect(expected.billingSettings).toEqual(mockBillingSettings)
    expect(expected.billingSettings.status).toEqual(RemoteDataState.Done)
  })
  it('can set the invoices status', () => {
    const expected = billingReducer(
      undefined,
      setInvoicesStatus(RemoteDataState.Loading)
    )

    expect(expected.invoicesStatus).toEqual(RemoteDataState.Loading)
  })
  it('can set the invoices', () => {
    const expected = billingReducer(
      undefined,
      setInvoices(mockInvoices, RemoteDataState.Done)
    )

    expect(expected.invoices).toEqual(mockInvoices)
    expect(expected.invoicesStatus).toEqual(RemoteDataState.Done)
  })
  it('can set the payment methods status', () => {
    const expected = billingReducer(
      undefined,
      setPaymentMethodsStatus(RemoteDataState.Loading)
    )

    expect(expected.paymentMethodsStatus).toEqual(RemoteDataState.Loading)
  })
  it('can set the payment methods', () => {
    const expected = billingReducer(
      undefined,
      setPaymentMethods(
        mockPaymentMethods,
        mockCreditCard,
        RemoteDataState.Done
      )
    )

    expect(expected.paymentMethods).toEqual(mockPaymentMethods)
    expect(expected.paymentMethodsStatus).toEqual(RemoteDataState.Done)
    expect(expected.creditCards).toEqual(mockCreditCard)
  })
  it('can set the region status', () => {
    const expected = billingReducer(
      undefined,
      setRegionStatus(RemoteDataState.Loading)
    )

    expect(expected.region.status).toEqual(RemoteDataState.Loading)
  })
  it('can set the region', () => {
    const expected = billingReducer(undefined, setRegion(mockRegion))

    expect(expected.region).toEqual(mockRegion)
    expect(expected.region.status).toEqual(RemoteDataState.Done)
  })
})
