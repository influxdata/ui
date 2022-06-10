// Libraries
import produce from 'immer'

import {
  IdentityUser,
  IdentityAccount,
  IdentityOrganization,
  Me,
} from 'src/client/unityRoutes'
import {RemoteDataState} from 'src/types'

interface CurrentAccount extends IdentityAccount {
  // These are optional properties of the current account, which are not retrieved from identity.
  billingProvider?: 'zuora' | 'aws' | 'gcm' | 'azure'
}

interface CurrentOrg extends IdentityOrganization {
  // These are optional properties of the current org, which are not retrieved from identity.
  creationDate?: string
  description?: string
  isRegionBeta?: boolean
  provider?: string
  regionCode?: string
  regionName?: string
}

interface CurrentUser extends IdentityUser {
  // These are optional properties of the current user, which are not retrieved from identity.
}

// May need to extend user properties once profile page work begins.

export interface CurrentIdentity {
  user: CurrentUser
  account: CurrentAccount
  org: CurrentOrg
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
        draftState.currentIdentity = action.identity.currentIdentity
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

      case SET_CURRENT_ORG_DETAILS: {
        // This could be shortened with an alias, but adhere to immer pattern for now.
        draftState.currentIdentity.org.creationDate = action.org.creationDate
        draftState.currentIdentity.org.description = action.org.description
        draftState.currentIdentity.org.isRegionBeta = action.org.isRegionBeta
        draftState.currentIdentity.org.provider = action.org.provider
        draftState.currentIdentity.org.regionCode = action.org.regionCode
        draftState.currentIdentity.org.regionName = action.org.regionName
        return
      }
    }
  })
