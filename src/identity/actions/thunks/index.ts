// Actions
import {setQuartzMe, setQuartzMeStatus} from 'src/me/actions/creators'
import {
  setCurrentOrgDetails,
  setCurrentBillingProvider,
  setQuartzIdentity,
  setQuartzIdentityStatus,
  setDefaultOrg,
} from 'src/identity/actions/creators'
import {notify} from 'src/shared/actions/notifications'
import {
  accountDefaultSettingSuccess,
  accountDefaultSettingError,
  updateBillingFailed,
  updateIdentityFailed,
  updateOrgFailed,
} from 'src/shared/copy/notifications'

// Types
import {RemoteDataState, GetState, NotificationAction} from 'src/types'
import {Actions as MeActions} from 'src/me/actions/creators'
import {Actions as IdentityActions} from 'src/identity/actions/creators'
import {Dispatch} from 'redux'

type ActionTypes = IdentityActions | MeActions | NotificationAction

// Utilities
import {
  fetchQuartzIdentity,
  fetchAccountDetails,
  fetchOrgDetails,
  putDefaultQuartzOrg,
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
  dispatch: Dispatch<ActionTypes>,
  getState: GetState
) => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const currentState = getState()
    const accountId = currentState.identity.currentIdentity.account.id

    const accountDetails = await fetchAccountDetails(accountId)

    dispatch(setCurrentBillingProvider(accountDetails.billingProvider))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))
    const updatedState = getState()
    const legacyMe = convertIdentityToMe(updatedState.identity.currentIdentity)
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
    const orgId = state.identity.currentIdentity.org.id

    const orgDetails = await fetchOrgDetails(orgId)

    dispatch(setCurrentOrgDetails(orgDetails))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))

    const updatedState = getState()
    const legacyMe = convertIdentityToMe(updatedState.identity.currentIdentity)
    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
    dispatch(setQuartzMeStatus(RemoteDataState.Done))
  } catch (error) {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
    dispatch(notify(updateOrgFailed()))
  }
}

// First, update set in redux, then call this thunk
export const updateDefaultOrgThunk = newDefaultOrg => async (dispatch: any) => {
  try {
    // Dispatching some indication of loading here
    await putDefaultQuartzOrg(newDefaultOrg.id)
    dispatch(setDefaultOrg(newDefaultOrg.id))
    // Dispatch some indication of completion here - end of loading

    // Since we want affirmative UI input, dispatch a notification that
    dispatch(notify(accountDefaultSettingSuccess(newDefaultOrg.name)))
  } catch (err) {
    // Dispatch remote data state error here
    // Remember to include in quartzme for now
    dispatch(notify(accountDefaultSettingError(newDefaultOrg.name)))
    console.log(err)
  }

  // Dispatch a notification indicating that the update of the org failed
}
