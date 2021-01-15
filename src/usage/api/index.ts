import {BillingDate, History, LimitStatuses} from 'src/types/billing'
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
  const limitsStatus: LimitStatuses = {
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

export const getHistory = (): Promise<any> => {
  const history: History = {
    billingStats: `
#group,false,false,true,true,false,false,true,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,double,string,string,string,string
#default,mean,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,id,s2_cell_id
,,0,2019-01-01T21:42:32Z,2019-02-28T22:42:32.923Z,2019-02-22T09:20:33.99Z,38.88867,lon,migration,91752A,17b4964
,,1,2019-01-01T21:42:32Z,2019-02-28T22:42:32.923Z,2019-01-15T15:53:33.288Z,38.81167,lon,migration,91752A,17b4854
,,2,2019-01-01T21:42:32Z,2019-02-28T22:42:32.923Z,2019-02-22T09:20:33.99Z,8.01367,lat,migration,91752A,17b4964
,,3,2019-01-01T21:42:32Z,2019-02-28T22:42:32.923Z,2019-01-15T15:53:33.288Z,7.86233,lat,migration,91752A,17b4854`,
    rateLimits: `
#group,false,false,true,false,false
#datatype,string,long,string,dateTime:RFC3339,long
#default,limits,,,,
,result,table,_field,_time,_value
,,0,limited_write,2021-01-14T22:05:00Z,0
,,0,limited_write,2021-01-14T22:10:00Z,0
,,0,limited_write,2021-01-14T22:15:00Z,0
,,0,limited_write,2021-01-14T22:20:00Z,0
,,0,limited_write,2021-01-14T22:25:00Z,15
,,0,limited_write,2021-01-14T22:27:58.880809515Z,27`,
    status: RemoteDataState.Done
  }

  return makeResponse(200, history)
}
