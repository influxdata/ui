// Libraries
import HoneyBadger from 'honeybadger-js'

// API
import {client} from 'src/utils/api'

// Utils
import {gaEvent, updateReportingContext} from 'src/cloud/utils/reporting'

// Actions
import {setMe} from 'src/me/actions/creators'

// Reducers
import {MeState} from 'src/me/reducers'

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
