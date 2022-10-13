// Libraries
import HoneyBadger from 'honeybadger-js'
import {Dispatch} from 'react'

// Functions making API calls
import {getMe as getIdpeMe} from 'src/client'

// Utils
import {gaEvent, updateReportingContext} from 'src/cloud/utils/reporting'

// Actions
import {setMe} from 'src/me/actions/creators'

// Reducers
import {MeState} from 'src/me/reducers'

// Types
import {Actions} from 'src/me/actions/creators'

export const getIdpeMeThunk = () => async (dispatch: Dispatch<Actions>) => {
  const resp = await getIdpeMe({})

  if (resp.status !== 200) {
    throw new Error(resp.data.message)
  }
  const user = resp.data

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
}
