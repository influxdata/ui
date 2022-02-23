// Libraries
import HoneyBadger from 'honeybadger-js'
import {identify} from 'rudder-sdk-js'
import {Dispatch} from 'react'

// API
import {getMe as apiGetApiMe} from 'src/client'
import {getAccounts, getMe as apiGetQuartzMe} from 'src/client/unityRoutes'
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
  try {
    let user

    if (
      isFlagEnabled('multiAccount') &&
      isFlagEnabled('avatarWidgetMultiAccountInfo')
    ) {
      const resp = await getAccounts({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }
      user = resp.data.find(account => account.isActive)
    } else {
      const resp = await apiGetApiMe({})

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

    dispatch(setMe(user as MeState))
  } catch (error) {
    console.error(error)
  }
}

export const getQuartzMe = () => async dispatch => {
  try {
    dispatch(setQuartzMeStatus(RemoteDataState.Loading))
    const resp = await apiGetQuartzMe({})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setQuartzMe(resp.data, RemoteDataState.Done))
  } catch (error) {
    console.error(error)
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}
