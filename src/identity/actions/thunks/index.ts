// Functions making API calls
import {
  getAccount,
  getIdentity,
  getOrg,
  Identity,
  Me,
} from 'src/client/unityRoutes'

import {Dispatch} from 'react'

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
import {setQuartzMeStatus} from 'src/me/actions/creators'

// Types
import {RemoteDataState} from 'src/types'

/*
These thunks are intended to be invoked only in connection with the new /quartz/identity
endpoints. For users still using legacy /quartz/me, use the legacy thunks in /src/me.
*/

export const getQuartzIdentityThunk = () => async dispatch => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    const quartzIdentity = await getIdentity({})

    if (quartzIdentity.status !== 200) {
      throw new Error(quartzIdentity.data.message)
    }

    // Enable compatibility with /quartz/me.
    const legacyMe = convertIdentityToMe(quartzIdentity.data)

    // this seems pretty duplicative
    const identityDispatch = {
      currentIdentity: quartzIdentity.data,
      status: RemoteDataState.Loading,
    }

    dispatch(setQuartzIdentity(identityDispatch, RemoteDataState.Done))
    // For now, enable compatibility with quartzMe by also populating quartzMe state using the same data.
    // dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
    // dispatch(setQuartzMeStatus(RemoteDataState.Done))
  } catch (error) {
    console.error(error)

    dispatch(setQuartzIdentityStatus(RemoteDataState.Error))
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}

export const getBillingProviderThunk = () => async (
  dispatch: Dispatch<Actions>,
  getState: GetState
) => {
  dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))
  // At moment, the additional information provideed by account endpoint beyond identity is billing provider.
  const state = getState()

  // /identity returns account ID as a number, but getAccount expects the ID as a string.
  const accountIdString = state?.identity?.currentIdentity?.account?.id.toString()

  const accountDetails = await getAccount({
    accountId: accountIdString,
  })

  if (accountDetails.status !== 200) {
    throw new Error(accountDetails.data.message)
  }

  dispatch(setCurrentBillingProvider(accountDetails.data.billing_provider))
  dispatch(setQuartzIdentityStatus(RemoteDataState.Done))
}

export const getCurrentOrgDetailsThunk = () => async (
  // I think we only need one action imported here
  dispatch: Dispatch<Actions>,
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

  dispatch(setCurrentOrgDetails(orgDetails.data))
  dispatch(setQuartzIdentityStatus(RemoteDataState.Done))
}

export const convertIdentityToMe = (quartzIdentity: Identity): Me => {
  const {account, org, user} = quartzIdentity

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
    billingProvider: '',
    // billingProvider: account.billingProvider,

    // Organization Data
    // Need this separately retrieved from elsewhere.
    clusterHost: org.clusterHost,
    regionCode: '',
    isRegionBeta: '',
    regionName: '',
    // regionCode: org.regionCode ? org.regionCode : '',
    // isRegionBeta: org.isRegionBeta ? org.isRegionBeta : '',
    // regionName: org.regionName ? org.regionName : '',
  }

  // Need to fix typing here.
  return legacyMe
}
