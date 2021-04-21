// Libraries
import HoneyBadger from 'honeybadger-js'

// API
import {client, getMeQuartz as apiGetQuartzMe} from 'src/utils/api'

// Utils
import {gaEvent, updateReportingContext} from 'src/cloud/utils/reporting'

// Actions
import {setMe, setQuartzMe, setQuartzMeStatus} from 'src/me/actions/creators'

// Reducers
import {MeState} from 'src/me/reducers'

// Types
import {RemoteDataState} from 'src/types'

export const getMe = () => async dispatch => {
  try {
    const user = await client.users.me()
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

    dispatch(setMe(user as MeState))
  } catch (error) {
    console.error(error)
  }
}

export const getQuartzMe = () => async dispatch => {
  try {
    dispatch(setQuartzMeStatus(RemoteDataState.Loading))
    const resp = await apiGetQuartzMe()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setQuartzMe(resp.data, RemoteDataState.Done))
  } catch (error) {
    console.error(error)
    dispatch(setQuartzMeStatus(RemoteDataState.Error))
  }
}
