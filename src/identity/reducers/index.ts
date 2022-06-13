// Libraries
import produce from 'immer'

import {IdentityUser, IdentityAccount} from 'src/client/unityRoutes'
import {RemoteDataState} from 'src/types'

export interface CurrentAccount extends IdentityAccount {
  // These are optional properties of the current account, which are not retrieved from identity.
  billingProvider?: 'zuora' | 'aws' | 'gcm' | 'azure'
}

export interface CurrentOrg {
  // These are optional properties of the current org, which are not retrieved from identity.
  // Typing this here is required because different properties are optional in state
  // than are optional when retrieved from each endpoint.
  id: string
  clusterHost: string
  name?: string
  creationDate?: string
  description?: string
  isRegionBeta?: boolean
  provider?: string
  regionCode?: string
  regionName?: string
}

export interface CurrentUser extends IdentityUser {
  // These are optional properties of the current user, which are not retrieved from identity.
}

// May need to extend user properties once profile page work begins.

export interface CurrentIdentity {
  user: CurrentUser
  account: CurrentAccount
  org: CurrentOrg
  status?: RemoteDataState
}

// Actions
import {
  Actions,
  SET_QUARTZ_IDENTITY,
  SET_QUARTZ_IDENTITY_STATUS,
  SET_CURRENT_BILLING_PROVIDER,
  SET_CURRENT_ORG_DETAILS,
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
  },
  status: RemoteDataState.NotStarted,
}

export default (state = initialState, action: Actions): CurrentIdentity =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_QUARTZ_IDENTITY: {
        const {account, org, user} = action.identity

        // Store account information from /identity in state.
        draftState.account.accountCreatedAt = account.accountCreatedAt
        draftState.account.id = account.id
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

        draftState = action.identity
        draftState.status = RemoteDataState.Done
        return
      }
      case SET_QUARTZ_IDENTITY_STATUS: {
        draftState.status = action.status
        return
      }
      case SET_CURRENT_BILLING_PROVIDER: {
        draftState.account.billingProvider = action.billingProvider
        return
      }

      case SET_CURRENT_ORG_DETAILS: {
        // draftState.org.id = action.org.id
        // draftState.org.name = action.org.name
        // draftState.org.clusterHost = action.org.clusterHost

        // draftState.org.creationDate = action.org.creationDate
        // draftState.org.description = action.org.description
        // draftState.org.isRegionBeta = action.org.isRegionBeta
        // draftState.org.provider = action.org.provider
        // draftState.org.regionCode = action.org.regionCode
        // draftState.org.regionName = action.org.regionName
        draftState.org = action.org

        return
      }
    }
  })
