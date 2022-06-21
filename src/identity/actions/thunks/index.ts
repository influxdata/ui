import {GetState} from 'src/types'
import {Dispatch} from 'react'

// Actions
import {
  setQuartzMe,
  setQuartzMeStatus,
  Actions as MeActions,
} from 'src/me/actions/creators'
import {
  setCurrentOrgDetails,
  setCurrentBillingProvider,
  setQuartzIdentity,
  setQuartzIdentityStatus,
  Actions as IdentityActions,
} from 'src/identity/actions/creators'

// Types
import {RemoteDataState} from 'src/types'

// Utilities
import {
  fetchQuartzIdentity,
  fetchAccountDetails,
  fetchOrgDetails,
} from 'src/identity/apis/auth'
import {convertIdentityToMe} from 'src/identity/utils/convertIdentityToMe'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Thunks
import {getQuartzMeThunk} from 'src/me/actions/thunks'

export const getQuartzIdentityThunk = () => async dispatch => {
  if (!isFlagEnabled('quartzIdentity')) {
    dispatch(getQuartzMeThunk())
    return
  }

  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const quartzIdentity = await fetchQuartzIdentity()

    dispatch(setQuartzIdentity(quartzIdentity))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))

    console.log('Quartz identity has been updated.')
    const legacyMe = convertIdentityToMe(quartzIdentity)
    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
    dispatch(setQuartzMeStatus(RemoteDataState.Done))
  } catch (error) {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
    console.error(error)
  }
}

export const getBillingProviderThunk = () => async (
  dispatch: Dispatch<IdentityActions | MeActions>,
  getState: GetState
) => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const currentState = getState()
    const accountId = currentState.identity.account.id

    const accountDetails = await fetchAccountDetails(accountId)

    dispatch(setCurrentBillingProvider(accountDetails.billingProvider))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))
    console.log('billingProvider has been updated.')
    const updatedState = getState()
    const legacyMe = convertIdentityToMe(updatedState.identity)
    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
    dispatch(setQuartzMeStatus(RemoteDataState.Done))
  } catch (error) {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
    console.error(error)
  }
}

export const getCurrentOrgDetailsThunk = () => async (
  dispatch: Dispatch<IdentityActions | MeActions>,
  getState: GetState
) => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const state = getState()
    const orgId = state.identity.org.id

    const orgDetails = await fetchOrgDetails(orgId)

    dispatch(setCurrentOrgDetails(orgDetails))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))
    console.log('Organization details have been updated.')

    const updatedState = getState()
    const legacyMe = convertIdentityToMe(updatedState.identity)
    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
    dispatch(setQuartzMeStatus(RemoteDataState.Done))
  } catch (error) {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
    console.error(error)
  }
}
