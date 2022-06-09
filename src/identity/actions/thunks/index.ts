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
