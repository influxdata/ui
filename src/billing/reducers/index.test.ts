// Reducer
import {billingReducer} from 'src/billing/reducers'

// Actions
import {
  setBillingInfo,
  setBillingInfoStatus,
  setBillingSettings,
  setBillingSettingsStatus,
  setInvoices,
  setInvoicesStatus,
  setCreditCard,
  setCreditCardStatus,
} from 'src/billing/reducers'

// Mocks
import {
  mockBillingInfo,
  mockBillingSettings,
  mockInvoices,
  mockCreditCard,
} from 'src/billing/reducers/mockBillingData'
import {RemoteDataState} from '@influxdata/clockface'

describe('billing reducer', () => {
  it('can set the billing info status', () => {
    const expected = billingReducer(
      undefined,
      setBillingInfoStatus(RemoteDataState.Loading)
    )

    expect(expected.billingInfo.status).toEqual(RemoteDataState.Loading)
  })
  it('can set the billing info', () => {
    const expected = billingReducer(undefined, setBillingInfo(mockBillingInfo))

    expect(expected.billingInfo).toEqual(mockBillingInfo)
    expect(expected.billingInfo.status).toEqual(RemoteDataState.Done)
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
  it('can set the credit card status', () => {
    const expected = billingReducer(
      undefined,
      setCreditCardStatus(RemoteDataState.Loading)
    )

    expect(expected.creditCard?.status).toEqual(RemoteDataState.Loading)
  })
  it('can set the payment methods', () => {
    const expected = billingReducer(undefined, setCreditCard(mockCreditCard))

    expect(expected.creditCard).toEqual(mockCreditCard)
    expect(expected.creditCard.status).toEqual(RemoteDataState.Done)
  })
})
