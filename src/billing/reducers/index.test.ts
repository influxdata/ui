// Reducer
import {billingReducer} from 'src/billing/reducers'

// Actions
import {setCreditCard, setCreditCardStatus} from 'src/billing/reducers'

// Mocks
import {mockCreditCard} from 'src/billing/reducers/mockBillingData'
import {RemoteDataState} from '@influxdata/clockface'

describe('billing reducer', () => {
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
