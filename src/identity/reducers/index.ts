// Libraries
import produce from 'immer'

import {Identity, Account, Organization} from 'src/client/unityRoutes'

import {RemoteDataState} from 'src/types'

export interface QuartzIdentityState {
  currentIdentity: Identity
  currentAccountDetails: Account
  currentOrgDetails: Organization
  status: RemoteDataState
}

// Actions
import {
  Actions,
  SET_QUARTZ_IDENTITY,
  SET_QUARTZ_IDENTITY_STATUS,
} from 'src/identity/actions/creators'

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
      id: 0,
      name: '',
      type: 'free',
      accountCreatedAt: '',
      paygCreditStartDate: '',
    },
  },
  currentAccountDetails: {
    billing_provider: 'zuora',
    id: 0,
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
  status: RemoteDataState.NotStarted,
}

export default (state = initialState, action: Actions): QuartzIdentityState =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_QUARTZ_IDENTITY: {
        draftState.currentIdentity = action.identity.currentIdentity
        draftState.currentOrgDetails = action.identity.currentOrgDetails
        draftState.currentAccountDetails = action.identity.currentAccountDetails
        draftState.status = RemoteDataState.Done
        return
      }
      case SET_QUARTZ_IDENTITY_STATUS: {
        draftState.status = action.status
        return
      }
    }
  })
