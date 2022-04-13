// Libraries
import React, {
  FC,
  memo,
  useEffect,
  useCallback,
  useState,
  Suspense,
  lazy,
} from 'react'
import {Switch, Route, useHistory, useLocation} from 'react-router-dom'

// APIs
import {getSetup} from 'src/client'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import PageSpinner from 'src/perf/components/PageSpinner'
import {LoginPage} from 'src/onboarding/containers/LoginPage'
// lazy loading the signin component causes wasm issues
import Signin from 'src/Signin'

const OnboardingWizardPage = lazy(() =>
  import('src/onboarding/containers/OnboardingWizardPage')
)
const SigninPage = lazy(() => import('src/onboarding/containers/SigninPage'))
const Logout = lazy(() => import('src/Logout'))
const ReadOnlyNotebook = lazy(() => import('src/flows/components/ReadOnly'))

// Constants
import {LOGIN, SIGNIN, LOGOUT} from 'src/shared/constants/routes'

// Utils
import {isOnboardingURL} from 'src/onboarding/utils'

// Types
import {RemoteDataState} from 'src/types'

const Setup: FC = () => {
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const [allowed, setAllowed] = useState(false)
  const history = useHistory()
  const {pathname} = useLocation()

  const handleGetSetup = useCallback(async () => {
    if (isOnboardingURL()) {
      setLoading(RemoteDataState.Done)
      return
    }

    const resp = await getSetup({})

    if (resp.status !== 200) {
      throw new Error('There was an error onboarding')
    }

    const {allowed} = resp.data

    setLoading(RemoteDataState.Done)
    setAllowed(allowed)

    if (!allowed) {
      return
    }

    history.push('/onboarding/0')
  }, [history])

  useEffect(() => {
    handleGetSetup()
  }, [handleGetSetup, pathname])

  return (
    <PageSpinner loading={loading}>
      <Suspense fallback={<PageSpinner />}>
        {allowed && (
          <Route path="/onboarding/:stepID" component={OnboardingWizardPage} />
        )}
        {!allowed && (
          <Switch>
            <Route
              path="/onboarding/:stepID"
              component={OnboardingWizardPage}
            />
            <Route path="/share/:accessID" component={ReadOnlyNotebook} />
            <Route path={LOGIN} component={LoginPage} />
            <Route path={SIGNIN} component={SigninPage} />
            <Route path={LOGOUT} component={Logout} />
            <Route component={Signin} />
          </Switch>
        )}
      </Suspense>
    </PageSpinner>
  )
}

export default memo(Setup)
