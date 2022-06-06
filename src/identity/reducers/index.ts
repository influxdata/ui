// Libraries
import produce from 'immer'

// Actions
import {Actions, SET_QUARTZ_IDENTITY} from 'src/identity/actions/creators'

import {Account, Identity, Organization} from 'src/client/unityRoutes'

// Types
// import {getIdentity} from 'src/client/unityRoutes'

import {RemoteDataState} from 'src/types'

// export interface MeLinks {
//   self: string
//   log: string
// }

export interface QuartzIdentityState {
  currentIdentity: Identity
  currentAccountDetails: Account
  currentOrgDetails: Organization
}

export const initialState: QuartzIdentityState = {
  currentIdentity: {
    user: {
      accountCount: 0,
      email: '',
      firstName: '',
      id: '',
      lastName: '',
      operatorRole: null,
      orgCount: 0,
    },
    org: {
      clusterHost: '',
      id: '',
      name: '',
    },
    account: {
      accountCreatedAt: '',
      id: 0,
      name: '',
      type: 'free',
    },
  },
  currentAccountDetails: {
    billing_provider: 'zuora',
    id: null,
    name: '',
    type: 'free',
  },
  currentOrgDetails: {
    clusterHost: '',
    creationDate: '',
    description: '',
    id: '',
    isRegionBeta: false,
    name: '',
    provider: '',
    regionCode: '',
    regionName: '',
  },
}

export default (state = initialState, action: Actions): QuartzIdentityState =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_QUARTZ_IDENTITY: {
        draftState.currentIdentity = action.identity.currentIdentity
        draftState.currentOrgDetails = action.identity.currentOrgDetails
        draftState.currentAccountDetails = action.identity.currentAccountDetails
        return
      }
    }
  })
