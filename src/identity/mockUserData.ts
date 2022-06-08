import {QuartzIdentityState} from 'src/identity/reducers'
import {RemoteDataState} from 'src/types'
// import {Identity} from 'src/client/unityRoutes'
// import {Account} from 'src/client/unityRoutes'
// import {Organization} from 'src/client/unityRoutes'

// // export interface QuartzIdentityState {
// //   currentIdentity: Identity
// //   currentAccountDetails: Account
// //   currentOrgDetails: Organization
// //   status: RemoteDataState

// // export interface IdentityUser {
// //   id: string
// //   email: string
// //   firstName?: string
// //   lastName?: string
// //   operatorRole?: 'read-only' | 'read-write'
// //   accountCount: number
// //   orgCount: number
// // }

// // export interface IdentityAccount {
// //   id: number
// //   name: string
// //   type: AccountType
// //   accountCreatedAt: string
// //   paygCreditStartDate?: string
// // }

// // export interface IdentityOrganization {
// //   id: string
// //   name: string
// //   clusterHost: string
// // }

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
        clusterHost: 'https://twodotoh-dev-testco.remocal.influxdev.co',
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
      clusterHost: 'https://twodotoh-dev-testco.remocal.influxdev.co',
      creationDate: '2022-06-08T16:59:44.827046Z',
      description: null,
      id: '89d20c01076ba140',
      isRegionBeta: false,
      name: 'pairingfakeemail@influxdata.com',
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
        clusterHost: 'https://twodotoh-dev-boconnell.remocal.influxdev.co',
        id: '89d20c01076ba140',
        name: 'pairingfakeemail@influxdata.com',
      },
      user: {
        accountCount: 1,
        email: 'pairingfakeemail@influxdata.com',
        firstName: 'Pairing',
        id: '04a1757b8987d0c3',
        lastName: 'Exercise',
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
      name: 'pairingfakeemail@influxdata.com',
      provider: 'AWS',
      regionCode: 'aws-local',
      regionName: 'AWS Local',
    },
    status: RemoteDataState.Done,
  },
]
