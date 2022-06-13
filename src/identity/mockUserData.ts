import {CurrentIdentity, CurrentOrg} from 'src/identity/reducers'

export type BillingProvider = 'zuora' | 'aws' | 'gcm' | 'azure'

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
  },
]

export const mockOrgDetailsArr: CurrentOrg[] = [
  {
    clusterHost: 'https://fakehost.fakehost.fake',
    creationDate: '2022-06-08T16:59:44.827046Z',
    description: null,
    isRegionBeta: false,
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
    isRegionBeta: true,
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
    isRegionBeta: false,
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
    isRegionBeta: true,
    id: '64d20c01076be140',
    name: 'newemail@influxdata.com',
    provider: 'AWS',
    regionCode: 'aws-local',
    regionName: 'AWS Local',
  },
]
