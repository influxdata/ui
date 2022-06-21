import {GetState} from 'src/types'

// Actions
import {setQuartzMe, setQuartzMeStatus} from 'src/me/actions/creators'
import {
  setCurrentOrgDetails,
  setCurrentBillingProvider,
  setQuartzIdentity,
  setQuartzIdentityStatus,
} from 'src/identity/actions/creators'
import {notify} from 'src/shared/actions/notifications'
import {
  updateBillingFailed,
  updateIdentityFailed,
  updateOrgFailed,
} from 'src/shared/copy/notifications'

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

    const legacyMe = convertIdentityToMe(quartzIdentity)
    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
    dispatch(setQuartzMeStatus(RemoteDataState.Done))
  } catch (error) {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
    dispatch(notify(updateIdentityFailed()))
  }
}

export const getBillingProviderThunk = () => async (
  dispatch: any,
  getState: GetState
) => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const currentState = getState()
    const accountId = currentState.identity.account.id

    const accountDetails = await fetchAccountDetails(accountId)

    dispatch(setCurrentBillingProvider(accountDetails.billingProvider))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))
    const updatedState = getState()
    const legacyMe = convertIdentityToMe(updatedState.identity)
    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
    dispatch(setQuartzMeStatus(RemoteDataState.Done))
  } catch (error) {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
    dispatch(notify(updateBillingFailed()))
  }
}

export const getCurrentOrgDetailsThunk = () => async (
  dispatch: any,
  getState: GetState
) => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const state = getState()
    const orgId = state.identity.org.id

    const orgDetails = await fetchOrgDetails(orgId)

    dispatch(setCurrentOrgDetails(orgDetails))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))

    const updatedState = getState()
    const legacyMe = convertIdentityToMe(updatedState.identity)
    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
    dispatch(setQuartzMeStatus(RemoteDataState.Done))
  } catch (error) {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
    dispatch(notify(updateOrgFailed()))
  }
}
