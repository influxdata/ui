// Functions making API calls
import {
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

// Types
import {RemoteDataState} from 'src/types'
import {QuartzIdentityState} from 'src/identity/reducers'
import {setQuartzMe} from 'src/me/actions/creators'

interface AccountIdentityResponse {
  status: string
  data: QuartzIdentityState | null
  error: string | null
}

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

    // For now, enable compatibility with quartzMe by also populating quartzMe state using the same data.
    const legacyMe = convertIdentityToMe(quartzIdentityDetails.data)

    dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
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

    // Once quartzMe is fully deprecated, we should consider adjusting the UI so that these API calls aren't required on load
    // Should not need three API calls to populate identity.

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

  // Refactor to show where this is coming from
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
