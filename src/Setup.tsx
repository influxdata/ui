// Libraries
import React, {ReactElement, PureComponent, Suspense, lazy} from 'react'
import {Switch, Route, RouteComponentProps} from 'react-router-dom'

// APIs
import {getSetup} from 'src/client'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import PageSpinner from 'src/perf/components/PageSpinner'
import {CloudLoginPage} from 'src/onboarding/containers/CloudLoginPage'
// lazy loading the Authenticate component causes wasm issues
import {Authenticate} from 'src/Authenticate'

const OnboardingWizardPage = lazy(
  () => import('src/onboarding/containers/OnboardingWizardPage')
)
const OSSLoginPage = lazy(
  () => import('src/onboarding/containers/OSSLoginPage')
)
const Logout = lazy(() => import('src/Logout'))
const ReadOnlyNotebook = lazy(() => import('src/flows/components/ReadOnly'))

// Utils
import {isOnboardingURL} from 'src/onboarding/utils'

// Types
import {RemoteDataState} from 'src/types'

interface State {
  loading: RemoteDataState
  shouldShowOnboarding: boolean
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
      shouldShowOnboarding: false,
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

    const resp = await getSetup({})

    if (resp.status !== 200) {
      throw new Error('There was an error onboarding')
    }

    const shouldShowOnboarding = resp.data.allowed

    this.setState({
      loading: RemoteDataState.Done,
      shouldShowOnboarding,
    })

    if (shouldShowOnboarding) {
      history.push('/onboarding/0')
      return
    }
  }

  async componentDidUpdate(prevProps: Props, prevState: State) {
    if (!prevState.shouldShowOnboarding) {
      return
    }

    if (prevProps.location.pathname.includes('/onboarding/2')) {
      this.setState({loading: RemoteDataState.Loading})
      const resp = await getSetup({})

      if (resp.status !== 200) {
        throw new Error('There was an error onboarding')
      }

      const shouldShowOnboarding = resp.data.allowed
      this.setState({shouldShowOnboarding, loading: RemoteDataState.Done})
    }
  }

  public render() {
    const {loading, shouldShowOnboarding} = this.state

    return (
      <PageSpinner loading={loading}>
        <Suspense fallback={<PageSpinner />}>
          {shouldShowOnboarding ? (
            <Route
              path="/onboarding/:stepID"
              component={OnboardingWizardPage}
            />
          ) : (
            <Switch>
              <Route
                path="/onboarding/:stepID"
                component={OnboardingWizardPage}
              />
              <Route path="/share/:accessID" component={ReadOnlyNotebook} />
              <Route path="/login" component={CloudLoginPage} />
              <Route path="/signin" component={OSSLoginPage} />
              <Route path="/logout" component={Logout} />
              <Route component={Authenticate} />
            </Switch>
          )}
        </Suspense>
      </PageSpinner>
    )
  }
}

export default Setup
