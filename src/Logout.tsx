// Libraries
import {FC, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'

// APIs
import {postSignout} from 'src/client'

// Constants
import {
  CLOUD,
  CLOUD_URL,
  CLOUD_LOGOUT_PATH,
  CLOUD_SIGNOUT_PATHNAME,
} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Components
import {reset} from 'src/shared/actions/flags'

const Logout: FC = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    const handleReset = () => {
      dispatch(reset())
      dispatch({type: 'USER_LOGGED_OUT'})
    }

    const handleSignOut = async () => {
      if (CLOUD) {
        /**
         * We'll need this authSessionCookieOn flag off for tools until
         * Quartz is integrated into that environment
         */
        const url = isFlagEnabled('authSessionCookieOn')
          ? new URL(`${window.location.origin}${CLOUD_SIGNOUT_PATHNAME}`).href
          : `${CLOUD_URL}${CLOUD_LOGOUT_PATH}`

        if (isFlagEnabled('authSessionCookieOn')) {
          handleReset()
        }

        window.location.href = url
        return
      } else {
        if (isFlagEnabled('authSessionCookieOn')) {
          handleReset()
        }
        const resp = await postSignout({})

        if (resp.status !== 204) {
          throw new Error(resp.data.message)
        }

        history.push(`/signin`)
      }
    }
    if (!isFlagEnabled('authSessionCookieOn')) {
      handleReset()
    }
    handleSignOut()
  }, [dispatch, history])

  return null
}

export default Logout
