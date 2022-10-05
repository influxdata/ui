// Libraries
import produce from 'immer'

import {CurrentIdentity} from 'src/identity/apis/auth'
import {RemoteDataState} from 'src/types'

// Actions
import {
  Actions,
  SET_QUARTZ_IDENTITY,
  SET_QUARTZ_IDENTITY_STATUS,
  SET_CURRENT_BILLING_PROVIDER,
  SET_CURRENT_BILLING_PROVIDER_STATUS,
  SET_CURRENT_ORG_DETAILS,
  SET_CURRENT_ORG_DETAILS_STATUS,
  SET_CURRENT_IDENTITY_ACCOUNT_NAME,
} from 'src/identity/actions/creators'

export const initialState: CurrentIdentity = {
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
    isUpgradeable: false,
  },
  loadingStatus: {
    identityStatus: RemoteDataState.NotStarted,
    billingStatus: RemoteDataState.NotStarted,
    orgDetailsStatus: RemoteDataState.NotStarted,
  },
}

export default (state = initialState, action: Actions): CurrentIdentity =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_QUARTZ_IDENTITY: {
        const {account, org, user} = action.identity

        // Store account information from /identity in state.
        draftState.account.accountCreatedAt = account.accountCreatedAt
        draftState.account.id = account.id
        draftState.account.isUpgradeable = account.isUpgradeable
        draftState.account.name = account.name
        draftState.account.paygCreditStartDate = account.paygCreditStartDate
        draftState.account.type = account.type

        // Store org information from /identity in state.
        draftState.org.clusterHost = org.clusterHost
        draftState.org.id = org.id
        draftState.org.name = org.name

        // Store user information from /identity in state.
        draftState.user.accountCount = user.accountCount
        draftState.user.email = user.email
        draftState.user.firstName = user.firstName
        draftState.user.id = user.id
        draftState.user.lastName = user.lastName
        draftState.user.operatorRole = user.operatorRole
        draftState.user.orgCount = user.orgCount
        return
      }

      case SET_QUARTZ_IDENTITY_STATUS: {
        draftState.loadingStatus.identityStatus = action.status
        return
      }
      case SET_CURRENT_BILLING_PROVIDER: {
        draftState.account.billingProvider = action.billingProvider
        return
      }

      case SET_CURRENT_BILLING_PROVIDER_STATUS: {
        draftState.loadingStatus.billingStatus = action.status
        return
      }

      case SET_CURRENT_ORG_DETAILS: {
        draftState.org = action.org
        return
      }

      case SET_CURRENT_ORG_DETAILS_STATUS: {
        draftState.loadingStatus.orgDetailsStatus = action.status
        return
      }

      case SET_CURRENT_IDENTITY_ACCOUNT_NAME: {
        if (draftState.account.id === action.account.id) {
          draftState.account.name = action.account.name
        }
        return
      }
    }
  })
