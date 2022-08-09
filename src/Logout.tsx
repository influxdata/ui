// Libraries
import {FC, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'

// APIs
import {postSignout} from 'src/client'

// Constants
import {CLOUD, CLOUD_SIGNOUT_PATHNAME} from 'src/shared/constants'

// Components
import {reset} from 'src/shared/actions/flags'

const Logout: FC = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    const handleSignOut = async () => {
      if (CLOUD) {
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
