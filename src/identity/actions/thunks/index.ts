// To Dos:

// 1 - Try to abstract away more into API later.
// 2 - Maybe move the utils in the API layer
// 3 - Is there any way we can get rid of the extra useEffect hooks?
// 4 - Think we need to call most of these APIS right now because of how getOrgs is structured.

import {getAccount, getIdentity, getOrg} from 'src/client/unityRoutes'

import {GetState} from 'src/types'

// Actions
import {setQuartzMeStatus} from 'src/me/actions/creators'
import {
  setCurrentOrgDetails,
  setCurrentBillingProvider,
  setQuartzIdentity,
  setQuartzIdentityStatus,
} from 'src/identity/actions/creators'

// Types
import {RemoteDataState} from 'src/types'

// Utilities
import {syncQuartzMe} from 'src/identity/utils/syncQuartzMe'

// Retrieves user's quartz identity from /quartz/identity, and stores it in state.identity.
export const getQuartzIdentityThunk = () => async (dispatch: any) => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const quartzIdentity = await getIdentity({})

    if (quartzIdentity.status !== 200) {
      throw new Error(quartzIdentity.data.message)
    }

    dispatch(setQuartzIdentity(quartzIdentity.data))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))

    // Remove line below once quartzMe is deprecated.
    syncQuartzMe(quartzIdentity.data, dispatch)
  } catch (error) {
    console.error(error)
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))

    // Remove line below once quartzMe is deprecated.
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}

// Retrieves current account's billingProvider, and stores it in state.identity.account.
export const getBillingProviderThunk = () => async (
  dispatch: any,
  getState: GetState
) => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const initialState = getState()
    const accountId = initialState?.identity?.account?.id

    if (accountId === undefined) {
      throw new Error('Unable to retrieve account ID from identity data.')
    }

    // /quartz/identity returns account ID to us as a number, but getAccount expects a string.
    const accountIdString = accountId.toString()

    const accountDetails = await getAccount({
      accountId: accountIdString,
    })

    if (accountDetails.status !== 200) {
      throw new Error(accountDetails.data.message)
    }

    // Resolve openAPI issue ith billingProvider versus billing_provider.
    dispatch(setCurrentBillingProvider(accountDetails.data.billingProvider))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))

    // Remove two below lines once quartzIdentity is removed.
    const updatedState = getState()
    syncQuartzMe(updatedState.identity, dispatch)
  } catch (err) {
    console.error(err)
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))

    // Remove line below once quartzMe is deprecated.
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}

// Same - need to change/fix types here
// It's actually mandatory for us to invoke this logic and ping this endpoint once
// whenever logging into the app. So I would just move this information over to /identity.
// Note to self: add this to Miro diagram.

// Retrieves more details about the current organization, and stores it in state.identity.org.
export const getCurrentOrgDetailsThunk = () => async (
  dispatch: any,
  getState: GetState
) => {
  // console.log('entering getCurrentOrgDetailsThunk')
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const state = getState()
    const orgId = state?.identity?.org?.id

    if (orgId === undefined) {
      throw new Error('Unable to retrieve organization ID from identity data.')
    }

    const orgDetails = await getOrg({
      orgId: orgId,
    })

    if (orgDetails.status !== 200) {
      throw new Error(orgDetails.data.message)
    }

    dispatch(setCurrentOrgDetails(orgDetails.data))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))

    // Remove two below lines after quartzIdentity flag is removed.
    const updatedState = getState()
    syncQuartzMe(updatedState.identity, dispatch)
  } catch (err) {
    console.error(err)
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))

    // Remove line below once quartzMe is deprecated.
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}
