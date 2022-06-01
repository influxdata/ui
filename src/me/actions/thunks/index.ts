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
  getIdentity as getIdentityAPI,
  getOrg as getOrgAPI,
} from 'src/client/unityRoutes'
// Utils
import {gaEvent, updateReportingContext} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'
import {getOrg} from 'src/organizations/selectors'
// import {getMe as getMeSelector} from 'src/me/selectors'

// Actions
import {setMe, setQuartzMe, setQuartzMeStatus} from 'src/me/actions/creators'

// Reducers
import {MeState} from 'src/me/reducers'

// Types
import {RemoteDataState, GetState} from 'src/types'

// Creators
import {Actions} from 'src/me/actions/creators'

export const getIdentity = () => async (
  dispatch: Dispatch<Actions>,
  getState: GetState
) => {
  console.log('entering getMe')

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
      const resp = await apiGetApiMe({})
      console.log('Original /me data')
      console.log(resp.data)
      const identityEndPoint = await getIdentityAPI({})
      console.log('here is result')
      console.log(identityEndPoint)

      if (identityEndPoint.status !== 200) {
        console.log(identityEndPoint)
        throw new Error('Error')
      }

      // console.log('herei s the data coming from /identity')
      // console.log(identityEndPoint.data)

      // const arrayOfAccounts = await getAccounts({})
      // console.log('here is a list of all accounts')
      // console.log(arrayOfAccounts.data)

      // const specificAccountInfo = await getAccount({
      //   accountId: arrayOfAccounts.data[0].id,
      // })

      // if (specificAccountInfo.status !== 200) {
      //   throw new Error(specificAccountInfo.data.message)
      // }

      // // Need a way to get the specific org id
      // const specificOrgInfo = await getOrgAPI({
      //   orgId: identityEndPoint.data.org.id,
      // })
      // if (specificOrgInfo.status !== 200) {
      //   throw new Error(specificOrgInfo.data.message)
      // }

      // console.log('here is the specific account data for id 2')
      // console.log(specificAccountInfo.data)

      // // This information would need to be moved into the quartz function though.
      // const quartzMeObj = {
      //   accountCreatedAt: identityEndPoint.data.account.accountCreatedAt,
      //   accountType: identityEndPoint.data.account.type,

      //   // For billing provider, I'm getting an undefined when I should be getting null.
      //   // Check with ecommerce team to make sure that's right.
      //   billingProvider: specificAccountInfo.data.billing_provider,
      //   clusterHost: identityEndPoint.data.org.clusterHost,
      //   email: identityEndPoint.data.user.email,
      //   id: identityEndPoint.data.user.id,

      //   // I don't see an isOperator. For now, I'm going to set it to false by default,
      //   // unless operatorRole is true.
      //   isOperator: identityEndPoint.data.user.operatorRole ? true : false,
      //   isRegionBeta: specificOrgInfo.data.isRegionBeta,
      //   operatorRole: identityEndPoint.data.user.operatorRole,
      //   paygCreditStartDate: identityEndPoint.data.account.paygCreditStartDate,
      //   regionCode: specificOrgInfo.data.regionCode,
      //   regionName: specificOrgInfo.data.regionName,
      // }
      // console.log('here is the shoehorn for quartzMe')
      // console.log(quartzMeObj)

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      if (identityEndPoint.status !== 200) {
        throw new Error(identityEndPoint.data.message)
      }

      const user2 = identityEndPoint.data.user

      // Note absence of 'links' from property.
      // Status property is also shoehorned: this
      // should be coming from somewhere.
      const shoeHorn = {
        id: user2.id,
        links: {self: `/api/v2/users/${user2.id}`},
        name: user2.email,
        status: 'active',
      }

      console.log('/Identity data implemented and used in shoehorn')
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
  // Ideally the best way to do this is:
  // (1) Check if flag is enabled. If it isn't, keep the old logic.
  // (2) If flag is enabled, then store a bunch of new information in a new piece of state
  // That keeps track fo organization data (this is true of both functions.
  // (3) If flag is enabled, also map over the data into a separate object.

  try {
    dispatch(setQuartzMeStatus(RemoteDataState.Loading))
    const resp = await apiGetQuartzMe({})
    console.log('here is what quartzMe contains')
    console.log(resp.data)
    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    // This info should be pulled from state, not re-pulled from the API.
    const identityEndPoint = await getIdentityAPI({})

    if (identityEndPoint.status !== 200) {
      throw new Error('Error')
    }

    const arrayOfAccounts = await getAccounts({})
    // console.log('here is a list of all accounts')
    // console.log(arrayOfAccounts.data)

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

    const quartzMeObj = {
      accountCreatedAt: identityEndPoint.data.account.accountCreatedAt + 'P',
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

    console.log('here is the new state')
    console.log(quartzMeObj)

    dispatch(setQuartzMe(quartzMeObj, RemoteDataState.Done))
  } catch (error) {
    console.error(error)
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}
