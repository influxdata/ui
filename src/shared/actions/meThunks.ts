// libraries
import HoneyBadger from 'honeybadger-js'

// api
import {client} from 'src/utils/api'

// utils
import {gaEvent, updateReportingContext} from 'src/cloud/utils/reporting'

// actions
import {setMe} from 'src/shared/actions/me'

//reducers
import {MeState} from 'src/shared/reducers/me'

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
