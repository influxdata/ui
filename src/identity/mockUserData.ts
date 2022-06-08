import {QuartzIdentityState} from 'src/identity/reducers'
import {RemoteDataState} from 'src/types'

export const mockIdentities: QuartzIdentityState[] = [
  {
    currentIdentity: {
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
    currentAccountDetails: {
      billing_provider: null,
      id: 1,
      name: 'TestCo',
      type: 'free',
    },
    currentOrgDetails: {
      clusterHost: 'https://fakehost.fakehost.fake',
      creationDate: '2022-06-08T16:59:44.827046Z',
      description: null,
      id: '89d20c01076ba140',
      isRegionBeta: false,
      name: 'fakeemail@influxdata.com',
      provider: 'AWS',
      regionCode: 'aws-local',
      regionName: 'AWS Local',
    },
    status: RemoteDataState.Done,
  },
  {
    currentIdentity: {
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
    currentAccountDetails: {
      billing_provider: null,
      id: 1,
      name: 'TestCo',
      type: 'free',
    },
    currentOrgDetails: {
      clusterHost: 'https://twodotoh-dev-boconnell.remocal.influxdev.co',
      creationDate: '2022-06-08T16:59:44.827046Z',
      description: null,
      id: '89d20c01076ba140',
      isRegionBeta: false,
      name: 'fakeemail@influxdata.com',
      provider: 'AWS',
      regionCode: 'aws-local',
      regionName: 'AWS Local',
    },
    status: RemoteDataState.Done,
  },
]
