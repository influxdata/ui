import {CurrentIdentity} from 'src/identity/apis/auth'
import {CurrentOrg} from 'src/identity/apis/org'
import {BillingProvider, RemoteDataState} from 'src/types'

export const mockBillingProviders: BillingProvider[] = [
  'zuora',
  'aws',
  'gcm',
  'azure',
]

export const mockIdentities: CurrentIdentity[] = [
  {
    account: {
      accountCreatedAt: '2022-06-08T16:59:37.939531Z',
      id: 1,
      name: 'TestCo',
      paygCreditStartDate: null,
      type: 'free',
      isUpgradeable: true,
    },
    org: {
      clusterHost: 'https://fakehost.fakehost.fake',
      id: '89d20c01076ba140',
      name: 'fakeemail@influxdata.com',
    },
    user: {
      accountCount: 1,
      email: 'fakeemail@influxdata.com',
      firstName: 'Fake',
      id: '04a1757b8987d0c3',
      lastName: 'Name',
      operatorRole: null,
      orgCount: 1,
    },
    loadingStatus: {
      identityStatus: RemoteDataState.NotStarted,
      billingStatus: RemoteDataState.NotStarted,
      orgDetailsStatus: RemoteDataState.NotStarted,
    },
  },
  {
    account: {
      accountCreatedAt: '2022-06-010T16:59:37.939531Z',
      id: 2,
      name: 'TestCo 2',
      paygCreditStartDate: null,
      type: 'contract',
      isUpgradeable: false,
    },
    org: {
      clusterHost: 'https://newhost.newhost.new',
      id: '89d20c01076ba140',
      name: 'newemaill@influxdata.com',
    },
    user: {
      accountCount: 4,
      email: 'newemail@influxdata.com',
      firstName: 'New',
      id: '08a1757b8987d0c3',
      lastName: 'User',
      operatorRole: null,
      orgCount: 3,
    },
    loadingStatus: {
      identityStatus: RemoteDataState.NotStarted,
      billingStatus: RemoteDataState.NotStarted,
      orgDetailsStatus: RemoteDataState.NotStarted,
    },
  },
  {
    account: {
      accountCreatedAt: '2022-06-01T16:59:37.939531Z',
      id: 3,
      name: 'Test Name 3',
      paygCreditStartDate: null,
      type: 'pay_as_you_go',
      isUpgradeable: false,
    },
    org: {
      clusterHost: 'https://testdomain.testdomain.org',
      id: '72d20c01076ba140',
      name: 'testname3@influxdata.com',
    },
    user: {
      accountCount: 1,
      email: 'testemail3@influxdata.com',
      firstName: 'Test',
      id: '04a1757b8987d0c3',
      lastName: 'Email',
      operatorRole: null,
      orgCount: 5,
    },
    loadingStatus: {
      identityStatus: RemoteDataState.NotStarted,
      billingStatus: RemoteDataState.NotStarted,
      orgDetailsStatus: RemoteDataState.NotStarted,
    },
  },
]

export const mockOrgDetailsArr: CurrentOrg[] = [
  {
    clusterHost: 'https://fakehost.fakehost.fake',
    creationDate: '2022-06-08T16:59:44.827046Z',
    description: null,
    id: '89d20c01076ba140',
    name: 'fakeemail@influxdata.com',
    provider: 'Azure',
    regionCode: 'azure-local',
    regionName: 'Azure Local',
  },
  {
    clusterHost: 'https://newhost.new.new',
    creationDate: '2022-06-10T16:59:44.827046Z',
    description: null,
    id: '72d20c01076ba120',
    name: 'newemail@influxdata.com',
    provider: 'AWS',
    regionCode: 'aws-local',
    regionName: 'AWS Local',
  },
  {
    clusterHost: 'https://oldhost.oldhost.old',
    creationDate: '2022-06-04T16:59:44.827046Z',
    description: null,
    id: '59d20c01076be140',
    name: 'newemail@influxdata.com',
    provider: 'GCP',
    regionCode: 'gcp-local',
    regionName: 'GCP Local',
  },
  {
    clusterHost: 'https://temphost.temphost.temp',
    creationDate: '2022-06-02T16:59:44.827046Z',
    description: null,
    id: '64d20c01076be140',
    name: 'newemail@influxdata.com',
    provider: 'AWS',
    regionCode: 'aws-local',
    regionName: 'AWS Local',
  },
]
