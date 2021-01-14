import {BillingDate} from 'src/types/billing'
import {RemoteDataState} from 'src/types'
import {Account} from 'src/client/unityRoutes'

const makeResponse = (status, data) => {
  return Promise.resolve({
    status,
    headers: new Headers({'Content-Type': 'application/json'}),
    data,
  })
}

export const getBillingAccount = (): ReturnType<typeof getBillingAccountGenerated> => {
  const account: Account = {
    id: 1234,
    balance: 100,
    billingContact: {
      companyName: 'InfluxDB',
      email: 'info@influxdata.com',
      firstName: 'Boatie',
      lastName: 'McBoatface',
      country: 'USA',
      street1: '123 Powers St',
      subdivision: 'NY',
      city: 'Brooklyn',
      postalCode: 30000,
    },
    deletable: false,
    marketplaceSubscription: {
      marketplace: 'us-west',
      subscriberId: 'id123',
      status: 'Paid',
    },
    pricingVersion: 4,
    type: 'free',
    updatedAt: new Date().toString(),
    users: [{}],
    zuoraAccountId: 'zID123',
  }
  return makeResponse(200, account)
}

export const getBillingDate = (): Promise<any> => {
  const billingDate: BillingDate = {
    date: new Date().toString(),
    time: '12:00:00pm',
    status: RemoteDataState.Done,
  }

  return makeResponse(200, billingDate)
}

export const getLimitsStatus = (): Promise<any> => {
  const limitsStatus: any = {
    read: {
      status: 'exceeded',
    },
    write: {
      status: 'exceeded',
    },
    cardinality: {
      status: 'exceeded',
    },
    status: RemoteDataState.Done,
  }

  return makeResponse(200, limitsStatus)
}
