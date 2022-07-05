// Libraries
import produce from 'immer'

import {CurrentIdentity} from '../apis/auth'
import {RemoteDataState} from 'src/types'

// Actions
import {
  Actions,
  SET_QUARTZ_IDENTITY,
  SET_QUARTZ_IDENTITY_STATUS,
  SET_CURRENT_BILLING_PROVIDER,
  SET_CURRENT_ORG_DETAILS,
  SET_DEFAULT_ORG,
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
        draftState.org = action.org
        return
      }

      // I think we need some new piece of state in orgs for tracking the current default org
      // And maybe a reference to that org.

      case SET_DEFAULT_ORG: {
        const fakeOrgMock = {
          identity: {
            user: '',
            org: '',
            account: '',
          },
          quartzOrganizations: {
            orgs: [
              {id: '1', name: 'AAAAA', isDefault: true, isActive: true},
              {id: '2', name: 'BBBBB', isDefault: false, isActive: false},
              {id: '3', name: 'CCCCC', isDefault: false, isActive: false},
              {id: '4', name: 'DDDD', isDefault: false, isActive: false},
            ],
          },
        }

        // We should be storing this somewhere.
        const oldDefaultOrgId = fakeOrgMock.quartzOrganizations.orgs.find(
          el => el.isDefault === true
        ).id

        let foundBoth = 0

        for (let i = 0; i < fakeOrgMock.quartzOrganizations.orgs.length; i++) {
          if (foundBoth === 2) {
            break
          }

          const currentOrg = fakeOrgMock.quartzOrganizations.orgs[i]

          if (currentOrg.id === action.newDefaultOrgId) {
            foundBoth++
            currentOrg.isDefault = true
          }
          if (currentOrg.id === oldDefaultOrgId) {
            foundBoth++
            if (currentOrg.id !== action.newDefaultOrgId) {
              currentOrg.isDefault = false
            }
          }
        }

        return
      }
    }
  })
