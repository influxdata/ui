// Functions making API calls
import {
  Account,
  getAccount,
  getIdentity,
  getOrg as getQuartzOrg,
  Me,
} from 'src/client/unityRoutes'

// Actions
import {
  setQuartzIdentity,
  setQuartzIdentityStatus,
  // Actions,
} from 'src/identity/actions/creators'
import {setQuartzMeStatus} from 'src/me/actions/creators'

// Selectors
import {selectQuartzIdentity} from 'src/identity/selectors'

// Types
import {RemoteDataState} from 'src/types'
import {QuartzIdentityState} from 'src/identity/reducers'
import {setQuartzMe} from 'src/me/actions/creators'

import {getState} from 'react-redux'

interface AccountIdentityResponse {
  status: string
  data: QuartzIdentityState | null
  error: string | null
}

/*
These thunks are intended to be invoked only in connection with the new /quartz/identity
endpoints. For users still using legacy /quartz/me, use the legacy thunks in /src/me.
*/

export const getQuartzIdentityThunk = () => async dispatch => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const quartzIdentityDetails = await getQuartzIdentityDetails()

    if (quartzIdentityDetails.error) {
      throw new Error(quartzIdentityDetails.error)
    }

    dispatch(
      setQuartzIdentity(quartzIdentityDetails.data, RemoteDataState.Done)
    )

    // Draw up diagrams of what's going on here --> showing how info gets transferred from API
    // to reducers

    // For now, enable compatibility with quartzMe by also populating quartzMe state using the same data.
    const legacyMe = convertIdentityToMe(quartzIdentityDetails.data)

    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
    dispatch(setQuartzMeStatus(RemoteDataState.Done))
  } catch (error) {
    console.error(error)

    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}

export const getQuartzIdentityDetails = async (): Promise<AccountIdentityResponse> => {
  try {
    const quartzIdentity = await getIdentity({})

    if (quartzIdentity.status !== 200) {
      throw new Error(quartzIdentity.data.message)
    }

    const {account, org} = quartzIdentity.data
    const {id: orgId} = org

    const accountPromise = getAccount({
      accountId: account.id.toString(),
    })

    const orgPromise = getQuartzOrg({orgId: orgId})

    // Once quartzMe is fully deprecated, we should consider adjusting the UI so that these API calls aren't required on login

    return Promise.all([accountPromise, orgPromise])
      .then(res => {
        const [currentAccount, currentOrg] = res

        if (currentAccount.status !== 200) {
          throw new Error(currentAccount.data.message)
        }

        if (currentOrg.status !== 200) {
          throw new Error(currentOrg.data.message)
        }

        return {
          status: 'success',
          data: {
            currentIdentity: quartzIdentity.data,
            currentOrgDetails: currentOrg.data,
            currentAccountDetails: currentAccount.data,
            status: RemoteDataState.Done,
          },
          error: null,
        }
      })
      .catch(err => {
        return {
          status: 'failure',
          data: null,
          error: err.stack,
        }
      })
  } catch (err) {
    return {
      status: 'failure',
      data: null,
      error: err.stack,
    }
  }
}

export const getBillingProviderThunk = async () => {
  dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))
  // Right now, the only additional information provided by this endpoint beyond what was
  // provided by the /identity endpoint is billingProvider.
  const quartzIdentity = getState()

  // /identity returns account ID as a number, but getAccount expects the ID as a string.
  const accountIdString = quartzIdentity?.currentIdentity?.account?.id.toString()

  const accountDetails = await getAccount({
    accountId: accountIdString,
  })

  if (accountDetails.status !== 200) {
    throw new Error(accountDetails.data.message)
  }

  dispatch(setQuartzAccountDetails(accountDetails.data.billing_provider))
  dispatch(setQuartzIdentityStatus(RemoteDataState.Done))
}

export const convertIdentityToMe = (
  quartzIdentity: QuartzIdentityState
): Me => {
  const {
    currentIdentity,
    currentAccountDetails,
    currentOrgDetails,
  } = quartzIdentity
  const {account, org, user} = currentIdentity

  // Consider placing this in the API layer

  const legacyMe = {
    // User Data
    email: user.email,
    id: user.id,
    isOperator: user.operatorRole ? true : false,
    operatorRole: user.operatorRole,

    // Account Data
    accountCreatedAt: account.accountCreatedAt,
    accountType: account.type,
    paygCreditStartDate: account.paygCreditStartDate,
    billingProvider: currentAccountDetails.billing_provider,

    // Organization Data
    clusterHost: org.clusterHost,
    regionCode: currentOrgDetails.regionCode,
    isRegionBeta: currentOrgDetails.isRegionBeta,
    regionName: currentOrgDetails.regionName,
  }

  return legacyMe
}
