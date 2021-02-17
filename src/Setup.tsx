// Libraries
import React, {ReactElement, PureComponent, Suspense, lazy} from 'react'
import {Switch, Route, RouteComponentProps} from 'react-router-dom'

// APIs
import {client} from 'src/utils/api'

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

// Constants
import {LOGIN, SIGNIN, LOGOUT} from 'src/shared/constants/routes'

// Utils
import {isOnboardingURL} from 'src/onboarding/utils'

// Types
import {RemoteDataState} from 'src/types'

interface State {
  loading: RemoteDataState
  allowed: boolean
}

interface OwnProps {
  children: ReactElement<any>
}

type Props = RouteComponentProps & OwnProps

@ErrorHandling
export class Setup extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      loading: RemoteDataState.NotStarted,
      allowed: false,
    }
  }

  public async componentDidMount() {
    const {history} = this.props

    if (isOnboardingURL()) {
      this.setState({
        loading: RemoteDataState.Done,
      })
      return
    }

    const {allowed} = await client.setup.status()
    this.setState({
      loading: RemoteDataState.Done,
      allowed,
    })

    if (!allowed) {
      return
    }

    history.push('/onboarding/0')
  }

  async componentDidUpdate(prevProps: Props, prevState: State) {
    if (!prevState.allowed) {
      return
    }

    if (prevProps.location.pathname.includes('/onboarding/2')) {
      this.setState({loading: RemoteDataState.Loading})
      const {allowed} = await client.setup.status()
      this.setState({allowed, loading: RemoteDataState.Done})
    }
  }

  public render() {
    const {loading, allowed} = this.state

    return (
      <PageSpinner loading={loading}>
        <Suspense fallback={<PageSpinner />}>
          {allowed && (
            <Route
              path="/onboarding/:stepID"
              component={OnboardingWizardPage}
            />
          )}
          {!allowed && (
            <Switch>
              <Route
                path="/onboarding/:stepID"
                component={OnboardingWizardPage}
              />
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
}

export default Setup
