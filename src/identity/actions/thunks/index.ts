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
  // Actions,
} from 'src/identity/actions/creators'

// Types
import {RemoteDataState} from 'src/types'
import {QuartzIdentityState} from 'src/identity/reducers'

interface AccountIdentityResponse {
  status: string
  data: QuartzIdentityState | null
  error: string | null
}

export const getQuartzIdentityThunk = () => async dispatch => {
  try {
    if (isFlagEnabled('quartzIdentity') && CLOUD) {
      dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

      const quartzIdentityDetails = await getQuartzIdentityDetails()

      if (quartzIdentityDetails.error) {
        throw new Error(quartzIdentityDetails.error)
      }

      dispatch(
        setQuartzIdentity(quartzIdentityDetails.data, RemoteDataState.Done)
      )
    }
  } catch (error) {
    console.error(error)
    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
  }
}

export const getQuartzIdentityDetails = async (): Promise<AccountIdentityResponse> => {
  // Retrieve user identity from /quartz/identity
  try {
    const quartzIdentity = await getIdentity({})

    if (quartzIdentity.status !== 200) {
      throw new Error(quartzIdentity.data.message)
    }

    // Use the accountId and orgId returned by /quartz/identity to retrieve necessary details
    // about the current organization and account.
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
  } catch (err) {
    return {
      status: 'failure',
      data: null,
      error: err.stack,
    }
  }
}

// When quartzIdentity is turned on, since data is not retrieved from /quartz/me, populate the
// /quartz/identity data into the 'quartzMe' redux state to ensure UI compatibility.
export const convertIdentityToMe = (
  quartzIdentity: QuartzIdentityState
): Me => {
  // General identity information retrieved from /quartz/identity
  const {
    currentIdentity,
    currentAccountDetails,
    currentOrgDetails,
  } = quartzIdentity
  const {account, org, user} = currentIdentity
  const {accountCreatedAt, paygCreditStartDate, type: accountType} = account
  const {clusterHost} = org
  const {email, id: userId, operatorRole} = user

  // More specific information retrieved from the quartz/accounts/:accountId and quartz/orgs/:orgId.
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
