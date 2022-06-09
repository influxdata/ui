// Libraries
import produce from 'immer'

import {
  Identity,
  IdentityUser,
  IdentityAccount,
  IdentityOrganization,
} from 'src/client/unityRoutes'
import {RemoteDataState} from 'src/types'

interface CurrentAccount extends IdentityAccount {
  // These are optional properties of the current account, which are not retrieved from identity.
  billingProvider?: string
}

interface CurrentOrg extends IdentityOrganization {
  // These are optional properties of the current org, which are not retrieved from identity.
  creationDate?: string
  description?: string
  isRegionBeta?: string
  provider?: string
  regionCode?: string
  regionName?: string
}

interface CurrentUser extends IdentityUser {
  // These are optional properties of the current user, which are not retrieved from identity.
}

// May need to extend user properties once profile page work begins.

interface CurrentIdentity {
  user: CurrentUser
  account: CurrentAccount
  org: CurrentOrg
}

export interface QuartzIdentityState {
  currentIdentity: CurrentIdentity
  status: RemoteDataState
}

// Actions
import {
  Actions,
  SET_QUARTZ_IDENTITY,
  SET_QUARTZ_IDENTITY_STATUS,
  SET_CURRENT_BILLING_PROVIDER,
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
      // Remove currentOrgDetails and currentAccount details, let's keep them in one object.

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
      case SET_CURRENT_BILLING_PROVIDER: {
        draftState.currentIdentity.account.billingProvider =
          action.billingProvider
        return
      }
    }
  })
