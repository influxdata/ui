import {GetState} from 'src/types'

// Actions
import {setQuartzMe, setQuartzMeStatus} from 'src/me/actions/creators'
import {
  setCurrentOrgDetails,
  setCurrentBillingProvider,
  setQuartzIdentity,
  setQuartzIdentityStatus,
} from 'src/identity/actions/creators'

// Types
import {RemoteDataState} from 'src/types'
enum RetrievalError {
  accountIdentity = 'Unable to retrieve account ID from user identity.',
  orgIdentity = 'Unable to retrieve organization ID from user identity.',
}

// Utilities
import {
  convertIdentityToMe,
  retrieveIdentity,
  retrieveAccountDetails,
  retrieveOrgDetails,
} from 'src/identity/apis/'

// Error catching options
// Options:
// (1) event - error fetching identity
// (2) user - notify user
// (3) honeybadger? req here or elsewhere

// Retrieves user's quartz identity from /quartz/identity, and stores it in state.identity.
export const getQuartzIdentityThunk = () => async (dispatch: any) => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const quartzIdentity = await retrieveIdentity()

    dispatch(setQuartzIdentity(quartzIdentity))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))

    const legacyMe = convertIdentityToMe(quartzIdentity)
    // Remove lines below once quartzMe is deprecated.
    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
    dispatch(setQuartzMeStatus(RemoteDataState.Done))
  } catch (error) {
    // Test error handler here by associating it with a 200.
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
    // Remove line below once quartzMe is deprecated.
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
    console.error(error)
    throw new Error(error)
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

    if (typeof accountId !== 'string' && typeof accountId !== 'number') {
      throw new Error(RetrievalError.accountIdentity)
    }

    const accountDetails = await retrieveAccountDetails(accountId)

    // Resolve openAPI issue ith billingProvider versus billing_provider.
    dispatch(setCurrentBillingProvider(accountDetails.billingProvider))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))

    // Remove below lines once quartzIdentity is removed.
    const updatedState = getState()
    const legacyMe = convertIdentityToMe(updatedState.identity)
    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
    dispatch(setQuartzMeStatus(RemoteDataState.Done))
  } catch (error) {
    // Test error handler here by associating it with a 200.
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
    // Remove line below once quartzMe is deprecated.
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
    console.error(error)
    throw new Error(error)
  }
}

// Retrieves more details about the current organization, and stores it in state.identity.org.
export const getCurrentOrgDetailsThunk = () => async (
  dispatch: any,
  getState: GetState
) => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const state = getState()
    const orgId = state?.identity?.org?.id

    if (typeof orgId !== 'string') {
      throw new Error(RetrievalError.orgIdentity)
    }

    const orgDetails = await retrieveOrgDetails(orgId)

    dispatch(setCurrentOrgDetails(orgDetails))
    dispatch(setQuartzIdentityStatus(RemoteDataState.Done))

    // Remove two below lines after quartzIdentity flag is removed.
    const updatedState = getState()
    const legacyMe = convertIdentityToMe(updatedState.identity)
    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
    dispatch(setQuartzMeStatus(RemoteDataState.Done))
  } catch (error) {
    // Test error handler here by associating it with a 200.
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
    // Remove line below once quartzMe is deprecated.
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
    console.error(error)
    throw new Error(error)
  }
}
