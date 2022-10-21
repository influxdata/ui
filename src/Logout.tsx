// Libraries
import {FC, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'

// APIs
import {postSignout} from 'src/client'

// Constants
import {
  CLOUD,
  CLOUD_LOGOUT_PATH,
  CLOUD_SIGNOUT_PATHNAME,
} from 'src/shared/constants'

// Components
import {reset} from 'src/shared/actions/flags'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const Logout: FC = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  let universalLoginFlagValue = false
  useEffect(() => {
    universalLoginFlagValue = isFlagEnabled('universalLogin')
  }, [])

  useEffect(() => {
    const handleSignOut = async () => {
      if (CLOUD) {
        console.warn('universalLoginFlagValue: ', universalLoginFlagValue)
        if (universalLoginFlagValue) {
          fetch('/api/env/quartz-login-url')
            .then(async response => {
              const quartzUrl = await response.text()
              const redirectUrl = `${quartzUrl}${CLOUD_LOGOUT_PATH}`
              console.warn('Redirect to cloud url: ', redirectUrl)
              window.location.replace(`${redirectUrl}`)
            })
            .catch(error => console.error(error))
          return null
        }
        const url = new URL(
          `${window.location.origin}${CLOUD_SIGNOUT_PATHNAME}`
        ).href

        window.location.href = url
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
