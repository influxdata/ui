// Libraries
import HoneyBadger from 'honeybadger-js'
import {Dispatch} from 'react'

// Functions making API calls
import {getMe as getIdpeMe} from 'src/client'
import {getAccounts} from 'src/client/unityRoutes'

// Utils
import {gaEvent, updateReportingContext} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Actions
import {
  setMe,
  setQuartzMe,
  setQuartzMeStatus,
  Actions as MeActions,
} from 'src/me/actions/creators'

// Reducers
import {MeState} from 'src/me/reducers'

// Types
import {RemoteDataState} from 'src/types'
import {Actions} from 'src/me/actions/creators'
import {fetchQuartzMe} from 'src/identity/apis/auth'

export const getIdpeMeThunk = () => async (dispatch: Dispatch<Actions>) => {
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

    HoneyBadger.setContext({
      user_id: user.id,
    })

    dispatch(setMe(user as MeState))
  } catch (error) {
    console.error(error)
  }
}

export const getQuartzMeThunk = () => async (dispatch: Dispatch<MeActions>) => {
  try {
    dispatch(setQuartzMeStatus(RemoteDataState.Loading))

    const quartzMe = await fetchQuartzMe()

    dispatch(setQuartzMe(quartzMe, RemoteDataState.Done))
  } catch (error) {
    console.error(error)
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}
