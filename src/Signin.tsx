// Libraries
import React, {memo, FC, useCallback, useEffect, useState, useRef} from 'react'
import {Switch, Route, useLocation, useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'

// Components
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'
import GetMe from 'src/shared/containers/GetMe'

// Utils
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from 'src/localStorage'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getPublicFlags} from 'src/shared/thunks/flags'

// Actions
import {notify} from 'src/shared/actions/notifications'

// Constants
import {sessionTimedOut} from 'src/shared/copy/notifications'
import {
  CLOUD,
  CLOUD_LOGIN_PATHNAME,
  CLOUD_SIGNIN_PATHNAME,
} from 'src/shared/constants'

// Types
import {RemoteDataState} from 'src/types'
import {getMe} from 'src/client'
import ErrorBoundary from './shared/components/ErrorBoundary'

const FETCH_WAIT = 60000

export const Signin: FC = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const {pathname} = useLocation()
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const [auth, setAuth] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  const intervalID = useRef(null)

  const checkForLogin = useCallback(async () => {
    try {
      const resp = await getMe({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      setAuth(true)
      const redirectIsSet = !!getFromLocalStorage('redirectTo')
      if (redirectIsSet) {
        removeFromLocalStorage('redirectTo')
      }
    } catch (error) {
      setAuth(false)

      clearInterval(intervalID.current)
      /**
       * We'll need this authSessionCookieOn flag off for tools until
       * Quartz is integrated into that environment
       */
      if (CLOUD && isFlagEnabled('authSessionCookieOn')) {
        const url = new URL(
          `${window.location.origin}${CLOUD_LOGIN_PATHNAME}?redirectTo=${window.location.href}`
        )
        setToLocalStorage('redirectTo', window.location.href)
        window.location.href = url.href
        throw error
      }

      if (CLOUD) {
        const url = new URL(
          `${window.location.origin}${CLOUD_SIGNIN_PATHNAME}?redirectTo=${window.location.href}`
        )
        setToLocalStorage('redirectTo', window.location.href)
        window.location.href = url.href
        throw error
      }

      if (pathname.startsWith('/signin')) {
        return
      }

      let returnTo = ''

      if (pathname !== '/') {
        returnTo = `?returnTo=${pathname}`
        dispatch(notify(sessionTimedOut()))
      }

      history.replace(`/signin${returnTo}`)
    }
  }, [dispatch, history, pathname])

  const handleMountLogic = useCallback(async () => {
    setHasMounted(true)
    setLoading(RemoteDataState.Loading)

    if (CLOUD) {
      await dispatch(getPublicFlags())
    }

    await checkForLogin()

    if (hasMounted) {
      setLoading(RemoteDataState.Done)
      intervalID.current = setInterval(() => {
        checkForLogin()
      }, FETCH_WAIT)
    }
  }, [hasMounted, dispatch, checkForLogin])

  useEffect(() => {
    handleMountLogic()

    return () => {
      clearInterval(intervalID.current)
      setHasMounted(false)
    }
  }, [handleMountLogic])

  return (
    <ErrorBoundary>
      <SpinnerContainer loading={loading} spinnerComponent={<TechnoSpinner />}>
        {auth && (
          <Switch>
            <Route component={GetMe} />
          </Switch>
        )}
      </SpinnerContainer>
    </ErrorBoundary>
  )
}

export default memo(Signin)
