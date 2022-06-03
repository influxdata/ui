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
import {setMe, setQuartzMe, setQuartzMeStatus} from 'src/me/actions/creators'

// Reducers
import {IdentityState} from 'src/me/reducers'

// Types
import {RemoteDataState, GetState} from 'src/types'
import {Actions} from 'src/me/actions/creators'

export const getIdentityThunk = () => async (
  dispatch: Dispatch<Actions>,
  getState: GetState
) => {
  try {
    let user

    if (isFlagEnabled('avatarWidgetMultiAccountInfo')) {
      const resp = await getAccounts({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }
      user = resp.data.find(account => account.isActive)
    } else {
      const resp = await getIdpeMe({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }
      user = resp.data
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

    if (isFlagEnabled('quartzIdentity')) {
      console.log('Using new route')
      getIdentity({})
        .then(quartzIdentity => {
          if (quartzIdentity.status !== 200) {
            throw new Error(quartzIdentity.data.message)
          }

          const {account, org, user} = quartzIdentity.data
          const {
            accountCreatedAt,
            paygCreditStartDate,
            type: accountType,
          } = account
          const {clusterHost, id: orgId} = org
          const {email, id: userId, operatorRole} = user

          const currentAccount = getAccount({
            accountId: account.id.toString(),
          })

          const currentOrg = getQuartzOrg({orgId: orgId})

          Promise.all([currentAccount, currentOrg])
            .then(resolved => {
              if (resolved[0].status !== 200) {
                throw new Error(resolved[0].data.message)
              }

              if (resolved[1].status !== 200) {
                throw new Error(resolved[1].data.message)
              }

              const {billingProvider} = resolved[0].data

              const {isRegionBeta, regionCode, regionName} = resolved[1].data

              const currentIdentity = {
                accountCreatedAt: accountCreatedAt,
                accountType: accountType,
                billingProvider: billingProvider,
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
              dispatch(setQuartzMe(currentIdentity, RemoteDataState.Done))
            })
            .catch(err => {
              throw new Error(err)
            })
        })
        .catch(err => {
          throw new Error(err)
        })
    } else {
      console.log('Using old route')
      getQuartzMe({})
        .then(quartzMe => {
          if (quartzMe.status !== 200) {
            throw new Error(quartzMe.data.message)
          } else {
            dispatch(setQuartzMe(quartzMe.data, RemoteDataState.Done))
          }
        })
        .catch(err => {
          throw new Error(err)
        })
    }
  } catch (error) {
    console.error(error)
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}
