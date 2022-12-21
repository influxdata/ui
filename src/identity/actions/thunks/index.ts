// Actions
import {
  setCurrentOrgDetails,
  setCurrentBillingProvider,
  setQuartzIdentity,
  setQuartzIdentityStatus,
  setCurrentBillingProviderStatus,
  setCurrentOrgDetailsStatus,
} from 'src/identity/actions/creators'

// Selectors
import {selectCurrentIdentity} from 'src/identity/selectors'

// Types
import {RemoteDataState, GetState, NotificationAction} from 'src/types'
import {Actions as IdentityActions} from 'src/identity/actions/creators'
import {Dispatch} from 'redux'

type ActionTypes = IdentityActions | NotificationAction

// Utilities
import {fetchQuartzIdentity} from 'src/identity/apis/auth'
import {fetchAccountDetails} from 'src/identity/apis/account'
import {fetchOrgDetails} from 'src/identity/apis/org'

// Error Reporting
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

// This function, which lets the caller handle the error
// is used by the authentication flow in the top of the app
export const getQuartzIdentityThunkNoErrorHandling =
  () => async (dispatch: Dispatch<any>) => {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const quartzIdentity = await fetchQuartzIdentity()

    dispatch(setQuartzIdentity(quartzIdentity))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))
  }

export const getQuartzIdentityThunk =
  () => async (dispatch: Dispatch<any>, getState: GetState) => {
    try {
      const identityThunk = getQuartzIdentityThunkNoErrorHandling()
      await identityThunk(dispatch)
    } catch (err) {
      dispatch(setQuartzIdentityStatus(RemoteDataState.Error))

      reportErrorThroughHoneyBadger(err, {
        name: 'Failed to fetch /quartz/identity',
        context: {state: getState()},
      })
    }
  }

export const getBillingProviderThunk =
  () => async (dispatch: Dispatch<ActionTypes>, getState: GetState) => {
    try {
      dispatch(setCurrentBillingProviderStatus(RemoteDataState.Loading))

      const currentState = getState()
      const accountId = currentState.identity.currentIdentity.account.id

      const accountDetails = await fetchAccountDetails(accountId)

      dispatch(setCurrentBillingProvider(accountDetails.billingProvider))
      dispatch(setCurrentBillingProviderStatus(RemoteDataState.Done))
    } catch (err) {
      dispatch(setCurrentBillingProviderStatus(RemoteDataState.Error))

      reportErrorThroughHoneyBadger(err, {
        name: 'Failed to fetch /quartz/accounts/',
        context: {state: getState()},
      })
    }
  }

export const getCurrentOrgDetailsThunk =
  (orgId: string) => async (dispatch: any, getState: GetState) => {
    try {
      dispatch(setCurrentOrgDetailsStatus(RemoteDataState.Loading))

      const orgDetails = await fetchOrgDetails(orgId)

      dispatch(setCurrentOrgDetails(orgDetails))
      dispatch(setCurrentOrgDetailsStatus(RemoteDataState.Done))

      return orgDetails
    } catch (err) {
      dispatch(setCurrentOrgDetailsStatus(RemoteDataState.Error))

      const state = getState()
      const identity = selectCurrentIdentity(state)

      reportErrorThroughHoneyBadger(err, {
        name: 'Failed to fetch /quartz/orgs/:orgId',
        context: {identity},
      })
      throw new Error(err)
    }
  }
