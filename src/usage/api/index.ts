import {BillingDate, History} from 'src/types/billing'
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

export const getHistory = (): Promise<any> => {
  const history: History = {
    billingStats: `
#group,false,false,true,true,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,long
#default,query_count,,,,
,result,table,_start,_stop,query_count
,,0,2021-01-13T22:00:24.064007058Z,2021-01-15T22:00:24.064007058Z,1954

#group,false,false,true,true,false,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,long,double
#default,reads_gb,,,,,
,result,table,_start,_stop,_value,reads_gb
,,0,2021-01-13T22:00:24.064007058Z,2021-01-15T22:00:24.064007058Z,45859673,0.05

#group,false,false,true,true,false,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,long,double
#default,writes_mb,,,,,
,result,table,_start,_stop,_value,writes_mb
,,0,2021-01-13T22:00:24.064007058Z,2021-01-15T22:00:24.064007058Z,63014966,63.01

#group,false,false,false,false
#datatype,string,long,double,double
#default,storage_gb,,,
,result,table,_value,storage_gb
,,0,144473630.31726062,0.14`,
    rateLimits: `
#group,false,false,true,false,false
#datatype,string,long,string,dateTime:RFC3339,long
#default,limits,,,,
,result,table,_field,_time,_value
,,0,limited_write,2021-01-13T22:05:00Z,0
,,0,limited_write,2021-01-13T22:10:00Z,0
,,0,limited_write,2021-01-13T22:15:00Z,0
,,0,limited_write,2021-01-13T22:20:00Z,0
,,0,limited_write,2021-01-13T22:25:00Z,0
,,0,limited_write,2021-01-13T22:30:00Z,0
,,0,limited_write,2021-01-13T22:35:00Z,0
,,0,limited_write,2021-01-13T22:40:00Z,0
,,0,limited_write,2021-01-13T22:45:00Z,0
,,0,limited_write,2021-01-13T22:50:00Z,0
,,0,limited_write,2021-01-13T22:55:00Z,0
,,0,limited_write,2021-01-13T23:00:00Z,0
,,0,limited_write,2021-01-13T23:05:00Z,0
,,0,limited_write,2021-01-13T23:10:00Z,0
,,0,limited_write,2021-01-13T23:15:00Z,0
,,0,limited_write,2021-01-13T23:20:00Z,0
,,0,limited_write,2021-01-13T23:25:00Z,0
,,0,limited_write,2021-01-13T23:30:00Z,0
,,0,limited_write,2021-01-13T23:35:00Z,0
,,0,limited_write,2021-01-13T23:40:00Z,0
,,0,limited_write,2021-01-13T23:45:00Z,0
,,0,limited_write,2021-01-13T23:50:00Z,0
,,0,limited_write,2021-01-13T23:55:00Z,0
,,0,limited_write,2021-01-14T00:00:00Z,0
,,0,limited_write,2021-01-14T00:05:00Z,0
,,0,limited_write,2021-01-14T00:10:00Z,0
,,0,limited_write,2021-01-14T00:15:00Z,0
,,0,limited_write,2021-01-14T00:20:00Z,0
,,0,limited_write,2021-01-14T00:25:00Z,0
,,0,limited_write,2021-01-14T00:30:00Z,0
,,0,limited_write,2021-01-14T00:35:00Z,0
,,0,limited_write,2021-01-14T00:40:00Z,0
,,0,limited_write,2021-01-14T00:45:00Z,0
,,0,limited_write,2021-01-14T00:50:00Z,0
,,0,limited_write,2021-01-14T00:55:00Z,0
,,0,limited_write,2021-01-14T01:00:00Z,0
,,0,limited_write,2021-01-14T01:05:00Z,0
,,0,limited_write,2021-01-14T01:10:00Z,0
,,0,limited_write,2021-01-14T01:15:00Z,0
,,0,limited_write,2021-01-14T01:20:00Z,0
,,0,limited_write,2021-01-14T01:25:00Z,0
,,0,limited_write,2021-01-14T01:30:00Z,0
,,0,limited_write,2021-01-14T01:35:00Z,0
,,0,limited_write,2021-01-14T01:40:00Z,0
,,0,limited_write,2021-01-14T01:45:00Z,0
,,0,limited_write,2021-01-14T01:50:00Z,0
,,0,limited_write,2021-01-14T01:55:00Z,0
,,0,limited_write,2021-01-14T02:00:00Z,0
,,0,limited_write,2021-01-14T02:05:00Z,0
,,0,limited_write,2021-01-14T02:10:00Z,0
,,0,limited_write,2021-01-14T02:15:00Z,0
,,0,limited_write,2021-01-14T02:20:00Z,0
,,0,limited_write,2021-01-14T02:25:00Z,0
,,0,limited_write,2021-01-14T02:30:00Z,0
,,0,limited_write,2021-01-14T02:35:00Z,0
,,0,limited_write,2021-01-14T02:40:00Z,0
,,0,limited_write,2021-01-14T02:45:00Z,0
,,0,limited_write,2021-01-14T02:50:00Z,0
,,0,limited_write,2021-01-14T02:55:00Z,0
,,0,limited_write,2021-01-14T03:00:00Z,0
,,0,limited_write,2021-01-14T03:05:00Z,0
,,0,limited_write,2021-01-14T03:10:00Z,0
,,0,limited_write,2021-01-14T03:15:00Z,0
,,0,limited_write,2021-01-14T03:20:00Z,0
,,0,limited_write,2021-01-14T03:25:00Z,0
,,0,limited_write,2021-01-14T03:30:00Z,0
,,0,limited_write,2021-01-14T03:35:00Z,0
,,0,limited_write,2021-01-14T03:40:00Z,0
,,0,limited_write,2021-01-14T03:45:00Z,0
,,0,limited_write,2021-01-14T03:50:00Z,0
,,0,limited_write,2021-01-14T03:55:00Z,0
,,0,limited_write,2021-01-14T04:00:00Z,0
,,0,limited_write,2021-01-14T04:05:00Z,0
,,0,limited_write,2021-01-14T04:10:00Z,0
,,0,limited_write,2021-01-14T04:15:00Z,0
,,0,limited_write,2021-01-14T04:20:00Z,0
,,0,limited_write,2021-01-14T04:25:00Z,0
,,0,limited_write,2021-01-14T04:30:00Z,0
,,0,limited_write,2021-01-14T04:35:00Z,0
,,0,limited_write,2021-01-14T04:40:00Z,0
,,0,limited_write,2021-01-14T04:45:00Z,0
,,0,limited_write,2021-01-14T04:50:00Z,0
,,0,limited_write,2021-01-14T04:55:00Z,0
,,0,limited_write,2021-01-14T05:00:00Z,0
,,0,limited_write,2021-01-14T05:05:00Z,0
,,0,limited_write,2021-01-14T05:10:00Z,0
,,0,limited_write,2021-01-14T05:15:00Z,0
,,0,limited_write,2021-01-14T05:20:00Z,0
,,0,limited_write,2021-01-14T05:25:00Z,0
,,0,limited_write,2021-01-14T05:30:00Z,0
,,0,limited_write,2021-01-14T05:35:00Z,0
,,0,limited_write,2021-01-14T05:40:00Z,0
,,0,limited_write,2021-01-14T05:45:00Z,0
,,0,limited_write,2021-01-14T05:50:00Z,0
,,0,limited_write,2021-01-14T05:55:00Z,0
,,0,limited_write,2021-01-14T06:00:00Z,0
,,0,limited_write,2021-01-14T06:05:00Z,0
,,0,limited_write,2021-01-14T06:10:00Z,0
,,0,limited_write,2021-01-14T06:15:00Z,0
,,0,limited_write,2021-01-14T06:20:00Z,0
,,0,limited_write,2021-01-14T06:25:00Z,0
,,0,limited_write,2021-01-14T06:30:00Z,0
,,0,limited_write,2021-01-14T06:35:00Z,0
,,0,limited_write,2021-01-14T06:40:00Z,0
,,0,limited_write,2021-01-14T06:45:00Z,0
,,0,limited_write,2021-01-14T06:50:00Z,0
,,0,limited_write,2021-01-14T06:55:00Z,0
,,0,limited_write,2021-01-14T07:00:00Z,0
,,0,limited_write,2021-01-14T07:05:00Z,0
,,0,limited_write,2021-01-14T07:10:00Z,0
,,0,limited_write,2021-01-14T07:15:00Z,0
,,0,limited_write,2021-01-14T07:20:00Z,0
,,0,limited_write,2021-01-14T07:25:00Z,0
,,0,limited_write,2021-01-14T07:30:00Z,0
,,0,limited_write,2021-01-14T07:35:00Z,0
,,0,limited_write,2021-01-14T07:40:00Z,0
,,0,limited_write,2021-01-14T07:45:00Z,0
,,0,limited_write,2021-01-14T07:50:00Z,0
,,0,limited_write,2021-01-14T07:55:00Z,0
,,0,limited_write,2021-01-14T08:00:00Z,0
,,0,limited_write,2021-01-14T08:05:00Z,0
,,0,limited_write,2021-01-14T08:10:00Z,0
,,0,limited_write,2021-01-14T08:15:00Z,0
,,0,limited_write,2021-01-14T08:20:00Z,0
,,0,limited_write,2021-01-14T08:25:00Z,0
,,0,limited_write,2021-01-14T08:30:00Z,0
,,0,limited_write,2021-01-14T08:35:00Z,0
,,0,limited_write,2021-01-14T08:40:00Z,0
,,0,limited_write,2021-01-14T08:45:00Z,0
,,0,limited_write,2021-01-14T08:50:00Z,0
,,0,limited_write,2021-01-14T08:55:00Z,0
,,0,limited_write,2021-01-14T09:00:00Z,0
,,0,limited_write,2021-01-14T09:05:00Z,0
,,0,limited_write,2021-01-14T09:10:00Z,0
,,0,limited_write,2021-01-14T09:15:00Z,0
,,0,limited_write,2021-01-14T09:20:00Z,0
,,0,limited_write,2021-01-14T09:25:00Z,0
,,0,limited_write,2021-01-14T09:30:00Z,0
,,0,limited_write,2021-01-14T09:35:00Z,0
,,0,limited_write,2021-01-14T09:40:00Z,0
,,0,limited_write,2021-01-14T09:45:00Z,0
,,0,limited_write,2021-01-14T09:50:00Z,0
,,0,limited_write,2021-01-14T09:55:00Z,0
,,0,limited_write,2021-01-14T10:00:00Z,0
,,0,limited_write,2021-01-14T10:05:00Z,0
,,0,limited_write,2021-01-14T10:10:00Z,0
,,0,limited_write,2021-01-14T10:15:00Z,0
,,0,limited_write,2021-01-14T10:20:00Z,0
,,0,limited_write,2021-01-14T10:25:00Z,0
,,0,limited_write,2021-01-14T10:30:00Z,0
,,0,limited_write,2021-01-14T10:35:00Z,0
,,0,limited_write,2021-01-14T10:40:00Z,0
,,0,limited_write,2021-01-14T10:45:00Z,0
,,0,limited_write,2021-01-14T10:50:00Z,0
,,0,limited_write,2021-01-14T10:55:00Z,0
,,0,limited_write,2021-01-14T11:00:00Z,0
,,0,limited_write,2021-01-14T11:05:00Z,0
,,0,limited_write,2021-01-14T11:10:00Z,0
,,0,limited_write,2021-01-14T11:15:00Z,0
,,0,limited_write,2021-01-14T11:20:00Z,0
,,0,limited_write,2021-01-14T11:25:00Z,0
,,0,limited_write,2021-01-14T11:30:00Z,0
,,0,limited_write,2021-01-14T11:35:00Z,0
,,0,limited_write,2021-01-14T11:40:00Z,0
,,0,limited_write,2021-01-14T11:45:00Z,0
,,0,limited_write,2021-01-14T11:50:00Z,0
,,0,limited_write,2021-01-14T11:55:00Z,0
,,0,limited_write,2021-01-14T12:00:00Z,0
,,0,limited_write,2021-01-14T12:05:00Z,0
,,0,limited_write,2021-01-14T12:10:00Z,0
,,0,limited_write,2021-01-14T12:15:00Z,0
,,0,limited_write,2021-01-14T12:20:00Z,0
,,0,limited_write,2021-01-14T12:25:00Z,0
,,0,limited_write,2021-01-14T12:30:00Z,0
,,0,limited_write,2021-01-14T12:35:00Z,0
,,0,limited_write,2021-01-14T12:40:00Z,0
,,0,limited_write,2021-01-14T12:45:00Z,0
,,0,limited_write,2021-01-14T12:50:00Z,0
,,0,limited_write,2021-01-14T12:55:00Z,0
,,0,limited_write,2021-01-14T13:00:00Z,0
,,0,limited_write,2021-01-14T13:05:00Z,0
,,0,limited_write,2021-01-14T13:10:00Z,0
,,0,limited_write,2021-01-14T13:15:00Z,0
,,0,limited_write,2021-01-14T13:20:00Z,0
,,0,limited_write,2021-01-14T13:25:00Z,0
,,0,limited_write,2021-01-14T13:30:00Z,0
,,0,limited_write,2021-01-14T13:35:00Z,0
,,0,limited_write,2021-01-14T13:40:00Z,0
,,0,limited_write,2021-01-14T13:45:00Z,0
,,0,limited_write,2021-01-14T13:50:00Z,0
,,0,limited_write,2021-01-14T13:55:00Z,0
,,0,limited_write,2021-01-14T14:00:00Z,0
,,0,limited_write,2021-01-14T14:05:00Z,0
,,0,limited_write,2021-01-14T14:10:00Z,0
,,0,limited_write,2021-01-14T14:15:00Z,0
,,0,limited_write,2021-01-14T14:20:00Z,0
,,0,limited_write,2021-01-14T14:25:00Z,0
,,0,limited_write,2021-01-14T14:30:00Z,0
,,0,limited_write,2021-01-14T14:35:00Z,0
,,0,limited_write,2021-01-14T14:40:00Z,0
,,0,limited_write,2021-01-14T14:45:00Z,0
,,0,limited_write,2021-01-14T14:50:00Z,0
,,0,limited_write,2021-01-14T14:55:00Z,0
,,0,limited_write,2021-01-14T15:00:00Z,0
,,0,limited_write,2021-01-14T15:05:00Z,0
,,0,limited_write,2021-01-14T15:10:00Z,0
,,0,limited_write,2021-01-14T15:15:00Z,0
,,0,limited_write,2021-01-14T15:20:00Z,0
,,0,limited_write,2021-01-14T15:25:00Z,0
,,0,limited_write,2021-01-14T15:30:00Z,0
,,0,limited_write,2021-01-14T15:35:00Z,0
,,0,limited_write,2021-01-14T15:40:00Z,0
,,0,limited_write,2021-01-14T15:45:00Z,0
,,0,limited_write,2021-01-14T15:50:00Z,0
,,0,limited_write,2021-01-14T15:55:00Z,0
,,0,limited_write,2021-01-14T16:00:00Z,0
,,0,limited_write,2021-01-14T16:05:00Z,0
,,0,limited_write,2021-01-14T16:10:00Z,0
,,0,limited_write,2021-01-14T16:15:00Z,0
,,0,limited_write,2021-01-14T16:20:00Z,0
,,0,limited_write,2021-01-14T16:25:00Z,0
,,0,limited_write,2021-01-14T16:30:00Z,0
,,0,limited_write,2021-01-14T16:35:00Z,0
,,0,limited_write,2021-01-14T16:40:00Z,0
,,0,limited_write,2021-01-14T16:45:00Z,0
,,0,limited_write,2021-01-14T16:50:00Z,0
,,0,limited_write,2021-01-14T16:55:00Z,0
,,0,limited_write,2021-01-14T17:00:00Z,0
,,0,limited_write,2021-01-14T17:05:00Z,0
,,0,limited_write,2021-01-14T17:10:00Z,0
,,0,limited_write,2021-01-14T17:15:00Z,0
,,0,limited_write,2021-01-14T17:20:00Z,0
,,0,limited_write,2021-01-14T17:25:00Z,0
,,0,limited_write,2021-01-14T17:30:00Z,0
,,0,limited_write,2021-01-14T17:35:00Z,0
,,0,limited_write,2021-01-14T17:40:00Z,0
,,0,limited_write,2021-01-14T17:45:00Z,0
,,0,limited_write,2021-01-14T17:50:00Z,0
,,0,limited_write,2021-01-14T17:55:00Z,0
,,0,limited_write,2021-01-14T18:00:00Z,0
,,0,limited_write,2021-01-14T18:05:00Z,0
,,0,limited_write,2021-01-14T18:10:00Z,0
,,0,limited_write,2021-01-14T18:15:00Z,0
,,0,limited_write,2021-01-14T18:20:00Z,0
,,0,limited_write,2021-01-14T18:25:00Z,0
,,0,limited_write,2021-01-14T18:30:00Z,0
,,0,limited_write,2021-01-14T18:35:00Z,0
,,0,limited_write,2021-01-14T18:40:00Z,0
,,0,limited_write,2021-01-14T18:45:00Z,0
,,0,limited_write,2021-01-14T18:50:00Z,0
,,0,limited_write,2021-01-14T18:55:00Z,0
,,0,limited_write,2021-01-14T19:00:00Z,0
,,0,limited_write,2021-01-14T19:05:00Z,0
,,0,limited_write,2021-01-14T19:10:00Z,0
,,0,limited_write,2021-01-14T19:15:00Z,0
,,0,limited_write,2021-01-14T19:20:00Z,0
,,0,limited_write,2021-01-14T19:25:00Z,0
,,0,limited_write,2021-01-14T19:30:00Z,0
,,0,limited_write,2021-01-14T19:35:00Z,0
,,0,limited_write,2021-01-14T19:40:00Z,0
,,0,limited_write,2021-01-14T19:45:00Z,0
,,0,limited_write,2021-01-14T19:50:00Z,0
,,0,limited_write,2021-01-14T19:55:00Z,0
,,0,limited_write,2021-01-14T20:00:00Z,0
,,0,limited_write,2021-01-14T20:05:00Z,0
,,0,limited_write,2021-01-14T20:10:00Z,0
,,0,limited_write,2021-01-14T20:15:00Z,0
,,0,limited_write,2021-01-14T20:20:00Z,0
,,0,limited_write,2021-01-14T20:25:00Z,0
,,0,limited_write,2021-01-14T20:30:00Z,0
,,0,limited_write,2021-01-14T20:35:00Z,0
,,0,limited_write,2021-01-14T20:40:00Z,0
,,0,limited_write,2021-01-14T20:45:00Z,0
,,0,limited_write,2021-01-14T20:50:00Z,0
,,0,limited_write,2021-01-14T20:55:00Z,0
,,0,limited_write,2021-01-14T21:00:00Z,0
,,0,limited_write,2021-01-14T21:05:00Z,0
,,0,limited_write,2021-01-14T21:10:00Z,0
,,0,limited_write,2021-01-14T21:15:00Z,0
,,0,limited_write,2021-01-14T21:20:00Z,0
,,0,limited_write,2021-01-14T21:25:00Z,0
,,0,limited_write,2021-01-14T21:30:00Z,0
,,0,limited_write,2021-01-14T21:35:00Z,0
,,0,limited_write,2021-01-14T21:40:00Z,0
,,0,limited_write,2021-01-14T21:45:00Z,0
,,0,limited_write,2021-01-14T21:50:00Z,0
,,0,limited_write,2021-01-14T21:55:00Z,0
,,0,limited_write,2021-01-14T22:00:00Z,0
,,0,limited_write,2021-01-14T22:05:00Z,0
,,0,limited_write,2021-01-14T22:10:00Z,0
,,0,limited_write,2021-01-14T22:15:00Z,0
,,0,limited_write,2021-01-14T22:20:00Z,0
,,0,limited_write,2021-01-14T22:25:00Z,15
,,0,limited_write,2021-01-14T22:30:00Z,45
,,0,limited_write,2021-01-14T22:35:00Z,45
,,0,limited_write,2021-01-14T22:40:00Z,45
,,0,limited_write,2021-01-14T22:45:00Z,45
,,0,limited_write,2021-01-14T22:50:00Z,45
,,0,limited_write,2021-01-14T22:55:00Z,45
,,0,limited_write,2021-01-14T23:00:00Z,42
,,0,limited_write,2021-01-14T23:05:00Z,45
,,0,limited_write,2021-01-14T23:10:00Z,45
,,0,limited_write,2021-01-14T23:15:00Z,45
,,0,limited_write,2021-01-14T23:20:00Z,45
,,0,limited_write,2021-01-14T23:25:00Z,45
,,0,limited_write,2021-01-14T23:30:00Z,45
,,0,limited_write,2021-01-14T23:35:00Z,45
,,0,limited_write,2021-01-14T23:40:00Z,45
,,0,limited_write,2021-01-14T23:45:00Z,45
,,0,limited_write,2021-01-14T23:50:00Z,45
,,0,limited_write,2021-01-14T23:55:00Z,45
,,0,limited_write,2021-01-15T00:00:00Z,45
,,0,limited_write,2021-01-15T00:05:00Z,45
,,0,limited_write,2021-01-15T00:10:00Z,45
,,0,limited_write,2021-01-15T00:15:00Z,45
,,0,limited_write,2021-01-15T00:20:00Z,45
,,0,limited_write,2021-01-15T00:25:00Z,45
,,0,limited_write,2021-01-15T00:30:00Z,45
,,0,limited_write,2021-01-15T00:35:00Z,45
,,0,limited_write,2021-01-15T00:40:00Z,45
,,0,limited_write,2021-01-15T00:45:00Z,45
,,0,limited_write,2021-01-15T00:50:00Z,45
,,0,limited_write,2021-01-15T00:55:00Z,45
,,0,limited_write,2021-01-15T01:00:00Z,45
,,0,limited_write,2021-01-15T01:05:00Z,45
,,0,limited_write,2021-01-15T01:10:00Z,45
,,0,limited_write,2021-01-15T01:15:00Z,45
,,0,limited_write,2021-01-15T01:20:00Z,45
,,0,limited_write,2021-01-15T01:25:00Z,45
,,0,limited_write,2021-01-15T01:30:00Z,45
,,0,limited_write,2021-01-15T01:35:00Z,26
,,0,limited_write,2021-01-15T01:40:00Z,0
,,0,limited_write,2021-01-15T01:45:00Z,0
,,0,limited_write,2021-01-15T01:50:00Z,0
,,0,limited_write,2021-01-15T01:55:00Z,0
,,0,limited_write,2021-01-15T02:00:00Z,0
,,0,limited_write,2021-01-15T02:05:00Z,0
,,0,limited_write,2021-01-15T02:10:00Z,0
,,0,limited_write,2021-01-15T02:15:00Z,0
,,0,limited_write,2021-01-15T02:20:00Z,0
,,0,limited_write,2021-01-15T02:25:00Z,0
,,0,limited_write,2021-01-15T02:30:00Z,0
,,0,limited_write,2021-01-15T02:35:00Z,0
,,0,limited_write,2021-01-15T02:40:00Z,0
,,0,limited_write,2021-01-15T02:45:00Z,0
,,0,limited_write,2021-01-15T02:50:00Z,0
,,0,limited_write,2021-01-15T02:55:00Z,0
,,0,limited_write,2021-01-15T03:00:00Z,0
,,0,limited_write,2021-01-15T03:05:00Z,0
,,0,limited_write,2021-01-15T03:10:00Z,0
,,0,limited_write,2021-01-15T03:15:00Z,0
,,0,limited_write,2021-01-15T03:20:00Z,0
,,0,limited_write,2021-01-15T03:25:00Z,0
,,0,limited_write,2021-01-15T03:30:00Z,0
,,0,limited_write,2021-01-15T03:35:00Z,0
,,0,limited_write,2021-01-15T03:40:00Z,0
,,0,limited_write,2021-01-15T03:45:00Z,0
,,0,limited_write,2021-01-15T03:50:00Z,0
,,0,limited_write,2021-01-15T03:55:00Z,0
,,0,limited_write,2021-01-15T04:00:00Z,0
,,0,limited_write,2021-01-15T04:05:00Z,0
,,0,limited_write,2021-01-15T04:10:00Z,0
,,0,limited_write,2021-01-15T04:15:00Z,0
,,0,limited_write,2021-01-15T04:20:00Z,0
,,0,limited_write,2021-01-15T04:25:00Z,0
,,0,limited_write,2021-01-15T04:30:00Z,0
,,0,limited_write,2021-01-15T04:35:00Z,0
,,0,limited_write,2021-01-15T04:40:00Z,0
,,0,limited_write,2021-01-15T04:45:00Z,0
,,0,limited_write,2021-01-15T04:50:00Z,0
,,0,limited_write,2021-01-15T04:55:00Z,0
,,0,limited_write,2021-01-15T05:00:00Z,0
,,0,limited_write,2021-01-15T05:05:00Z,0
,,0,limited_write,2021-01-15T05:10:00Z,0
,,0,limited_write,2021-01-15T05:15:00Z,0
,,0,limited_write,2021-01-15T05:20:00Z,0
,,0,limited_write,2021-01-15T05:25:00Z,0
,,0,limited_write,2021-01-15T05:30:00Z,0
,,0,limited_write,2021-01-15T05:35:00Z,0
,,0,limited_write,2021-01-15T05:40:00Z,0
,,0,limited_write,2021-01-15T05:45:00Z,0
,,0,limited_write,2021-01-15T05:50:00Z,0
,,0,limited_write,2021-01-15T05:55:00Z,0
,,0,limited_write,2021-01-15T06:00:00Z,0
,,0,limited_write,2021-01-15T06:05:00Z,0
,,0,limited_write,2021-01-15T06:10:00Z,0
,,0,limited_write,2021-01-15T06:15:00Z,0
,,0,limited_write,2021-01-15T06:20:00Z,0
,,0,limited_write,2021-01-15T06:25:00Z,0
,,0,limited_write,2021-01-15T06:30:00Z,0
,,0,limited_write,2021-01-15T06:35:00Z,0
,,0,limited_write,2021-01-15T06:40:00Z,0
,,0,limited_write,2021-01-15T06:45:00Z,0
,,0,limited_write,2021-01-15T06:50:00Z,0
,,0,limited_write,2021-01-15T06:55:00Z,0
,,0,limited_write,2021-01-15T07:00:00Z,0
,,0,limited_write,2021-01-15T07:05:00Z,0
,,0,limited_write,2021-01-15T07:10:00Z,0
,,0,limited_write,2021-01-15T07:15:00Z,0
,,0,limited_write,2021-01-15T07:20:00Z,0
,,0,limited_write,2021-01-15T07:25:00Z,0
,,0,limited_write,2021-01-15T07:30:00Z,0
,,0,limited_write,2021-01-15T07:35:00Z,0
,,0,limited_write,2021-01-15T07:40:00Z,0
,,0,limited_write,2021-01-15T07:45:00Z,0
,,0,limited_write,2021-01-15T07:50:00Z,0
,,0,limited_write,2021-01-15T07:55:00Z,0
,,0,limited_write,2021-01-15T08:00:00Z,0
,,0,limited_write,2021-01-15T08:05:00Z,0
,,0,limited_write,2021-01-15T08:10:00Z,0
,,0,limited_write,2021-01-15T08:15:00Z,0
,,0,limited_write,2021-01-15T08:20:00Z,0
,,0,limited_write,2021-01-15T08:25:00Z,0
,,0,limited_write,2021-01-15T08:30:00Z,0
,,0,limited_write,2021-01-15T08:35:00Z,0
,,0,limited_write,2021-01-15T08:40:00Z,0
,,0,limited_write,2021-01-15T08:45:00Z,0
,,0,limited_write,2021-01-15T08:50:00Z,0
,,0,limited_write,2021-01-15T08:55:00Z,0
,,0,limited_write,2021-01-15T09:00:00Z,0
,,0,limited_write,2021-01-15T09:05:00Z,0
,,0,limited_write,2021-01-15T09:10:00Z,0
,,0,limited_write,2021-01-15T09:15:00Z,0
,,0,limited_write,2021-01-15T09:20:00Z,0
,,0,limited_write,2021-01-15T09:25:00Z,0
,,0,limited_write,2021-01-15T09:30:00Z,0
,,0,limited_write,2021-01-15T09:35:00Z,0
,,0,limited_write,2021-01-15T09:40:00Z,0
,,0,limited_write,2021-01-15T09:45:00Z,0
,,0,limited_write,2021-01-15T09:50:00Z,0
,,0,limited_write,2021-01-15T09:55:00Z,0
,,0,limited_write,2021-01-15T10:00:00Z,0
,,0,limited_write,2021-01-15T10:05:00Z,0
,,0,limited_write,2021-01-15T10:10:00Z,0
,,0,limited_write,2021-01-15T10:15:00Z,0
,,0,limited_write,2021-01-15T10:20:00Z,0
,,0,limited_write,2021-01-15T10:25:00Z,0
,,0,limited_write,2021-01-15T10:30:00Z,0
,,0,limited_write,2021-01-15T10:35:00Z,0
,,0,limited_write,2021-01-15T10:40:00Z,0
,,0,limited_write,2021-01-15T10:45:00Z,0
,,0,limited_write,2021-01-15T10:50:00Z,0
,,0,limited_write,2021-01-15T10:55:00Z,0
,,0,limited_write,2021-01-15T11:00:00Z,0
,,0,limited_write,2021-01-15T11:05:00Z,0
,,0,limited_write,2021-01-15T11:10:00Z,0
,,0,limited_write,2021-01-15T11:15:00Z,0
,,0,limited_write,2021-01-15T11:20:00Z,0
,,0,limited_write,2021-01-15T11:25:00Z,0
,,0,limited_write,2021-01-15T11:30:00Z,0
,,0,limited_write,2021-01-15T11:35:00Z,0
,,0,limited_write,2021-01-15T11:40:00Z,0
,,0,limited_write,2021-01-15T11:45:00Z,0
,,0,limited_write,2021-01-15T11:50:00Z,0
,,0,limited_write,2021-01-15T11:55:00Z,0
,,0,limited_write,2021-01-15T12:00:00Z,0
,,0,limited_write,2021-01-15T12:05:00Z,0
,,0,limited_write,2021-01-15T12:10:00Z,0
,,0,limited_write,2021-01-15T12:15:00Z,0
,,0,limited_write,2021-01-15T12:20:00Z,0
,,0,limited_write,2021-01-15T12:25:00Z,0
,,0,limited_write,2021-01-15T12:30:00Z,0
,,0,limited_write,2021-01-15T12:35:00Z,0
,,0,limited_write,2021-01-15T12:40:00Z,0
,,0,limited_write,2021-01-15T12:45:00Z,0
,,0,limited_write,2021-01-15T12:50:00Z,0
,,0,limited_write,2021-01-15T12:55:00Z,0
,,0,limited_write,2021-01-15T13:00:00Z,0
,,0,limited_write,2021-01-15T13:05:00Z,0
,,0,limited_write,2021-01-15T13:10:00Z,0
,,0,limited_write,2021-01-15T13:15:00Z,0
,,0,limited_write,2021-01-15T13:20:00Z,0
,,0,limited_write,2021-01-15T13:25:00Z,0
,,0,limited_write,2021-01-15T13:30:00Z,0
,,0,limited_write,2021-01-15T13:35:00Z,6
,,0,limited_write,2021-01-15T13:40:00Z,0
,,0,limited_write,2021-01-15T13:45:00Z,0
,,0,limited_write,2021-01-15T13:50:00Z,0
,,0,limited_write,2021-01-15T13:55:00Z,0
,,0,limited_write,2021-01-15T14:00:00Z,0
,,0,limited_write,2021-01-15T14:05:00Z,0
,,0,limited_write,2021-01-15T14:10:00Z,0
,,0,limited_write,2021-01-15T14:15:00Z,0
,,0,limited_write,2021-01-15T14:20:00Z,0
,,0,limited_write,2021-01-15T14:25:00Z,0
,,0,limited_write,2021-01-15T14:30:00Z,0
,,0,limited_write,2021-01-15T14:35:00Z,0
,,0,limited_write,2021-01-15T14:40:00Z,0
,,0,limited_write,2021-01-15T14:45:00Z,0
,,0,limited_write,2021-01-15T14:50:00Z,0
,,0,limited_write,2021-01-15T14:55:00Z,0
,,0,limited_write,2021-01-15T15:00:00Z,0
,,0,limited_write,2021-01-15T15:05:00Z,0
,,0,limited_write,2021-01-15T15:10:00Z,0
,,0,limited_write,2021-01-15T15:15:00Z,0
,,0,limited_write,2021-01-15T15:20:00Z,0
,,0,limited_write,2021-01-15T15:25:00Z,0
,,0,limited_write,2021-01-15T15:30:00Z,0
,,0,limited_write,2021-01-15T15:35:00Z,0
,,0,limited_write,2021-01-15T15:40:00Z,0
,,0,limited_write,2021-01-15T15:45:00Z,0
,,0,limited_write,2021-01-15T15:50:00Z,0
,,0,limited_write,2021-01-15T15:55:00Z,0
,,0,limited_write,2021-01-15T16:00:00Z,0
,,0,limited_write,2021-01-15T16:05:00Z,0
,,0,limited_write,2021-01-15T16:10:00Z,0
,,0,limited_write,2021-01-15T16:15:00Z,0
,,0,limited_write,2021-01-15T16:20:00Z,0
,,0,limited_write,2021-01-15T16:25:00Z,0
,,0,limited_write,2021-01-15T16:30:00Z,0
,,0,limited_write,2021-01-15T16:35:00Z,0
,,0,limited_write,2021-01-15T16:40:00Z,0
,,0,limited_write,2021-01-15T16:45:00Z,0
,,0,limited_write,2021-01-15T16:50:00Z,0
,,0,limited_write,2021-01-15T16:55:00Z,0
,,0,limited_write,2021-01-15T17:00:00Z,0
,,0,limited_write,2021-01-15T17:05:00Z,0
,,0,limited_write,2021-01-15T17:10:00Z,0
,,0,limited_write,2021-01-15T17:15:00Z,0
,,0,limited_write,2021-01-15T17:20:00Z,33
,,0,limited_write,2021-01-15T17:25:00Z,0
,,0,limited_write,2021-01-15T17:30:00Z,27
,,0,limited_write,2021-01-15T17:35:00Z,45
,,0,limited_write,2021-01-15T17:40:00Z,45
,,0,limited_write,2021-01-15T17:45:00Z,45
,,0,limited_write,2021-01-15T17:50:00Z,45
,,0,limited_write,2021-01-15T17:55:00Z,45
,,0,limited_write,2021-01-15T18:00:00Z,30
,,0,limited_write,2021-01-15T18:05:00Z,45
,,0,limited_write,2021-01-15T18:10:00Z,45
,,0,limited_write,2021-01-15T18:15:00Z,45
,,0,limited_write,2021-01-15T18:20:00Z,45
,,0,limited_write,2021-01-15T18:25:00Z,45
,,0,limited_write,2021-01-15T18:30:00Z,45
,,0,limited_write,2021-01-15T18:35:00Z,45
,,0,limited_write,2021-01-15T18:40:00Z,45
,,0,limited_write,2021-01-15T18:45:00Z,45
,,0,limited_write,2021-01-15T18:50:00Z,45
,,0,limited_write,2021-01-15T18:55:00Z,45
,,0,limited_write,2021-01-15T19:00:00Z,45
,,0,limited_write,2021-01-15T19:05:00Z,45
,,0,limited_write,2021-01-15T19:10:00Z,45
,,0,limited_write,2021-01-15T19:15:00Z,45
,,0,limited_write,2021-01-15T19:20:00Z,45
,,0,limited_write,2021-01-15T19:25:00Z,45
,,0,limited_write,2021-01-15T19:30:00Z,45
,,0,limited_write,2021-01-15T19:35:00Z,45
,,0,limited_write,2021-01-15T19:40:00Z,45
,,0,limited_write,2021-01-15T19:45:00Z,45
,,0,limited_write,2021-01-15T19:50:00Z,45
,,0,limited_write,2021-01-15T19:55:00Z,45
,,0,limited_write,2021-01-15T20:00:00Z,45
,,0,limited_write,2021-01-15T20:05:00Z,45
,,0,limited_write,2021-01-15T20:10:00Z,45
,,0,limited_write,2021-01-15T20:15:00Z,45
,,0,limited_write,2021-01-15T20:20:00Z,45
,,0,limited_write,2021-01-15T20:25:00Z,45
,,0,limited_write,2021-01-15T20:30:00Z,45
,,0,limited_write,2021-01-15T20:35:00Z,45
,,0,limited_write,2021-01-15T20:40:00Z,45
,,0,limited_write,2021-01-15T20:45:00Z,45
,,0,limited_write,2021-01-15T20:50:00Z,45
,,0,limited_write,2021-01-15T20:55:00Z,45
,,0,limited_write,2021-01-15T21:00:00Z,45
,,0,limited_write,2021-01-15T21:05:00Z,45
,,0,limited_write,2021-01-15T21:10:00Z,45
,,0,limited_write,2021-01-15T21:15:00Z,45
,,0,limited_write,2021-01-15T21:20:00Z,45
,,0,limited_write,2021-01-15T21:25:00Z,45
,,0,limited_write,2021-01-15T21:30:00Z,45
,,0,limited_write,2021-01-15T21:35:00Z,45
,,0,limited_write,2021-01-15T21:40:00Z,46
,,0,limited_write,2021-01-15T21:45:00Z,45
,,0,limited_write,2021-01-15T21:50:00Z,45
,,0,limited_write,2021-01-15T21:55:00Z,45
,,0,limited_write,2021-01-15T22:00:00Z,45
,,0,limited_write,2021-01-15T22:01:46.746172314Z,18`,
    status: RemoteDataState.Done,
  }

  return makeResponse(200, history)
}
