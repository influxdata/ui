// General approach here: I would basically finesse this into the legacy quartzme structure for now,
// under a feature flag,
// but also store the appropriate new information in orgs as needed.

// Libraries
import HoneyBadger from 'honeybadger-js'
import {identify} from 'rudder-sdk-js'
import {Dispatch} from 'react'

// API
import {getMe as apiGetApiMe} from 'src/client'
import {
  getAccount,
  getAccounts,
  getMe as apiGetQuartzMe,
  getIdentity,
  getOrg as getOrgAPI,
} from 'src/client/unityRoutes'
// Utils
import {gaEvent, updateReportingContext} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'
import {getOrg} from 'src/organizations/selectors'
// Actions
import {setMe, setQuartzMe, setQuartzMeStatus} from 'src/me/actions/creators'

// Reducers
import {MeState} from 'src/me/reducers'

// Types
import {RemoteDataState, GetState} from 'src/types'

// Creators
import {Actions} from 'src/me/actions/creators'

export const getMe = () => async (
  dispatch: Dispatch<Actions>,
  getState: GetState
) => {
  console.log('entering getMe')

  try {
    let user

    if (isFlagEnabled('avatarWidgetMultiAccountInfo')) {
      console.log('avatarWidgetMultiAccountInfo')
      const resp = await getAccounts({})
      console.log('here is the information from multi account')
      console.log(resp)

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }
      user = resp.data.find(account => account.isActive)
    } else {
      const resp = await apiGetApiMe({})
      console.log('here is the data coming from /me')
      console.log(resp.data)
      const identityEndPoint = await getIdentity({})

      if (identityEndPoint.status !== 200) {
        throw new Error('Error')
      }

      console.log('herei s the data coming from /identity')
      console.log(identityEndPoint.data)
      const arrayOfAccounts = await getAccounts({})
      console.log('here is a list of all accounts')
      console.log(arrayOfAccounts.data)

      const specificAccountInfo = await getAccount({
        accountId: arrayOfAccounts.data[0].id,
      })

      if (specificAccountInfo.status !== 200) {
        throw new Error(specificAccountInfo.data.message)
      }

      // Need a way to get the specific org id
      const specificOrgInfo = await getOrgAPI({
        orgId: identityEndPoint.data.org.id,
      })
      if (specificOrgInfo.status !== 200) {
        throw new Error(specificOrgInfo.data.message)
      }

      console.log('here is the specific account data for id 2')
      console.log(specificAccountInfo.data)

      const quartzMeObj = {
        accountCreatedAt: identityEndPoint.data.account.accountCreatedAt,
        accountType: identityEndPoint.data.account.type,

        // For billing provider, I'm getting an undefined when I should be getting null.
        // Check with ecommerce team to make sure that's right.
        billingProvider: specificAccountInfo.data.billing_provider,
        clusterHost: identityEndPoint.data.org.clusterHost,
        email: identityEndPoint.data.user.email,
        id: identityEndPoint.data.user.id,

        // I don't see an isOperator. For now, I'm going to set it to false by default,
        // unless operatorRole is true.
        isOperator: identityEndPoint.data.user.operatorRole ? true : false,
        isRegionBeta: specificOrgInfo.data.isRegionBeta,
        operatorRole: identityEndPoint.data.user.operatorRole,
        paygCreditStartDate: identityEndPoint.data.account.paygCreditStartDate,
        regionCode: specificOrgInfo.data.regionCode,
        regionName: specificOrgInfo.data.regionName,
      }
      console.log('here is the shoehorn for quartzMe')
      console.log(quartzMeObj)

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      if (identityEndPoint.status !== 200) {
        throw new Error(identityEndPoint.data.message)
      }

      const user2 = identityEndPoint.data.user

      const shoeHorn = {
        id: user2.id,
        links: {self: `/api/v2/users/${user2.id}`},
        name: user2.email,
        status: 'active',
      }

      console.log(
        'here is the shoehorned data, which should be identical to /me'
      )
      console.log(shoeHorn)

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

    dispatch(setMe(user as MeState))
  } catch (error) {
    console.error(error)
  }
}

export const getQuartzMe = () => async dispatch => {
  try {
    dispatch(setQuartzMeStatus(RemoteDataState.Loading))
    const resp = await apiGetQuartzMe({})
    console.log('here is the quartzMe data')
    console.log(resp.data)
    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setQuartzMe(resp.data, RemoteDataState.Done))
  } catch (error) {
    console.error(error)
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}
