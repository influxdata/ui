// Libraries
import HoneyBadger from 'honeybadger-js'
import {identify} from 'rudder-sdk-js'
import {Dispatch} from 'react'

// Functions making API calls
import {getMe as getIdpeMe} from 'src/client'
import {
  getAccount,
  getAccounts,
  getMe as getQuartzMe,
  getIdentity,
  getOrg as getQuartzOrg,
} from 'src/client/unityRoutes'

// Utils
import {gaEvent, updateReportingContext} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'
import {getOrg} from 'src/organizations/selectors'

// Actions
import {
  setQuartzIdentity,
  setQuartzIdentityStatus,
} from 'src/identity/actions/creators'

// Reducers
import {QuartzIdentityState} from 'src/identity/reducers'

// Types
import {RemoteDataState, GetState} from 'src/types'
import {Actions} from 'src/identity/actions/creators'
import {Identity, Me} from 'src/client/unityRoutes'

// interface LegacyIdentityResponse {
//   status: string
//   data: Me | null
//   error?: Error
// }

export const getQuartzIdentityThunk = () => async dispatch => {
  try {
    dispatch(setQuartzIdentityStatus(RemoteDataState.Loading))

    // this should probably be happening outside for this one

    if (isFlagEnabled('quartzIdentity')) {
      const quartzIdentity = await getIdentity({})

      if (quartzIdentity.status !== 200) {
        throw new Error(quartzIdentity.data.message)
      }

      // const legacyMeIdentity = await convertIdentityToMe(quartzIdentity.data)

      if (legacyMeIdentity.status === 'failure') {
        throw new Error(legacyMeIdentity.error.stack)
      }

      console.log('Here is the result of calling quartzIdentity')
      console.log(legacyMeIdentity.data)

      console.log('Here is the result of calling meIdentity')
      const quartzMe = await getQuartzMe({})
      console.log(quartzMe.data)

      dispatch(setQuartzMe(legacyMeIdentity.data, RemoteDataState.Done))
    } else {
      const quartzMe = await getQuartzMe({})

      if (quartzMe.status !== 200) {
        throw new Error(quartzMe.data.message)
      }
      dispatch(setQuartzMe(quartzMe.data, RemoteDataState.Done))
    }
  } catch (error) {
    console.error(error)
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}

const convertIdentityToMe = (
  quartzIdentity: Identity
): Promise<LegacyIdentityResponse> => {
  const {account, org, user} = quartzIdentity
  const {accountCreatedAt, paygCreditStartDate, type: accountType} = account
  const {clusterHost, id: orgId} = org
  const {email, id: userId, operatorRole} = user

  const accountPromise = getAccount({
    accountId: account.id.toString(),
  })

  const orgPromise = getQuartzOrg({orgId: orgId})

  return Promise.all([accountPromise, orgPromise])
    .then(res => {
      // Typescript doesn't trace the typing here if we loop with forEach.

      const currentAccount = res[0]
      const currentOrg = res[1]

      if (currentAccount.status !== 200) {
        throw new Error(currentAccount.data.message)
      }

      if (currentOrg.status !== 200) {
        throw new Error(currentOrg.data.message)
      }

      const {billing_provider} = currentAccount.data

      const {isRegionBeta, regionCode, regionName} = currentOrg.data

      const currentIdentity = {
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
      return {
        status: 'success',
        data: currentIdentity,
      }
    })
    .catch(err => {
      return {
        status: 'failure',
        data: null,
        error: err,
      }
    })
}

// export const getIdentityThunk = () => async (
//   dispatch: Dispatch<Actions>,
//   getState: GetState
// ) => {
//   try {
//     let user

//     if (isFlagEnabled('avatarWidgetMultiAccountInfo')) {
//       const resp = await getAccounts({})

//       if (resp.status !== 200) {
//         throw new Error(resp.data.message)
//       }
//       user = resp.data.find(account => account.isActive)
//     } else {
//       const resp = await getIdpeMe({})

//       if (resp.status !== 200) {
//         throw new Error(resp.data.message)
//       }
//       user = resp.data
//     }

//     updateReportingContext({userID: user.id, userEmail: user.name})

//     gaEvent('cloudAppUserDataReady', {
//       identity: {
//         id: user.id,
//         email: user.name,
//       },
//     })

//     updateReportingContext({
//       userID: user.id,
//     })
//     HoneyBadger.setContext({
//       user_id: user.id,
//     })

//     if (CLOUD && isFlagEnabled('rudderstackReporting')) {
//       const state = getState()
//       const org = getOrg(state)
//       identify(user.id, {email: user.name, orgID: org.id})
//     }

//     dispatch(setMe(user as IdentityState))
//   } catch (error) {
//     console.error(error)
//   }
// }
