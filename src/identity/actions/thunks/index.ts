// Current Workflow -- need to structure CurrentIdentity and Status in reducer correctly,
// so that data is actually being pulled into the endpoint

// Further to-dos

// 1 - more testing

// 2 - try to abstract away more into API later.

// 3 - Maybe move the utils in the API layer

// 4 - Is there any way we can get rid of the extra useEffect hooks?

// 5 - basically, dont we need to call these extra APIs regardless now?

// Functions making API calls
import {getAccount, getIdentity, getOrg} from 'src/client/unityRoutes'

import {GetState} from 'src/types'

// Actions
import {setQuartzMeStatus} from 'src/me/actions/creators'
import {
  setCurrentOrgDetails,
  setCurrentBillingProvider,
  setQuartzIdentity,
  setQuartzIdentityStatus,
  // Actions,
} from 'src/identity/actions/creators'

// Types
import {RemoteDataState} from 'src/types'

// Utilities
import {syncQuartzMe} from 'src/identity/utils/syncQuartzMe'

// Retrieves user's quartz identity from /quartz/identity, and stores it in state.identity.
export const getQuartzIdentityThunk = () => async (
  dispatch: any,
  getState: GetState
) => {
  console.log('entering getQuartzIdentityThunk')
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const quartzIdentity = await getIdentity({})

    if (quartzIdentity.status !== 200) {
      throw new Error(quartzIdentity.data.message)
    }

    console.log('here is the response')
    console.log(quartzIdentity)
    dispatch(setQuartzIdentity(quartzIdentity.data))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))
    console.log('successfully retrieved quartzIdentity')
    console.log(getState().identity)

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
  console.log('Entering getBillingProviderThunk')
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
    console.log('successfully retrieved billing provider')

    // Remove two below lines once quartzIdentity is removed.
    const updatedState = getState()
    syncQuartzMe(updatedState.identity, dispatch)
  } catch (err) {
    console.log(err)
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))

    // Remove line below once quartzMe is deprecated.
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}

// Same - need to change/fix types here
// So, this is a little silly, because it's actually mandatory for us to invoke this logic and ping this endpoint once
// whenever logging into the app. So I would just move this information over to /identity.
// Note to self: add this to Miro diagram.

// Retrieves more details about the current organization, and stores it in state.identity.org.
export const getCurrentOrgDetailsThunk = () => async (
  dispatch: any,
  getState: GetState
) => {
  console.log('entering getCurrentOrgDetailsThunk')
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
    console.log('successfully retrieved additional organization details')

    // Remove two below lines after quartzIdentity flag is removed.
    const updatedState = getState()
    syncQuartzMe(updatedState.identity, dispatch)
  } catch (err) {
    console.log(err)
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))

    // Remove line below once quartzMe is deprecated.
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}
