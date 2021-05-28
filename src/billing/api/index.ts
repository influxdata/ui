import {getBilling, getPaymentForm} from 'src/client/unityRoutes'

import {RemoteDataState} from 'src/types'
import {CreditCardParams, BillingInfo} from 'src/types/billing'

const makeResponse = (status, data, ...args) => {
  for (let i = 0; i < args.length; i++) {
    console.log(args[i]) // eslint-disable-line no-console
  }

  return Promise.resolve({
    status,
    headers: new Headers({'Content-Type': 'application/json'}),
    data,
  })
}

export const getBillingInfo = (): ReturnType<typeof getBilling> => {
  const billing: BillingInfo = {
    balance: 100,
    region: 'us-west',
    paymentMethod: {
      cardType: 'Visa',
      cardNumber: '4242424242424242',
      expirationMonth: '04',
      expirationYear: '22',
      defaultPaymentMethod: true,
    },
    balanceUpdatedAt: new Date().toString(),
    contact: {
      companyName: 'InfluxDB',
      email: 'info@influxdata.com',
      firstName: 'Boatie',
      lastName: 'McBoatface',
      country: 'USA',
      street1: '123 Powers St',
      city: 'Brooklyn',
      subdivision: 'NY',
      postalCode: 30000,
    },
    status: RemoteDataState.Done,
  }
  return makeResponse(200, billing)
}

export const getBillingCreditCardParams = (): ReturnType<typeof getPaymentForm> => {
  const cc: CreditCardParams = {
    style: 'inline',
    url: 'you-are-el',
    submitEnabled: 'false',
    tenantId: '12345',
    token: 'TOW-KEN',
    key: 'KEE',
    signature: 'SIGNATURE',
    id: 'eye-dee',
    status: RemoteDataState.Done,
  }

  return makeResponse(200, cc, 'getBillingCreditCard')
}
