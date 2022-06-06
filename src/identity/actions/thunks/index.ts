// Libraries
import {Dispatch} from 'react'

// Functions making API calls
import {
  getAccount,
  getIdentity,
  getOrg as getQuartzOrg,
  Me,
} from 'src/client/unityRoutes'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Constants
import {CLOUD} from 'src/shared/constants'

// Actions
import {
  setQuartzIdentity,
  setQuartzIdentityStatus,
  Actions,
} from 'src/identity/actions/creators'

// Reducers
import {QuartzIdentityState} from 'src/identity/reducers'

// Types
import {RemoteDataState} from 'src/types'

interface AccountIdentityResponse {
  status: string
  data: QuartzIdentityState | null
  error: string | null
}

export const getQuartzIdentityThunk = () => async dispatch => {
  try {
    if (isFlagEnabled('quartzIdentity') && CLOUD) {
      const quartzIdentityDetails = await getQuartzIdentityDetails()

      if (quartzIdentityDetails.error) {
        throw new Error(quartzIdentityDetails.error)
      }

      dispatch(
        setQuartzIdentity(quartzIdentityDetails.data, RemoteDataState.Done)
      )
    }
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))
  } catch (error) {
    console.error(error)
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
  }
}

export const getQuartzIdentityDetails = async (): Promise<AccountIdentityResponse> => {
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

  return Promise.all([accountPromise, orgPromise])
    .then(res => {
      const currentAccount = res[0]
      const currentOrg = res[1]

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
}

export const convertIdentityToMe = (
  quartzIdentity: QuartzIdentityState
): Me => {
  // General information retrieved from the quartz identity endpoint.
  const {
    currentIdentity,
    currentAccountDetails,
    currentOrgDetails,
  } = quartzIdentity
  const {account, org, user} = currentIdentity
  const {accountCreatedAt, paygCreditStartDate, type: accountType} = account
  const {clusterHost} = org
  const {email, id: userId, operatorRole} = user

  // Specific information retrieved separately from the quartz account and organization endpoints.
  const {billing_provider} = currentAccountDetails
  const {isRegionBeta, regionCode, regionName} = currentOrgDetails

  const legacyMe = {
    accountCreatedAt: accountCreatedAt,
    accountType: accountType,
    billingProvider: billing_provider,
    clusterHost: clusterHost,
    email: email,
    id: userId,
    isOperator: operatorRole ? true : false,
    isRegionBeta: isRegionBeta,
    operatorRole: operatorRole,
    paygCreditStartDate: paygCreditStartDate,
    regionCode: regionCode,
    regionName: regionName,
  }

  return legacyMe
}
