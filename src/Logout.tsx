// Libraries
import {FC, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {RouteComponentProps} from 'react-router-dom'
import auth0js from 'auth0-js'

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

type Props = RouteComponentProps

const Logout: FC<Props> = ({history}) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const handleSignOut = async () => {
      if (CLOUD && isFlagEnabled('authSessionCookieOn')) {
        const signoutUrl = new URL(
          `${window.location.origin}${CLOUD_SIGNOUT_PATHNAME}`
        )
        const auth0 = new auth0js.WebAuth({
          returnTo: signoutUrl.href,
        })
        // Log the user out of Auth0, then destroy their API session
        auth0.logout()
        return
      }

      if (CLOUD) {
        window.location.href = `${CLOUD_URL}${CLOUD_LOGOUT_PATH}`
        return
      } else {
        const resp = await postSignout({})

        if (resp.status !== 204) {
          throw new Error(resp.data.message)
        }

        history.push(`/signin`)
      }
    }
    dispatch(reset())
    dispatch({type: 'USER_LOGGED_OUT'})
    handleSignOut()
  }, [dispatch, history])

  return null
}

export default Logout
