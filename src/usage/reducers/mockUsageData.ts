import {RemoteDataState} from 'src/types'
import {Account, BillingDate, History} from 'src/types/billing'

export const mockAccount: Account = {
  status: RemoteDataState.Done,
  id: 100,
  balance: 100,
  billingContact: {},
  deletable: false,
  marketplaceSubscription: {},
  type: 'free',
  updatedAt: '01/01/2021',
  users: [],
  pricingVersion: 4,
  zuoraAccountId: 'z-id-me',
}

export const mockBillingStart: BillingDate = {
  date: '01/01/2021',
  time: '1/20/2021, 3:15:00 PM',
  status: RemoteDataState.Done,
}

export const mockHistory: History = {
  status: RemoteDataState.Done,
  rateLimits: `#group,false,false,true,false,false
#datatype,string,long,string,dateTime:RFC3339,long
#default,limits,,,,
,result,table,_field,_time,_value
,,0,limited_write,2021-01-13T22:05:00Z,0`,
  billingStats: `#group,false,false,true,true,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,long
#default,query_count,,,,
,result,table,_start,_stop,query_count
,,0,2021-01-13T22:00:24.064007058Z,2021-01-15T22:00:24.064007058Z,1954`,
  usageStats: `#group,false,false,true,false,false
#datatype,string,long,string,dateTime:RFC3339,long
#default,limits,,,,
,result,table,_field,_time,_value
,,0,limited_write,2021-01-13T22:05:00Z,0`,
}
