// Functions making API calls
import {
  getAccount,
  getIdentity,
  getOrg,
  Identity,
  Me,
} from 'src/client/unityRoutes'

import {cloneDeep} from 'lodash'
import {GetState} from 'src/types'

// Actions
import {
  setCurrentOrgDetails,
  setCurrentBillingProvider,
  setQuartzIdentity,
  setQuartzIdentityStatus,
  // I think this should really be changed throughout to be action
  // Compare to other files where getState was called.
  Actions,
  // Actions,
} from 'src/identity/actions/creators'
import {setQuartzMeStatus, setQuartzMe} from 'src/me/actions/creators'

// Types
import {RemoteDataState} from 'src/types'

// Utilities
import {convertIdentityToMe} from 'src/identity/utils/convertIdentityToMe'

export const getQuartzIdentityThunk = () => async dispatch => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const quartzIdentity = await getIdentity({})

    if (quartzIdentity.status !== 200) {
      throw new Error(quartzIdentity.data.message)
    }

    const identityDispatch = {
      currentIdentity: quartzIdentity.data,
      status: RemoteDataState.Loading,
    }

    dispatch(setQuartzIdentity(identityDispatch, RemoteDataState.Done))
    const legacyMe = convertIdentityToMe(quartzIdentity.data)

    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
    dispatch(setQuartzMeStatus(RemoteDataState.Done))
  } catch (error) {
    console.error(error)

    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}

// For now, billingProvider is the only account data not already provided by /identity.
// If this changes, may need to expand this thunk and associated reducer.
export const getBillingProviderThunk = () => async (
  dispatch: any,
  getState: GetState
) => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))
    const initialState = getState()

    // /identity returns account ID as number, but getAccount expects ID as a string.
    const accountIdString = initialState?.identity?.currentIdentity?.account?.id.toString()

    const accountDetails = await getAccount({
      accountId: accountIdString,
    })

    if (accountDetails.status !== 200) {
      throw new Error(accountDetails.data.message)
    }

    // Resolve openAPI issue ith billingProvider versus billing_provider.
    dispatch(setCurrentBillingProvider(accountDetails.data.billingProvider))
    const updatedState = getState()
    const legacyMe = convertIdentityToMe(updatedState.identity.currentIdentity)
    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))

    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))
  } catch (err) {
    console.log(err)
  }
}

// Same - need to change/fix types here

// So, this is a little silly, because it's actually mandatory for us to invoke this logic and ping this endpoint once
// whenever logging into the app. So I would just move this information over to /identity.
// Note to self: add this to Miro diagram.

export const getCurrentOrgDetailsThunk = () => async (
  // I think we only need one action imported here
  dispatch: any,
  getState: GetState
) => {
  dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

  const state = getState()

  const orgId = state?.identity?.currentIdentity?.org?.id
  const orgDetails = await getOrg({
    orgId: orgId,
  })

  if (orgDetails.status !== 200) {
    throw new Error(orgDetails.data.message)
  }

  // This should avoid this problem.
  dispatch(setCurrentOrgDetails(orgDetails.data))

  const updatedState = getState()
  const legacyMe = convertIdentityToMe(updatedState.identity.currentIdentity)
  dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))

  dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))

  dispatch(setQuartzIdentityStatus(RemoteDataState.Done))
}
