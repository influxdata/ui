// Libraries
import HoneyBadger from 'honeybadger-js'
import {identify} from 'rudder-sdk-js'
import {Dispatch} from 'react'

// API
// IDPE endpoints
import {getMe as getIdpeMe} from 'src/client'
// Quartz endpoints
import {
  getAccount,
  getAccounts,
  getMe as getQuartzMe,
  getIdentity as getIdentityAPI,
  getOrg as getQuartzOrg,
} from 'src/client/unityRoutes'

// Utils
import {gaEvent, updateReportingContext} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'
import {getOrg} from 'src/organizations/selectors'

// Actions
import {setMe, setQuartzMe, setQuartzMeStatus} from 'src/me/actions/creators'

// Reducers
import {IdentityState} from 'src/me/reducers'

// Types
import {RemoteDataState, GetState} from 'src/types'

// Creators
import {Actions} from 'src/me/actions/creators'
// import {createAbsolutePositionFromRelativePosition} from 'yjs'

export const getIdentityThunk = () => async (
  dispatch: Dispatch<Actions>,
  getState: GetState
) => {
  try {
    let user

    if (isFlagEnabled('avatarWidgetMultiAccountInfo')) {
      // console.log('avatarWidgetMultiAccountInfo')
      const resp = await getAccounts({})
      // console.log('here is the information from multi account')
      // console.log(resp)

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }
      user = resp.data.find(account => account.isActive)
    } else {
      const resp = await getIdpeMe({})

      const identityEndPoint = await getIdentityAPI({})

      if (identityEndPoint.status !== 200) {
        throw new Error('Error')
      }
      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      if (identityEndPoint.status !== 200) {
        throw new Error(identityEndPoint.data.message)
      }

      const user2 = identityEndPoint.data.user

      // Links is missing from property.
      // Status property is also shoehorned: this
      // should be coming from somewhere.
      const shoeHorn = {
        id: user2.id,
        links: {self: `/api/v2/users/${user2.id}`},
        name: user2.email,
        status: 'active',
      }

      user = shoeHorn
    }

    updateReportingContext({userID: user.id, userEmail: user.name})

    gaEvent('cloudAppUserDataReady', {
      identity: {
        id: user.id,
        email: user.name,
      },
    })

    updateReportingContext({
      userID: user.id,
    })
    HoneyBadger.setContext({
      user_id: user.id,
    })

    if (CLOUD && isFlagEnabled('rudderstackReporting')) {
      const state = getState()
      const org = getOrg(state)
      identify(user.id, {email: user.name, orgID: org.id})
    }

    dispatch(setMe(user as IdentityState))
  } catch (error) {
    console.error(error)
  }
}

export const getQuartzMeThunk = () => async dispatch => {
  try {
    dispatch(setQuartzMeStatus(RemoteDataState.Loading))
    const resp = await getQuartzMe({})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    // This info should be pulled from state, not re-pulled from the API.
    const identityEndPoint = await getIdentityAPI({})

    if (identityEndPoint.status !== 200) {
      throw new Error('Error')
    }

    const arrayOfAccounts = await getAccounts({})

    const specificAccountInfo = await getAccount({
      accountId: arrayOfAccounts.data[0].id,
    })

    if (specificAccountInfo.status !== 200) {
      throw new Error(specificAccountInfo.data.message)
    }

    // Need a way to get the specific org id
    const specificOrgInfo = await getQuartzOrg({
      orgId: identityEndPoint.data.org.id,
    })
    if (specificOrgInfo.status !== 200) {
      throw new Error(specificOrgInfo.data.message)
    }

    const identityObj = {
      accountCreatedAt: identityEndPoint.data.account.accountCreatedAt,
      accountType: identityEndPoint.data.account.type,
      // For billing provider, I'm getting an undefined when I should be getting null.
      billingProvider: specificAccountInfo.data.billing_provider,
      clusterHost: identityEndPoint.data.org.clusterHost,
      email: identityEndPoint.data.user.email,
      id: identityEndPoint.data.user.id,
      // I don't see an isOperator. This is hacky.
      isOperator: identityEndPoint.data.user.operatorRole ? true : false,
      isRegionBeta: specificOrgInfo.data.isRegionBeta,
      operatorRole: identityEndPoint.data.user.operatorRole,
      paygCreditStartDate: identityEndPoint.data.account.paygCreditStartDate,
      regionCode: specificOrgInfo.data.regionCode,
      regionName: specificOrgInfo.data.regionName,
    }

    dispatch(setQuartzMe(identityObj, RemoteDataState.Done))
  } catch (error) {
    console.error(error)
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}
